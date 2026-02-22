
import React, { useState, useEffect } from 'react';
import { WorkoutPlan, Exercise, WorkoutLog } from '../types';
import { TrashIcon, EditIcon, CheckIcon, XIcon, PlusIcon, PlayIcon } from './Icons';
import LogWorkoutModal from './LogWorkoutModal';

interface PlanDisplayProps {
  plan: WorkoutPlan;
  onDelete: (id: string) => void;
  onUpdate: (plan: WorkoutPlan) => void;
  onLogSaved: (log: WorkoutLog) => void;
}

interface EditState {
  dayIdx: number;
  exIdx: number;
  data: Exercise;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onDelete, onUpdate, onLogSaved }) => {
  const [editing, setEditing] = useState<EditState | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [showLogModal, setShowLogModal] = useState(false);

  useEffect(() => {
    setActiveDayIdx(0);
  }, [plan.id]);

  const startEditing = (dayIdx: number, exIdx: number, ex: Exercise) => {
    setEditing({ dayIdx, exIdx, data: { ...ex } });
  };

  const saveEditing = () => {
    if (!editing) return;
    const newPlan = { ...plan };
    newPlan.days = [...plan.days];
    newPlan.days[editing.dayIdx] = { ...newPlan.days[editing.dayIdx] };
    newPlan.days[editing.dayIdx].exercises = [...newPlan.days[editing.dayIdx].exercises];
    newPlan.days[editing.dayIdx].exercises[editing.exIdx] = editing.data;
    onUpdate(newPlan);
    setEditing(null);
  };

  const handleAddExercise = () => {
    const newPlan = { ...plan };
    const newExercise: Exercise = {
        name: "Nuovo Esercizio",
        sets: 3,
        reps: "10",
        rest: "90s",
        notes: ""
    };
    newPlan.days[activeDayIdx].exercises.push(newExercise);
    onUpdate(newPlan);
    // Avvia modifica immediatamente
    setEditing({ 
        dayIdx: activeDayIdx, 
        exIdx: newPlan.days[activeDayIdx].exercises.length - 1, 
        data: newExercise 
    });
  };

  const handleDeleteExercise = (dayIdx: number, exIdx: number) => {
    if(!confirm("Vuoi davvero eliminare questo esercizio?")) return;
    const newPlan = { ...plan };
    newPlan.days = [ ...plan.days ];
    newPlan.days[dayIdx] = { ...plan.days[dayIdx], exercises: [...plan.days[dayIdx].exercises] };
    newPlan.days[dayIdx].exercises.splice(exIdx, 1);
    onUpdate(newPlan);
    setEditing(null);
  };

  const currentDay = plan.days[activeDayIdx];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {showLogModal && (
        <LogWorkoutModal
          day={{ ...currentDay, exercises: currentDay.exercises.filter(ex => !ex.isHeader) }}
          planTitle={plan.title}
          planId={plan.id}
          onClose={() => setShowLogModal(false)}
          onSave={(log) => { onLogSaved(log); setShowLogModal(false); }}
        />
      )}

      {/* Header Scheda - Responsive e Light */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight uppercase break-words hyphens-auto">
              {plan.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                {plan.frequency} Sessioni
              </span>
              {plan.goal && (
                <span className="px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-100 dark:border-orange-500/20 rounded-full text-[9px] font-black uppercase tracking-widest truncate max-w-[150px]">
                  {plan.goal}
                </span>
              )}
              <button 
                onClick={() => onUpdate({ ...plan, isPublic: !plan.isPublic })}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${
                  plan.isPublic 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-100 dark:border-emerald-500/20' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${plan.isPublic ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                {plan.isPublic ? 'Condivisa' : 'Privata'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowLogModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-orange-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-orange-500/20 uppercase tracking-widest active:scale-95 transition-all"
            >
              <PlayIcon /> Inizia
            </button>
            <button
              onClick={() => onDelete(plan.id)}
              className="p-4 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Selettore Giorni - Responsive */}
      <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-x-auto no-scrollbar scroll-smooth snap-x">
        {plan.days.map((day, idx) => (
          <button
            key={idx}
            onClick={() => setActiveDayIdx(idx)}
            className={`snap-start whitespace-nowrap min-w-[100px] flex-1 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
              activeDayIdx === idx
                ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm border border-slate-100 dark:border-slate-700'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {day.dayName.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Lista Esercizi - Migliorato Responsive Testi */}
      <div className="space-y-4">
        {currentDay.exercises.map((ex, exIdx) => {
          const isEditing = editing?.dayIdx === activeDayIdx && editing?.exIdx === exIdx;
          
          if (isEditing) {
            return (
              <div key={exIdx} className="bg-white dark:bg-slate-900 border-2 border-orange-500 p-6 rounded-[2.5rem] shadow-xl space-y-4 animate-in zoom-in-95">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Esercizio</label>
                    <input 
                    type="text" 
                    value={editing.data.name} 
                    onChange={(e) => setEditing({...editing, data: {...editing.data, name: e.target.value}})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-colors" 
                    />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Serie</label>
                        <input type="number" value={editing.data.sets} onChange={(e) => setEditing({...editing, data: {...editing.data, sets: parseInt(e.target.value) || 0}})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-colors" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Reps</label>
                        <input type="text" value={editing.data.reps} onChange={(e) => setEditing({...editing, data: {...editing.data, reps: e.target.value}})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-colors" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Recupero</label>
                        <input type="text" value={editing.data.rest} onChange={(e) => setEditing({...editing, data: {...editing.data, rest: e.target.value}})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-colors" />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Note</label>
                    <textarea 
                        value={editing.data.notes || ''} 
                        onChange={(e) => setEditing({...editing, data: {...editing.data, notes: e.target.value}})}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-colors resize-none h-20"
                    />
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={saveEditing} className="flex-1 py-3 bg-orange-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-colors">Salva Modifiche</button>
                  <button onClick={() => handleDeleteExercise(editing.dayIdx, editing.exIdx)} className="px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors"><TrashIcon /></button>
                  <button onClick={() => setEditing(null)} className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white rounded-xl transition-colors"><XIcon /></button>
                </div>
              </div>
            );
          }

          if (ex.isHeader) {
            return (
              <div key={exIdx} className="py-2 flex items-center gap-4">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] whitespace-nowrap">{ex.name}</h3>
                <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
              </div>
            );
          }

          return (
            <div key={exIdx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[2rem] shadow-sm hover:border-orange-200 dark:hover:border-orange-500/30 transition-all group">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h4 className="font-black text-slate-900 dark:text-white text-base md:text-lg uppercase tracking-tight leading-tight break-words hyphens-auto flex-1">
                  {ex.name}
                </h4>
                <button 
                  onClick={() => startEditing(activeDayIdx, exIdx, ex)}
                  className="p-2 text-slate-300 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                >
                  <EditIcon />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl text-center flex flex-col justify-center min-w-0">
                  <span className="text-[7px] md:text-[8px] uppercase font-black text-slate-400 block mb-0.5 tracking-widest">Serie</span>
                  <span className="text-xs md:text-sm font-black text-slate-900 dark:text-white truncate">{ex.sets}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl text-center flex flex-col justify-center min-w-0">
                  <span className="text-[7px] md:text-[8px] uppercase font-black text-slate-400 block mb-0.5 tracking-widest">Reps</span>
                  <span className="text-xs md:text-sm font-black text-slate-900 dark:text-white truncate">{ex.reps}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl text-center flex flex-col justify-center min-w-0">
                  <span className="text-[7px] md:text-[8px] uppercase font-black text-slate-400 block mb-0.5 tracking-widest">Rest</span>
                  <span className="text-xs md:text-sm font-black text-slate-900 dark:text-white truncate">{ex.rest || '90s'}</span>
                </div>
              </div>

              {ex.notes && (
                <p className="mt-3 text-[10px] text-slate-400 font-medium italic break-words leading-relaxed px-1">
                  {ex.notes}
                </p>
              )}
            </div>
          );
        })}

        <button 
            onClick={handleAddExercise}
            className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] text-slate-400 font-black uppercase tracking-widest text-[10px] hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all flex items-center justify-center gap-2"
        >
            <PlusIcon /> Aggiungi Esercizio
        </button>
      </div>
    </div>
  );
};

export default PlanDisplay;
