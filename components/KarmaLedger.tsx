
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserProfile, KarmaTransaction } from '../types';
import { getLocalData } from '../services/dbService';

const INITIAL_TXS: KarmaTransaction[] = [
  { id: 'tx-1', from: 'SYSTEM-ADMIN', to: 'u-777', amount: 1000, timestamp: Date.now() - 86400000 * 2, reason: 'Monthly Basic Allocation', hash: '0xabc123...', previousHash: '0x000' },
  { id: 'tx-2', from: 'u-elderly-1', to: 'u-777', amount: 50, timestamp: Date.now() - 3600000, reason: 'Service: Plumbing Repair', hash: '0xdef456...', previousHash: '0xabc123...' },
];

const KarmaLedger: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [transactions] = useState<KarmaTransaction[]>(getLocalData('ledger', INITIAL_TXS));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">Immutable Karma Ledger</h2>
          <p className="text-slate-400 text-sm">Local B-LAN Sidechain. Verified by Governance Board.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl shadow-xl">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Your Balance</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">{user.karmaBalance} K</div>
          </div>
          <Link 
            to="/ledger/transfer"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest self-end shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
          >
            <i className="fa-solid fa-paper-plane mr-2"></i>
            Transfer Karma
          </Link>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Chain Hash</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Routing</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Value</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Audit Note</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-600 italic">No ledger shards detected on local node.</td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-indigo-500/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-indigo-400 font-bold truncate w-24" title={tx.hash}>{tx.hash}</span>
                          <i className="fa-solid fa-link text-[8px] text-slate-700"></i>
                        </div>
                        <span className="text-[8px] font-mono text-slate-700">PREV: {tx.previousHash.slice(0, 10)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300 uppercase">{tx.from === user.id ? 'LOCAL_PIM' : tx.from}</span>
                        <span className="text-[10px] text-slate-600 font-mono">→ {tx.to === user.id ? 'LOCAL_PIM' : tx.to}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-black ${tx.to === user.id ? 'text-green-400' : 'text-slate-400'}`}>
                        {tx.to === user.id ? '+' : '-'}{tx.amount} <span className="text-[8px] font-bold">K</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400">{tx.reason}</span>
                        {tx.taskId && <span className="text-[9px] text-indigo-500 font-mono">TASK_REF: {tx.taskId}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] text-slate-500 font-mono">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-3xl flex items-center gap-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
          <i className="fa-solid fa-shield-check text-xl"></i>
        </div>
        <div>
           <h4 className="text-white font-bold text-sm uppercase mb-1">Local Immutable Sharding</h4>
           <p className="text-xs text-slate-400 leading-relaxed">
             This ledger uses a parent-hash verification system. Every transaction is tied to the previous shard hash, ensuring data integrity within the B-LAN. Syncing with the A-LAN sidechain occurs hourly to reconcile neighborhood consensus.
           </p>
        </div>
      </div>
    </div>
  );
};

export default KarmaLedger;
