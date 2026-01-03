
import React, { useState } from 'react';
import { SecurityAlert, ChatMessage } from '../types';
import { getLocalData, setLocalData } from '../services/dbService';

interface SecurityViewProps {
  onBroadcast: (message: string) => void;
}

const SecurityView: React.FC<SecurityViewProps> = ({ onBroadcast }) => {
  const [cameras] = useState([
    { id: 1, name: 'North Perimeter', url: 'https://picsum.photos/seed/sec1/400/300' },
    { id: 2, name: 'Main Entrance', url: 'https://picsum.photos/seed/sec2/400/300' },
    { id: 3, name: 'Garden Quad', url: 'https://picsum.photos/seed/sec3/400/300' },
    { id: 4, name: 'Solar Array B', url: 'https://picsum.photos/seed/sec4/400/300' },
  ]);

  const [alerts, setAlerts] = useState<SecurityAlert[]>(getLocalData('security_logs', [
    { id: 'a1', camera: 'Main Entrance', timestamp: Date.now() - 3600000, message: 'Package delivery detected at Gate 2', severity: 'INFO' },
    { id: 'a2', camera: 'North Perimeter', timestamp: Date.now() - 7200000, message: 'Motion detected in restricted zone B', severity: 'WARNING' },
  ]));

  const triggerAlert = () => {
    const msg = "Manual emergency broadcast: Unidentified activity reported in Section C.";
    onBroadcast(msg);
    
    // Log it locally
    const newAlert: SecurityAlert = {
      id: `a-${Date.now()}`,
      camera: 'Manual Override',
      timestamp: Date.now(),
      message: msg,
      severity: 'CRITICAL'
    };
    
    const updated = [newAlert, ...alerts].slice(0, 50);
    setAlerts(updated);
    setLocalData('security_logs', updated);

    // Also push to chat channel (simulated via local storage update)
    const chatMsg: ChatMessage = {
      id: `sec-chat-${Date.now()}`,
      senderId: 'SYSTEM',
      senderName: 'SECURITY CLUSTER',
      text: msg,
      timestamp: Date.now(),
      type: 'SECURITY'
    };
    const currentChat = getLocalData<ChatMessage[]>('chat_messages', []);
    setLocalData('chat_messages', [...currentChat, chatMsg]);
  };

  return (
    <div className="flex flex-col h-full gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">B-LAN Security Cluster</h2>
          <p className="text-slate-400">Real-time shared community surveillance.</p>
        </div>
        <button 
          onClick={triggerAlert}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 animate-pulse shadow-lg shadow-red-600/20 w-full sm:w-auto justify-center"
        >
          <i className="fa-solid fa-triangle-exclamation"></i> Broadcast Alert
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Camera Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
          {cameras.map(cam => (
            <div key={cam.id} className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 group shadow-lg">
              <img src={cam.url} alt={cam.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-all duration-500 scale-105 group-hover:scale-100" />
              <div className="absolute inset-0 pointer-events-none border-2 border-transparent group-hover:border-indigo-500/30 transition-all"></div>
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono border border-white/10">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                REC {cam.name}
              </div>
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded">
                 <div className="text-[10px] text-white/80 font-mono tracking-wider">SEC_CH_{cam.id}</div>
              </div>
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-300 bg-black/40 px-2 py-1 rounded">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        {/* Security Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-inner overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
            <h3 className="font-bold text-white uppercase text-xs tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-list-ul text-red-400"></i>
              Security Log
            </h3>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono uppercase">Live</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-10 text-slate-600 text-sm">No recent activity</div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className="flex gap-3 animate-slideInLeft">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 shadow-sm ${alert.severity === 'CRITICAL' ? 'bg-red-500 shadow-red-500/50' : alert.severity === 'WARNING' ? 'bg-amber-500 shadow-amber-500/50' : 'bg-blue-500 shadow-blue-500/50'}`}></div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-200 leading-tight">{alert.message}</div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{alert.camera}</div>
                      <div className="text-[10px] text-slate-600 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityView;
