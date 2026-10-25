
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, LemonadeService } from '../types';
import { getLocalData, setLocalData } from '../services/dbService';

interface Dependency {
  name: string;
  version: string;
  status: 'INSTALLED' | 'SYNCING' | 'PENDING';
  size: string;
}

const MOCK_SERVICES: LemonadeService[] = [
  { id: 's-1', name: 'Neighborhood Wiki', status: 'RUNNING', port: 8080, cpuUsage: 0.5, memoryUsage: '42MB' },
  { id: 's-2', name: 'SQL Cluster 0x1 (PostgreSQL)', status: 'RUNNING', port: 5432, cpuUsage: 1.2, memoryUsage: '456MB' },
  { id: 's-6', name: 'Odoo Community Shard', status: 'STOPPED', port: 8069, cpuUsage: 0, memoryUsage: '0MB' },
  { id: 's-5', name: 'YOLO v11 Edge Inference', status: 'RUNNING', port: 8888, cpuUsage: 4.5, memoryUsage: '1.2GB' },
  { id: 's-3', name: 'DTN Proxy', status: 'RUNNING', port: 9000, cpuUsage: 0.2, memoryUsage: '12MB' },
];

const MOCK_DEPENDENCIES: Dependency[] = [
  { name: 'odoo-17-core', version: '17.0.2', status: 'PENDING', size: '1.4GB' },
  { name: 'postgresql-mesh-client', version: '15.4', status: 'INSTALLED', size: '220MB' },
  { name: 'ultralytics-yolo11', version: '11.0.3', status: 'INSTALLED', size: '450MB' },
  { name: 'pytorch-edge-runtime', version: '2.1.0', status: 'INSTALLED', size: '890MB' },
];

