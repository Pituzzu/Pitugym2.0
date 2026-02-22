
import React, { useState, useMemo } from 'react';
import { BodyMetric } from '../types';
import { ScaleIcon, PlusIcon, TrashIcon, XIcon, ActivityIcon, CalendarIcon, CheckIcon } from './Icons';

interface BodyMetricsViewProps {
  metrics: BodyMetric[];
  onAddMetric: (metric: BodyMetric) => void;
  onDeleteMetric: (id: string) => void;
}

const BodyMetricsView: React.FC<BodyMetricsViewProps> = ({ metrics, onAddMetric, onDeleteMetric }) => {
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const sortedMetrics = useMemo(() => 
    [...metrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  , [metrics]);

  const latestMetric = sortedMetrics[sortedMetrics.length - 1];
  const previousMetric = sortedMetrics[sortedMetrics.length - 2];

  const weightChange = latestMetric && previousMetric 
    ? (latestMetric.weight - previousMetric.weight).toFixed(1) 
    : '0';

  const handleAdd = () => {
    if (!weight) return;
    const newMetric: BodyMetric = {
      id: crypto.randomUUID(),
      date,
      weight: parseFloat(weight),
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      muscleMass: muscleMass ? parseFloat(muscleMass) : undefined
    };
    onAddMetric(newMetric);
    setWeight('');
    setBodyFat('');
    setMuscleMass('');
    setShowForm(false);
  };

  const renderChart = () => {
    if (sortedMetrics.length < 2) return null;

    const width = 600;
    const height = 240;
    const padding = 50;
    
    const weights = sortedMetrics.map(m => m.weight);
    const maxW = Math.max(...weights) + 0.5;
    const minW = Math.min(...weights) - 0.5;
    const range = maxW - minW || 1;

    const points = sortedMetrics.map((m, i) => {
      const x = padding + (i * (width - 2 * padding) / (sortedMetrics.length - 1));
      const y = height - padding - ((m.weight - minW) / range * (height - 2 * padding));
      return { x, y, data: m };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div className="relative w-full overflow-x-auto no-scrollbar py-6">
        <div className="min-w-[500px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1e293b" strokeWidth="1" />
            
            {/* Area & Line */}
            <path d={areaPath} fill="url(#weightGradient)" />
            <path d={linePath} fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Points */}
            {points.map((p, i) => (
              <g key={i} className="group cursor-pointer">
                <circle cx={p.x} cy={p.y} r="6" fill="#f97316" stroke="#0f172a" strokeWidth="3" />
                <text x={p.x} y={p.y - 15} textAnchor="middle" className="text-[10px] font-black fill-white opacity-0 group-hover:opacity-100 transition-opacity">{p.data.weight}kg</text>
                <text x={p.x} y={height - padding + 20} textAnchor="middle" className="text-[9px] font-bold fill-slate-500">{new Date(p.data.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">Composizione Corporea</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Analisi antropometrica e trend</p>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
          <div className="absolute -right-6 -top-6 opacity-5 scale-[2.5] rotate-12 group-hover:rotate-0 transition-all duration-700 pointer-events-none">
            <ScaleIcon />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Peso Attuale</p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-white tracking-tighter">{latestMetric?.weight || '--'}</span>
            <span className="text-xl font-bold text-slate-600 uppercase">kg</span>
            {latestMetric && previousMetric && (
              <div className={`ml-4 flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs ${parseFloat(weightChange) > 0 ? 'text-orange-400 bg-orange-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
                <span>{parseFloat(weightChange) > 0 ? '▲' : '▼'}</span>
                <span>{Math.abs(parseFloat(weightChange))} kg</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="mt-10 w-full py-5 bg-white text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl hover:bg-slate-200"
          >
            Registra Nuova Pesata
          </button>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between gap-6">
          <div className="flex justify-between items-center p-6 bg-slate-950/40 rounded-3xl border border-slate-800/50">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Massa Grassa</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-white">{latestMetric?.bodyFat || '--'}</p>
                <p className="text-sm font-bold text-slate-600">%</p>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <ActivityIcon />
            </div>
          </div>
          <div className="flex justify-between items-center p-6 bg-slate-950/40 rounded-3xl border border-slate-800/50">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Massa Muscolare</p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-white">{latestMetric?.muscleMass || '--'}</p>
                <p className="text-sm font-bold text-slate-600">%</p>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckIcon />
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-900 border-2 border-orange-500/30 p-8 rounded-[3rem] shadow-[0_0_50px_-12px_rgba(249,115,22,0.2)] space-y-8 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Aggiungi Dati Corporei</h4>
            <button onClick={() => setShowForm(false)} className="p-2 text-slate-500 hover:text-white bg-slate-800 rounded-xl transition-colors"><XIcon /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1">
                <label className="text-[10px] font-black text-orange-500 uppercase px-1">Peso (kg)</label>
                <input type="number" step="0.1" autoFocus placeholder="0.0" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500 transition-colors" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase px-1">Data Rilevazione</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500 transition-colors" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase px-1">Massa Grassa (%)</label>
                <input type="number" step="0.1" placeholder="--" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500 transition-colors" />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase px-1">Massa Muscolare (%)</label>
                <input type="number" step="0.1" placeholder="--" value={muscleMass} onChange={(e) => setMuscleMass(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-orange-500 transition-colors" />
             </div>
          </div>

          <button onClick={handleAdd} className="w-full py-5 bg-orange-500 text-white font-black rounded-2xl uppercase tracking-widest text-sm hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95">
            Salva Misurazioni
          </button>
        </div>
      )}

      {/* Chart Card */}
      {sortedMetrics.length >= 2 && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500/10 p-2 rounded-xl text-orange-500">
               <ScaleIcon />
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Andamento Peso</h4>
          </div>
          {renderChart()}
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Storico Misurazioni</h4>
        {sortedMetrics.length === 0 ? (
          <div className="py-20 text-center text-slate-600 border-2 border-slate-800 border-dashed rounded-[2.5rem]">
            <ScaleIcon />
            <p className="mt-4 font-black uppercase tracking-widest text-xs">Ancora nessuna misurazione</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {[...sortedMetrics].reverse().map(m => (
              <div key={m.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex items-center justify-between group hover:border-slate-700 transition-all">
                <div className="flex items-center gap-6">
                  <div className="bg-slate-800 p-4 rounded-2xl text-slate-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <CalendarIcon />
                  </div>
                  <div>
                    <p className="font-black text-white text-xl">{m.weight} <span className="text-xs text-slate-500 font-bold">kg</span></p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">{new Date(m.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="hidden sm:grid grid-cols-2 gap-6 text-right">
                    <div>
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Grasso</p>
                      <p className="text-sm font-bold text-slate-300">{m.bodyFat ? `${m.bodyFat}%` : '--'}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Muscolo</p>
                      <p className="text-sm font-bold text-slate-300">{m.muscleMass ? `${m.muscleMass}%` : '--'}</p>
                    </div>
                  </div>
                  <button onClick={() => onDeleteMetric(m.id)} className="p-3 text-slate-700 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyMetricsView;
