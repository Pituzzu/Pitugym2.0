
import React, { useMemo, useState } from 'react';
import { WorkoutPlan, WorkoutLog, BodyMetric, GoalItem, PaymentLog } from '../types';
import { auth, messaging, getToken } from '../services/firebase';
import { 
  DumbbellIcon, 
  ActivityIcon, 
  ScaleIcon, 
  TargetIcon, 
  WalletIcon, 
  PlayIcon,
  CheckIcon,
  ClockIcon,
  PlusIcon,
  SparklesIcon,
  HistoryIcon,
  XIcon,
  UsersIcon
} from './Icons';

interface HomeViewProps {
  activePlan: WorkoutPlan | undefined;
  latestLog: WorkoutLog | undefined;
  latestMetric: BodyMetric | undefined;
  plans: WorkoutPlan[];
  logs: WorkoutLog[];
  bodyMetrics: BodyMetric[];
  goals: GoalItem[];
  payments: PaymentLog[];
  notifications: any[];
  onNavigate: (view: 'home' | 'plans' | 'history' | 'payments' | 'goals' | 'social') => void;
  onStartWorkout: () => void;
  onClearNotification: (id: string) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ 
  activePlan, 
  latestLog, 
  latestMetric, 
  plans,
  logs,
  bodyMetrics,
  goals, 
  payments, 
  notifications,
  onNavigate,
  onStartWorkout,
  onClearNotification
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [vapidKeys, setVapidKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const lastPayment = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const isExpired = lastPayment ? new Date(lastPayment.expiryDate) < new Date() : true;
  const completedGoals = goals.filter(g => g.completed).length;
  const goalProgress = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

  const workoutContext = useMemo(() => {
    if (!activePlan) return null;
    const daysOfWeek = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
    const now = new Date();
    const todayStr = daysOfWeek[now.getDay()];
    const todayWorkout = activePlan.days.find(d => d.dayName.toLowerCase().includes(todayStr) || d.dayName.toLowerCase().includes(todayStr.substring(0, 3)));
    if (todayWorkout) return { type: 'today', workout: todayWorkout };
    return { type: 'next', workout: activePlan.days[0] };
  }, [activePlan]);

  const stats = useMemo(() => {
    const totalSessions = logs.length;
    const weeklyVolume = logs.slice(0, 7).reduce((acc, log) => acc + (log.totalVolume || 0), 0);
    const sortedMetrics = [...bodyMetrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const weightDelta = sortedMetrics.length >= 2 ? (sortedMetrics[sortedMetrics.length - 1].weight - sortedMetrics[0].weight).toFixed(1) : "0.0";
    return { totalSessions, weeklyVolume, weightDelta };
  }, [logs, bodyMetrics]);

  const exportData = () => {
    const data = {
      plans,
      logs,
      payments,
      goals,
      metrics: bodyMetrics,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pitugym_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm("Questo sovrascriverà tutti i dati attuali nel database. Continuare?")) {
           // Since we can't easily batch save from here without a prop, 
           // we'll alert that this feature is coming soon or needs a specific implementation.
           // For now, let's just log it and alert.
           console.log("Import data:", data);
           alert("Funzione di importazione massiva non ancora disponibile in questa versione. Contatta il supporto.");
        }
      } catch (err) { alert("Errore nel formato del file backup."); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto pb-24">
      {showSettings && (
        <div className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-md p-8 rounded-[3rem] border border-slate-800 animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-white uppercase">Impostazioni Dati</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 text-slate-500"><XIcon /></button>
             </div>
             <div className="space-y-4">
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Notifiche di Sistema</p>
                   <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-slate-400">Stato permessi:</p>
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                        Notification.permission === 'granted' ? 'bg-emerald-500/10 text-emerald-500' : 
                        Notification.permission === 'denied' ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {Notification.permission === 'granted' ? 'Attive' : Notification.permission === 'denied' ? 'Bloccate' : 'Non Richieste'}
                      </span>
                   </div>
                   <button 
                    onClick={() => {
                      if (Notification.permission === 'default') {
                        Notification.requestPermission().then(() => window.location.reload());
                      } else if (Notification.permission === 'granted') {
                        navigator.serviceWorker.ready.then(registration => {
                          registration.showNotification("PituGym", { 
                            body: "Le notifiche sono attive! 🦁", 
                            icon: '🦁',
                            badge: '🦁'
                          });
                        });
                      } else {
                        alert("Le notifiche sono state bloccate. Abilitale nelle impostazioni del browser.");
                      }
                    }}
                    className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all"
                   >
                     {Notification.permission === 'default' ? 'Attiva Notifiche' : 'Invia Notifica Test'}
                   </button>
                   {Notification.permission === 'granted' && (
                     <div className="space-y-2 mt-2">
                       <button 
                        onClick={async () => {
                          const registration = await navigator.serviceWorker.ready;
                          const subscription = await registration.pushManager.getSubscription();
                          if (subscription) {
                            await fetch('/api/push/send', {
                              method: 'POST',
                              body: JSON.stringify({
                                subscription,
                                title: "PituGym Push",
                                body: "Questa è una vera notifica push dal server! 🚀"
                              }),
                              headers: { 'Content-Type': 'application/json' }
                            });
                          } else {
                            alert("Nessuna sottoscrizione push trovata. Assicurati di aver configurato le chiavi VAPID e prova a cliccare 'Registra Sottoscrizione' qui sotto.");
                          }
                        }}
                        className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all"
                       >
                         Test Real Push (Server)
                       </button>
                       
                       <button 
                        onClick={async () => {
                          try {
                            const registration = await navigator.serviceWorker.ready;
                            const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
                            
                            if (!publicKey) {
                              alert("Errore: VITE_VAPID_PUBLIC_KEY non configurata nelle variabili d'ambiente.");
                              return;
                            }

                            const subscription = await registration.pushManager.subscribe({
                              userVisibleOnly: true,
                              applicationServerKey: publicKey
                            });

                            await fetch('/api/push/subscribe', {
                              method: 'POST',
                              body: JSON.stringify(subscription),
                              headers: { 'Content-Type': 'application/json' }
                            });
                            
                            alert("Sottoscrizione registrata con successo!");
                          } catch (err) {
                            console.error(err);
                            alert("Errore durante la registrazione: " + (err as Error).message);
                          }
                        }}
                        className="w-full py-2 text-[9px] text-slate-500 uppercase font-black hover:text-slate-300 transition-colors"
                       >
                         Registra Sottoscrizione
                       </button>
                     </div>
                   )}
                </div>

                <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Firebase Cloud Messaging (FCM)</p>
                   {!fcmToken ? (
                     <button 
                      onClick={async () => {
                        if (messaging) {
                          try {
                            const token = await getToken(messaging, {
                              vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
                            });
                            setFcmToken(token);
                          } catch (e) {
                            alert("Errore FCM: " + (e as Error).message);
                          }
                        }
                      }}
                      className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all"
                     >
                       Mostra Token FCM
                     </button>
                   ) : (
                     <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                        <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Token FCM</p>
                        <code className="text-[9px] text-blue-400 break-all block">{fcmToken}</code>
                        <button 
                          onClick={() => setFcmToken(null)}
                          className="w-full mt-2 text-[8px] text-slate-500 uppercase font-black"
                        >
                          Nascondi
                        </button>
                     </div>
                   )}
                </div>

                <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Configurazione Push (VAPID)</p>
                   <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                     Per far funzionare le notifiche push "reali" (anche ad app chiusa), devi generare queste chiavi e inserirle nelle variabili d'ambiente di AI Studio.
                   </p>
                   
                   {!vapidKeys ? (
                     <button 
                      onClick={async () => {
                        const res = await fetch('/api/push/generate-keys');
                        const keys = await res.json();
                        setVapidKeys(keys);
                      }}
                      className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all"
                     >
                       Genera Nuove Chiavi
                     </button>
                   ) : (
                     <div className="space-y-3">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                          <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Public Key (VITE_VAPID_PUBLIC_KEY)</p>
                          <code className="text-[9px] text-emerald-400 break-all block">{vapidKeys.publicKey}</code>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                          <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Private Key (VAPID_PRIVATE_KEY)</p>
                          <code className="text-[9px] text-orange-400 break-all block">{vapidKeys.privateKey}</code>
                        </div>
                        <button 
                          onClick={() => setVapidKeys(null)}
                          className="w-full py-2 text-[9px] text-slate-500 uppercase font-black"
                        >
                          Nascondi
                        </button>
                     </div>
                   )}
                </div>

                <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Esportazione</p>
                   <button onClick={exportData} className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest">Scarica Backup JSON</button>
                </div>
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Importazione</p>
                   <label className="block w-full py-4 bg-slate-800 text-slate-300 font-black rounded-2xl text-[10px] uppercase tracking-widest text-center cursor-pointer"> Carica File Backup <input type="file" accept=".json" onChange={importData} className="hidden" /></label>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="px-2 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            Ciao, <span className="text-orange-500">{auth.currentUser?.email?.split('@')[0] || 'Atleta'}</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2">Pronto per distruggere la ghisa?</p>
        </div>
        <button onClick={() => setShowSettings(true)} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all"><SparklesIcon /></button>
      </div>

      {notifications.length > 0 && (
        <div className="space-y-3 px-2">
          {notifications.map(notif => (
            <div key={notif.id} className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-left-4 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">🔔</div>
                <div>
                  <p className="text-xs text-white font-black uppercase tracking-tight">
                    <span className="text-orange-500">{notif.fromName}</span> {notif.message}
                  </p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">{new Date(notif.date).toLocaleTimeString()}</p>
                </div>
              </div>
              <button onClick={() => onClearNotification(notif.id)} className="text-slate-500 hover:text-white"><XIcon /></button>
            </div>
          ))}
        </div>
      )}

      <div className={`p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group transition-all duration-500 ${workoutContext?.type === 'today' ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-slate-900 border border-slate-800'}`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block ${workoutContext?.type === 'today' ? 'bg-white text-orange-600' : 'bg-blue-500/10 text-blue-500'}`}>{workoutContext?.type === 'today' ? '• Allenamento di Oggi' : '• Prossimo Obiettivo'}</div>
              <h3 className="text-3xl font-black uppercase tracking-tight text-white">{workoutContext?.workout.dayName || "Inizia Ora"}</h3>
            </div>
            <button onClick={onStartWorkout} className={`px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all ${workoutContext?.type === 'today' ? 'bg-white text-slate-950' : 'bg-orange-500 text-white'}`}><PlayIcon /> Inizia</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] flex flex-col justify-between">
           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Volume Recente</span>
           <div className="flex items-baseline gap-2"><span className="text-4xl font-black text-white">{stats.weeklyVolume.toLocaleString()}</span><span className="text-xs font-bold text-slate-600">KG</span></div>
        </div>
        
        <div onClick={() => onNavigate('social')} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] cursor-pointer hover:border-orange-500/30 transition-all group relative overflow-hidden">
           <div className="absolute top-4 right-4 text-slate-800 group-hover:text-orange-500/20 transition-colors"><UsersIcon /></div>
           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4 block">Amici Attivi</span>
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border-2 border-orange-500/30 text-lg">🏋️‍♂️</div>
              <p className="text-xs font-black text-white uppercase tracking-tight">Il Coach ha caricato una nuova scheda!</p>
           </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] border flex items-center justify-between ${isExpired ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
          <div><h4 className="text-xl font-black text-white uppercase">Abbonamento</h4><p className={`text-[10px] font-bold uppercase mt-1 ${isExpired ? 'text-red-500' : 'text-emerald-500'}`}>{isExpired ? "Scaduto" : "In Regola"}</p></div>
          <button onClick={() => onNavigate('payments')} className="p-3 bg-slate-900 rounded-xl text-slate-500">→</button>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