const LemonadeServer: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [services, setServices] = useState<LemonadeService[]>(getLocalData('lemonade_services', MOCK_SERVICES));
  const [dependencies, setDependencies] = useState<Dependency[]>(getLocalData('lemonade_deps', MOCK_DEPENDENCIES));
  const [isDeploying, setIsDeploying] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'B-LAN LMN-KERNEL v1.0.4-LMN initialized.',
    'Establishing encrypted sharding link...',
    'Connected to Node 0x1 (Lemonade-Personal-Server).',
    'Neural NPU Detected: EdgeTensor-v2 @ 4.2 TFLOPS',
    'Detected Odoo Blueprint in local /mnt/shards/config.',
    'Type "help" for a list of community authorized commands.'
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  const handleTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    const newHistory = [...terminalHistory, `pim@${user.id.toLowerCase()}:~$ ${terminalInput}`];

    if (cmd.includes('odoo')) {
      newHistory.push('[LMN] Inspecting Odoo requirements...');
      newHistory.push('  - RAM needed: 2.5GB (Available: 6.6GB)');
      newHistory.push('  - Storage needed: 5.0GB (Available: 142GB)');
      newHistory.push('[LMN] Resource check: PASSED.');
    } else {
      switch (cmd) {
        case 'help':
          newHistory.push('Available commands: ls, top, status, whoami, yolo, odoo, clear, exit');
          break;
        case 'top':
          newHistory.push(`CPU Load: ${services.reduce((a, b) => a + b.cpuUsage, 0).toFixed(1)}%`);
          newHistory.push('Memory Usage: 1.8GB / 8GB');
          break;
        case 'clear':
          setTerminalHistory([]);
          setTerminalInput('');
          return;
        case 'exit':
          setShowTerminal(false);
          setTerminalInput('');
          return;
        default:
          newHistory.push(`Command not found: ${cmd}. Type "help" for authorized LMN commands.`);
      }
    }

    setTerminalHistory(newHistory);
    setTerminalInput('');
  };

  const toggleService = (id: string) => {
    const updated = services.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'RUNNING' ? 'STOPPED' : 'RUNNING';
        // Simulate Odoo resource impact
        const nextMem = nextStatus === 'RUNNING' && s.name.includes('Odoo') ? '2.4GB' : s.memoryUsage;
        return { ...s, status: nextStatus as any, memoryUsage: nextMem };
      }
      return s;
    });
    setServices(updated);
    setLocalData('lemonade_services', updated);
  };

  if (!user.hasPersonalServer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-900 border border-slate-800 rounded-[3rem] p-12 text-center">
        <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-500 text-3xl mb-6 border border-white/5">
          <i className="fa-solid fa-server"></i>
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Insufficient Resources</h2>
        <p className="text-slate-400 text-sm max-w-md leading-relaxed italic">
          Minimum 8GB RAM required to shard Odoo ERP or YOLO Inference.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12 relative">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <i className="fa-solid fa-lemon text-9xl"></i>
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-center">
           <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-white text-3xl shadow-xl shadow-amber-500/20 shrink-0">
              <i className="fa-solid fa-microchip"></i>
           </div>
           <div className="flex-1">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Lemonade Personal Server</h2>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black uppercase rounded-full">Status: ONLINE</span>
                <span className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Shard ID: {user.id}-LMN</span>
              </div>
           </div>
           <div className="flex gap-4">
             <button 
               onClick={() => setShowTerminal(true)}
               className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 transition-all flex items-center gap-2"
             >
               <i className="fa-solid fa-terminal"></i>
               Terminal
             </button>
             <button 
               onClick={() => {setIsDeploying(true); setTimeout(() => setIsDeploying(false), 3000);}}
               className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
             >
               {isDeploying ? <i className="fa-solid fa-sync animate-spin mr-2"></i> : <i className="fa-solid fa-plus mr-2"></i>}
               Deploy Shard
             </button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Service Stack */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                <i className="fa-solid fa-list-check text-amber-500"></i>
                Active Service Stack
             </h3>
             <div className="text-[10px] font-mono text-slate-600">CAPACITY: 8.0GB</div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {services.map(service => (
              <div key={service.id} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border transition-all ${
                    service.status === 'RUNNING' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-slate-800 border-white/5 text-slate-500 grayscale'
                  }`}>
                    <i className={`fa-solid ${service.name.includes('Odoo') ? 'fa-briefcase' : service.name.includes('YOLO') ? 'fa-eye' : 'fa-rocket'}`}></i>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight">{service.name}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] font-mono text-slate-500">PORT: {service.port}</span>
                      <span className="text-[9px] text-slate-700">•</span>
                      <span className="text-[9px] font-mono text-slate-500">MEM: {service.status === 'RUNNING' ? service.memoryUsage : 'OFFLINE'}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => toggleService(service.id)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    service.status === 'RUNNING' ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-power-off"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Footprint Visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl space-y-8">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
              <i className="fa-solid fa-chart-pie text-indigo-400"></i>
              Resource Blueprint
           </h3>
           
           <div className="space-y-6">
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] uppercase font-bold">
                    <span className="text-slate-400">RAM Allocation</span>
                    <span className="text-white">1.8GB / 8GB</span>
                 </div>
                 <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-white/5">
                    <div className="h-full bg-indigo-500" style={{ width: '15%' }} title="Kernel"></div>
                    <div className="h-full bg-amber-500" style={{ width: '30%' }} title="Odoo (Potential)"></div>
                    <div className="h-full bg-blue-500" style={{ width: '20%' }} title="YOLO"></div>
                 </div>
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] uppercase font-bold">
                    <span className="text-slate-400">Storage Shards</span>
                    <span className="text-white">4.2GB / 256GB</span>
                 </div>
                 <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-emerald-500" style={{ width: '10%' }}></div>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-800 space-y-4">
                 <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1"></div>
                    <p className="text-[10px] text-slate-500 italic">Odoo requires 2.5GB RAM and 5GB Storage. Node {user.id} has sufficient room.</p>
                 </div>
                 <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1"></div>
                    <p className="text-[10px] text-slate-500 italic">YOLO v11 is sharding 72% of NPU cycles for security motion detection.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* SSH Terminal Overlay */}
      {showTerminal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fadeIn">
          <div className="w-full max-w-4xl h-[600px] bg-black border border-indigo-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden font-mono">
            <div className="p-4 bg-slate-900 border-b border-white/10 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-terminal text-indigo-400"></i>
                pim@node-lmn: ~ (ssh)
              </span>
              <button onClick={() => setShowTerminal(false)} className="text-slate-500 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-1 custom-scrollbar-terminal">
              {terminalHistory.map((line, i) => (
                <div key={i} className={`text-sm leading-relaxed ${line.startsWith('pim@') ? 'text-indigo-400' : 'text-slate-300'}`}>
                  {line}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
            <div className="p-4 bg-slate-950 border-t border-white/5 flex items-center gap-2">
              <span className="text-indigo-400 text-sm">pim@${user.id.toLowerCase()}:~$</span>
              <form onSubmit={handleTerminalCommand} className="flex-1">
                <input autoFocus type="text" className="w-full bg-transparent border-none outline-none text-white text-sm focus:ring-0" value={terminalInput} onChange={e => setTerminalInput(e.target.value)} />
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar-terminal::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-terminal::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar-terminal::-webkit-scrollbar-thumb { background: #1e1e2e; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default LemonadeServer;
