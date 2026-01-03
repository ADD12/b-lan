
import React from 'react';
import { UserProfile } from '../types';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 p-8 rounded-2xl">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, {user.name}</h1>
          <p className="text-slate-400 max-w-lg italic">
            "Community is not a place, it's a practice." - B-LAN Governance
          </p>
          <div className="flex gap-4 mt-8">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex-1">
              <span className="text-xs text-slate-500 uppercase font-bold">Current Balance</span>
              <div className="text-2xl font-bold text-indigo-400 mt-1">{user.karmaBalance} <span className="text-sm font-normal">Karma</span></div>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex-1">
              <span className="text-xs text-slate-500 uppercase font-bold">Solar Harvest</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{user.solarWatts} <span className="text-sm font-normal">Watts</span></div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-80 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-green-500 p-1">
            <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{user.name}</h3>
            <p className="text-slate-400 text-sm">{user.address}</p>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-indigo-500 w-3/4"></div>
          </div>
          <p className="text-xs text-slate-500">Reputation Level 4 (Angel Shark SDR Eligible)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard 
          icon="fa-shield-halved" 
          title="Security Status" 
          value="All Systems Green" 
          color="text-green-400"
          desc="4 Local cameras active"
        />
        <DashboardCard 
          icon="fa-briefcase" 
          title="Pending Tasks" 
          value="3 Jobs Match" 
          color="text-indigo-400"
          desc="Based on PIM Skill Routing"
        />
        <DashboardCard 
          icon="fa-link" 
          title="Blockchain Sync" 
          value="Connected" 
          color="text-blue-400"
          desc="Mainnet sync: 12m ago"
        />
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-indigo-500"></i>
          Community Activity
        </h3>
        <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4">
          {[40, 65, 52, 80, 45, 90, 70, 85, 60, 95, 110, 80].map((h, i) => (
            <div key={i} className="group relative flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-indigo-600/40 border-t-2 border-indigo-400 rounded-t-sm group-hover:bg-indigo-500/60 transition-all cursor-pointer" 
                style={{ height: `${h}%` }}
              ></div>
              <span className="text-[10px] text-slate-600 font-mono">H{i+1}</span>
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] px-2 py-1 rounded">
                {h * 10} K-TX
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{ icon: string; title: string; value: string; color: string; desc: string }> = ({ icon, title, value, color, desc }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
        <i className={`fa-solid ${icon} text-indigo-500`}></i>
      </div>
      <span className="text-slate-400 font-medium">{title}</span>
    </div>
    <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
    <div className="text-xs text-slate-500">{desc}</div>
  </div>
);

export default Dashboard;
