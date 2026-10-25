
import React, { useState, useEffect } from 'react';
import { UserProfile, SolarCardConfig } from '../types';
import { getLocalData, setLocalData } from '../services/dbService';

interface SolarCardConfigViewProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const SolarCardConfigView: React.FC<SolarCardConfigViewProps> = ({ user, onUpdate }) => {
  const [apiKey, setApiKey] = useState(user.solarCardConfig?.apiKey || '');
  const [isScanning, setIsScanning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastWatts, setLastWatts] = useState(user.solarWatts);

  const handleLink = async () => {
    setIsSyncing(true);
    // Simulate API validation
    await new Promise(r => setTimeout(r, 2000));
    
    const newConfig: SolarCardConfig = {
      apiKey: apiKey,
      isLinked: true,
      lastSync: Date.now()
    };

    // Simulate proprietary Watt fetch
    const fetchedWatts = Math.floor(Math.random() * 2000) + 500;
    
    const updatedUser = {
      ...user,
      solarWatts: fetchedWatts,
      solarCardConfig: newConfig
    };

    onUpdate(updatedUser);
    setLastWatts(fetchedWatts);
    setIsSyncing(false);
    alert("Solar Card linked to B-LAN PIM successfully.");
  };

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setApiKey(`SC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
      setIsScanning(false);
      alert("QR Code Validated: Solar Card ID detected.");
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn pb-16">
      <div className="bg-slate-900 border-2 border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
           <i className="fa-solid fa-sun text-[12rem] text-amber-500"></i>
        </div>
        
        <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
           <div className="w-24 h-24 bg-amber-500 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-2xl shadow-amber-600/30 shrink-0 border-2 border-amber-400/40">
              <i className="fa-solid fa-solar-panel"></i>
           </div>
           <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Solar Card Integration</h2>
              <p className="text-lg text-slate-400 font-mono uppercase tracking-widest font-black">
                Proprietary Wattage Sharding // solargiftcards.com
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Connection Panel */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[3rem] p-10 shadow-xl flex flex-col gap-8">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-4">
             <i className="fa-solid fa-link text-indigo-500 text-xl"></i>
             Account Authentication
          </h3>

          <div className="space-y-8">
            <div className="space-y-6">
              <button 
                onClick={simulateScan}
                disabled={isScanning}
                className={`w-full h-44 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${
                  isScanning ? 'bg-indigo-600/10 border-indigo-500/40' : 'bg-slate-950 border-slate-800 hover:border-indigo-500/40 text-slate-500 hover:text-indigo-400'
                }`}
              >
                {isScanning ? (
                  <>
                    <i className="fa-solid fa-qrcode text-5xl animate-pulse"></i>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Scanning Hardware...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-camera text-5xl opacity-40"></i>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Scan Solar Card QR</span>
                  </>
                )}
              </button>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-0.5 bg-slate-800"></div>
                <span className="text-sm font-black text-slate-700 uppercase tracking-widest">OR</span>
                <div className="flex-1 h-0.5 bg-slate-800"></div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Manual API Key</label>
              <input 
                type="password" 
                placeholder="SC-XXXX-XXXX-XXXX"
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-[1.5rem] p-6 text-white text-lg font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner placeholder:text-slate-800"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
            </div>

            <button 
              onClick={handleLink}
              disabled={isSyncing || !apiKey}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? <i className="fa-solid fa-sync animate-spin text-xl"></i> : <i className="fa-solid fa-plug text-xl"></i>}
              {user.solarCardConfig?.isLinked ? 'Update Link' : 'Link Solar Card'}
            </button>
          </div>
        </div>

        {/* Info & Buy Panel */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[3rem] p-10 shadow-xl flex flex-col justify-between">
          <div className="space-y-8">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-4">
               <i className="fa-solid fa-circle-info text-amber-500 text-xl"></i>
               Balance Shard
            </h3>

            <div className="bg-slate-950 border-2 border-white/5 p-8 rounded-[2.5rem] text-center shadow-inner relative overflow-hidden">
               {user.solarCardConfig?.isLinked && (
                 <div className="absolute top-4 right-4">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse block border-2 border-slate-950"></span>
                 </div>
               )}
               <div className="text-sm text-slate-600 font-black uppercase tracking-widest mb-2">Local PIM Watts</div>
               <div className="text-6xl font-black text-amber-500 tracking-tighter">
                  {lastWatts.toLocaleString()} <span className="text-2xl font-normal text-slate-700">Wh</span>
               </div>
               <p className="text-xs text-slate-600 font-mono mt-4 font-bold uppercase tracking-widest">
                 Last Sync: {user.solarCardConfig?.lastSync ? new Date(user.solarCardConfig.lastSync).toLocaleString() : 'Never Detected'}
               </p>
            </div>

            <div className="space-y-6">
               <p className="text-base text-slate-400 leading-relaxed italic font-medium">
                 Solar Card provides B-LAN users with renewable energy vouchers that can be traded on the Honey Do board or sharded for community backup power.
               </p>
               <div className="p-6 bg-indigo-600/5 border-2 border-indigo-500/10 rounded-3xl flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-2xl">
                     <i className="fa-solid fa-cart-shopping"></i>
                  </div>
                  <div>
                    <div className="text-xs font-black text-white uppercase tracking-widest">Need More Harvest?</div>
                    <a 
                      href="https://solargiftcards.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lg font-black text-indigo-400 uppercase underline decoration-2 underline-offset-4"
                    >
                      <b>Visit solargiftcards.com</b>
                    </a>
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-xs text-slate-700 font-mono font-black uppercase tracking-[0.3em] text-center">
            Secured via Proprietary Solar-Link Protocol
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarCardConfigView;
