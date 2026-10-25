
import React, { useState, useEffect } from 'react';
import { UserProfile, ResidentSafetyStatus, EmergencyIncident } from '../types';
import { getLocalData, setLocalData } from '../services/dbService';

interface TriageViewProps {
  user: UserProfile;
  onNewAlert: (msg: string) => void;
}

const TriageView: React.FC<TriageViewProps> = ({ user, onNewAlert }) => {
  const [safetyStatuses, setSafetyStatuses] = useState<ResidentSafetyStatus[]>(getLocalData('triage_safety', []));
  const [incident, setIncident] = useState<EmergencyIncident | null>(getLocalData('current_incident', null));
  const [isResponderMode, setIsResponderMode] = useState(false);
  const [helpNote, setHelpNote] = useState('');
  const [responderId, setResponderId] = useState('');
  const [pushStatus, setPushStatus] = useState<'IDLE' | 'PUSHING' | 'SYNCED'>('IDLE');

  const triggerPanic = (type: 'FIRE' | 'POLICE' | 'MEDICAL') => {
    const newIncident: EmergencyIncident = {
      id: `incident-${Date.now()}`,
      startTime: Date.now(),
      type,
      status: 'ACTIVE',
      triggeredBy: user.id
    };
    setIncident(newIncident);
    setLocalData('current_incident', newIncident);
    onNewAlert(`CRITICAL: Neighborhood ${type} alert sharded by ${user.name}.`);
    markSafety('NEED_HELP');
  };

  const markSafety = (status: 'SAFE' | 'NEED_HELP') => {
    setPushStatus('PUSHING');
    const newStatus: ResidentSafetyStatus = {
      userId: user.id,
      userName: user.name,
      address: user.address,
      status,
      note: helpNote,
      timestamp: Date.now()
    };
    
    setTimeout(() => {
      const updated = [newStatus, ...safetyStatuses.filter(s => s.userId !== user.id)];
      setSafetyStatuses(updated);
      setLocalData('triage_safety', updated);
      setPushStatus('SYNCED');
      if (status === 'NEED_HELP') onNewAlert(`HELP REQUESTED: ${user.name} at ${user.address}`);
      setTimeout(() => setPushStatus('IDLE'), 2000);
    }, 800);
  };

  const myStatus = safetyStatuses.find(s => s.userId === user.id);

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fadeIn pb-12">
      
      {/* Platform Aware Header */}
      <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border shadow-2xl transition-all duration-500 relative overflow-hidden ${
        incident?.status === 'ACTIVE' 
          ? 'bg-red-950/40 border-red-500/40' 
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 md:gap-6 text-center md:text-left">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center text-2xl md:text-3xl shadow-xl transition-all ${
              incident?.status === 'ACTIVE' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-500'
            }`}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-tight">Emergency Triage</h2>
              <p className="text-xs md:text-sm text-slate-500 font-mono uppercase tracking-widest mt-1">B-LAN Tactical Loop v3.0</p>
            </div>
          </div>

          <div className="flex w-full md:w-auto">
            {!isResponderMode ? (
              <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-white/5 w-full">
                <input 
                  type="password" 
                  placeholder="ID" 
                  className="bg-transparent text-sm font-mono px-4 py-3 w-full md:w-24 outline-none text-white"
                  value={responderId}
                  onChange={e => setResponderId(e.target.value)}
                />
                <button 
                  onClick={() => (responderId === '911' || user.role === 'ADMIN') && setIsResponderMode(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap"
                >
                  Verify
                </button>
              </div>
            ) : (
              <button onClick={() => setIsResponderMode(false)} className="w-full md:w-auto bg-slate-800 text-slate-400 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest">
                Exit Responder Mode
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        {/* Resident Panel - Adapts grid behavior */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-xl">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 md:mb-8 flex items-center gap-3">
              <i className="fa-solid fa-user-shield text-indigo-500"></i>
              Safety Control
            </h3>

            <div className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => markSafety('SAFE')}
                  className={`h-24 md:h-28 rounded-2xl md:rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    myStatus?.status === 'SAFE' 
                      ? 'bg-green-600 border-green-500 text-white' 
                      : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-green-500'
                  }`}
                >
                  <i className="fa-solid fa-circle-check text-2xl md:text-3xl"></i>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Mark Safe</span>
                </button>
                <button 
                  onClick={() => markSafety('NEED_HELP')}
                  className={`h-24 md:h-28 rounded-2xl md:rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    myStatus?.status === 'NEED_HELP' 
                      ? 'bg-amber-600 border-amber-500 text-white shadow-amber-600/20 shadow-lg' 
                      : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-amber-500'
                  }`}
                >
                  <i className="fa-solid fa-hand-holding-medical text-2xl md:text-3xl"></i>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Need Help</span>
                </button>
              </div>

              <textarea 
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-5 text-slate-200 text-sm md:text-base h-24 md:h-32 focus:ring-1 focus:ring-indigo-500 outline-none resize-none shadow-inner"
                placeholder="Incident details for mesh shard..."
                value={helpNote}
                onChange={e => setHelpNote(e.target.value)}
              />

              <div className="pt-6 md:pt-8 border-t border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  <PanicButton icon="fa-fire-extinguisher" label="Fire" color="bg-orange-600" onClick={() => triggerPanic('FIRE')} />
                  <PanicButton icon="fa-handcuffs" label="Police" color="bg-blue-600" onClick={() => triggerPanic('POLICE')} />
                  <PanicButton icon="fa-kit-medical" label="Medical" color="bg-red-600" onClick={() => triggerPanic('MEDICAL')} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Queue - Scrollable list */}
        <div className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-xl min-h-[400px]">
          <div className="p-5 md:p-6 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Mesh Safety Queue</h3>
            <div className="flex gap-2">
              <div className="bg-slate-950 px-3 py-1 rounded-full border border-white/5 text-[10px] font-mono text-green-500 font-black">
                SAFE: {safetyStatuses.filter(s => s.status === 'SAFE').length}
              </div>
              <div className="bg-slate-950 px-3 py-1 rounded-full border border-white/5 text-[10px] font-mono text-red-500 font-black animate-pulse">
                HELP: {safetyStatuses.filter(s => s.status === 'NEED_HELP').length}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 bg-slate-950/20 custom-scrollbar">
            {safetyStatuses.map(status => (
              <div key={status.userId} className={`bg-slate-900 border p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                status.status === 'NEED_HELP' ? 'border-red-500/50 bg-red-600/5' : 'border-slate-800'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-xl ${
                    status.status === 'SAFE' ? 'bg-green-600/10 text-green-500' : 'bg-red-600 text-white animate-pulse'
                  }`}>
                    <i className={`fa-solid ${status.status === 'SAFE' ? 'fa-check' : 'fa-hand-holding-medical'}`}></i>
                  </div>
                  <div>
                    <div className="text-sm md:text-base font-black text-white uppercase">{status.userName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">LOC: {status.address}</div>
                  </div>
                </div>
                {status.note && <div className="text-xs text-slate-400 italic bg-slate-950/40 p-3 rounded-lg flex-1 sm:mx-4 w-full sm:w-auto">"{status.note}"</div>}
                <div className="text-[10px] text-slate-600 font-mono whitespace-nowrap self-end sm:self-auto">
                  {new Date(status.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PanicButton: React.FC<{ icon: string; label: string; color: string; onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-row sm:flex-col items-center justify-center gap-4 sm:gap-2 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/5 active:scale-95 transition-all text-white ${color} shadow-lg min-h-[56px]`}
  >
    <i className={`fa-solid ${icon} text-lg md:text-xl`}></i>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default TriageView;
