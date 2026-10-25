
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PhotoEntry, UserProfile } from '../types';
import { getLocalData, setLocalData } from '../services/dbService';

const PhotoAlbum: React.FC<{ user: UserProfile }> = ({ user }) => {
  const storageKey = `user_photos_${user.id}`;
  
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize data with user-specific scoping
  useEffect(() => {
    const defaults: PhotoEntry[] = [
      { id: 'p-1', url: 'https://picsum.photos/seed/garden/800/600', caption: 'Community Garden Shard 0x1', timestamp: Date.now() - 86400000, isPublicInMesh: true },
      { id: 'p-2', url: 'https://picsum.photos/seed/solar/800/600', caption: 'New solar array in Sector B', timestamp: Date.now() - 172800000, isPublicInMesh: false },
      { id: 'p-3', url: 'https://picsum.photos/seed/neighbor/800/600', caption: 'Mrs. Gable sink fix - documentation', timestamp: Date.now() - 3600000, isPublicInMesh: true },
    ];
    // Check if we have legacy global data to migrate, otherwise use user-specific or defaults
    const legacyData = getLocalData<PhotoEntry[]>('user_photos', []);
    const existingData = getLocalData<PhotoEntry[]>(storageKey, legacyData.length > 0 ? legacyData : defaults);
    setPhotos(existingData);
    
    // Cleanup legacy key if migrated
    if (legacyData.length > 0) {
      localStorage.removeItem('blan_user_photos');
      setLocalData(storageKey, existingData);
    }
  }, [user.id, storageKey]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const newP: PhotoEntry = {
        id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        url: base64Url,
        caption: file.name.split('.')[0] || 'Manual Shard Entry',
        timestamp: Date.now(),
        isPublicInMesh: false
      };
      const updated = [newP, ...photos];
      setPhotos(updated);
      setLocalData(storageKey, updated);
      showToast(`Shard "${newP.caption}" uploaded successfully.`);
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const togglePublic = (id: string) => {
    const updated = photos.map(p => p.id === id ? { ...p, isPublicInMesh: !p.isPublicInMesh } : p);
    setPhotos(updated);
    setLocalData(storageKey, updated);
    const p = updated.find(x => x.id === id);
    showToast(p?.isPublicInMesh ? "Shard published to mesh." : "Shard moved to private storage.", 'info');
  };

  const confirmDelete = (id: string) => {
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);
    setLocalData(storageKey, updated);
    setDeletingId(null);
    showToast("Image shard permanently wiped from PIM storage.", 'success');
  };

  const handleSocialShare = (platform: string) => {
    showToast(`Bridge Activation: Preparing egress packet for ${platform}.`, 'info');
    setSharingId(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12 relative">
      {/* Toast Notification System */}
      {toast && (
        <div className="fixed top-20 right-8 z-[100] animate-slideInRight">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-4 backdrop-blur-xl ${
            toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
            toast.type === 'info' ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' :
            'bg-red-500/20 border-red-500/40 text-red-400'
          }`}>
            <i className={`fa-solid ${
              toast.type === 'success' ? 'fa-circle-check' :
              toast.type === 'info' ? 'fa-circle-info' :
              'fa-triangle-exclamation'
            } text-xl`}></i>
            <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Personal Shard Album</h2>
          <div className="flex items-center gap-3">
            <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">
              PIM: {user.name} // NODE: {user.id}
            </p>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] font-black text-slate-600 uppercase">Local Encryption Active</span>
          </div>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload}
          />
          <button 
            onClick={triggerUpload}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            Upload to Shard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {photos.length === 0 ? (
          <div className="col-span-full py-32 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 italic">
            <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center mb-6">
              <i className="fa-solid fa-images text-4xl opacity-20"></i>
            </div>
            <p className="font-bold uppercase tracking-widest text-[10px] mb-2">No Local Shards Found</p>
            <p className="text-[10px]">Your personal information module storage is currently empty.</p>
          </div>
        ) : (
          photos.map(photo => (
            <div key={photo.id} className={`bg-slate-900 border rounded-[2rem] overflow-hidden shadow-2xl group relative h-full flex flex-col transition-all duration-300 ${
              deletingId === photo.id ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-800'
            }`}>
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-950">
                 <img src={photo.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Shard" />
                 
                 {/* Social Share Popover */}
                 {sharingId === photo.id && (
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 animate-fadeIn">
                       <h4 className="text-white font-black text-[9px] uppercase tracking-widest mb-4">Export Shard to WAN</h4>
                       <div className="grid grid-cols-3 gap-3 mb-6">
                          <SocialIcon icon="fa-facebook" color="bg-blue-600" onClick={() => handleSocialShare('Facebook')} />
                          <SocialIcon icon="fa-x-twitter" color="bg-slate-800" onClick={() => handleSocialShare('X')} />
                          <SocialIcon icon="fa-instagram" color="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600" onClick={() => handleSocialShare('Instagram')} />
                          <SocialIcon icon="fa-whatsapp" color="bg-green-500" onClick={() => handleSocialShare('WhatsApp')} />
                          <SocialIcon icon="fa-reddit" color="bg-orange-500" onClick={() => handleSocialShare('Reddit')} />
                          <SocialIcon icon="fa-pinterest" color="bg-red-600" onClick={() => handleSocialShare('Pinterest')} />
                       </div>
                       <button 
                          onClick={() => setSharingId(null)}
                          className="text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                       >
                          Close Bridge
                       </button>
                    </div>
                 )}

                 {/* Confirm Delete Overlay */}
                 {deletingId === photo.id ? (
                    <div className="absolute inset-0 bg-red-600/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fadeIn">
                       <i className="fa-solid fa-triangle-exclamation text-white text-3xl mb-3"></i>
                       <p className="text-white font-black text-[10px] uppercase tracking-widest mb-4 leading-tight">Wipe Shard Permanently?</p>
                       <div className="flex gap-2 w-full">
                          <button 
                            onClick={() => setDeletingId(null)}
                            className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => confirmDelete(photo.id)}
                            className="flex-1 bg-white text-red-600 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl"
                          >
                            Confirm
                          </button>
                       </div>
                    </div>
                 ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-[-10px] group-hover:translate-y-0 transition-all">
                        <button 
                          onClick={() => setSharingId(photo.id)}
                          className="w-10 h-10 rounded-2xl bg-indigo-600/80 border border-indigo-400 text-white flex items-center justify-center backdrop-blur-md transition-all hover:bg-indigo-600 shadow-lg"
                          title="Share to WAN"
                        >
                          <i className="fa-solid fa-share-nodes text-xs"></i>
                        </button>
                        <button 
                          onClick={() => togglePublic(photo.id)}
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center border backdrop-blur-md transition-all ${
                            photo.isPublicInMesh ? 'bg-green-600 border-green-500 text-white shadow-lg' : 'bg-slate-900/60 border-white/10 text-slate-400'
                          }`}
                          title={photo.isPublicInMesh ? "Public in Mesh" : "Private in PIM"}
                        >
                          <i className={`fa-solid ${photo.isPublicInMesh ? 'fa-mesh' : 'fa-lock'}`}></i>
                        </button>
                        <button 
                          onClick={() => setDeletingId(photo.id)}
                          className="w-10 h-10 rounded-2xl bg-red-600/80 border border-red-500 text-white flex items-center justify-center backdrop-blur-md transition-all hover:bg-red-600 shadow-lg"
                          title="Wipe Shard"
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                      </div>
                    </>
                 )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-white text-xs font-bold uppercase tracking-tight truncate leading-tight">{photo.caption}</p>
                  <span className={`shrink-0 w-2 h-2 rounded-full mt-1 ${photo.isPublicInMesh ? 'bg-green-500' : 'bg-slate-700'}`}></span>
                </div>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                  <span className="text-[8px] font-mono text-slate-500">{new Date(photo.timestamp).toLocaleDateString()}</span>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${photo.isPublicInMesh ? 'text-green-500' : 'text-slate-600'}`}>
                    {photo.isPublicInMesh ? 'Mesh Shared' : 'PIM Private'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Verification / Security Banner */}
      <div className="bg-slate-950 border border-indigo-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 text-2xl border border-indigo-500/20 shrink-0">
          <i className="fa-solid fa-user-shield"></i>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Verified Offline Sharding Protocol</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed italic">
            Images in this album are sharded into your local SQL database on PIM node <span className="text-indigo-500 font-mono font-bold">"{user.id}"</span>. 
            Social media egress requires a manual SDR Bridge activation as B-LAN never maintains a direct WAN link for raw imagery.
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/audit-logs" className="px-6 py-2.5 rounded-xl border border-slate-800 text-slate-500 text-[9px] font-black uppercase tracking-widest hover:text-white hover:bg-slate-900 transition-all flex items-center justify-center">Audit Logs</Link>
          <Link to="/privacy-document" className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all flex items-center justify-center">Read Rights</Link>
        </div>
      </div>
      
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInRight {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

const SocialIcon: React.FC<{ icon: string; color: string; onClick: () => void }> = ({ icon, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg transition-all hover:scale-110 active:scale-90 shadow-xl ${color}`}
  >
    <i className={`fa-brands ${icon}`}></i>
  </button>
);

export default PhotoAlbum;
