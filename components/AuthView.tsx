
import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../services/firebase';
import { DumbbellIcon, PlayIcon } from './Icons';

const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      let msg = "Si è verificato un errore.";
      if (err.code === 'auth/invalid-email') msg = "Email non valida.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = "Credenziali errate.";
      if (err.code === 'auth/email-already-in-use') msg = "Email già registrata.";
      if (err.code === 'auth/weak-password') msg = "Password troppo debole (min 6 caratteri).";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex bg-orange-500 p-4 rounded-3xl text-white shadow-xl shadow-orange-500/20 mb-2">
            <div className="scale-150"><DumbbellIcon /></div>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
              PITU<span className="text-orange-500">GYM</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-2">
              Professional Workout Manager
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[3rem] shadow-2xl">
          <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] mb-8">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                isLogin 
                  ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm' 
                  : 'text-slate-400'
              }`}
            >
              Accedi
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                !isLogin 
                  ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm' 
                  : 'text-slate-400'
              }`}
            >
              Registrati
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tuo@email.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl">
                <p className="text-[10px] font-bold text-red-500 uppercase text-center">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-orange-500 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Attendere...' : (isLogin ? 'Entra in Palestra' : 'Crea Account')}
            </button>
          </form>
        </div>

        <p className="text-center text-[9px] text-slate-300 dark:text-slate-700 font-black uppercase tracking-widest">
          By Pituzzu & Firebase
        </p>
      </div>
    </div>
  );
};

export default AuthView;
