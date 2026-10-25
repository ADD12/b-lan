
import React, { useState } from 'react';

interface GuideSection {
  id: string;
  title: string;
  icon: string;
  content: React.ReactNode;
}

const UserGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState('getting-started');

  const githubUrl = "https://github.com/ADD12/b-lan";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(githubUrl)}&color=6366f1&bgcolor=0f172a`;

  const sections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'B-LAN Fundamentals',
      icon: 'fa-rocket',
      content: (
        <div className="space-y-6">
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-3xl">
            <h4 className="text-white font-black text-lg mb-3">What is B-LAN?</h4>
            <p className="text-slate-400 text-sm leading-relaxed italic">
              B-LAN (Bottom-up Local Area Network) is a 100% offline, local-first ecosystem. 
              Instead of relying on central cloud servers, B-LAN shards data across neighbors' hardware 
              using the "Fog-Over-DTN" protocol. Everything you do here stays within your physical community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GuideCard 
              title="PIM (Personal Identity)" 
              text="Your PIM is your local passport. It stores your skills, bio, and Karma balance encrypted on the local shard." 
              icon="fa-user-shield" 
            />
            <GuideCard 
              title="CIM (Community Mesh)" 
              text="You are linked to a Community Information Module. This routes your tasks and ensures governance consensus." 
              icon="fa-network-wired" 
            />
          </div>
        </div>
      )
    },
    {
      id: 'honey-do',
      title: 'Honey Do Economy',
      icon: 'fa-list-check',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-white font-black text-lg uppercase tracking-tight">How to Earn Karma</h4>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
               <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">1</div>
                  <div>
                    <span className="text-white font-bold block mb-1">Browse the Board</span>
                    <p className="text-slate-500 text-xs">Navigate to the Honey Do List. Look for "Skill Match" badges—our Gemini AI identifies these based on your PIM inventory.</p>
                  </div>
               </div>
               <div className="flex gap-6 items-start mt-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">2</div>
                  <div>
                    <span className="text-white font-bold block mb-1">Claim a Task</span>
                    <p className="text-slate-500 text-xs">Click "Claim Task". This locks the job to your profile and alerts the poster via the mesh chat.</p>
                  </div>
               </div>
               <div className="flex gap-6 items-start mt-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">3</div>
                  <div>
                    <span className="text-white font-bold block mb-1">Get Paid</span>
                    <p className="text-slate-500 text-xs">Once complete, the poster verifies the work, and Karma is sharded to your ledger instantly.</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-black text-lg uppercase tracking-tight">How to Request Help</h4>
            <div className="bg-slate-950/50 border border-white/5 p-6 rounded-3xl">
               <p className="text-slate-400 text-sm leading-relaxed mb-4">Need help fixing a sink or setting up solar panels? Posting is easy:</p>
               <ol className="list-decimal list-inside text-xs text-slate-500 space-y-2 ml-2">
                 <li>Go to <span className="text-indigo-400 font-bold">Honey Do List</span>.</li>
                 <li>Click the <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px]">Post New Task</span> button.</li>
                 <li>Define your reward. Remember: <span className="italic">Karma is the currency of trust here.</span></li>
                 <li>Submit. Your request is now a bundle propagating through the neighborhood fog nodes.</li>
               </ol>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'deployment',
      title: 'Fog Node Setup',
      icon: 'fa-tower-broadcast',
      content: (
        <div className="space-y-6">
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center">
            <div className="bg-white p-4 rounded-2xl shadow-2xl shrink-0">
               <img src={qrCodeUrl} alt="Clone B-LAN QR Code" className="w-32 h-32" />
            </div>
            <div>
               <h4 className="text-white font-black text-lg mb-2 uppercase tracking-tight">Initialize Fog Shard</h4>
               <p className="text-slate-400 text-xs leading-relaxed mb-4 italic">
                 B-LAN is built for <b>Fog Computing</b>—decentralized infrastructure that operates at the edge. 
                 To expand the mesh, clone the core repository and sideload it onto local hardware.
               </p>
               <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 p-2 rounded border border-indigo-500/20 truncate">
                    git clone {githubUrl}
                  </div>
                  <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">
                    Target: Raspberry Pi 5 / Orange Pi / Local Server Shards
                  </p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <h5 className="text-white font-bold mb-2 text-sm">1. SDR Bridge</h5>
                <p className="text-slate-500 text-[10px] leading-relaxed">Connect a LoRa or SDR antenna. This allows your node to talk to other neighbors without Wi-Fi or Internet.</p>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <h5 className="text-white font-bold mb-2 text-sm">2. Local SQL</h5>
                <p className="text-slate-500 text-[10px] leading-relaxed">The PIM registry runs on a local SQL cluster. No data ever leaves the physical hardware of the Fog node.</p>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <h5 className="text-white font-bold mb-2 text-sm">3. Mesh ID</h5>
                <p className="text-slate-500 text-[10px] leading-relaxed">Generate a unique Shard ID. This ensures your community ledger doesn't collide with neighboring meshes.</p>
             </div>
          </div>
        </div>
      )
    },
    {
      id: 'redistribution',
      title: 'Redistribution Protocol',
      icon: 'fa-share-nodes',
      content: (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-emerald-600/10 border border-emerald-500/20 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <i className="fa-solid fa-usb text-7xl text-emerald-400"></i>
            </div>
            <h4 className="text-white font-black text-xl mb-4 uppercase tracking-tight">Physical Mesh Expansion</h4>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 italic">
              When WAN access is compromised, community operators must rely on physical hand-off. 
              Follow these steps to prepare a B-LAN sideloading shard.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="text-emerald-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-folder-tree"></i>
                  USB Drive Preparation
                </h5>
                <ul className="text-[11px] text-slate-500 space-y-3 list-none">
                  <li className="flex gap-3">
                    <span className="text-emerald-500 font-black">01</span>
                    <span>Format drive to <span className="text-slate-300 font-mono">exFAT</span> for cross-platform PIM compatibility.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-500 font-black">02</span>
                    <span>Copy the <span className="text-slate-300 font-mono">/dist</span> folder containing the B-LAN Core binary.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-500 font-black">03</span>
                    <span>Include <span className="text-slate-300 font-mono">setup_pim.sh</span> for automated SQL database sharding.</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="text-indigo-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  <i className="fa-solid fa-box-archive"></i>
                  Self-Installing Bundle
                </h5>
                <ul className="text-[11px] text-slate-500 space-y-3 list-none">
                  <li className="flex gap-3">
                    <span className="text-indigo-500 font-black">01</span>
                    <span>Compile the source into a single <span className="text-slate-300 font-mono">.AppImage</span> or <span className="text-slate-300 font-mono">Docker</span> container.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-indigo-500 font-black">02</span>
                    <span>Bundle with <span className="text-slate-300 font-mono">SDR-drivers-lite</span> to ensure mesh connectivity on fresh hardware.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-indigo-500 font-black">03</span>
                    <span>Add <span className="text-slate-300 font-mono">index.html</span> as a local gateway for zero-config startup.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
            <h5 className="text-white font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-3">
              <i className="fa-solid fa-terminal text-emerald-500"></i>
              Command: Build Offline Shard
            </h5>
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 space-y-4">
               <p className="text-[10px] text-slate-500 font-mono mb-2"># Run this to create a portable B-LAN environment</p>
               <code className="block text-indigo-400 text-[11px] font-mono leading-relaxed">
                 npm run build --offline<br/>
                 cp -r ./dist /media/operator/BLAN_SHARD/<br/>
                 tar -czvf blan_node_installer.tar.gz ./scripts/install.sh ./dist
               </code>
               <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                 <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Target: Raspberry Pi / x86_64</span>
                 <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Integrity: Verified</span>
               </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: 'Privacy & Security',
      icon: 'fa-shield-halved',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
               <h5 className="text-red-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-camera"></i>
                  Sentry Mode
               </h5>
               <p className="text-slate-400 text-xs leading-relaxed">
                  Associate your Tesla USB or mesh cameras with the B-LAN Mesh. This provides a community shield where movement alerts are sharded to local storage for collective safety.
               </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
               <h5 className="text-amber-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-eye-slash"></i>
                  Privacy Guarantee
               </h5>
               <p className="text-slate-400 text-xs leading-relaxed">
                  B-LAN uses "Privacy Mode" to disable active feeds. Data never touches the internet. All sharding is performed on local SQL clusters encrypted by the community DAO.
               </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
      {/* Hero */}
      <div className="text-center space-y-4 pt-10">
        <div className="inline-block px-4 py-1.5 bg-indigo-600/10 border border-indigo-500/30 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
          Knowledge Base v2.0
        </div>
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">The B-LAN Citizen's <span className="text-indigo-500">Manual</span></h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
          Welcome to the mesh. This guide explains how to navigate our local-only ecosystem, earn Karma, and protect our collective privacy.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-[2rem] shadow-xl overflow-x-auto custom-scrollbar-hide">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveTab(s.id)}
            className={`flex-1 py-4 px-6 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 whitespace-nowrap ${
              activeTab === s.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <i className={`fa-solid ${s.icon}`}></i>
            <span className="hidden lg:inline">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {sections.find(s => s.id === activeTab)?.content}
      </div>

      {/* FAQ Footer */}
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[3rem] text-center">
         <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Still Have Questions?</div>
         <p className="text-slate-400 text-xs mb-6 italic">Connect with an Admin in the Two-Way Chat or talk to Rye Assistant.</p>
         <div className="flex justify-center gap-4">
            <span className="text-[9px] font-mono text-indigo-400/50 uppercase tracking-tighter">B-LAN Protocol v2.0</span>
            <span className="text-[9px] font-mono text-slate-700 uppercase tracking-tighter">•</span>
            <span className="text-[9px] font-mono text-indigo-400/50 uppercase tracking-tighter">Local-First Logic</span>
         </div>
      </div>
      
      <style>{`
        .custom-scrollbar-hide::-webkit-scrollbar { display: none; }
        .custom-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const GuideCard: React.FC<{ title: string; text: string; icon: string }> = ({ title, text, icon }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/30 transition-all group">
    <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center text-slate-500 mb-4 group-hover:text-indigo-400 transition-colors">
       <i className={`fa-solid ${icon}`}></i>
    </div>
    <h5 className="text-white font-bold mb-2 text-sm">{title}</h5>
    <p className="text-slate-500 text-xs leading-relaxed">{text}</p>
  </div>
);

export default UserGuide;
