
import React, { useState, useEffect, useRef } from 'react';
import { WorkoutDay, WorkoutLog, ExerciseLog, SetLog } from '../types';
import { XIcon, CheckIcon, PlayIcon, PlusIcon, ClockIcon, SparklesIcon } from './Icons';

interface LogWorkoutModalProps {
  day: WorkoutDay;
  planTitle: string;
  planId: string;
  onClose: () => void;
  onSave: (log: WorkoutLog) => void;
}

const LogWorkoutModal: React.FC<LogWorkoutModalProps> = ({ day, planTitle, planId, onClose, onSave }) => {
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(
    day.exercises.map(ex => ({
      name: ex.name,
      sets: Array.from({ length: ex.sets }).map(() => ({ weight: 0, reps: 0, rpe: 8, type: 'normal' })),
      notes: ''
    }))
  );

  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [totalRestTime, setTotalRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [nextTaskInfo, setNextTaskInfo] = useState<{ name: string; index: number; total: number } | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const restIntervalRef = useRef<number | null>(null);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});

  const timerPresets = [15, 30, 45, 90, 120, 180];

  useEffect(() => {
    const sessionInterval = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => {
      clearInterval(sessionInterval);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      
      const playSingleBeep = (startTime: number) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(context.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, startTime);
        gain.gain.setValueAtTime(0, startTime);
        // Gain a 0.8 per essere "forte"
        gain.gain.linearRampToValueAtTime(0.8, startTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, startTime + 0.4);
        osc.start(startTime);
        osc.stop(startTime + 0.5);
      };

      const now = context.currentTime;
      // 3 Beep in sequenza distanziati di 600ms
      playSingleBeep(now);
      playSingleBeep(now + 0.6);
      playSingleBeep(now + 1.2);
    } catch (e) {
      console.error("Errore audio:", e);
    }
  };

  const parseTimeToSeconds = (timeStr: string): number => {
    if (!timeStr || timeStr === '-') return 0;
    if (timeStr.includes("'")) {
      const parts = timeStr.split("'");
      const mins = parseInt(parts[0]) || 0;
      const secs = parseInt(parts[1].replace('"', '')) || 0;
      return mins * 60 + secs;
    }
    return parseInt(timeStr.replace('s', '')) || 90;
  };

  const initRestTimer = (duration: number, nextInfo: { name: string; index: number; total: number }) => {
    if (isResting) return;
    setRestSeconds(duration);
    setTotalRestTime(duration);
    setNextTaskInfo(nextInfo);
    setIsResting(true);
    setIsMinimized(false);
    setIsTimerActive(false);
    startCountdown();
  };

  const startCountdown = () => {
    setIsTimerActive(true);
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    restIntervalRef.current = window.setInterval(() => {
      setRestSeconds(prev => {
        if (prev <= 1) { stopRestTimer(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRestTimer = (isAuto = false) => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setIsResting(false);
    setIsMinimized(false);
    setIsTimerActive(false);
    if (isAuto) {
      // Vibrazione tripla forte sincrona con i beep
      if ('vibrate' in navigator) navigator.vibrate([300, 300, 300, 300, 300]);
      playBeep();
    }
  };

  const calculateVolume = () => {
    return exerciseLogs.reduce((total, ex) => 
      total + ex.sets.reduce((sTotal, s) => sTotal + (s.weight * s.reps), 0)
    , 0);
  };

  const handleFinishRequest = () => {
    setShowSummary(true);
  };

  const handleSave = () => {
    const log: WorkoutLog = {
      id: crypto.randomUUID(),
      planId,
      planTitle,
      dayName: day.dayName,
      date: new Date().toISOString(),
      exercises: exerciseLogs,
      totalVolume: calculateVolume()
    };
    onSave(log);
  };

  const strokeDashoffset = totalRestTime > 0 ? 282.7 - (restSeconds / totalRestTime) * 282.7 : 0;

  if (showSummary) {
    const vol = calculateVolume();
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-white/90 dark:bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 text-center shadow-2xl">
          <div className="bg-orange-500 w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-orange-500/20">
            <SparklesIcon />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Allenamento Finito!</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Ottimo lavoro, hai dato il massimo.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase block mb-1">Volume Totale</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{vol.toLocaleString()} <span className="text-xs text-slate-400">kg</span></span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase block mb-1">Tempo Totale</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">{Math.floor(secondsElapsed / 60)}'</span>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={handleSave} className="w-full py-5 bg-emerald-500 text-white dark:text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
              Salva Sessione
            </button>
            <button onClick={() => setShowSummary(false)} className="w-full py-4 text-slate-400 dark:text-slate-600 font-black text-[10px] uppercase tracking-widest">
              Torna all'Allenamento
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
      {/* Header Modal */}
      <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <XIcon />
          </button>
          <div className="min-w-0">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none truncate">{day.dayName}</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 truncate">{planTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
           <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-[10px] font-black text-slate-500 tabular-nums">
             {formatTime(secondsElapsed)}
           </div>
           <button onClick={handleFinishRequest} className="px-5 py-2.5 bg-emerald-500 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-500/20">
             Fine
           </button>
        </div>
      </div>

      {/* Main Content - Exercise List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-24">
        {exerciseLogs.map((exLog, exIdx) => (
          <div key={exIdx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
               <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex-1 mr-4">{exLog.name}</h4>
               <button 
                 onClick={() => initRestTimer(90, { name: exLog.name, index: exIdx, total: exerciseLogs.length })}
                 className="p-2 text-slate-300 hover:text-orange-500 transition-colors"
               >
                 <ClockIcon />
               </button>
            </div>

            <div className="space-y-3">
               <div className="grid grid-cols-12 gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest px-4 mb-1">
                 <div className="col-span-1">Set</div>
                 <div className="col-span-4 text-center">Peso (kg)</div>
                 <div className="col-span-4 text-center">Reps</div>
                 <div className="col-span-3 text-right">OK</div>
               </div>

               {exLog.sets.map((set, setIdx) => {
                 const setKey = `${exIdx}-${setIdx}`;
                 const isCompleted = completedSets[setKey];

                 return (
                   <div key={setIdx} className={`grid grid-cols-12 items-center gap-2 p-2 rounded-2xl transition-all ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-950 border border-transparent'}`}>
                     <div className="col-span-1 text-[10px] font-black text-slate-400 text-center">{setIdx + 1}</div>
                     <div className="col-span-4">
                       <input 
                         type="number" 
                         value={set.weight || ''} 
                         onChange={(e) => {
                           const newLogs = [...exerciseLogs];
                           newLogs[exIdx].sets[setIdx].weight = parseFloat(e.target.value) || 0;
                           setExerciseLogs(newLogs);
                         }}
                         placeholder="0"
                         className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-2 py-2.5 text-center text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-colors"
                       />
                     </div>
                     <div className="col-span-4">
                       <input 
                         type="number" 
                         value={set.reps || ''} 
                         onChange={(e) => {
                           const newLogs = [...exerciseLogs];
                           newLogs[exIdx].sets[setIdx].reps = parseInt(e.target.value) || 0;
                           setExerciseLogs(newLogs);
                         }}
                         placeholder="0"
                         className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-2 py-2.5 text-center text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-colors"
                       />
                     </div>
                     <div className="col-span-3 flex justify-end">
                       <button 
                         onClick={() => {
                           setCompletedSets(prev => ({ ...prev, [setKey]: !prev[setKey] }));
                           if (!isCompleted) {
                             const duration = parseTimeToSeconds(day.exercises[exIdx].rest);
                             if (duration > 0) initRestTimer(duration, { name: exLog.name, index: exIdx, total: exerciseLogs.length });
                           }
                         }}
                         className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-slate-900 text-slate-200 border border-slate-100 dark:border-slate-800'}`}
                       >
                         <CheckIcon />
                       </button>
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Rest Timer Modal */}
      {isResting && (
        <div className="fixed inset-x-4 bottom-24 md:bottom-32 z-[110] bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20"><ClockIcon /></div>
                <div className="min-w-0">
                   <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recupero in corso</h5>
                   <p className="text-xs font-black text-white uppercase tracking-tight truncate">{nextTaskInfo?.name}</p>
                </div>
             </div>
             <button onClick={() => stopRestTimer()} className="p-2 text-slate-500 hover:text-white transition-colors"><XIcon /></button>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-24 h-24 -rotate-90">
                   <circle cx="48" cy="48" r="45" className="stroke-slate-800 fill-none" strokeWidth="6" />
                   <circle 
                     cx="48" cy="48" r="45" 
                     className="stroke-orange-500 fill-none transition-all duration-1000" 
                     strokeWidth="6" 
                     strokeDasharray="282.7" 
                     strokeDashoffset={strokeDashoffset}
                     strokeLinecap="round"
                   />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                   <span className="text-2xl font-black text-white tabular-nums">{restSeconds}</span>
                </div>
             </div>

             <div className="flex-1 grid grid-cols-2 gap-2">
                {[30, 60].map(s => (
                  <button key={s} onClick={() => { setRestSeconds(prev => prev + s); setTotalRestTime(prev => prev + s); }} className="py-2.5 bg-slate-800 text-[9px] font-black text-white rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors">+{s}s</button>
                ))}
                <button onClick={() => stopRestTimer()} className="col-span-2 py-2.5 bg-white text-slate-950 text-[9px] font-black rounded-xl uppercase tracking-widest active:scale-95 transition-all">Salta Recupero</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogWorkoutModal;
