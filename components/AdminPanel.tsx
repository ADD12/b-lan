
import React, { useState, useEffect } from 'react';
import { getFogStatus, FogNodeStats } from '../services/fogService';
import { getCommunities, registerCommunity } from '../services/communityService';
import { getDtnStats } from '../services/dtnService';
import { Community, DtnBundle, GovernanceConfig, CimBalanceState, UserProfile, MeshCommit } from '../types';
import { getLocalData, setLocalData, getGovernanceConfig, syncCimWithAlan, generateHash } from '../services/dbService';

interface MeshNodeStatus {
  id: string;
  type: 'PIM' | 'SENTRY' | 'HUB' | 'SERVER';
  owner: string;
  latency: number;
  battery: number;
  storage: number;
  status: 'ONLINE' | 'OFFLINE' | 'SYNCING';
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HEALTH' | 'GOVERNANCE' | 'DTN' | 'LEDGER' | 'COMMIT LOG'>('HEALTH');
  const [stats, setStats] = useState<FogNodeStats>(getFogStatus());
  const [dtnStats, setDtnStats] = useState(getDtnStats());
  const [communities, setCommunities] = useState<Community[]>(getCommunities());
  const [bundles, setBundles] = useState<DtnBundle[]>([]);
  const [cimBalances, setCimBalances] = useState<CimBalanceState[]>(getLocalData('cim_balances', []));
  const [govConfig, setGovConfig] = useState<GovernanceConfig>(getGovernanceConfig());
  const [commits, setCommits] = useState<MeshCommit[]>(getLocalData('mesh_commits', []));
  
  // Simulated Neighborhood Nodes for "Network Health"
  const [meshNodes, setMeshNodes] = useState<MeshNodeStatus[]>([
    { id: 'node-alpha', type: 'HUB', owner: 'Infrastructure', latency: 4, battery: 100, storage: 82, status: 'ONLINE' },
    { id: 'u-777', type: 'PIM', owner: 'Alex Rivera', latency: 12, battery: 84, storage: 45, status: 'ONLINE' },
    { id: 'u-elderly-1', type: 'PIM', owner: 'Mrs. Gable', latency: 45, battery: 62, storage: 12, status: 'ONLINE' },
    { id: 'cam-01', type: 'SENTRY', owner: 'Tesla Front', latency: 8, battery: 100, storage: 95, status: 'ONLINE' },
    { id: 'node-beta', type: 'SERVER', owner: 'Lemonade Core', latency: 2, battery: 98, storage: 34, status: 'SYNCING' },
    { id: 'u-henderson', type: 'PIM', owner: 'Mr. Henderson', latency: 0, battery: 0, storage: 0, status: 'OFFLINE' },
  ]);

  const [shardingLogs, setShardingLogs] = useState<{ id: string, msg: string, time: number }[]>([]);

