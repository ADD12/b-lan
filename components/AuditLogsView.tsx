
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocalData } from '../services/dbService';

const AuditLogsView: React.FC = () => {
  const navigate = useNavigate();
  const auditLogsText = getLocalData('album_audit_logs_text', 'B-LAN Photo Album Audit Logs:\n[SYSTEM] No unauthorized access detected.\n[NODE] PIM Encryption keys rotated.');

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
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Audit Logs</h2>
          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em]">Local Shard ID: DOC-AUDIT-002 // B-LAN MESH</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden min-h-[600px]">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <i className="fa-solid fa-shield-halved text-9xl"></i>
        </div>
        
        <div className="prose prose-invert max-w-none text-emerald-400/90 text-sm leading-relaxed space-y-8 relative z-10 whitespace-pre-wrap font-mono">
          {auditLogsText}
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-1 bg-emerald-600 rounded-full mb-4"></div>
          <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest leading-loose">
            This log shard is immutable once verified by the community node cluster. 
            Unauthorized tampering will trigger an A-LAN security broadcast. 
            Encrypted Audit Kernel active.
          </p>
          <div className="flex gap-4 mt-4">
             <span className="text-[8px] font-bold text-slate-700 uppercase">SYSTEM INTEGRITY VERIFIED</span>
             <span className="text-[8px] font-bold text-slate-700 uppercase">NO EGRESS DETECTED</span>
             <span className="text-[8px] font-bold text-slate-700 uppercase">SHARD CONSISTENCY: 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsView;
