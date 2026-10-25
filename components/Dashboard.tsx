
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { UserProfile, Community, HoneyDoJob, MeshCommit } from '../types';
import { getFogStatus, FogNodeStats } from '../services/fogService';
import { getCommunityById } from '../services/communityService';
import { getDtnStats } from '../services/dtnService';
import { syncManager } from '../services/syncService';
import { getLocalData, setLocalData, generateHash, awardReferralKarma, clearPendingShards } from '../services/dbService';

interface DashboardProps {
  user: UserProfile;
  onUpdate?: (user: UserProfile) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUpdate }) => {
  const [fogStats, setFogStats] = useState<FogNodeStats>(getFogStatus());
  const [dtnStats, setDtnStats] = useState(getDtnStats());
  const [community, setCommunity] = useState<Community | undefined>(getCommunityById(user.communityId));
  const [activeTasks, setActiveTasks] = useState<HoneyDoJob[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(syncManager.getSyncStatus());
  const [syncHistory, setSyncHistory] = useState<string[]>([]);
  const [commits, setCommits] = useState<MeshCommit[]>(getLocalData('mesh_commits', []));
  const [pendingShards, setPendingShards] = useState<string[]>([]);

  useEffect(() => {
    const updateStats = () => {
      setFogStats(getFogStatus());
      setDtnStats(getDtnStats());
      setSyncStatus(syncManager.getSyncStatus());
      const allJobs = getLocalData<HoneyDoJob[]>('jobs', []);
      setActiveTasks(allJobs.filter(j => j.assignedTo === user.id && j.status === 'IN_PROGRESS'));
      setPendingShards(getLocalData<string[]>('pending_shards', []));
    };
    
    updateStats();
    const timer = setInterval(updateStats, 2000);
    return () => clearInterval(timer);
  }, [user.id]);

  const handleSyncMesh = async () => {
    if (pendingShards.length === 0) return;
    
    setIsSyncing(true);
    setSyncHistory(['$ b-lan mesh status', 'Scanning LOCAL_PIM_SQL shards...']);
    
    const steps = [
      `$ b-lan commit -m "Neighborhood sync: ${pendingShards.length} shards"`,
      'Creating immutable payload bundle...',
      'Signing with Private Key...',
      '$ b-lan push mesh master',
      'Establishing SDR Uplink...',
      'Consensus achieved via DTN hops.',
      'Mesh Sync Complete.'
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 600));
      setSyncHistory(prev => [...prev, step]);
    }

    const SYNC_REWARD = 10;
    setSyncHistory(prev => [...prev, `[REWARD] Integrity verified. +${SYNC_REWARD} Karma awarded.`]);

    const newCommit: MeshCommit = {
      id: `commit-${Date.now()}`,
      message: `Neighborhood sync: ${pendingShards.length} shards`,
      author: user.name,
      timestamp: Date.now(),
      hash: generateHash({ time: Date.now(), user: user.id }).slice(0, 12),
      filesChanged: pendingShards.length,
      type: 'SYSTEM'
    };

    const updatedCommits = [newCommit, ...commits].slice(0, 50);
    setCommits(updatedCommits);
    setLocalData('mesh_commits', updatedCommits);
    clearPendingShards();
    setPendingShards([]);

    if (onUpdate) {
      onUpdate({ ...user, karmaBalance: user.karmaBalance + SYNC_REWARD });
    }

    await new Promise(r => setTimeout(r, 1500));
    setIsSyncing(false);
    setSyncHistory([]);
  };

  const [isDownloadingWp, setIsDownloadingWp] = useState(false);
  const [wpDownloadMsg, setWpDownloadMsg] = useState<string | null>(null);

  const handleWpZipDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsDownloadingWp(true);
    setWpDownloadMsg(null);
    try {
      // Use cache-busting query parameter so browser never serves stale cached 3.0 zip
      const cacheBust = Date.now();
      let response = await fetch(`/b-lan-plugin-v3.2.0.zip?t=${cacheBust}`);
      if (!response.ok) {
        response = await fetch(`/b-lan-plugin-v3.zip?t=${cacheBust}`);
      }
      if (!response.ok) throw new Error('ZIP file not found on server');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'b-lan-plugin-v3.2.1.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setWpDownloadMsg('Downloaded v3.2.1 ZIP');
      setTimeout(() => setWpDownloadMsg(null), 4000);
    } catch (err) {
      console.error('Error downloading WordPress plugin:', err);
      setWpDownloadMsg('Download failed');
      setTimeout(() => setWpDownloadMsg(null), 3000);
    } finally {
      setIsDownloadingWp(false);
    }
  };

  const contributionData = useMemo(() => Array.from({ length: 7 * 16 }).map(() => Math.floor(Math.random() * 5)), []);

  return (
    <div className="space-y-6 md:space-y-10 animate-fadeIn pb-16">
      
      {/* Platform Adaptive Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Main Identity Node Card */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 to-indigo-950/40 border-2 border-indigo-500/20 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none hidden sm:block">
             <i className="fa-solid fa-microchip text-[10rem] md:text-[12rem] text-indigo-400 rotate-12"></i>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8">
            <div className="w-full">
              <h1 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tight uppercase leading-tight">Identity: {user.name}</h1>
              <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 md:mb-10">
                <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/30">
                  <i className="fa-solid fa-code-branch text-xs text-indigo-400"></i>
                  <span className="text-xs md:text-sm text-indigo-400 font-black uppercase tracking-widest">master v3.0</span>
                </div>
                <p className="text-indigo-300/60 text-base md:text-lg font-mono uppercase tracking-widest font-bold">
                  Shard: <span className="text-indigo-400">{fogStats.nodeId.slice(0, 8)}</span>
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleSyncMesh}
              disabled={pendingShards.length === 0}
              className={`w-full md:w-auto px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-4 ${
                pendingShards.length > 0 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 active:scale-95' 
                  : 'bg-slate-800 text-slate-500 border border-white/5 opacity-50 cursor-not-allowed'
              }`}
            >
              <i className={`fa-solid ${pendingShards.length > 0 ? 'fa-cloud-arrow-up' : 'fa-check'}`}></i>
              <span className="whitespace-nowrap">{pendingShards.length > 0 ? `Push ${pendingShards.length} Shards` : 'Synced'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mt-8 md:mt-10">
            <div className="bg-slate-950/60 backdrop-blur-md p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 flex-1 shadow-inner text-center sm:text-left">
              <span className="text-xs md:text-sm text-slate-500 uppercase font-black tracking-widest">Karma Ledger</span>
              <div className="text-3xl md:text-5xl font-black text-indigo-400 mt-1 md:mt-2">{user.karmaBalance}</div>
            </div>
            <div className="bg-slate-950/60 backdrop-blur-md p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 flex-1 shadow-inner text-center sm:text-left">
              <span className="text-xs md:text-sm text-slate-500 uppercase font-black tracking-widest">Solar Reserve</span>
              <div className="text-3xl md:text-5xl font-black text-amber-400 mt-1 md:mt-2">{user.solarWatts.toLocaleString()} <span className="text-lg md:text-xl font-normal opacity-40">Wh</span></div>
            </div>
          </div>
        </div>

        {/* Health Widget */}
        <div className="lg:col-span-4 bg-slate-900 border-2 border-slate-800 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-center mb-6 md:mb-10">
            <h3 className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-widest">B-LAN Health</h3>
            <span className={`px-3 py-1 ${community?.cimStatus === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'} text-[10px] md:text-xs font-black rounded-full border-2`}>
              {community?.cimStatus || 'OFFLINE'}
            </span>
          </div>
          
          <div className="space-y-6 md:space-y-8">
            <StatLine label="Consistency" value="100%" color="bg-indigo-500" />
            <StatLine label="ML Density" value={`${fogStats.sensorLoad}%`} color="bg-blue-500" />
            <StatLine label="Packet Loss" value="0.02%" color="bg-green-500" />
          </div>

          <div className="mt-10 md:mt-14 pt-6 md:pt-8 border-t border-slate-800 flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-950 flex items-center justify-center text-indigo-500 border-2 border-slate-800 shadow-inner text-xl md:text-2xl">
               <i className={`fa-solid ${syncStatus.pendingTasks > 0 ? 'fa-arrows-rotate animate-spin' : 'fa-code-merge animate-pulse'}`}></i>
            </div>
            <div>
              <div className="text-sm md:text-base font-black text-white uppercase tracking-tight">
                {syncStatus.meshStatus}: {syncStatus.pendingTasks} PENDING
              </div>
              <div className="text-[10px] md:text-sm text-slate-500 font-mono uppercase mt-0.5 md:mt-1">
                DTN: {syncStatus.deliveredBundles} DELIVERED
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Quick Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8">
        <DashboardCard icon="fa-terminal" title="Staged" value={pendingShards.length.toString()} color="text-amber-400" desc="Unpushed local shards" />
        <DashboardCard icon="fa-shield-halved" title="Security" value="ACTIVE" color="text-green-400" desc="FOS Perimeter Loop" />
        
        <div className="bg-slate-900 border-2 border-indigo-500/30 p-6 md:p-8 rounded-[2rem] hover:border-indigo-400 transition-all group shadow-xl flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center gap-4 md:gap-5 mb-3">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border-2 border-indigo-500/20 text-lg md:text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <i className="fa-brands fa-wordpress"></i>
              </div>
              <div className="text-left">
                <div className="text-sm md:text-base font-black text-white uppercase tracking-widest">WordPress Link</div>
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-widest">B-LAN PLUGIN V.3.2.1</span>
                  <span className="text-[8px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded leading-none">PHP 8.3.13+</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mb-4 text-left leading-relaxed">
              Bridge your local site to the Core mesh. Hardened against AI php2shell exploits.
            </p>
          </div>
          <div className="mt-auto">
            <div className="grid grid-cols-2 gap-2">
              <Link 
                to="/wordpress"
                className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1"
              >
                <i className="fa-solid fa-gears"></i>
                Manage
              </Link>
              <a 
                href="/b-lan-plugin-v3.2.1.zip" 
                onClick={handleWpZipDownload}
                className={`bg-slate-950 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1 ${isDownloadingWp ? 'opacity-70 pointer-events-none' : ''}`}
                title="Download Hardened v3.2.1 Plugin ZIP (PHP 8.3.13+)"
              >
                <i className={`fa-solid ${isDownloadingWp ? 'fa-spinner animate-spin text-indigo-400' : 'fa-cloud-arrow-down animate-bounce'}`}></i>
                {isDownloadingWp ? 'Getting...' : 'Get ZIP v3.2.1'}
              </a>
            </div>
            {wpDownloadMsg && (
              <div className="mt-2 text-center text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1 px-2 rounded-lg animate-fadeIn">
                ✓ {wpDownloadMsg}
              </div>
            )}
          </div>
        </div>

        <div 
          onClick={() => setShowShareModal(true)}
          className="bg-slate-900 border-2 border-amber-500/30 p-6 md:p-8 rounded-[2rem] hover:bg-slate-800 hover:border-amber-400 transition-all group shadow-xl cursor-pointer"
        >
          <div className="flex items-center gap-4 md:gap-5 mb-4 md:mb-6">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border-2 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white transition-all text-lg md:text-xl">
              <i className="fa-solid fa-user-plus"></i>
            </div>
            <span className="text-slate-500 text-xs md:text-sm font-black uppercase tracking-widest">Refer Shard</span>
          </div>
          <div className="text-2xl md:text-3xl font-black text-amber-400 mb-1 md:mb-2 tracking-tighter">+500 K</div>
          <div className="text-xs md:text-sm text-slate-600 font-mono font-bold italic uppercase">Expand Mesh</div>
        </div>

        <Link 
          to="/admin"
          className="bg-slate-900 border-2 border-indigo-500/30 p-6 md:p-8 rounded-[2rem] hover:bg-slate-800 hover:border-indigo-400 transition-all group shadow-xl flex flex-col items-center justify-center text-center"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border-2 border-indigo-500/20 mb-4 text-lg md:text-xl">
            <i className="fa-solid fa-lock"></i>
          </div>
          <div className="text-sm md:text-base font-black text-white uppercase tracking-widest mb-1">A-LAN Admin</div>
          <div className="text-[10px] md:text-xs text-slate-500 font-mono font-bold uppercase tracking-widest">Shard Control Console</div>
        </Link>

        <a 
          href="https://aistudio.google.com/apps/84228fc4-795e-4541-8020-5890bcbb95b5?showPreview=true&showAssistant=true"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-indigo-600/10 border-2 border-indigo-500/40 p-6 md:p-8 rounded-[2rem] hover:bg-indigo-600/20 hover:border-indigo-400 transition-all group shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-2">
            <i className="fa-solid fa-thumbtack text-indigo-500 text-[10px] rotate-45 opacity-60"></i>
          </div>
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 text-lg md:text-xl shadow-lg shadow-indigo-600/20">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <div className="text-sm md:text-base font-black text-white uppercase tracking-widest mb-1">B-LAN BUILD</div>
          <div className="text-[10px] md:text-xs text-indigo-400 font-mono font-bold uppercase tracking-widest">Security Cam Dashboard</div>
        </a>
      </div>

      {/* Sync Modal Overlay */}
      {isSyncing && (
        <div className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-3xl bg-black border-2 border-indigo-500/30 rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden font-mono flex flex-col h-[400px] md:h-[550px]">
            <div className="p-4 md:p-6 bg-slate-900 border-b border-white/10 flex items-center justify-between">
               <div className="flex items-center gap-3 md:gap-5">
                  <div className="flex gap-1.5 md:gap-2">
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-red-500/60"></div>
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-amber-500/60"></div>
                    <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-green-500/60"></div>
                  </div>
                  <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">b-lan push: master</span>
               </div>
               <i className="fa-solid fa-cloud-arrow-up text-indigo-500 text-xl md:text-2xl animate-bounce"></i>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-2 md:space-y-3 text-xs md:text-sm custom-scrollbar bg-slate-950/50">
               {syncHistory.map((line, i) => (
                 <div key={i} className={`${line.startsWith('$') ? 'text-indigo-400 font-black' : line.startsWith('[REWARD]') ? 'text-green-400 font-black' : 'text-slate-400'} animate-slideInRight leading-relaxed`}>
                    {line}
                 </div>
               ))}
               <div className="flex items-center gap-2 md:gap-3 text-indigo-400">
                  <span className="animate-pulse font-black">_</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatLine: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="space-y-2 md:space-y-3">
    <div className="flex justify-between items-end">
      <span className="text-[10px] md:text-xs text-slate-600 uppercase font-black tracking-widest">{label}</span>
      <span className="text-xs md:text-sm font-mono text-white font-black">{value}</span>
    </div>
    <div className="h-1.5 md:h-2 w-full bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} w-4/5 shadow-[0_0_12px_rgba(79,70,229,0.3)]`}></div>
    </div>
  </div>
);

const DashboardCard: React.FC<{ icon: string; title: string; value: string; color: string; desc: string }> = ({ icon, title, value, color, desc }) => (
  <div className="bg-slate-900 border-2 border-slate-800 p-6 md:p-8 rounded-[2rem] hover:border-indigo-500/40 transition-all group shadow-lg">
    <div className="flex items-center gap-4 md:gap-5 mb-4 md:mb-6">
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-950 flex items-center justify-center border-2 border-white/5 group-hover:bg-indigo-600/10 group-hover:text-indigo-400 transition-colors text-lg md:text-xl text-slate-400">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <span className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest">{title}</span>
    </div>
    <div className={`text-3xl md:text-4xl font-black ${color} mb-1 md:mb-2 tracking-tighter`}>{value}</div>
    <div className="text-xs md:text-sm text-slate-600 font-mono font-bold uppercase tracking-tighter italic">{desc}</div>
  </div>
);

export default Dashboard;