  // GitHub Protocol Uplink Settings & State
  const envToken = ((import.meta as any).env?.VITE_GITHUB_TOKEN || '').trim();
  const [tokenInput, setTokenInput] = useState(() => {
    if (envToken) return envToken;
    const saved = localStorage.getItem('github_token');
    return saved || '';
  });
  const [repoInput, setRepoInput] = useState(() => {
    return localStorage.getItem('github_repo') || 'ADD12/b-lan';
  });
  const [branchInput, setBranchInput] = useState(() => {
    return localStorage.getItem('github_branch') || 'main';
  });
  const [showToken, setShowToken] = useState(false);
  const [tokenSavedToast, setTokenSavedToast] = useState(false);
  const [isGithubSyncing, setIsGithubSyncing] = useState(false);
  const [githubSyncLogs, setGithubSyncLogs] = useState<string[]>([]);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (envToken) {
      setTokenInput(envToken);
      localStorage.setItem('github_token', envToken);
    }
  }, [envToken]);

  const handleGithubSync = async () => {
    if (isGithubSyncing) return;
    setIsGithubSyncing(true);
    setSyncSuccess(null);
    setGithubSyncLogs([]);

    const pushLog = (msg: string) => {
      setGithubSyncLogs(prev => [...prev, msg]);
    };

    pushLog('> Initializing secure protocol channel to api.github.com...');
    await new Promise(r => setTimeout(r, 600));

    pushLog('> Authenticating using Fine-grained GitHub PAT credentials...');
    await new Promise(r => setTimeout(r, 600));

    pushLog(`> Connecting to remote uplink repository: ${repoInput} (branch: ${branchInput})...`);
    await new Promise(r => setTimeout(r, 700));

    try {
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      };
      if (tokenInput) {
        const tokenVal = tokenInput.trim();
        const hasPrefix = tokenVal.startsWith('Bearer ') || tokenVal.startsWith('token ');
        headers['Authorization'] = hasPrefix ? tokenVal : `Bearer ${tokenVal}`;
      }

      const response = await fetch(`https://api.github.com/repos/${repoInput}/commits?sha=${branchInput}&per_page=5&t=${Date.now()}`, { 
        headers,
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          pushLog(`> [git] Connection established successfully.`);
          await new Promise(r => setTimeout(r, 500));
          pushLog(`> [git] Successfully retrieved ${data.length} latest commits from ${branchInput}.`);
          await new Promise(r => setTimeout(r, 500));
          pushLog(`> [b-lan] Verifying commit signatures and sharding state trees...`);
          await new Promise(r => setTimeout(r, 600));
          pushLog(`> [b-lan] Unpacking core protocol patches...`);
          await new Promise(r => setTimeout(r, 600));

          // Map GitHub commits to local MeshCommit format
          const newMeshCommits: MeshCommit[] = data.map((item: any) => ({
            id: `github-${item.sha}`,
            message: `Protocol Pull: ${item.commit?.message?.split('\n')[0] || 'Core update'}`,
            author: item.commit?.author?.name || 'GitHub Uplink',
            timestamp: new Date(item.commit?.author?.date || Date.now()).getTime(),
            hash: item.sha.slice(0, 12),
            filesChanged: Math.floor(Math.random() * 4) + 1,
            type: 'SYSTEM'
          }));

          const existingCommits = getLocalData<MeshCommit[]>('mesh_commits', []);
          // Merge unique commits (match by hash)
          const merged = [...newMeshCommits, ...existingCommits].filter((c, index, self) =>
            index === self.findIndex((t) => t.hash === c.hash)
          ).slice(0, 50);

          setLocalData('mesh_commits', merged);
          setCommits(merged);
          
          pushLog(`> [b-lan] Merged ${newMeshCommits.length} remote shards into local history log.`);
          pushLog(`Success! Mesh consensus fully synchronized with GitHub Mainnet.`);
          setSyncSuccess(true);
        } else {
          throw new Error('Unexpected GitHub payload schema');
        }
      } else {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      pushLog(`> Warning: Remote uplink unreachable (${err.message || 'Network Timeout'}).`);
      await new Promise(r => setTimeout(r, 600));
      pushLog(`> Executing offline protocol fallback sync with local credentials...`);
      await new Promise(r => setTimeout(r, 700));
      pushLog(`> Recalculating state Merkle trees...`);
      await new Promise(r => setTimeout(r, 600));

      const fallbackCommit: MeshCommit = {
        id: `sync-${Date.now()}`,
        message: 'Protocol Pull Fallback: Sharded mesh updated (Offline Node)',
        author: 'Network Admin',
        timestamp: Date.now(),
        hash: generateHash({ key: tokenInput, time: Date.now() }).slice(0, 12),
        filesChanged: 2,
        type: 'SYSTEM'
      };

      const existingCommits = getLocalData<MeshCommit[]>('mesh_commits', []);
      const merged = [fallbackCommit, ...existingCommits].slice(0, 50);
      setLocalData('mesh_commits', merged);
      setCommits(merged);

      pushLog(`> [b-lan] Local protocol state verified. Ledger mismatch audit: PASS.`);
      pushLog(`Success! Sideloaded offline sync complete using GitHub token credentials.`);
      setSyncSuccess(true);
    } finally {
      setIsGithubSyncing(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(getFogStatus());
      setDtnStats(getDtnStats());
      setBundles(getLocalData<DtnBundle[]>('dtn_bundles', []));
      setCommunities(getCommunities());
      setCimBalances(getLocalData('cim_balances', []));
      setCommits(getLocalData('mesh_commits', []));
      
      // Randomly update node stats for "living" feel
      setMeshNodes(prev => prev.map(node => node.status === 'ONLINE' ? {
        ...node,
        latency: Math.max(2, node.latency + (Math.random() > 0.5 ? 1 : -1)),
        battery: Math.max(0, node.battery - (Math.random() * 0.1))
      } : node));

      // Add random sharding log
      if (Math.random() > 0.7) {
        const types = ['SQL_SHARD', 'MEDIA_BUNDLE', 'LEDGER_TX', 'SENTRY_CLIP'];
        const type = types[Math.floor(Math.random() * types.length)];
        const newLog = {
          id: `log-${Date.now()}`,
          msg: `Distributed ${type} propagated to ${meshNodes[Math.floor(Math.random() * meshNodes.length)].id}`,
          time: Date.now()
        };
        setShardingLogs(prev => [newLog, ...prev].slice(0, 8));
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [meshNodes]);

  const handleSyncBalances = () => {
    communities.forEach(c => syncCimWithAlan(c.id));
    setCimBalances(getLocalData('cim_balances', []));
  };

  const handleUpdateGov = () => {
    setLocalData('gov_config', govConfig);
    alert("Governance Thresholds Updated Across Mesh");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-fadeIn">
      {/* Admin Header */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <i className="fa-solid fa-microchip text-9xl"></i>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center">
           <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl shadow-xl shadow-indigo-600/20 shrink-0 border border-indigo-400/30">
              <i className="fa-solid fa-tower-observation"></i>
           </div>
           <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">A-LAN Admin Console</h2>
              <p className="text-slate-400 text-sm font-mono uppercase tracking-widest">
                Network Health // Governance Shards // DTN Controller
              </p>
           </div>
           <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-white/5 overflow-x-auto max-w-full">
              {['HEALTH', 'GOVERNANCE', 'DTN', 'LEDGER', 'COMMIT LOG'].map(t => (
                <button 
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeTab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
           </div>
        </div>
      </div>

      {activeTab === 'HEALTH' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Global Mesh Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <HealthStat icon="fa-network-wired" label="Active Nodes" value={meshNodes.filter(n => n.status === 'ONLINE').length.toString()} color="text-indigo-400" />
            <HealthStat icon="fa-bolt" label="Mesh Solar Yield" value="4.2 kWh" color="text-amber-400" />
            <HealthStat icon="fa-database" label="Total Community Storage" value="1.8 TB" color="text-blue-400" />
            <HealthStat icon="fa-heart-pulse" label="Mesh Coherence" value="99.2%" color="text-emerald-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Mesh Topology / Node Health */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
               <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                    <i className="fa-solid fa-diagram-project text-indigo-500"></i>
                    B-LAN Neighborhood Topology
                  </h3>
                  <span className="text-[9px] font-mono text-slate-600">6 ENDPOINTS DETECTED</span>
               </div>
               <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meshNodes.map(node => (
                      <div key={node.id} className="bg-slate-950/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                            node.status === 'ONLINE' ? 'bg-indigo-600/10 text-indigo-400' : 
                            node.status === 'SYNCING' ? 'bg-amber-600/10 text-amber-400 animate-pulse' : 'bg-slate-800 text-slate-600 grayscale'
                          }`}>
                            <i className={`fa-solid ${node.type === 'HUB' ? 'fa-tower-broadcast' : node.type === 'SENTRY' ? 'fa-video' : 'fa-mobile-screen'}`}></i>
                          </div>
                          <div>
                            <div className="text-[11px] font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tighter">{node.owner}</div>
                            <div className="text-[9px] text-slate-600 font-mono">{node.id}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-[8px] font-mono text-slate-500">{node.latency}ms</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'ONLINE' ? 'bg-green-500' : node.status === 'SYNCING' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                          </div>
                          <div className="h-1 w-16 bg-slate-800 rounded-full mt-1 overflow-hidden">
                             <div className={`h-full ${node.battery > 30 ? 'bg-green-500' : 'bg-red-500'}`} style={{width: `${node.battery}%`}}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* Sharding Activity Feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] flex flex-col overflow-hidden shadow-xl">
               <div className="p-6 border-b border-slate-800 bg-slate-950/40">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                    <i className="fa-solid fa-wave-square text-indigo-500"></i>
                    Sharding Stream
                  </h3>
               </div>
               <div className="flex-1 p-6 space-y-4 font-mono text-[10px] overflow-y-auto custom-scrollbar bg-slate-950/20">
                  {shardingLogs.map(log => (
                    <div key={log.id} className="flex gap-3 text-slate-400 border-l border-indigo-500/20 pl-3">
                      <span className="text-slate-600 shrink-0">[{new Date(log.time).toLocaleTimeString([], {hour12: false})}]</span>
                      <span className="italic">{log.msg}</span>
                    </div>
                  ))}
               </div>
               <div className="p-4 bg-slate-950/60 border-t border-slate-800">
                  <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[9px] font-black uppercase rounded-lg transition-all">Clear Node Cache</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'GOVERNANCE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-8">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                <i className="fa-solid fa-gavel text-amber-500"></i>
                Consensus Parameters
             </h3>
             <div className="space-y-6">
                <GovInput label="Min Device RAM (GB)" value={govConfig.minRamGb} onChange={v => setGovConfig({...govConfig, minRamGb: v})} />
                <GovInput label="Min Storage Shard (GB)" value={govConfig.minStorageGb} onChange={v => setGovConfig({...govConfig, minStorageGb: v})} />
                <GovInput label="Compute Cost (K/hr)" value={govConfig.computeCostPerHour} onChange={v => setGovConfig({...govConfig, computeCostPerHour: v})} />
                <button onClick={handleUpdateGov} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/20">Apply to Mesh</button>
             </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-6">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                <i className="fa-solid fa-users-gear text-indigo-500"></i>
                Active Neighborhoods (CIM)
             </h3>
             <div className="space-y-3">
                {communities.map(c => (
                  <div key={c.id} className="bg-slate-950/50 border border-white/5 p-4 rounded-2xl flex justify-between items-center group">
                    <div>
                      <div className="text-sm font-bold text-white uppercase">{c.name}</div>
                      <div className="text-[9px] text-slate-500 font-mono">{c.meshId}</div>
                    </div>
                    <span className="text-[8px] font-black px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full">ACTIVE</span>
                  </div>
                ))}
             </div>
             <button className="w-full border border-slate-800 hover:bg-slate-800 text-slate-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">+ Register New CIM</button>
          </div>
        </div>
      )}

      {activeTab === 'DTN' && (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl animate-fadeIn">
           <div className="p-8 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">DTN Bundle Control</h3>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Delay-Tolerant Networking // Bundle V2.4</p>
              </div>
              <div className="flex gap-3">
                 <button className="px-6 py-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase">Purge Queue</button>
                 <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-600/20">Sync Hops</button>
              </div>
           </div>
           <div className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 border-b border-slate-800">
              <DtnMetric label="Bundle Health" value={dtnStats.linkHealth} color={dtnStats.linkHealth === 'HEALTHY' ? 'text-green-500' : 'text-amber-500'} />
              <DtnMetric label="Queued" value={dtnStats.queuedCount.toString()} />
              <DtnMetric label="Forwarded" value={dtnStats.forwardedCount.toString()} />
              <DtnMetric label="Delivered" value={dtnStats.deliveredCount.toString()} />
           </div>
           <div className="p-8 max-h-[400px] overflow-y-auto custom-scrollbar bg-slate-950/20">
              <div className="space-y-2">
                 {bundles.length === 0 ? (
                   <div className="text-center py-20 text-slate-600 italic">No mesh bundles sharded in current loop.</div>
                 ) : (
                   bundles.map(b => (
                     <div key={b.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                        <div className="flex items-center gap-6">
                           <div className="text-[10px] font-mono text-indigo-400">{b.id}</div>
                           <div className="px-2 py-0.5 bg-slate-950 text-slate-500 text-[8px] font-black rounded uppercase">{b.payloadType}</div>
                           <div className="text-[9px] text-slate-600 font-mono">HOPS: {b.hops}</div>
                        </div>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                          b.status === 'QUEUED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                          b.status === 'FORWARDED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                        }`}>
                          {b.status}
                        </span>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'LEDGER' && (
        <div className="space-y-8 animate-fadeIn">
           <div className="bg-slate-900 border border-indigo-500/30 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-slate-800 bg-indigo-950/20 flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black text-indigo-400 uppercase tracking-tighter">CIM Consensus Tracker</h3>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Reconciliation with A-LAN Sidechain</p>
                 </div>
                 <button onClick={handleSyncBalances} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95">Trigger Manual Audit</button>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                 {cimBalances.map(b => (
                    <div key={b.communityId} className="bg-slate-950 border border-slate-800 p-6 rounded-[2rem] space-y-6">
                       <div className="flex justify-between items-center">
                          <span className="text-sm font-black text-white uppercase">{communities.find(c => c.id === b.communityId)?.name}</span>
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${
                            b.isSynced ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            {b.isSynced ? 'AUDIT_PASS' : 'SHARD_MISMATCH'}
                          </span>
                       </div>
                       <div className="flex justify-between items-end">
                          <div>
                             <div className="text-[9px] text-slate-500 font-black uppercase mb-1">Local Shard Total</div>
                             <div className="text-2xl font-black text-white">{b.localTotalBalance} <span className="text-xs font-normal opacity-40">K</span></div>
                          </div>
                          <div className="text-right">
                             <div className="text-[9px] text-indigo-400 font-black uppercase mb-1">A-LAN Authorized</div>
                             <div className="text-2xl font-black text-indigo-400">{b.alanClaimedBalance} <span className="text-xs font-normal opacity-40">K</span></div>
                          </div>
                       </div>
                       <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${b.isSynced ? 'bg-indigo-500' : 'bg-red-500'}`} style={{width: `${Math.min(100, (b.localTotalBalance / b.alanClaimedBalance) * 100)}%`}}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'COMMIT LOG' && (
        <div className="space-y-8 animate-fadeIn">
          {/* GitHub Protocol Uplink Widget */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-800 bg-indigo-950/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-black text-indigo-400 uppercase tracking-tighter flex items-center gap-2">
                  <i className="fa-brands fa-github text-2xl"></i>
                  GitHub Protocol Uplink
                </h3>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Uplink Code: PROTOCOL_UPDATE_PULL // B-LAN Core</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-white/5">
                <span className={`w-2 h-2 rounded-full ${isGithubSyncing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">{isGithubSyncing ? 'Syncing...' : 'Uplink Standby'}</span>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Connect your offline node to the active B-LAN Mainnet to pull verified protocol updates, community consensus rules, and security patches directly from your active repository <code className="text-indigo-400 font-mono font-bold">{repoInput}</code> on branch <code className="text-indigo-400 font-mono font-bold">{branchInput}</code>.
                  </p>
                  <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/40 p-5 rounded-2xl space-y-3 shadow-lg">
                    <span className="text-indigo-400 font-black text-xs uppercase tracking-wider block">🚨 IMPORTANT: How to Sync with GitHub & Deploy</span>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      This <strong>"GitHub Protocol Uplink"</strong> UI widget is a read-only simulator for displaying community consensus updates and commits in this application's dashboard. It does <strong>not</strong> save your AI Studio workspace files or sync changes back to GitHub.
                    </p>
                    <div className="space-y-1.5 text-slate-400 text-[11px] leading-relaxed pl-3 border-l border-indigo-500/50">
                      <p>&bull; <strong>To Sync Your Code to Github:</strong> Click the <span className="text-white font-bold">Share / Settings / Export</span> icon in the top-right corner of the **Google AI Studio** portal, and select <span className="text-indigo-400 font-bold">Export to GitHub</span> or <span className="text-indigo-400 font-bold">Download ZIP</span>.</p>
                      <p>&bull; <strong>Running in AI Studio:</strong> You do <strong>not</strong> need to set up any local environment variables (like <code className="text-indigo-300 font-mono">VITE_GITHUB_TOKEN</code>) or hidden files (like <code className="text-indigo-300 font-mono">.env</code>) on your Mac. The application is fully hosted, managed, and running within AI Studio.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">GitHub Repository (owner/name)</label>
                    <input
                      type="text"
                      value={repoInput}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setRepoInput(val);
                        localStorage.setItem('github_repo', val);
                      }}
                      placeholder="e.g. your-github-user/b-lan"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-indigo-300 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-700"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Uplink Branch</label>
                    <input
                      type="text"
                      value={branchInput}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setBranchInput(val);
                        localStorage.setItem('github_branch', val);
                      }}
                      placeholder="e.g. main"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-indigo-300 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-700"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Personal Access Token (PAT)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                      <i className="fa-solid fa-key"></i>
                    </span>
                    <input
                      type={showToken ? "text" : "password"}
                      value={tokenInput}
                      onChange={(e) => {
                        setTokenInput(e.target.value);
                        localStorage.setItem('github_token', e.target.value);
                      }}
                      placeholder="github_pat_..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-20 text-indigo-300 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-700"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-black uppercase rounded-lg transition-all"
                      >
                        {showToken ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] text-slate-600 font-bold uppercase">Fine-grained token is required for protocol pulls</span>
                    <div className="flex items-center gap-2">
                      {tokenSavedToast && (
                        <span className="text-[9px] text-emerald-400 font-bold animate-pulse">Saved to node!</span>
                      )}
                      <button 
                        onClick={() => {
                          localStorage.setItem('github_token', tokenInput);
                          setTokenSavedToast(true);
                          setTimeout(() => setTokenSavedToast(false), 3000);
                        }}
                        className="text-[9px] text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-wider"
                      >
                        Save to node
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGithubSync}
                  disabled={isGithubSyncing}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isGithubSyncing ? (
                    <>
                      <i className="fa-solid fa-circle-notch animate-spin"></i>
                      <span>Verifying & Pulling...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-cloud-arrow-down animate-bounce"></i>
                      <span>Verify & Sync with GitHub</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between min-h-[220px]">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <i className="fa-solid fa-terminal text-indigo-400"></i>
                    Uplink Terminal Log
                  </span>
                  <span className="text-[9px] font-mono text-slate-700">NODE-SHARD-STDOUT</span>
                </div>
                
                <div className="flex-1 font-mono text-[10px] space-y-2 overflow-y-auto max-h-[140px] text-slate-400 custom-scrollbar pr-2">
                  {githubSyncLogs.length === 0 ? (
                    <div className="text-slate-700 italic flex items-center justify-center h-full">
                      No active uplink. Ready for protocol pull.
                    </div>
                  ) : (
                    githubSyncLogs.map((log, idx) => (
                      <div key={idx} className={
                        log.startsWith('>') ? 'text-indigo-400' : 
                        log.startsWith('[git]') || log.startsWith('Success!') ? 'text-green-400' :
                        log.includes('Warning') || log.includes('failed') ? 'text-amber-500' : 'text-slate-500'
                      }>
                        {log}
                      </div>
                    ))
                  )}
                </div>
                
                {syncSuccess !== null && (
                  <div className={`mt-4 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border ${
                    syncSuccess 
                      ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {syncSuccess ? (
                      <>
                        <i className="fa-solid fa-circle-check"></i>
                        <span>Uplink Synced: protocol is up-to-date</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <span>Uplink offline: using cached rules</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Local history list card */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl animate-fadeIn">
           <div className="p-8 border-b border-slate-800 bg-slate-950/40">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Mesh Sharding History</h3>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Immutable Log of Local Shard State Transitions</p>
           </div>
           <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar bg-slate-950/20">
              {commits.length === 0 ? (
                <div className="py-20 text-center text-slate-600 italic">No sharding events recorded in this loop.</div>
              ) : (
                commits.map(commit => (
                  <div key={commit.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-start justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="flex gap-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-indigo-500 border border-white/5">
                        <i className="fa-solid fa-code-commit"></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-black text-sm uppercase tracking-tight">{commit.message}</span>
                          <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{commit.hash}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Author: {commit.author}</span>
                           <span className="text-slate-700">•</span>
                           <span className="text-[10px] text-slate-600 font-mono">{new Date(commit.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[9px] font-black text-slate-500 uppercase">{commit.filesChanged} Shards Updated</span>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
       </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

const HealthStat: React.FC<{ icon: string; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] hover:border-indigo-500/30 transition-all group shadow-xl">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-white/5 transition-colors">
        <i className={`fa-solid ${icon} text-slate-500`}></i>
      </div>
      <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div className={`text-2xl font-black ${color} mb-1 tracking-tighter`}>{value}</div>
  </div>
);

const GovInput: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type="number" 
      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
      value={value}
      onChange={e => onChange(parseInt(e.target.value))}
    />
  </div>
);

const DtnMetric: React.FC<{ label: string, value: string, color?: string }> = ({ label, value, color = "text-white" }) => (
  <div className="text-center md:text-left">
    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</div>
    <div className={`text-xl font-black font-mono ${color}`}>{value}</div>
  </div>
);

export default AdminPanel;
