
import React from 'react';
// Fixed error: ScaleIcon is not exported from ./Icons and is not used in this file
import { ActivityIcon, BarChartIcon, ClockIcon, CheckIcon } from './Icons';

const FooterSections: React.FC = () => {
  return (
    <div className="mt-20 space-y-24 pb-20 border-t border-slate-900 pt-20">
      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
        <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/50 hover:border-orange-500/30 transition-all group">
          <div className="bg-orange-500/10 text-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 group-hover:text-white transition-all">
            <BarChartIcon />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">Analisi Avanzata</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Monitora i tuoi progressi nel tempo con grafici dettagliati per ogni esercizio. Visualizza il volume totale e i tuoi massimali in un clic.
          </p>
        </div>

        <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/50 hover:border-blue-500/30 transition-all group">
          <div className="bg-blue-500/10 text-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all">
            <ClockIcon />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">Timer Integrato</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Gestisci i tempi di recupero senza uscire dall'app. Il timer intelligente ti avvisa con una vibrazione quando è il momento di ricominciare.
          </p>
        </div>

        <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/50 hover:border-emerald-500/30 transition-all group">
          <div className="bg-emerald-500/10 text-emerald-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <ActivityIcon />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">Log in Tempo Reale</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Salva carichi e ripetizioni mentre ti alleni. La cronologia salva tutto in locale, garantendo privacy e velocità estrema.
          </p>
        </div>
      </section>

      {/* Advice Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 md:p-12 rounded-[3rem] shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <div className="scale-[5]">
             <ActivityIcon />
          </div>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-8">Consigli Pro per l'Allenamento</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="shrink-0 mt-1 text-orange-500"><CheckIcon /></div>
              <div>
                <h4 className="font-bold text-white text-sm uppercase mb-1">Sovraccarico Progressivo</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Cerca di aumentare gradualmente il peso, le ripetizioni o migliorare la tecnica in ogni sessione per garantire lo stimolo ipertrofico.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 mt-1 text-orange-500"><CheckIcon /></div>
              <div>
                <h4 className="font-bold text-white text-sm uppercase mb-1">Recupero e Sonno</h4>
                <p className="text-slate-500 text-xs leading-relaxed">I muscoli crescono mentre riposi. Assicurati 7-8 ore di sonno di qualità per ottimizzare la sintesi proteica e la riparazione dei tessuti.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 mt-1 text-orange-500"><CheckIcon /></div>
              <div>
                <h4 className="font-bold text-white text-sm uppercase mb-1">Idratazione costante</h4>
                <p className="text-slate-500 text-xs leading-relaxed">Una perdita d'acqua del solo 2% può ridurre drasticamente la tua forza e resistenza. Bevi piccoli sorsi durante tutto l'allenamento.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links / Newsletter Placeholder */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-12 px-4">
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Tieniti aggiornato</h3>
          <p className="text-slate-500 text-sm max-w-sm italic">Nuove funzionalità in arrivo ogni mese: analisi avanzate, cloud sync e video tecnici.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input 
            type="email" 
            placeholder="La tua email..." 
            className="flex-1 md:w-64 bg-slate-900 border border-slate-800 px-5 py-4 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
          <button className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg">
            OK
          </button>
        </div>
      </section>
    </div>
  );
};

export default FooterSections;
