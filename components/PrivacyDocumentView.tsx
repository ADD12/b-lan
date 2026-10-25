
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocalData } from '../services/dbService';

const PrivacyDocumentView: React.FC = () => {
  const navigate = useNavigate();
  const privacyText = getLocalData('album_privacy_text', 'Default B-LAN Album Privacy Policy: Data stays local. No cloud egress.');

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Privacy Document</h2>
          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em]">Local Shard ID: DOC-PRIV-001 // B-LAN MESH</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden min-h-[600px]">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <i className="fa-solid fa-file-contract text-9xl"></i>
        </div>
        
        <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-8 relative z-10 whitespace-pre-wrap font-serif">
          {privacyText}
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-1 bg-indigo-600 rounded-full mb-4"></div>
          <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest leading-loose">
            This document is sharded across the B-LAN local mesh and verified by community governance boards. 
            Modifications require A-LAN administrative clearance. 
            Privacy-by-design kernel active.
          </p>
          <div className="flex gap-4 mt-4">
             <span className="text-[8px] font-bold text-slate-700 uppercase">CALIFORNIA PRIVACY COMPLIANT</span>
             <span className="text-[8px] font-bold text-slate-700 uppercase">LOCAL FIRST LOGIC</span>
             <span className="text-[8px] font-bold text-slate-700 uppercase">100% OFFLINE VALIDATED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyDocumentView;
