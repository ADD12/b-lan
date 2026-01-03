
import React, { useState } from 'react';
import { UserProfile, KarmaTransaction } from '../types';
import { getLocalData, generateHash } from '../services/dbService';

const INITIAL_TXS: KarmaTransaction[] = [
  { id: 'tx-1', from: 'SYSTEM-ADMIN', to: 'u-777', amount: 1000, timestamp: Date.now() - 86400000 * 2, reason: 'Monthly Basic Allocation', hash: '0xabc123...' },
  { id: 'tx-2', from: 'u-elderly-1', to: 'u-777', amount: 50, timestamp: Date.now() - 3600000, reason: 'Service: Plumbing Repair', hash: '0xdef456...' },
];

const KarmaLedger: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [transactions] = useState<KarmaTransaction[]>(getLocalData('ledger', INITIAL_TXS));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Immutable Karma Ledger</h2>
          <p className="text-slate-400">Local B-LAN Sidechain. Verified by Governance Board.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Your Balance</span>
            <div className="text-xl font-bold text-indigo-400 mt-1">{user.karmaBalance} K</div>
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold self-end shadow-lg shadow-indigo-500/20">
            Transfer Karma
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">TX Hash</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">From/To</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Reason</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-600 truncate w-24" title={tx.hash}>{tx.hash}</span>
                      <i className="fa-solid fa-copy text-[10px] text-slate-700 cursor-pointer"></i>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-300">{tx.from === user.id ? 'YOU' : tx.from}</span>
                      <span className="text-[10px] text-slate-500">→ {tx.to === user.id ? 'YOU' : tx.to}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${tx.to === user.id ? 'text-green-500' : 'text-slate-300'}`}>
                      {tx.to === user.id ? '+' : '-'}{tx.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400">{tx.reason}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
          <i className="fa-solid fa-circle-info text-xl"></i>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Note: These credits are assigned monthly by the A-LAN network admin. Karma tokens represent value created and exchanged within this B-LAN. Cashing out to Mainnet requires Board of Governance approval.
        </p>
      </div>
    </div>
  );
};

export default KarmaLedger;
