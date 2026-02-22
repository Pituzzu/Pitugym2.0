
import React, { useState } from 'react';
import { BodyMetric, PaymentLog, Friend, WorkoutLog, GoalItem } from '../types';
import { auth, signOut } from '../services/firebase';
import { 
  SunIcon, 
  MoonIcon, 
  WalletIcon, 
  ScaleIcon, 
  ActivityIcon, 
  TargetIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  LogOutIcon
} from './Icons';

interface ProfileViewProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  metrics: BodyMetric[];
  payments: PaymentLog[];
  friends: Friend[];
  logs: WorkoutLog[];
  goals: GoalItem[];
  onAddGoal: (g: GoalItem) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onSignOut: () => void;
  pituzzuId: string | null;
}

const ProfileView: React.FC<ProfileViewProps> = ({ 
  theme, 
  onThemeToggle, 
  metrics, 
  payments, 
  friends, 
  logs,
  goals,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  onSignOut,
  pituzzuId
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'targets' | 'body'>('info');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const latestMetric = [...metrics].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const lastPayment = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const isExpired = lastPayment ? new Date(lastPayment.expiryDate) < new Date() : true;

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) return;
    onAddGoal({
      id: crypto.randomUUID(),
      title: newGoalTitle,
      completed: false,
      category: 'strength'
    });
    setNewGoalTitle('');
    setShowAddGoal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-32 px-2">
      {/* Header - Super Light */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[3rem] shadow-sm relative transition-all">
        <div className="flex flex-col items-center md:flex-row gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/20 text-white shrink-0">
            🦁
          </div>
          <div className="text-center md:text-left flex-1 min-w-0">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">{auth.currentUser?.email?.split('@')[0] || 'Utente'}</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em] mt-1 mb-3">{auth.currentUser?.email}</p>
            
            <div className="inline-flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID:</span>
              <span className="text-xs font-black text-orange-500 tracking-tight">{pituzzuId || '...'}</span>
              <button 
                onClick={() => {
                  if (pituzzuId) {
                    navigator.clipboard.writeText(pituzzuId);
                    alert("ID Copiato!");
                  }
                }}
                className="p-1 hover:text-orange-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          </div>
          {/* Theme Switcher - Pulito */}
          <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700">
            <button 
              onClick={() => theme === 'dark' && onThemeToggle()} 
              className={`p-2.5 rounded-xl transition-all ${theme === 'light' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500'}`}
            >
              <SunIcon />
            </button>
            <button 
              onClick={() => theme === 'light' && onThemeToggle()} 
              className={`p-2.5 rounded-xl transition-all ${theme === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500'}`}
            >
              <MoonIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-[2rem] border border-slate-100 dark:border-slate-800">
        {(['info', 'targets', 'body'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === t 
                ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm border border-slate-50 dark:border-slate-700' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {t === 'info' ? 'Info' : t === 'targets' ? 'Obiettivi' : 'Corpo'}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'info' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className={`p-6 rounded-[2.5rem] border ${isExpired ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isExpired ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}><WalletIcon /></div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Abbonamento</h4>
                  <p className={`text-[10px] font-black uppercase mt-1 ${isExpired ? 'text-red-600' : 'text-emerald-600'}`}>{isExpired ? 'Scaduto' : 'In Regola'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Logs</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{logs.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Amici</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{friends.length}</p>
              </div>
            </div>

            <button 
              onClick={onSignOut}
              className="w-full py-5 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-500 font-black rounded-[2rem] uppercase tracking-widest text-xs transition-colors mt-8 flex items-center justify-center gap-2"
            >
              <LogOutIcon /> Esci dall'Account
            </button>
          </div>
        )}

        {activeTab === 'targets' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Traguardi personali</h3>
              <button onClick={() => setShowAddGoal(true)} className="p-2 bg-orange-500 text-white rounded-xl shadow-md"><PlusIcon /></button>
            </div>

            {showAddGoal && (
              <div className="bg-white dark:bg-slate-900 border-2 border-orange-500 p-5 rounded-[2.5rem] shadow-xl animate-in zoom-in-95">
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    placeholder="es: 100kg Panca..."
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 text-sm font-bold text-slate-900 dark:text-white outline-none"
                  />
                  <button onClick={handleAddGoal} className="bg-orange-500 text-white p-3 rounded-2xl"><CheckIcon /></button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {goals.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-slate-300 text-[10px] font-black uppercase tracking-widest">Nessun obiettivo attivo</div>
              ) : (
                goals.map(g => (
                  <div key={g.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[2rem] flex items-center justify-between group shadow-sm transition-all hover:border-orange-200">
                    <div className="flex items-center gap-4 min-w-0">
                      <button onClick={() => onToggleGoal(g.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${g.completed ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                        {g.completed ? <CheckIcon /> : <TargetIcon />}
                      </button>
                      <span className={`text-sm font-bold tracking-tight uppercase truncate ${g.completed ? 'text-slate-300 line-through' : 'text-slate-900 dark:text-white'}`}>{g.title}</span>
                    </div>
                    <button onClick={() => onDeleteGoal(g.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors shrink-0"><TrashIcon /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'body' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-orange-50 dark:bg-orange-500/10 text-orange-500 p-3 rounded-2xl"><ScaleIcon /></div>
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Peso Ultimo</h4>
              </div>
              <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">{latestMetric?.weight || '--'} <span className="text-sm text-slate-400">kg</span></p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 p-3 rounded-2xl"><ActivityIcon /></div>
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Grasso Corporeo</h4>
              </div>
              <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">{latestMetric?.bodyFat || '--'} <span className="text-sm text-slate-400">%</span></p>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-[8px] text-slate-200 dark:text-slate-800 font-black uppercase tracking-[0.5em] pt-8">ENGINE v2.9.5</p>
    </div>
  );
};

export default ProfileView;
