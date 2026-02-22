
import React from 'react';
import { DumbbellIcon, HistoryIcon, UsersIcon, UserIcon } from './Icons';

interface BottomNavbarProps {
  activeView: 'home' | 'plans' | 'history' | 'profile' | 'social' | 'payments' | 'goals';
  onViewChange: (view: 'home' | 'plans' | 'history' | 'profile' | 'social' | 'payments' | 'goals') => void;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id: 'plans', label: 'Piani', icon: <DumbbellIcon /> },
    { id: 'social', label: 'Social', icon: <UsersIcon /> },
    { id: 'history', label: 'Log', icon: <HistoryIcon /> },
    { id: 'profile', label: 'Profilo', icon: <UserIcon /> },
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-8 pt-2 pointer-events-none">
      <nav className="w-full max-w-md bg-white/95 dark:bg-slate-900/98 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-1.5 flex items-center justify-around shadow-lg shadow-slate-200/50 dark:shadow-black/50 pointer-events-auto transition-all duration-300">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative py-2.5 px-4 rounded-3xl ${
              activeView === item.id 
                ? 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <div className={`transition-transform duration-300 ${activeView === item.id ? 'scale-110' : 'scale-100'}`}>
              {item.icon}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest transition-opacity duration-300 ${activeView === item.id ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default BottomNavbar;
