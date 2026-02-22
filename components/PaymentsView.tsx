
import React, { useState } from 'react';
import { PaymentLog } from '../types';
import { WalletIcon, PlusIcon, TrashIcon, CalendarIcon, CheckIcon } from './Icons';

interface PaymentsViewProps {
  payments: PaymentLog[];
  onAddPayment: (payment: PaymentLog) => void;
  onDeletePayment: (id: string) => void;
}

const PaymentsView: React.FC<PaymentsViewProps> = ({ payments, onAddPayment, onDeletePayment }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState('45');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });

  const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const lastPayment = sortedPayments[0];
  const isExpired = lastPayment ? new Date(lastPayment.expiryDate) < new Date() : true;
  const daysToExpiry = lastPayment 
    ? Math.ceil((new Date(lastPayment.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleAdd = () => {
    const newPayment: PaymentLog = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      date,
      expiryDate,
      method: 'Contanti'
    };
    onAddPayment(newPayment);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-2">
        <h2 className="text-3xl font-black text-white tracking-tighter">Abbonamento</h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Gestisci le tue mensilità PITUGYM</p>
      </div>

      {/* Status Card */}
      <div className={`p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden ${
        isExpired 
          ? 'bg-red-500/10 border-red-500/30' 
          : 'bg-emerald-500/10 border-emerald-500/30'
      }`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <div className="scale-[4]">
            <WalletIcon />
          </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${
              isExpired ? 'bg-red-500 text-white' : 'bg-emerald-500 text-slate-950'
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              {isExpired ? 'Abbonamento Scaduto' : 'Abbonamento Attivo'}
            </div>
            
            <h3 className="text-4xl font-black text-white tracking-tighter mb-2">
              {isExpired ? 'Frequenza Non Autorizzata' : `Scade tra ${daysToExpiry} giorni`}
            </h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">
              {lastPayment ? `Ultimo pagamento: ${new Date(lastPayment.date).toLocaleDateString()} (${lastPayment.amount}€)` : 'Nessun pagamento registrato'}
            </p>
          </div>

          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl self-start md:self-center"
          >
            Registra Pagamento
          </button>
        </div>
      </div>

      {/* Add Payment Modal/Form */}
      {showAddForm && (
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-black text-white uppercase tracking-widest">Nuova Mensilità</h4>
            <button onClick={() => setShowAddForm(false)} className="text-slate-500"><XIcon /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase px-1">Importo (€)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase px-1">Data Pagamento</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase px-1">Data Scadenza</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold outline-none" />
            </div>
          </div>

          <button onClick={handleAdd} className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-orange-400 transition-colors active:scale-95">
            Conferma Pagamento
          </button>
        </div>
      )}

      {/* History */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Storico Pagamenti</h4>
        {payments.length === 0 ? (
          <div className="py-12 text-center text-slate-600 border border-slate-800 border-dashed rounded-3xl">
            Nessuno storico pagamenti presente.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPayments.map(p => (
              <div key={p.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-800 p-3 rounded-xl text-slate-400">
                    <CalendarIcon />
                  </div>
                  <div>
                    <p className="font-black text-white text-sm">{p.amount}€ - {p.method}</p>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Valido fino al {new Date(p.expiryDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => onDeletePayment(p.id)} className="p-2 text-slate-700 hover:text-red-400 transition-colors">
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsView;

// Sostituto per XIcon se non importato correttamente (aggiunto localmente per sicurezza)
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
