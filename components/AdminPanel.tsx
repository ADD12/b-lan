
import React from 'react';

const AdminPanel: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-2xl flex items-center gap-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
          <i className="fa-solid fa-lock text-3xl"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Upstream A-LAN Controls</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Restricted access. This B-LAN instance is governed by the regional Angel Sharks Governance Board. 
            All subscriptions and Karma credit cycles are priced by the board at intervals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-users text-indigo-500"></i>
            Board Governance
          </h3>
          <div className="space-y-4">
            <AdminAction title="Grant Monthly Karma" desc="Bulk assign baseline Karma to all registered PIM IDs." />
            <AdminAction title="Review Skill Routing" desc="Update AI parameters for neighborhood task distribution." />
            <AdminAction title="Set Cash-out Rates" desc="Current SDR to Karma exchange rate." />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="font-bold text-white mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-server text-blue-500"></i>
            Local Cluster Health
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">PIM Database Sync</span>
              <span className="text-green-500 font-mono">STABLE</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Media Server Cluster</span>
              <span className="text-green-500 font-mono">3 ONLINE</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Sidechain Ledger Latency</span>
              <span className="text-slate-200 font-mono">14ms</span>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-500 mb-2">Solarcard Mainnet Sync Status</div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[92%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
        <h4 className="text-indigo-400 font-bold mb-2 uppercase text-xs">Angel Sharks SDA to SDR System</h4>
        <div className="text-4xl font-bold text-white mb-6">1.00 SDR = 42.50 Karma</div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl shadow-indigo-600/10">
          Sync Exchange Rates
        </button>
      </div>
    </div>
  );
};

const AdminAction: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <button className="w-full text-left p-3 rounded-xl hover:bg-slate-800 transition-colors group">
    <div className="text-sm font-bold text-slate-300 group-hover:text-indigo-400">{title}</div>
    <div className="text-[10px] text-slate-500">{desc}</div>
  </button>
);

export default AdminPanel;
