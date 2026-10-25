
import React, { useState, useEffect } from 'react';
import { Cpu, Shield, Wifi, Github } from 'lucide-react';
import { UserProfile, Community } from '../types';
import { registerLocalUser, authenticateLocalUser } from '../services/dbService';
import { getCommunities } from '../services/communityService';

interface LandingPageProps {
  onLogin: (user: UserProfile) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    address: '',
    communityId: '',
    bio: 'Local community member.',
    skills: [] as string[],
    role: 'USER'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    setCommunities(getCommunities());
    const comms = getCommunities();
    if (comms.length > 0) {
      setFormData(prev => ({ ...prev, communityId: comms[0].id }));
    }
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = authenticateLocalUser(formData.name, formData.password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials or PIM identity not found.');
      }
    } else {
      if (!formData.name || !formData.address || !formData.communityId) {
        setError('Identification, Unit Address, and Community required.');
        return;
      }
      
      const newUser: UserProfile = {
        id: `u-${Math.floor(Math.random() * 9000) + 1000}`,
        name: formData.name,
        address: formData.address,
        communityId: formData.communityId,
        skills: formData.skills.length > 0 ? formData.skills : (formData.role === 'ADMIN' ? ['Superuser', 'Network Admin'] : ['General Labor']),
        bio: formData.role === 'ADMIN' ? 'B-LAN Primary Administrator' : formData.bio,
        karmaBalance: formData.role === 'ADMIN' ? 999999 : 500, // Starting bonus / Infinite for admin
        solarWatts: 1000, // Demo starting balance
        isElderly: false,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${formData.name}`,
        role: formData.role as 'USER' | 'ADMIN',
        deviceStats: formData.role === 'ADMIN' ? { ramGb: 32, storageGb: 2048, cpuCores: 16 } : { ramGb: 8, storageGb: 256, cpuCores: 8 },
        hasPersonalServer: true,
        calendar: [],
        deviceRoutes: [],
        socialProfiles: {},
        installedShards: formData.role === 'ADMIN' ? [
          'SECURITY_CAM',
          'JOB_BOARD',
          'KARMA_LEDGER',
          'MEDIA_HUB',
          'CHAT_SYSTEM',
          'PHOTO_ALBUM',
          'AI_HUB',
          'VOICE_ASSISTANT',
          'SOLAR_CARD',
          'LEMONADE_SERVER'
        ] : [
          'JOB_BOARD',
          'KARMA_LEDGER',
          'MEDIA_HUB',
          'CHAT_SYSTEM',
          'PHOTO_ALBUM',
          'AI_HUB',
          'VOICE_ASSISTANT',
          'SOLAR_CARD',
          'LEMONADE_SERVER'
        ]
      };

      registerLocalUser(newUser, formData.password);
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Mesh Network Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
        <div className="grid grid-cols-12 gap-4 h-full w-full opacity-10">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border border-indigo-500/20 rounded-full h-1 w-1"></div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Brand/Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-white text-3xl font-bold shadow-2xl shadow-indigo-600/20 mb-4 border border-indigo-400/30">
            B
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">B-LAN <span className="text-indigo-500">Core</span></h1>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">Local Identity Cluster v3.0</p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
          <div className="absolute top-0 right-8 transform -translate-y-1/2">
            <span className="flex items-center gap-2 text-green-500 text-[10px] font-mono uppercase bg-slate-900 border border-green-500/30 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Mesh Node Online
            </span>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 text-sm">PIM Identification</label>
              <input 
                type="text" 
                placeholder={isLogin ? "Enter Registered Name" : "Enter Full Name"}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-700 text-base"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 text-sm">Secure Passkey</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-700 font-mono text-base"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-1 animate-slideDown">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 text-sm">Local Unit Address</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sector B-4, Unit 12"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder:text-slate-700 text-base"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="space-y-1 animate-slideDown">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 text-sm">Community Information Module (CIM)</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-base"
                    value={formData.communityId}
                    onChange={(e) => setFormData({...formData, communityId: e.target.value})}
                  >
                    {communities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 animate-slideDown">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 text-sm">Identity Access Role</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-base font-black text-indigo-400"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="USER">Mesh User (Regular Role)</option>
                    <option value="ADMIN">Mesh Administrator (Full Admin Role)</option>
                  </select>
                </div>
              </>
            )}

            {error && <div className="text-red-400 text-sm font-bold uppercase bg-red-400/10 border border-red-400/20 p-2 rounded text-center">{error}</div>}

            <button 
              type="submit"
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-indigo-600/20 uppercase tracking-widest text-sm"
            >
              {isLogin ? 'Initialize Uplink' : 'Create PIM Profile'}
            </button>
          </form>

          {isLogin && (
            <div className="bg-slate-950/80 border border-indigo-500/20 rounded-2xl p-4 mt-6 text-center animate-fadeIn">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Primary Node Administration (a-lan)</span>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    name: 'a-lan',
                    password: 'Asw1Nnw2!'
                  });
                }}
                className="w-full py-2.5 bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-500/30 hover:border-indigo-400 text-indigo-400 hover:text-indigo-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Shield className="w-3.5 h-3.5" />
                Auto-Fill Admin Credentials
              </button>
              <p className="text-[9px] text-slate-500 mt-1.5 uppercase font-mono tracking-tight">Username: a-lan &bull; Password: Asw1Nnw2!</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col items-center gap-4">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors"
            >
              {isLogin ? "No PIM Profile? Create New Identity" : "Already have a profile? Login to Mesh"}
            </button>
          </div>
        </div>

        {/* Technical Footer */}
        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="flex justify-center gap-8 text-sm font-mono text-slate-600 uppercase tracking-tighter">
            <div className="flex items-center gap-1">
              <Cpu className="w-4 h-4" />
              SDR Node Active
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Local SQL Encrypted
            </div>
            <div className="flex items-center gap-1">
              <Wifi className="w-4 h-4" />
              B-LAN 100% Offline
            </div>
          </div>
          
          <a 
            href="https://github.com/ADD12/b-lan" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-sm font-black text-slate-400 hover:text-white hover:border-indigo-500 transition-all uppercase tracking-widest"
          >
            <Github className="w-4 h-4" />
            Download B-LAN Core Source
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
