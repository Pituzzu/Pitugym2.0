
import React, { useState } from 'react';
import { WorkoutPlan, WorkoutDay } from '../types';
import { PlusIcon, CheckIcon, SparklesIcon } from './Icons';
import { generateWorkoutWithAI } from '../services/geminiService';

interface WorkoutGeneratorProps {
  onPlanGenerated: (plan: WorkoutPlan) => void;
}

const WorkoutGenerator: React.FC<WorkoutGeneratorProps> = ({ onPlanGenerated }) => {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [frequency, setFrequency] = useState(3);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateManual = () => {
    if (!title.trim()) return alert("Inserisci un titolo per la scheda");
    
    const emptyDays: WorkoutDay[] = Array.from({ length: frequency }).map((_, i) => ({
      id: crypto.randomUUID(),
      dayName: `Giorno ${i + 1}`,
      exercises: []
    }));

    onPlanGenerated({
      id: crypto.randomUUID(),
      title: title.trim(),
      goal: goal.trim() || undefined,
      frequency,
      createdAt: new Date().toISOString(),
      days: emptyDays
    });
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return alert("Descrivi che tipo di allenamento desideri");
    setIsGenerating(true);
    try {
      const generated = await generateWorkoutWithAI(aiPrompt);
      const fullPlan: WorkoutPlan = {
        id: crypto.randomUUID(),
        title: generated.title || "Scheda AI",
        goal: generated.goal || "Generato da AI",
        frequency: generated.frequency || 3,
        createdAt: new Date().toISOString(),
        days: (generated.days || []).map(day => ({
          ...day,
          id: crypto.randomUUID()
        }))
      };
      onPlanGenerated(fullPlan);
    } catch (error: any) {
      alert(error.message || "Errore durante la generazione AI");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* AI GENERATOR SECTION */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-orange-500 scale-[3] rotate-12">
          <SparklesIcon />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
              <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/20"><SparklesIcon /></div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none">Generatore AI</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6 font-medium leading-relaxed">
            Descrivi i tuoi obiettivi (es. "Voglio una scheda per ipertrofia 3 giorni a settimana focus gambe") e l'intelligenza artificiale creerà una scheda professionale per te.
          </p>
          <div className="space-y-4">
            <textarea 
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Descrivi il tuo allenamento ideale..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500 transition-all resize-none h-24 text-sm"
            />
            <button 
              onClick={handleGenerateAI}
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full py-5 bg-orange-500 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><SparklesIcon /> Genera con AI</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4">
        <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
        <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Oppure</span>
        <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800"></div>
      </div>

      {/* MANUAL CREATOR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[3rem] shadow-sm">
        <div className="flex items-center gap-4 mb-6">
            <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/20"><PlusIcon /></div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Nuova Scheda</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Titolo Scheda</label>
              <input 
                type="text" 
                placeholder="es. Massa Invernale" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold outline-none focus:border-orange-500 transition-all" 
              />
          </div>

          <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Obiettivo Principale</label>
              <input 
                type="text" 
                placeholder="es. Ipertrofia, Forza..." 
                value={goal} 
                onChange={(e) => setGoal(e.target.value)} 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold outline-none focus:border-orange-500 transition-all" 
              />
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center px-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequenza Settimanale</label>
               <span className="text-orange-500 font-black text-sm">{frequency} GIORNI</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          <button 
            onClick={handleCreateManual} 
            disabled={!title.trim()}
            className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-2xl uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon /> Crea Scheda Vuota
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutGenerator;
