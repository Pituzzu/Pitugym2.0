
import React from 'react';
import { ActivityIcon, BarChartIcon, DumbbellIcon, ScaleIcon } from './Icons';

interface StatsDashboardProps {
  totalPlans: number;
  totalExercises: number;
  avgFrequency: string;
  latestWeight?: number;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ totalPlans, totalExercises, avgFrequency, latestWeight }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="bg-slate-900/40 border border-slate-800 p-4 md:p-5 rounded-2xl md:rounded-3xl backdrop-blur-sm flex items-center gap-3 md:gap-4 shadow-lg shadow-black/10">
        <div className="bg-orange-500/10 p-2 md:p-3 rounded-xl text-orange-500 flex-shrink-0">
          <DumbbellIcon />
        </div>
        <div className="min-w-0">
          <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest truncate">Schede</p>
          <p className="text-xl md:text-2xl font-black text-white">{totalPlans}</p>
        </div>
      </div>
      
      <div className="bg-slate-900/40 border border-slate-800 p-4 md:p-5 rounded-2xl md:rounded-3xl backdrop-blur-sm flex items-center gap-3 md:gap-4 shadow-lg shadow-black/10">
        <div className="bg-blue-500/10 p-2 md:p-3 rounded-xl text-blue-500 flex-shrink-0">
          <ActivityIcon />
        </div>
        <div className="min-w-0">
          <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest truncate">Volume</p>
          <p className="text-xl md:text-2xl font-black text-white">{totalExercises}</p>
        </div>
      </div>
      
      <div className="bg-slate-900/40 border border-slate-800 p-4 md:p-5 rounded-2xl md:rounded-3xl backdrop-blur-sm flex items-center gap-3 md:gap-4 shadow-lg shadow-black/10">
        <div className="bg-emerald-500/10 p-2 md:p-3 rounded-xl text-emerald-500 flex-shrink-0">
          <BarChartIcon />
        </div>
        <div className="min-w-0">
          <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest truncate">Freq. Media</p>
          <p className="text-lg md:text-xl font-black text-white flex items-baseline gap-1">
            {avgFrequency} 
            <span className="text-[10px] font-normal text-slate-500">gg</span>
          </p>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 p-4 md:p-5 rounded-2xl md:rounded-3xl backdrop-blur-sm flex items-center gap-3 md:gap-4 shadow-lg shadow-black/10">
        <div className="bg-indigo-500/10 p-2 md:p-3 rounded-xl text-indigo-500 flex-shrink-0">
          <ScaleIcon />
        </div>
        <div className="min-w-0">
          <p className="text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest truncate">Ultimo Peso</p>
          <p className="text-xl md:text-2xl font-black text-white flex items-baseline gap-1">
            {latestWeight || '--'} 
            <span className="text-[10px] font-normal text-slate-500">kg</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
