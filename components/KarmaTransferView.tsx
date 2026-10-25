
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, HoneyDoJob } from '../types';
import { getLocalData, performKarmaTransfer, queueSyncTask } from '../services/dbService';

const KarmaTransferView: React.FC<{ user: UserProfile }> = ({ user }) => {
  const navigate = useNavigate();
  const [neighbors, setNeighbors] = useState<UserProfile[]>([]);
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [taskId, setTaskId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const allUsers = getLocalData<UserProfile[]>('user_registry', []);
    setNeighbors(allUsers.filter(u => u.id !== user.id));
  }, [user.id]);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!recipientId) return setError("Please select a recipient node.");
    if (amount <= 0) return setError("Amount must be greater than zero.");
    if (amount > user.karmaBalance) return setError("Insufficient balance in local Karma reserve.");

    setLoading(true);
    try {
      const updatedUser = performKarmaTransfer(user.id, recipientId, amount, note || "Direct peer-to-peer shard transfer", taskId || undefined);
      if (updatedUser) {
        queueSyncTask('LEDGER_TX', { from: user.id, to: recipientId, amount, note, taskId });
      }
      setTimeout(() => {
        setLoading(false);
        navigate('/ledger');
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Transfer failed.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/ledger')}
          className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Karma Shard Transfer</h2>
          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em]">SIDECHAIN PROTOCOL V2 // OFFLINE TX</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
           <i className="fa-solid fa-paper-plane text-9xl"></i>
        </div>

        <form onSubmit={handleTransfer} className="space-y-8 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Destination Node (Neighbor)</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              value={recipientId}
              onChange={e => setRecipientId(e.target.value)}
              required
            >
              <option value="">Select Resident...</option>
              {neighbors.map(n => (
                <option key={n.id} value={n.id}>{n.name} ({n.address})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Value Amount (K)</label>
              <div className="relative">
                 <input 
                  type="number" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 font-black text-xl focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold uppercase tracking-widest">Karma</div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Task Reference ID (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. task-001"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 font-mono text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                value={taskId}
                onChange={e => setTaskId(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Transaction Audit Note</label>
            <textarea 
              className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 text-slate-200 text-sm h-32 focus:ring-1 focus:ring-indigo-500 outline-none resize-none shadow-inner"
              placeholder="Provide context for this peer transfer..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 animate-shake">
               <i className="fa-solid fa-circle-exclamation text-xl"></i>
               <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
            </div>
          )}

          <div className="pt-6 flex flex-col md:flex-row gap-4">
             <button 
               type="button"
               onClick={() => navigate('/ledger')}
               className="flex-1 px-8 py-4 rounded-2xl border border-slate-800 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all"
             >
               Abort Shard
             </button>
             <button 
               type="submit"
               disabled={loading}
               className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
             >
               {loading ? (
                 <i className="fa-solid fa-sync animate-spin"></i>
               ) : (
                 <i className="fa-solid fa-stamp"></i>
               )}
               Finalize TX Shard
             </button>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-3 text-center">
           <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Auth Authorized by Governance Shard</span>
           </div>
           <p className="text-[9px] text-slate-700 font-mono uppercase italic">
             Warning: TX Shards are immutable once sharded. Double-check recipient node ID before finalizing.
           </p>
        </div>
      </div>
    </div>
  );
};

export default KarmaTransferView;
