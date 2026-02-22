
import React, { useState, useMemo } from 'react';
import { GoalItem, BodyMetric } from '../types';
import { TargetIcon, PlusIcon, TrashIcon, CheckIcon, XIcon, CalendarIcon, ScaleIcon, ActivityIcon } from './Icons';

interface GoalsViewProps {
  goals: GoalItem[];
  onAddGoal: (goal: GoalItem) => void;
  onDeleteGoal: (id: string) => void;
  onToggleGoal: (id: string) => void;
  metrics: BodyMetric[];
  onAddMetric: (metric: BodyMetric) => void;
  onDeleteMetric: (id: string) => void;
}

const GoalsView: React.FC<GoalsViewProps> = ({ 
  goals, onAddGoal, onDeleteGoal, onToggleGoal,
  metrics, onAddMetric, onDeleteMetric 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'targets' | 'composition'>('targets');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showMetricForm, setShowMetricForm] = useState(false);

  // Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalCategory, setGoalCategory] = useState<GoalItem['category']>('strength');

  // Metric Form State
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [metricDate, setMetricDate] = useState(new Date().toISOString().split('T')[0]);

  const sortedMetrics = useMemo(() => 
    [...metrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  , [metrics]);

  const latestMetric = sortedMetrics[sortedMetrics.length - 1];
  const previousMetric = sortedMetrics[sortedMetrics.length - 2];
  const weightChange = latestMetric && previousMetric 
    ? (latestMetric.weight - previousMetric.weight).toFixed(1) 
    : '0';

  const handleAddGoal = () => {
    if (!goalTitle.trim()) return;
    onAddGoal({
      id: crypto.randomUUID(),
      title: goalTitle.trim(),
      targetDate: goalDate || undefined,
      completed: false,
      category: goalCategory
    });
    setGoalTitle('');
    setGoalDate('');
    setShowGoalForm(false);
  };

  const handleAddMetric = () => {
    if (!weight) return;
    onAddMetric({
      id: crypto.randomUUID(),
      date: metricDate,
      weight: parseFloat(weight),
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      muscleMass: muscleMass ? parseFloat(muscleMass) : undefined
    });
    setWeight('');
    setBodyFat('');
    setMuscleMass('');
    setShowMetricForm(false);
  };

  const renderProgressChart = () => {
    if (sortedMetrics.length < 2) return null;
    const width = 600;
    const height = 200;
    const padding = 40;
    const weights = sortedMetrics.map(m => m.weight);
    const maxW = Math.max(...weights) + 1;
    const minW = Math.min(...weights) - 1;
    const range = maxW - minW || 1;
    const points = sortedMetrics.map((m, i) => ({
      x: padding + (i * (width - 2 * padding) / (sortedMetrics.length - 1)),
      y: height - padding - ((m.weight - minW) / range * (height - 2 * padding)),
      weight: m.weight,
      date: m.date
    }));
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div className="w-full overflow-x-auto no-scrollbar py-4">
        <div className="min-w-[400px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#metricGradient)" />
            <path d={linePath} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="4" fill="#f97316" stroke="#0f172a" strokeWidth="2" />
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">Obiettivi & Corpo</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Traccia la tua evoluzione completa</p>
        </div>
        
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start">
          <button 
            onClick={() => setActiveSubTab('targets')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-tight ${activeSubTab === 'targets' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Traguardi
          </button>
          <button 
            onClick={() => setActiveSubTab('composition')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-tight ${activeSubTab === 'composition' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Composizione
          </button>
        </div>
      </div>

      {activeSubTab === 'targets' ? (
        <div className="space-y-6">
          {/* Targets Hero */}
          <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <TargetIcon />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Miglioramento Continuo</h3>
            <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">Definisci i tuoi record personali, traguardi di forza o obiettivi di benessere. Supera te stesso ogni giorno.</p>
            <button 
              onClick={() => setShowGoalForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-orange-500/20"
            >
              Nuovo Obiettivo
            </button>
          </div>

          {showGoalForm && (
            <div className="bg-slate-900 border-2 border-orange-500/30 p-8 rounded-[3rem] shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Aggiungi Traguardo</h4>
                <button onClick={() => setShowGoalForm(false)} className="text-slate-500 hover:text-white bg-slate-800 p-2 rounded-xl"><XIcon /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-black text-orange-500 uppercase px-1">Cosa vuoi raggiungere?</label>
                  <input type="text" placeholder="es. 100kg Panca Piana" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase px-1">Data Target</label>
                  <input type="date" value={goalDate} onChange={(e) => setGoalDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase px-1">Categoria</label>
                  <select value={goalCategory} onChange={(e) => setGoalCategory(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold outline-none appearance-none">
                    <option value="strength">Forza</option>
                    <option value="weight">Peso</option>
                    <option value="endurance">Resistenza</option>
                    <option value="other">Altro</option>
                  </select>
                </div>
              </div>
              <button onClick={handleAddGoal} className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-200 active:scale-95 transition-all">Salva Obiettivo</button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-600 border-2 border-slate-800 border-dashed rounded-[2.5rem]">
                Nessun obiettivo attivo.
              </div>
            ) : (
              goals.map(goal => (
                <div key={goal.id} className={`p-6 rounded-[2rem] border transition-all duration-300 flex items-start gap-4 ${goal.completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900 border-slate-800 hover:border-orange-500/30 group'}`}>
                  <button onClick={() => onToggleGoal(goal.id)} className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${goal.completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500 hover:text-orange-500'}`}>
                    {goal.completed ? <CheckIcon /> : <TargetIcon />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-black text-lg truncate ${goal.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{goal.title}</h4>
                      <button onClick={() => onDeleteGoal(goal.id)} className="p-1.5 text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon /></button>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-slate-800 rounded-lg text-slate-400">{goal.category}</span>
                      {goal.targetDate && (
                        <div className="flex items-center gap-1 text-slate-500"><CalendarIcon /><span className="text-[10px] font-bold">{new Date(goal.targetDate).toLocaleDateString()}</span></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Composition Hero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
              <div className="absolute -right-6 -top-6 opacity-5 scale-[2.5] rotate-12 pointer-events-none transition-transform duration-700 group-hover:rotate-0"><ScaleIcon /></div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Peso Attuale</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-white tracking-tighter">{latestMetric?.weight || '--'}</span>
                <span className="text-xl font-bold text-slate-600">KG</span>
                {latestMetric && previousMetric && (
                  <div className={`ml-4 flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs ${parseFloat(weightChange) > 0 ? 'text-orange-400 bg-orange-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
                    {parseFloat(weightChange) > 0 ? '▲' : '▼'} {Math.abs(parseFloat(weightChange))} kg
                  </div>
                )}
              </div>
              <button onClick={() => setShowMetricForm(true)} className="mt-8 w-full py-4 bg-orange-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all">Nuova Pesata</button>
            </div>
            
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between gap-4">
              <div className="flex justify-between items-center p-5 bg-slate-950/40 rounded-3xl border border-slate-800/50">
                <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Massa Grassa</p><p className="text-2xl font-black text-white">{latestMetric?.bodyFat || '--'}%</p></div>
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center"><ActivityIcon /></div>
              </div>
              <div className="flex justify-between items-center p-5 bg-slate-950/40 rounded-3xl border border-slate-800/50">
                <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Massa Muscolare</p><p className="text-2xl font-black text-white">{latestMetric?.muscleMass || '--'}%</p></div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><CheckIcon /></div>
              </div>
            </div>
          </div>

          {showMetricForm && (
            <div className="bg-slate-900 border-2 border-orange-500/30 p-8 rounded-[3rem] shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Registra Misurazione</h4>
                <button onClick={() => setShowMetricForm(false)} className="text-slate-500 p-2 bg-slate-800 rounded-xl"><XIcon /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-orange-500 uppercase px-1">Peso (kg)</label><input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold outline-none" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase px-1">Data</label><input type="date" value={metricDate} onChange={(e) => setMetricDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold outline-none" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase px-1">Grasso (%)</label><input type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold outline-none" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-500 uppercase px-1">Muscolo (%)</label><input type="number" step="0.1" value={muscleMass} onChange={(e) => setMuscleMass(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold outline-none" /></div>
              </div>
              <button onClick={handleAddMetric} className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all">Conferma Rilevazione</button>
            </div>
          )}

          {sortedMetrics.length >= 2 && (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Grafico Peso</h4>
              {renderProgressChart()}
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Storico Misurazioni</h4>
            {[...sortedMetrics].reverse().map(m => (
              <div key={m.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-800 p-3 rounded-xl text-slate-500"><CalendarIcon /></div>
                  <div><p className="font-black text-white text-lg">{m.weight} kg</p><p className="text-[9px] text-slate-500 uppercase font-bold">{new Date(m.date).toLocaleDateString()}</p></div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:grid grid-cols-2 gap-4 text-right">
                    <div><p className="text-[8px] font-black text-slate-600 uppercase">Grasso</p><p className="text-xs font-bold text-slate-400">{m.bodyFat || '--'}%</p></div>
                    <div><p className="text-[8px] font-black text-slate-600 uppercase">Muscolo</p><p className="text-xs font-bold text-slate-400">{m.muscleMass || '--'}%</p></div>
                  </div>
                  <button onClick={() => onDeleteMetric(m.id)} className="p-2 text-slate-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><TrashIcon /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsView;
