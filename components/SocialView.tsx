
import React, { useState, useMemo } from 'react';
import { Friend, WorkoutLog, WorkoutPlan } from '../types';
import { UsersIcon, UserPlusIcon, XIcon, CalendarIcon, ActivityIcon, SparklesIcon, DumbbellIcon, ClockIcon, PlusIcon, CheckIcon } from './Icons';

interface SocialViewProps {
  friends: Friend[];
  userLogs: WorkoutLog[];
  username: string;
  onAddFriend: (id: string) => void;
  onAcceptFriend: (id: string) => void;
  onRemoveFriend: (id: string) => void;
  onCopyPlan: (plan: WorkoutPlan) => void;
  onRequestPlan: (friendId: string) => void;
}

const SocialView: React.FC<SocialViewProps> = ({ friends, userLogs, username, onAddFriend, onAcceptFriend, onRemoveFriend, onCopyPlan, onRequestPlan }) => {
  const [searchId, setSearchId] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [friendTab, setFriendTab] = useState<'plans' | 'logs'>('plans');

  const mutualFriends = useMemo(() => friends.filter(f => f.isMutual), [friends]);
  const pendingRequests = useMemo(() => friends.filter(f => !f.isMutual), [friends]);

  // Aggrega tutte le attività (log) degli amici e le ordina per data
  const activities = useMemo(() => {
    const allActivities: { 
      type: 'workout'; 
      username: string; 
      avatar: string; 
      date: string; 
      title: string; 
      volume: number;
    }[] = [];

    mutualFriends.forEach(friend => {
      friend.logs.forEach(log => {
        allActivities.push({
          type: 'workout',
          username: friend.username,
          avatar: friend.avatar,
          date: log.date,
          title: log.planTitle,
          volume: log.totalVolume
        });
      });
    });

    // Aggiungi i log dell'utente
    userLogs.forEach(log => {
      allActivities.push({
        type: 'workout',
        username: 'Tu',
        avatar: '🦁',
        date: log.date,
        title: log.planTitle,
        volume: log.totalVolume
      });
    });

    return allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [mutualFriends, userLogs]);

  const handleSearch = () => {
    if (!searchId.trim()) return;
    onAddFriend(searchId.trim());
    setSearchId('');
    setShowAddModal(false);
  };

  const closeProfile = () => {
    setSelectedFriend(null);
    setFriendTab('plans');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-2 flex justify-between items-end">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">Social Club</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Confrontati con i tuoi amici di ghisa</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="p-4 bg-orange-500 text-white rounded-2xl shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
        >
          <UserPlusIcon />
        </button>
      </div>

      {showAddModal && (
        <div className="bg-slate-900 border-2 border-orange-500/30 p-8 rounded-[3rem] shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Aggiungi Amico</h4>
            <button onClick={() => setShowAddModal(false)} className="text-slate-500 p-2 bg-slate-800 rounded-xl"><XIcon /></button>
          </div>
          <div className="space-y-4">
            <p className="text-xs text-slate-400">Inserisci il Pituzzu ID del tuo amico per inviare una richiesta di amicizia. L'amicizia deve essere reciproca per vedere i progressi.</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="es: PITU-5678" 
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500 transition-all"
              />
              <button 
                onClick={handleSearch}
                className="bg-white text-slate-950 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
              >
                Invia
              </button>
            </div>
            <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest text-center italic">Tip: puoi provare l'ID "MOCK-GIOVANNI" o "MOCK-SARA"</p>
          </div>
        </div>
      )}

      {selectedFriend ? (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col md:flex-row items-center gap-6 border-b border-slate-800 relative">
            <button onClick={closeProfile} className="absolute top-6 right-6 p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"><XIcon /></button>
            <div className="w-24 h-24 rounded-3xl bg-orange-500/20 border-2 border-orange-500/50 flex items-center justify-center text-4xl shadow-2xl">{selectedFriend.avatar}</div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedFriend.username}</h3>
                <span className={`w-2 h-2 rounded-full ${selectedFriend.status === 'training' ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{selectedFriend.status === 'training' ? 'Si sta allenando ora' : 'Online'}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex justify-center gap-4">
            <button 
              onClick={() => setFriendTab('plans')} 
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${friendTab === 'plans' ? 'bg-orange-500 text-white' : 'text-slate-500'}`}
            >
              Schede
            </button>
            <button 
              onClick={() => setFriendTab('logs')} 
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${friendTab === 'logs' ? 'bg-orange-500 text-white' : 'text-slate-500'}`}
            >
              Cronologia
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {friendTab === 'plans' ? (
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Programmi Attivi</h4>
                {selectedFriend.plans.length === 0 ? (
                  <div className="py-20 text-center space-y-4 bg-slate-950/20 border-2 border-slate-800 border-dashed rounded-3xl">
                    <p className="text-slate-600 text-sm">Nessuna scheda condivisa da questo atleta.</p>
                    <button 
                      onClick={() => onRequestPlan(selectedFriend.id)}
                      className="px-6 py-3 bg-slate-800 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-slate-700 transition-all"
                    >
                      Richiedi Scheda
                    </button>
                  </div>
                ) : (
                  selectedFriend.plans.map(plan => (
                    <div key={plan.id} className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-3xl group">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg"><DumbbellIcon /></div>
                          <h5 className="font-black text-white uppercase tracking-tight">{plan.title}</h5>
                        </div>
                        <button 
                          onClick={() => onCopyPlan(plan)}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-[9px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                        >
                          <PlusIcon /> Aggiungi alla mia libreria
                        </button>
                      </div>
                      <div className="space-y-2">
                        {plan.days.map(day => (
                          <div key={day.id} className="p-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl flex justify-between items-center">
                            <span className="text-[10px] text-slate-300 font-black uppercase">{day.dayName}</span>
                            <span className="text-[9px] text-slate-600 font-bold uppercase">{day.exercises.length} ES.</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Ultimi Allenamenti</h4>
                {selectedFriend.logs.length === 0 ? (
                  <div className="py-20 text-center text-slate-600 border-2 border-slate-800 border-dashed rounded-3xl">L'amico non ha ancora caricato sessioni.</div>
                ) : (
                  selectedFriend.logs.map(log => (
                    <div key={log.id} className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-3xl group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-900 p-3 rounded-xl text-orange-500"><CalendarIcon /></div>
                          <div>
                            <p className="text-white font-black text-sm uppercase">{log.dayName}</p>
                            <p className="text-[9px] text-slate-600 font-black uppercase">{new Date(log.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[7px] text-slate-600 font-black uppercase block">Volume</span>
                          <span className="text-lg font-black text-white">{log.totalVolume?.toLocaleString()} <span className="text-[9px] text-slate-500">kg</span></span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 opacity-80">
                        {log.exercises.map((ex, i) => (
                          <div key={i} className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800/50 flex justify-between items-center">
                            <span className="text-[10px] text-slate-300 font-black uppercase tracking-tight truncate max-w-[120px]">{ex.name}</span>
                            <span className="text-[10px] text-slate-500 font-bold">{ex.sets.length} serie</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mutualFriends.length === 0 && pendingRequests.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-slate-900/40 border-2 border-slate-800 border-dashed rounded-[3rem] px-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mb-6"><UsersIcon /></div>
              <h3 className="text-xl font-black text-white uppercase mb-2">Ancora Solo Ghisa?</h3>
              <p className="text-slate-500 text-sm max-w-xs">Aggiungi i tuoi compagni di allenamento per motivarvi a vicenda e vedere le cronologie.</p>
            </div>
          ) : (
            mutualFriends.map(friend => (
              <div 
                key={friend.id} 
                onClick={() => setSelectedFriend(friend)}
                className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] flex items-center justify-between hover:border-orange-500/30 transition-all cursor-pointer group shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl group-hover:bg-orange-500 transition-all">{friend.avatar}</div>
                  <div>
                    <h4 className="font-black text-white uppercase tracking-tight">{friend.username}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${friend.status === 'training' ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{friend.status === 'training' ? 'In Allenamento' : 'Attivo ora'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest mb-1">Ultimo Vol.</p>
                  <p className="text-sm font-black text-orange-500">{(friend.logs[0]?.totalVolume || 0).toLocaleString()} <span className="text-[8px] text-slate-600">kg</span></p>
                </div>
              </div>
            ))
          )}
          
          {pendingRequests.length > 0 && (
            <div className="col-span-full mt-8">
               <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2 mb-4">Richieste in Sospeso</h4>
               <div className="space-y-3">
                 {pendingRequests.map(f => (
                   <div key={f.id} className="bg-slate-950/40 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-lg">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl opacity-50">{f.avatar}</div>
                        <div>
                          <span className="text-sm font-black text-white uppercase tracking-tight">{f.username}</span>
                          <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">
                            {f.requestStatus === 'sent' ? 'Richiesta Inviata' : 'Ti ha inviato una richiesta'}
                          </p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        {f.requestStatus === 'received' && (
                          <button 
                            onClick={() => onAcceptFriend(f.id)}
                            className="px-5 py-2.5 bg-emerald-500 text-slate-950 text-[9px] font-black rounded-xl uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2"
                          >
                            <CheckIcon /> Accetta
                          </button>
                        )}
                        <button 
                          onClick={() => onRemoveFriend(f.id)}
                          className="p-2.5 text-slate-500 hover:text-red-400 bg-slate-900 border border-slate-800 rounded-xl transition-all"
                        >
                          <XIcon />
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-slate-950/40 border border-slate-800/60 p-8 rounded-[2.5rem] mt-12">
        <div className="flex items-center gap-4 mb-8">
           <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-xl"><SparklesIcon /></div>
           <h3 className="text-xl font-black text-white uppercase tracking-tight">Feed Attività</h3>
        </div>
        <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
            {activities.length === 0 ? (
              <div className="relative pl-12">
                <div className="absolute left-0 top-1 w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sm z-10">📭</div>
                <p className="text-xs text-slate-500 font-medium">Ancora nessuna attività dai tuoi amici. Inizia ad allenarti!</p>
              </div>
            ) : (
              activities.map((act, i) => (
                <div key={i} className={`relative pl-12 animate-in slide-in-from-left-4 duration-500 ${act.username === 'Tu' ? 'opacity-90' : ''}`} style={{ animationDelay: `${i * 100}ms` }}>
                  <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl bg-slate-900 border ${act.username === 'Tu' ? 'border-orange-500/50 shadow-orange-500/10' : 'border-slate-800'} flex items-center justify-center text-sm z-10 shadow-lg`}>{act.avatar}</div>
                  <p className="text-xs text-slate-300 font-medium">
                    <span className={`font-black ${act.username === 'Tu' ? 'text-orange-500' : 'text-white'}`}>{act.username}</span> ha completato <span className="text-orange-500 font-bold">{act.title}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                      {new Date(act.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <p className="text-[9px] text-orange-500/80 font-black uppercase tracking-widest">
                      {act.volume.toLocaleString()} kg totali
                    </p>
                  </div>
                </div>
              ))
            )}
        </div>
      </div>
    </div>
  );
};

export default SocialView;
