
import React, { useState, useMemo } from 'react';
import { WorkoutLog } from '../types';
import { TrashIcon, CalendarIcon, ActivityIcon, BarChartIcon, ClockIcon, XIcon } from './Icons';

interface WorkoutHistoryProps {
  logs: WorkoutLog[];
  onDeleteLog: (id: string) => void;
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ logs, onDeleteLog }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedExerciseProgress, setSelectedExerciseProgress] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');

  const sortedLogs = useMemo(() => 
    [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  , [logs]);

  const uniqueExercises = useMemo(() => {
    const exerciseSet = new Set<string>();
    logs.forEach(log => {
      log.exercises.forEach(ex => exerciseSet.add(ex.name));
    });
    return Array.from(exerciseSet).sort();
  }, [logs]);

  const progressData = useMemo(() => {
    if (!selectedExerciseProgress) return [];
    
    return logs
      .filter(log => log.exercises.some(ex => ex.name === selectedExerciseProgress))
      .map(log => {
        const exercise = log.exercises.find(ex => ex.name === selectedExerciseProgress)!;
        const maxWeight = Math.max(...exercise.sets.map(s => s.weight));
        const totalVolume = exercise.sets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
        return {
          date: new Date(log.date),
          maxWeight,
          totalVolume,
          formattedDate: new Date(log.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [selectedExerciseProgress, logs]);

  const renderProgressChart = () => {
    if (!progressData.length) return null;

    const width = 600;
    const height = 200;
    const padding = 40;
    
    const maxWeight = Math.max(...progressData.map(d => d.maxWeight), 1);
    const minWeight = Math.min(...progressData.map(d => d.maxWeight), 0);
    const range = maxWeight - minWeight || 1;

    const points = progressData.map((d, i) => {
      const x = padding + (i * (width - 2 * padding) / (progressData.length - 1 || 1));
      const y = height - padding - ((d.maxWeight - minWeight) / range * (height - 2 * padding));
      return { x, y, data: d };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div className="relative w-full overflow-x-auto no-scrollbar py-6">
        <div className="min-w-[500px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1e293b" strokeWidth="1" />
            <path d={areaPath} fill="url(#chartGradient)" />
            <path d={linePath} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
              <g key={i} className="group cursor-pointer">
                <circle cx={p.x} cy={p.y} r="5" fill="#f97316" className="transition-all duration-300 group-hover:r-8" />
                <text x={p.x} y={height - padding + 20} textAnchor="middle" className="text-[10px] fill-slate-500 font-bold">{p.data.formattedDate}</text>
                <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <rect x={p.x - 25} y={p.y - 35} width="50" height="25" rx="6" fill="#0f172a" stroke="#f97316" strokeWidth="1" />
                  <text x={p.x} y={p.y - 18} textAnchor="middle" className="text-[10px] fill-white font-black">{p.data.maxWeight}kg</text>
                </g>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-slate-900/40 border border-slate-800 rounded-[2.5rem]">
        <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center text-slate-500 mb-6">
          <ActivityIcon />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Ancora Nessun Dato</h2>
        <p className="text-slate-400 max-w-xs text-sm">Completa il tuo primo allenamento per sbloccare la cronologia e l'analisi dei progressi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 mb-2">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Cronologia</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Traccia ogni singola sessione</p>
        </div>
        
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-center">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-tight ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Sessioni
          </button>
          <button 
            onClick={() => setViewMode('analytics')}
            className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-tight ${viewMode === 'analytics' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Analisi
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-4">
          {sortedLogs.map((log) => {
            const totalVolume = log.exercises.reduce((acc, ex) => 
              acc + ex.sets.reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0), 0);
            const isExpanded = expandedId === log.id;

            return (
              <div key={log.id} className={`group bg-slate-900/40 border transition-all duration-300 rounded-[2rem] overflow-hidden ${isExpanded ? 'border-orange-500/30 ring-1 ring-orange-500/10' : 'border-slate-800 hover:border-slate-700'}`}>
                <div 
                  className="p-5 md:p-6 cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all ${isExpanded ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                        <CalendarIcon />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.15em] mb-0.5">{log.dayName}</p>
                        <h3 className="font-black text-white text-base md:text-lg tracking-tight truncate leading-tight">
                          {new Date(log.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </h3>
                        <p className="text-[9px] text-slate-500 font-bold uppercase truncate mt-0.5">{log.planTitle}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end shrink-0">
                      <div className="text-right">
                        <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block mb-0.5">Volume</span>
                        <span className="text-lg md:text-xl font-black text-white tabular-nums leading-none">
                          {totalVolume.toLocaleString()}
                          <span className="text-[10px] font-bold text-slate-500 ml-1 uppercase">kg</span>
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-lg">
                        <ActivityIcon />
                        <span className="text-[9px] font-black text-slate-400">{log.exercises.length} ES.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-6 border-t border-slate-800/50 pt-6 animate-in slide-in-from-top-2 duration-300 bg-slate-900/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {log.exercises.map((ex, idx) => (
                        <div key={idx} className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 group/ex transition-all">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-black text-white text-xs flex items-center gap-2 uppercase tracking-tight truncate">
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0"></span>
                              {ex.name}
                            </h4>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExerciseProgress(ex.name);
                                setViewMode('analytics');
                              }}
                              className="shrink-0 text-[8px] font-black text-orange-500 hover:bg-orange-500 hover:text-white uppercase tracking-widest border border-orange-500/30 px-2 py-1 rounded-lg transition-all"
                            >
                              Trend
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {ex.sets.map((set, sIdx) => (
                              <div key={sIdx} className="flex items-center justify-between text-[10px] py-1.5 px-3 bg-slate-900/30 rounded-xl border border-slate-800/30">
                                <span className="text-slate-600 font-black uppercase tracking-tighter">Set {sIdx + 1}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-slate-300 font-bold">{set.weight}<span className="text-[8px] text-slate-600 ml-0.5 uppercase">kg</span></span>
                                  <div className="w-0.5 h-0.5 bg-slate-800 rounded-full"></div>
                                  <span className="text-slate-300 font-bold">{set.reps}<span className="text-[8px] text-slate-600 ml-0.5 uppercase">reps</span></span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {ex.notes && (
                            <div className="mt-3 px-3 py-2 bg-slate-950/60 rounded-xl border-l-2 border-orange-500/50">
                                <p className="text-[9px] text-slate-400 font-medium italic">{ex.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex justify-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteLog(log.id); }}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest border border-red-500/20"
                      >
                        <TrashIcon /> ELIMINA SESSIONE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Analizza Esercizio</label>
            <div className="flex flex-wrap gap-2">
              {uniqueExercises.map(exName => (
                <button
                  key={exName}
                  onClick={() => setSelectedExerciseProgress(exName)}
                  className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all truncate max-w-[150px] ${
                    selectedExerciseProgress === exName
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {exName}
                </button>
              ))}
            </div>
          </div>

          {selectedExerciseProgress ? (
            <div className="bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-500 p-3 rounded-2xl text-white shrink-0">
                    <BarChartIcon />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase leading-tight">{selectedExerciseProgress}</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Andamento Carichi Massimali</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/50">
                    <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Personal Best</span>
                    <span className="text-xl font-black text-emerald-400">{Math.max(...progressData.map(d => d.maxWeight))}kg</span>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/50">
                    <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Sessioni</span>
                    <span className="text-xl font-black text-blue-400">{progressData.length}</span>
                  </div>
                </div>
              </div>

              {renderProgressChart()}

              <div className="mt-8 pt-8 border-t border-slate-800/50">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Registro Storico</h4>
                <div className="space-y-2">
                  {progressData.slice().reverse().map((data, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-950/30 rounded-2xl border border-slate-800/30 hover:border-orange-500/20 transition-all">
                      <div className="flex items-center gap-3">
                        <CalendarIcon />
                        <span className="text-[11px] font-black text-slate-300 uppercase">{data.date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-[7px] font-black text-slate-600 uppercase block">Max</span>
                          <span className="text-sm font-black text-orange-500 leading-none">{data.maxWeight}kg</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[7px] font-black text-slate-600 uppercase block">Volume</span>
                          <span className="text-sm font-black text-slate-400 leading-none">{data.totalVolume}kg</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center bg-slate-900/20 border-2 border-slate-800/50 border-dashed rounded-[3rem]">
              <div className="mb-4 opacity-10 flex justify-center"><ActivityIcon /></div>
              <p className="font-black uppercase tracking-widest text-[10px] text-slate-600">Seleziona un esercizio per analizzare i tuoi dati</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;
