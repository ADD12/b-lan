
import React, { useState } from 'react';

const LegalPages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TOS' | 'PRIVACY'>('TOS');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-20">
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-[2rem] shadow-xl">
        <button 
          onClick={() => setActiveTab('TOS')}
          className={`flex-1 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'TOS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500'
          }`}
        >
          Terms of Service
        </button>
        <button 
          onClick={() => setActiveTab('PRIVACY')}
          className={`flex-1 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'PRIVACY' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500'
          }`}
        >
          Privacy Policy
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <i className="fa-solid fa-gavel text-9xl"></i>
        </div>
        
        {activeTab === 'TOS' ? (
          <div className="space-y-8 relative z-10">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-6">Local Mesh TOS v2.1</h2>
            <div className="prose prose-invert max-w-none text-slate-400 text-sm leading-relaxed space-y-6 italic">
              <section className="space-y-3">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs">1. Acceptance of Local Governance</h3>
                <p>By initializing a B-LAN PIM (Personal Information Module), you agree to abide by the consensus of your CIM (Community Information Module). This is a localized contract governed by neighborhood logic.</p>
              </section>
              <section className="space-y-3">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs">2. No Cloud Guarantee</h3>
                <p>B-LAN operates 100% offline. You acknowledge that data loss resulting from local hardware failure is your responsibility. Mesh sharding provides redundancy, but not permanent archival.</p>
              </section>
              <section className="space-y-3">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs">3. Karma as Social Capital</h3>
                <p>Karma points are a non-monetary unit of community trust. Any attempt to exploit Karma via SDR spoofing or identity collision results in immediate exclusion from the Mesh.</p>
              </section>
            </div>
          </div>
        ) : (
          <div className="space-y-8 relative z-10">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-6">California Privacy Shard</h2>
            <div className="prose prose-invert max-w-none text-slate-400 text-sm leading-relaxed space-y-6 italic">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl">
                 <p className="text-indigo-400 font-bold mb-2 uppercase text-[10px] tracking-widest">CCPA Compliance Notice</p>
                 <p className="text-xs">B-LAN is designed with California Privacy standards as the kernel default. No personal information is ever egressed to external servers without explicit SDR manual bridge activation.</p>
              </div>
              <section className="space-y-3">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs">Right to Know</h3>
                <p>You have the right to view every SQL table associated with your PIM. Use the "A-LAN Admin Console" to perform a full database dump of your local shard.</p>
              </section>
              <section className="space-y-3">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs">Right to Delete</h3>
                <p>By performing a "Factory Reset" on your B-LAN Node, all community-sharded indices of your profile are marked for garbage collection in the next mesh sync.</p>
              </section>
              <section className="space-y-3">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs">Biometric & Neural Data</h3>
                <p>Neural sensor streams from ML-Sensors are processed on-device. Vector embeddings are sharded, but raw sensor data is purged every 24 hours to comply with privacy-by-design principles.</p>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalPages;
