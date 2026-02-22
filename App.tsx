
import React, { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutLog, PaymentLog, GoalItem, BodyMetric, Friend } from './types';
import { DumbbellIcon, SunIcon, MoonIcon, PlusIcon, LogOutIcon } from './components/Icons';
import WorkoutGenerator from './components/WorkoutGenerator';
import PlanDisplay from './components/PlanDisplay';
import WorkoutHistory from './components/WorkoutHistory';
import BottomNavbar from './components/BottomNavbar';
import ProfileView from './components/ProfileView';
import HomeView from './components/HomeView';
import SocialView from './components/SocialView';
import AuthView from './components/AuthView';
import PaymentsView from './components/PaymentsView';
import GoalsView from './components/GoalsView';
import { 
  auth, 
  db, 
  messaging,
  getToken,
  onMessage,
  signOut,
  onAuthStateChanged, 
  User, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  where,
  limit
} from './services/firebase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [payments, setPayments] = useState<PaymentLog[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [pituzzuId, setPituzzuId] = useState<string | null>(null);
  
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [view, setView] = useState<'home' | 'plans' | 'history' | 'profile' | 'social' | 'payments' | 'goals'>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Gestione Tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('pitugym_theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.className = savedTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('pitugym_theme', newTheme);
    document.documentElement.className = newTheme;
  };

  // Auth & Data Listeners
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Pituzzu ID & Profile Sync
  useEffect(() => {
    if (!user) {
      setPituzzuId(null);
      return;
    }

    const syncProfile = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.pituzzuId) {
          setPituzzuId(data.pituzzuId);
        } else {
          // Generate new ID if missing
          const newId = `PITU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          await setDoc(userDocRef, { 
            pituzzuId: newId, 
            email: user.email,
            username: user.email?.split('@')[0] || 'Atleta'
          }, { merge: true });
          // Also index it
          await setDoc(doc(db, 'pituzzu_ids', newId), { uid: user.uid });
          setPituzzuId(newId);
        }
      } else {
        // First time setup
        const newId = `PITU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        await setDoc(userDocRef, { 
          pituzzuId: newId, 
          email: user.email,
          username: user.email?.split('@')[0] || 'Atleta'
        });
        await setDoc(doc(db, 'pituzzu_ids', newId), { uid: user.uid });
        setPituzzuId(newId);
      }
    };

    syncProfile();
  }, [user]);

  useEffect(() => {
    const setupPush = async () => {
      if ('Notification' in window && Notification.permission === 'granted' && 'serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
          
          if (!publicKey) return;

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey
          });

          await fetch('/api/push/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } catch (err) {
          console.error("Push setup failed:", err);
        }
      }
    };

    if (user) setupPush();
  }, [user]);

  useEffect(() => {
    const setupFCM = async () => {
      if (messaging && 'Notification' in window && Notification.permission === 'granted') {
        try {
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
          });
          if (token) {
            console.log("FCM Token:", token);
            // In a real app, save this token to Firestore for the user
            await setDoc(doc(db, 'users', user!.uid), { fcmToken: token }, { merge: true });
          }
        } catch (err) {
          console.error("FCM setup failed:", err);
        }
      }
    };

    if (user) setupFCM();

    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log("Foreground message received:", payload);
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'PituGym', {
            body: payload.notification?.body,
            icon: '🦁'
          });
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setPlans([]);
      setLogs([]);
      setPayments([]);
      setGoals([]);
      setBodyMetrics([]);
      setFriends([]);
      return;
    }

    // 1. Listen for Plans
    const plansQuery = query(collection(db, 'users', user.uid, 'plans'), orderBy('createdAt', 'desc'));
    const unsubPlans = onSnapshot(plansQuery, (snapshot) => {
      const loadedPlans = snapshot.docs.map(d => d.data() as WorkoutPlan);
      setPlans(loadedPlans);
      // Se c'è un piano attivo ma non è più nella lista (es. cancellato), o se non c'è piano attivo ma ne abbiamo caricati
      if (!activePlanId && loadedPlans.length > 0) {
        setActivePlanId(loadedPlans[0].id);
      }
    });

    // 2. Listen for Logs
    const logsQuery = query(collection(db, 'users', user.uid, 'logs'), orderBy('date', 'desc'));
    const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
      setLogs(snapshot.docs.map(d => d.data() as WorkoutLog));
    });

    // 3. Listen for Metrics
    const metricsQuery = query(collection(db, 'users', user.uid, 'metrics'), orderBy('date', 'desc'));
    const unsubMetrics = onSnapshot(metricsQuery, (snapshot) => {
      setBodyMetrics(snapshot.docs.map(d => d.data() as BodyMetric));
    });

    // 4. Listen for Goals
    const goalsRef = collection(db, 'users', user.uid, 'goals');
    const unsubGoals = onSnapshot(goalsRef, (snapshot) => {
      setGoals(snapshot.docs.map(d => d.data() as GoalItem));
    });

    // 5. Listen for Payments
    const paymentsRef = collection(db, 'users', user.uid, 'payments');
    const unsubPayments = onSnapshot(paymentsRef, (snapshot) => {
      setPayments(snapshot.docs.map(d => d.data() as PaymentLog));
    });

    // 6. Listen for Friends
    const friendsRef = collection(db, 'users', user.uid, 'friends');
    const unsubFriends = onSnapshot(friendsRef, async (snapshot) => {
      const basicFriends = snapshot.docs.map(d => d.data() as Friend);
      setFriends(basicFriends);
    });

    // 7. Listen for Notifications
    const notificationsRef = collection(db, 'users', user.uid, 'notifications');
    let isInitialLoad = true;
    const unsubNotifications = onSnapshot(notificationsRef, (snapshot) => {
      const newNotifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications(newNotifs);

      // Trigger system notification for new items after initial load
      if (!isInitialLoad && snapshot.docChanges().some(change => change.type === 'added')) {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (Notification.permission === 'granted') {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(`PituGym: ${data.fromName}`, {
                  body: data.message,
                  icon: '🦁',
                  badge: '🦁',
                  vibrate: [200, 100, 200]
                } as any);
              });
            }
          }
        });
      }
      isInitialLoad = false;
    });

    return () => {
      unsubPlans();
      unsubLogs();
      unsubMetrics();
      unsubGoals();
      unsubPayments();
      unsubFriends();
      unsubNotifications();
    };
  }, [user]);

  // Enriched Friend Data (Public Plans & Logs)
  useEffect(() => {
    if (!user || friends.length === 0) return;

    const mutualFriends = friends.filter(f => f.isMutual);
    const unsubs: (() => void)[] = [];

    mutualFriends.forEach(friend => {
      // Listen to friend's public plans
      const plansQuery = query(
        collection(db, 'users', friend.id, 'plans'), 
        where('isPublic', '==', true)
      );
      const unsubPlans = onSnapshot(plansQuery, (snap) => {
        const publicPlans = snap.docs.map(d => d.data() as WorkoutPlan);
        setFriends(prev => prev.map(f => f.id === friend.id ? { ...f, plans: publicPlans } : f));
      });
      unsubs.push(unsubPlans);

      // Listen to friend's logs (last 5)
      const logsQuery = query(
        collection(db, 'users', friend.id, 'logs'), 
        orderBy('date', 'desc'),
        limit(5)
      );
      const unsubLogs = onSnapshot(logsQuery, (snap) => {
        const recentLogs = snap.docs.map(d => d.data() as WorkoutLog);
        setFriends(prev => prev.map(f => f.id === friend.id ? { ...f, logs: recentLogs } : f));
      });
      unsubs.push(unsubLogs);
    });

    return () => unsubs.forEach(u => u());
  }, [user, friends.map(f => f.id + f.isMutual).join(',')]);

  // Firestore Actions Helpers
  const sanitizeData = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(v => sanitizeData(v));
    } else if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};
      for (const key in obj) {
        if (obj[key] !== undefined) {
          newObj[key] = sanitizeData(obj[key]);
        }
      }
      return newObj;
    }
    return obj;
  };

  const saveData = async (collectionName: string, id: string, data: any) => {
    if (!user) return;
    try {
      const cleanData = sanitizeData(data);
      await setDoc(doc(db, 'users', user.uid, collectionName, id), cleanData);
    } catch (e) {
      console.error(`Error saving to ${collectionName}:`, e);
      alert("Errore di connessione. Impossibile salvare.");
    }
  };

  const deleteData = async (collectionName: string, id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, collectionName, id));
    } catch (e) {
      console.error(`Error deleting from ${collectionName}:`, e);
    }
  };

  const activePlan = plans.find(p => p.id === activePlanId);
  const latestLog = logs.length > 0 ? logs[0] : undefined;
  const latestMetric = bodyMetrics.length > 0 ? bodyMetrics[0] : undefined;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (e) {
      console.error("Logout error:", e);
      alert("Errore durante il logout. Riprova.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <header className="sticky top-0 z-40 w-full border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('home')}>
            <div className="bg-orange-500 p-1.5 rounded-xl text-white shadow-lg shadow-orange-500/20 transition-transform group-hover:scale-110">
              <DumbbellIcon />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
              PITU<span className="text-orange-500">GYM</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:text-orange-500">
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <button onClick={handleSignOut} className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:text-red-500">
              <LogOutIcon />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        {view === 'home' && (
          <HomeView 
            activePlan={activePlan} latestLog={latestLog} latestMetric={latestMetric} 
            plans={plans} logs={logs} bodyMetrics={bodyMetrics} goals={goals} payments={payments}
            notifications={notifications}
            onNavigate={(v: any) => setView(v)} onStartWorkout={() => setView('plans')} 
            onClearNotification={(id) => deleteData('notifications', id)}
          />
        )}
        
        {view === 'history' && (
          <WorkoutHistory 
            logs={logs} 
            onDeleteLog={(id) => deleteData('logs', id)} 
          />
        )}
        
        {view === 'profile' && (
          <ProfileView 
            theme={theme} 
            onThemeToggle={toggleTheme} 
            metrics={bodyMetrics} 
            payments={payments} 
            friends={friends} 
            logs={logs}
            goals={goals}
            onAddGoal={(g) => saveData('goals', g.id, g)}
            onToggleGoal={(id) => {
              const g = goals.find(goal => goal.id === id);
              if (g) saveData('goals', id, { ...g, completed: !g.completed });
            }}
            onDeleteGoal={(id) => deleteData('goals', id)}
            onSignOut={handleSignOut}
            pituzzuId={pituzzuId}
          />
        )}
        
        {view === 'social' && (
          <SocialView 
            friends={friends} 
            userLogs={logs}
            username={user?.email?.split('@')[0] || 'Atleta'}
            onAddFriend={async (id) => {
                if (id === pituzzuId) {
                  alert("Non puoi aggiungere te stesso!");
                  return;
                }
                
                // 1. Find user by Pituzzu ID
                const idDoc = await getDoc(doc(db, 'pituzzu_ids', id));
                if (!idDoc.exists()) {
                  alert("Pituzzu ID non trovato!");
                  return;
                }
                
                const targetUid = idDoc.data().uid;
                const targetUserDoc = await getDoc(doc(db, 'users', targetUid));
                const targetData = targetUserDoc.data();

                // 2. Add request to target user (they received it)
                const myFriendData: Friend = {
                  id: user!.uid,
                  username: user!.email?.split('@')[0] || 'Atleta',
                  avatar: '🏋️',
                  status: 'online',
                  isMutual: false,
                  requestStatus: 'received',
                  logs: [],
                  plans: [],
                  lastActive: new Date().toISOString()
                };
                
                await setDoc(doc(db, 'users', targetUid, 'friends', user!.uid), myFriendData);

                // Notify target user
                const notification = {
                  id: crypto.randomUUID(),
                  type: 'friend_request',
                  fromId: user!.uid,
                  fromName: user!.email?.split('@')[0] || 'Atleta',
                  date: new Date().toISOString(),
                  message: "ti ha inviato una richiesta di amicizia!"
                };
                await setDoc(doc(db, 'users', targetUid, 'notifications', notification.id), notification);

                // 3. Add to my list as pending (I sent it)
                const targetFriendData: Friend = {
                  id: targetUid,
                  username: targetData?.username || 'Atleta',
                  avatar: '🔥',
                  status: 'offline',
                  isMutual: false,
                  requestStatus: 'sent',
                  logs: [],
                  plans: [],
                  lastActive: new Date().toISOString()
                };
                await setDoc(doc(db, 'users', user!.uid, 'friends', targetUid), targetFriendData);
                
                alert("Richiesta inviata!");
            }} 
            onAcceptFriend={async (id) => {
                if (!user) return;
                // Update my friend entry
                const myFriendRef = doc(db, 'users', user.uid, 'friends', id);
                const myFriendDoc = await getDoc(myFriendRef);
                if (myFriendDoc.exists()) {
                  await setDoc(myFriendRef, { ...myFriendDoc.data(), isMutual: true }, { merge: true });
                }

                // Update their friend entry
                const theirFriendRef = doc(db, 'users', id, 'friends', user.uid);
                const theirFriendDoc = await getDoc(theirFriendRef);
                if (theirFriendDoc.exists()) {
                  await setDoc(theirFriendRef, { ...theirFriendDoc.data(), isMutual: true }, { merge: true });
                  
                  // Notify them
                  const notification = {
                    id: crypto.randomUUID(),
                    type: 'friend_accepted',
                    fromId: user.uid,
                    fromName: user.email?.split('@')[0] || 'Atleta',
                    date: new Date().toISOString(),
                    message: "ha accettato la tua richiesta di amicizia!"
                  };
                  await setDoc(doc(db, 'users', id, 'notifications', notification.id), notification);
                }
            }} 
            onRemoveFriend={(id) => deleteData('friends', id)} 
            onCopyPlan={(plan) => {
                const newPlan = { ...plan, id: crypto.randomUUID(), title: `${plan.title} (Copia)` };
                saveData('plans', newPlan.id, newPlan);
                alert("Scheda copiata nella tua libreria!");
            }} 
            onRequestPlan={async (friendId) => {
                if (!user) return;
                const notification = {
                  id: crypto.randomUUID(),
                  type: 'plan_request',
                  fromId: user.uid,
                  fromName: user.email?.split('@')[0] || 'Atleta',
                  date: new Date().toISOString(),
                  message: "ti ha chiesto di condividere una scheda!"
                };
                await setDoc(doc(db, 'users', friendId, 'notifications', notification.id), notification);
                alert("Richiesta inviata!");
            }}
          />
        )}

        {view === 'payments' && (
          <PaymentsView 
            payments={payments}
            onAddPayment={(p) => saveData('payments', p.id, p)}
            onDeletePayment={(id) => deleteData('payments', id)}
          />
        )}

        {view === 'goals' && (
          <GoalsView 
            goals={goals}
            onAddGoal={(g) => saveData('goals', g.id, g)}
            onDeleteGoal={(id) => deleteData('goals', id)}
            onToggleGoal={(id) => {
              const g = goals.find(goal => goal.id === id);
              if (g) saveData('goals', id, { ...g, completed: !g.completed });
            }}
            metrics={bodyMetrics}
            onAddMetric={(m) => saveData('metrics', m.id, m)}
            onDeleteMetric={(id) => deleteData('metrics', id)}
          />
        )}
        
        {view === 'plans' && (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-3 lg:border-r border-slate-100 dark:border-slate-800 lg:pr-6">
              <div className="lg:sticky lg:top-24 space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h2 className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Le tue Schede</h2>
                  <button onClick={() => setShowCreator(true)} className="p-1.5 bg-orange-500 text-white rounded-lg shadow-md"><PlusIcon /></button>
                </div>
                <div className="flex lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
                  {plans.map(p => (
                    <button key={p.id} onClick={() => { setActivePlanId(p.id); setShowCreator(false); }} className={`flex-shrink-0 w-56 lg:w-full p-4 rounded-3xl text-left border transition-all ${activePlanId === p.id ? 'bg-white dark:bg-slate-900 border-orange-500 text-slate-900 dark:text-white shadow-sm' : 'bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200'}`}>
                      <p className="font-black text-xs truncate uppercase tracking-tight">{p.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
            <section className="lg:col-span-9">
              {showCreator ? (
                <WorkoutGenerator onPlanGenerated={(p) => {
                  saveData('plans', p.id, p);
                  setActivePlanId(p.id);
                  setShowCreator(false);
                }} />
              ) : activePlan ? (
                <PlanDisplay 
                  plan={activePlan} 
                  onDelete={(id) => {
                    deleteData('plans', id);
                    if (activePlanId === id) setActivePlanId(null);
                  }} 
                  onUpdate={(p) => saveData('plans', p.id, p)} 
                  onLogSaved={(l) => saveData('logs', l.id, l)} 
                />
              ) : (
                <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                  <button onClick={() => setShowCreator(true)} className="bg-orange-500 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all">Nuova scheda</button>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <BottomNavbar activeView={view} onViewChange={setView} />
    </div>
  );
};

export default App;
