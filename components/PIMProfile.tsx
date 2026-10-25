
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Community, CalendarEvent, DeviceRoute } from '../types';
import { getCommunities } from '../services/communityService';
import { queueSyncTask } from '../services/dbService';
import { X, Upload, Image as ImageIcon, Check } from 'lucide-react';

const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
];

interface PIMProfileProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const PIMProfile: React.FC<PIMProfileProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState(user);
  const [newSkill, setNewSkill] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeTab, setActiveTab] = useState<'INFO' | 'CALENDAR' | 'ROUTING' | 'MODULES'>('INFO');
  const [selectedShardId, setSelectedShardId] = useState('');
  const [availableShards, setAvailableShards] = useState<any[]>([]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCommunities(getCommunities());
    // Import dynamically to avoid circular dependency or just use the constant if it's safe
    import('../constants/shards').then(m => {
      setAvailableShards(m.AVAILABLE_SHARDS);
    });
  }, []);

  const handleSave = () => {
    onUpdate(formData);
    queueSyncTask('PIM_UPDATE', formData);
    alert("PIM Database Updated Locally. Queued for Mesh Sync.");
  };

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const updateSocial = (platform: string, value: string) => {
    setFormData({
      ...formData,
      socialProfiles: {
        ...formData.socialProfiles,
        [platform]: value
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
        setShowAvatarPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentCommunity = communities.find(c => c.id === formData.communityId);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Personal Information Module</h2>
          <p className="text-slate-400 text-lg font-medium">Identity, Calendar & Dynamic Mesh Routing Settings.</p>
        </div>
        <div className="flex bg-slate-900 border-2 border-slate-800 p-1.5 rounded-[2rem]">
          {['INFO', 'CALENDAR', 'ROUTING', 'MODULES'].map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`px-8 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-500 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border-2 border-slate-800 p-12 rounded-[3.5rem] space-y-10 shadow-2xl relative overflow-hidden min-h-[700px]">
        {activeTab === 'INFO' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="flex gap-10 items-center border-b border-white/5 pb-10">
              <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
                <img src={formData.avatar} alt="User" className="w-36 h-36 rounded-[2.5rem] object-cover border-4 border-slate-800 shadow-2xl transition-all group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-lg">
                  <Upload className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">{formData.name}</h3>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-indigo-400 text-xs font-black uppercase tracking-widest bg-indigo-500/10 px-4 py-1.5 rounded-xl border border-indigo-500/30">
                    {currentCommunity?.name || 'Local Shard'}
                  </span>
                  <p className="text-slate-500 text-sm font-mono font-bold uppercase">{formData.id}</p>
                </div>
              </div>
            </div>

            {/* Avatar Picker Modal */}
            {showAvatarPicker && (
              <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
                <div className="bg-slate-900 border-2 border-slate-800 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">Identity Visualizer</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Select a mesh avatar or upload a custom shard.</p>
                    </div>
                    <button 
                      onClick={() => setShowAvatarPicker(false)}
                      className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-10 space-y-10">
                    <div className="grid grid-cols-4 gap-6">
                      {DEFAULT_AVATARS.map((url, i) => (
                        <button 
                          key={i}
                          onClick={() => {
                            setFormData({ ...formData, avatar: url });
                            setShowAvatarPicker(false);
                          }}
                          className={`relative aspect-square rounded-3xl overflow-hidden border-4 transition-all hover:scale-105 active:scale-95 ${
                            formData.avatar === url ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                          {formData.avatar === url && (
                            <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                              <Check className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="h-[2px] flex-1 bg-white/5"></div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">OR</span>
                      <div className="h-[2px] flex-1 bg-white/5"></div>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-slate-950 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 p-10 rounded-[2.5rem] transition-all group flex flex-col items-center gap-4"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-black text-white uppercase tracking-widest">Upload Custom Shard</div>
                          <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">PNG, JPG, WEBP (MAX 2MB)</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Legal PIM Identity</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 text-slate-200 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Physical Mesh Shard (Address)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 text-slate-200 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Biography // Neural Context</label>
              <textarea 
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 text-slate-200 h-32 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 outline-none resize-none shadow-inner italic"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
              />
            </div>

            {/* Social Media Section */}
            <div className="space-y-6 pt-6 border-t border-white/5">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">WAN Social Shard Links</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SocialInput icon="fa-facebook" platform="facebook" value={formData.socialProfiles?.facebook || ''} onChange={(val) => updateSocial('facebook', val)} />
                <SocialInput icon="fa-x-twitter" platform="twitter" value={formData.socialProfiles?.twitter || ''} onChange={(val) => updateSocial('twitter', val)} />
                <SocialInput icon="fa-instagram" platform="instagram" value={formData.socialProfiles?.instagram || ''} onChange={(val) => updateSocial('instagram', val)} />
                <SocialInput icon="fa-whatsapp" platform="whatsapp" value={formData.socialProfiles?.whatsapp || ''} onChange={(val) => updateSocial('whatsapp', val)} />
                <SocialInput icon="fa-reddit" platform="reddit" value={formData.socialProfiles?.reddit || ''} onChange={(val) => updateSocial('reddit', val)} />
                <SocialInput icon="fa-pinterest" platform="pinterest" value={formData.socialProfiles?.pinterest || ''} onChange={(val) => updateSocial('pinterest', val)} />
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-white/5">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Skill Inventory (DAO Keys)</label>
              <div className="flex flex-wrap gap-3">
                {formData.skills.map((skill, i) => (
                  <span key={i} className="flex items-center gap-3 bg-indigo-600/10 text-indigo-400 border border-indigo-600/30 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                    {skill}
                    <button 
                      onClick={() => setFormData({...formData, skills: formData.skills.filter((_, idx) => idx !== i)})}
                      className="hover:text-red-400 text-sm"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Add community skill..." 
                  className="flex-1 bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-base text-slate-200 shadow-inner outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                />
                <button 
                  onClick={addSkill}
                  className="bg-slate-800 hover:bg-slate-700 px-8 rounded-2xl text-white text-sm font-black uppercase tracking-widest border border-white/10 transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'CALENDAR' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-black text-white uppercase tracking-tight">Schedule-Based Messaging</h3>
               <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">Add Event</button>
            </div>
            <div className="space-y-6">
               {formData.calendar?.map(event => (
                 <div key={event.id} className="bg-slate-950 border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-indigo-500/40 transition-all shadow-inner">
                    <div className="flex items-center gap-8">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-amber-600/10 border border-amber-600/30 text-amber-500 flex items-center justify-center text-3xl">
                          <i className="fa-solid fa-calendar-check"></i>
                       </div>
                       <div>
                          <div className="text-xl font-black text-white uppercase tracking-tight">{event.title}</div>
                          <div className="text-sm text-slate-500 font-mono mt-2 font-bold">
                             {new Date(event.start).toLocaleTimeString()} - {new Date(event.end).toLocaleTimeString()}
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <span className="text-xs font-black text-amber-400 uppercase tracking-[0.2em] bg-amber-500/10 px-4 py-1.5 rounded-lg border-2 border-amber-500/20">
                          {event.isBusy ? 'BUSY' : 'AVAILABLE'}
                       </span>
                       <button className="text-slate-600 hover:text-red-500 transition-colors text-2xl">
                          <i className="fa-solid fa-trash-can"></i>
                       </button>
                    </div>
                 </div>
               ))}
            </div>
            <div className="bg-slate-950/40 p-8 rounded-3xl border border-white/5 italic text-slate-400 text-base font-medium leading-relaxed">
               Calls received during "Busy" calendar events will be automatically prompted to leave a Video/Voice Shard on your node.
            </div>
          </div>
        )}

        {activeTab === 'ROUTING' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-black text-white uppercase tracking-tight">Dynamic Mesh Routing</h3>
               <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">New Route</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {formData.deviceRoutes?.map(route => (
                 <div key={route.id} className="bg-slate-950 border border-white/5 p-8 rounded-[2.5rem] relative group hover:border-indigo-500/40 transition-all shadow-inner">
                    <div className="text-xs font-mono font-black text-slate-600 mb-3 uppercase tracking-widest">Active: {route.startTime} - {route.endTime}</div>
                    <div className="text-2xl font-black text-white uppercase tracking-tight mb-6">{route.name}</div>
                    <div className="flex items-center gap-3">
                       <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                       <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Route Integrity: 100%</span>
                    </div>
                    <button className="absolute top-8 right-8 text-slate-700 hover:text-indigo-400 transition-colors text-xl">
                       <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                 </div>
               ))}
            </div>
            <div className="p-10 bg-indigo-600/5 border border-indigo-500/10 rounded-[3rem] flex items-center gap-10">
               <div className="w-20 h-20 rounded-[2rem] bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-4xl">
                  <i className="fa-solid fa-tower-broadcast"></i>
               </div>
               <div>
                  <h4 className="text-xl font-black text-white uppercase mb-2">Schedule-Aware Hardware Switching</h4>
                  <p className="text-slate-400 text-base italic leading-relaxed font-medium">
                     Your B-LAN PIM signal will dynamically route to the specified device based on the time of day. This prevents "Handheld fatigue" while ensuring critical mesh alerts reach you.
                  </p>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'MODULES' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="flex justify-between items-center">
               <h3 className="text-2xl font-black text-white uppercase tracking-tight">Mesh Module Management</h3>
               <div className="flex gap-4">
                  <select 
                    value={selectedShardId}
                    onChange={(e) => setSelectedShardId(e.target.value)}
                    className="bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select PID Module...</option>
                    {availableShards
                      .filter(s => !formData.installedShards?.includes(s.id))
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))
                    }
                  </select>
                  <button 
                    onClick={() => {
                      if (selectedShardId) {
                        const updated = {
                          ...formData,
                          installedShards: [...(formData.installedShards || []), selectedShardId]
                        };
                        setFormData(updated);
                        setSelectedShardId('');
                      }
                    }}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                  >
                    Install Module
                  </button>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {(formData.installedShards || []).map(shardId => {
                 const shard = availableShards.find(s => s.id === shardId);
                 if (!shard) return null;
                 return (
                   <div key={shardId} className="bg-slate-950 border border-white/5 p-8 rounded-[2.5rem] relative group hover:border-indigo-500/40 transition-all shadow-inner">
                      <div className="flex items-center gap-6 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-600/30 text-indigo-400 flex items-center justify-center">
                          {shard.icon}
                        </div>
                        <div>
                          <div className="text-xl font-black text-white uppercase tracking-tight">{shard.name}</div>
                          <div className="text-xs font-mono font-black text-slate-600 uppercase tracking-widest">{shard.category}</div>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm italic leading-relaxed mb-6">{shard.description}</p>
                      <button 
                        onClick={() => {
                          setFormData({
                            ...formData,
                            installedShards: formData.installedShards.filter(id => id !== shardId)
                          });
                        }}
                        className="text-red-500 hover:text-red-400 text-xs font-black uppercase tracking-widest flex items-center gap-2"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                        Uninstall Module
                      </button>
                   </div>
                 );
               })}
               {(formData.installedShards || []).length === 0 && (
                 <div className="col-span-full p-20 text-center bg-slate-950/40 rounded-[3rem] border-2 border-dashed border-slate-800">
                    <p className="text-slate-500 italic text-lg">No additional PID modules installed. Use the dropdown above to add features.</p>
                 </div>
               )}
            </div>
          </div>
        )}

        <div className="absolute bottom-12 right-12 flex gap-6">
          <button className="px-10 py-4 rounded-2xl border-2 border-slate-800 text-slate-500 font-black text-sm uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all">Discard</button>
          <button 
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-500 px-12 py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all"
          >
            Commit to Shard
          </button>
        </div>
      </div>
    </div>
  );
};

const SocialInput: React.FC<{ icon: string; platform: string; value: string; onChange: (val: string) => void }> = ({ icon, platform, value, onChange }) => (
  <div className="relative">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-xl">
      <i className={`fa-brands ${icon}`}></i>
    </div>
    <input 
      type="text" 
      placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} Shard URL`}
      className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner placeholder:text-slate-800"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default PIMProfile;
