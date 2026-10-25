
import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { getLocalData, setLocalData } from '../services/dbService';

const INITIAL_MEDIA: MediaItem[] = [
  {
    id: 'm-1',
    type: 'PODCAST',
    title: 'Voices of B-LAN: Episode 42',
    author: 'Neighborhood Comm',
    content: 'Discussing the new solar garden expansion and upcoming water purification shards.',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    timestamp: Date.now() - 172800000,
    isSynced: true,
    category: 'Community Update',
    thumbnail: 'https://picsum.photos/seed/pod1/300/300'
  },
  {
    id: 'm-2',
    type: 'NEWS',
    title: 'Solar Harvest Reaches All-Time High',
    author: 'Grid Monitor',
    content: 'Local B-LAN nodes report a 15% increase in efficiency following the latest FOS kernel update. Battery reserves are currently at 94% across the mesh.',
    timestamp: Date.now() - 86400000,
    isSynced: true,
    category: 'Technical',
    thumbnail: 'https://picsum.photos/seed/news1/300/300'
  },
  {
    id: 'm-3',
    type: 'PODCAST',
    title: 'Governance Shard #04',
    author: 'Mesh Elders',
    content: 'A deep dive into the local Karma ledger sharding strategy and how it protects against mainnet fluctuations.',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    timestamp: Date.now() - 432000000,
    isSynced: false,
    category: 'Governance',
    thumbnail: 'https://picsum.photos/seed/pod2/300/300'
  },
  {
    id: 'm-4',
    type: 'NEWS',
    title: 'Community Garden: Planting Season',
    author: 'Garden Quad',
    content: 'The Spring planting roster is now open. We need 4 volunteers for heirloom seed sorting in Sector A.',
    timestamp: Date.now() - 3600000,
    isSynced: true,
    category: 'Community',
    thumbnail: 'https://picsum.photos/seed/news2/300/300'
  }
];

const MediaHub: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>(getLocalData('media_items', INITIAL_MEDIA));
  const [filter, setFilter] = useState<'ALL' | 'PODCAST' | 'NEWS'>('ALL');
  const [activePodcast, setActivePodcast] = useState<MediaItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = (id: string) => {
    setIsSyncing(true);
    setTimeout(() => {
      const updated = items.map(item => item.id === id ? { ...item, isSynced: true } : item);
      setItems(updated);
      setLocalData('media_items', updated);
      setIsSyncing(false);
    }, 2000);
  };

  const filteredItems = items.filter(i => filter === 'ALL' || i.type === filter);

  return (
    <div className="flex flex-col h-full space-y-8 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">B-LAN Media Server</h2>
          <p className="text-slate-400 text-sm mt-1">Community broads & news • Offline Mesh Storage</p>
        </div>
        
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl w-full md:w-auto">
          {['ALL', 'PODCAST', 'NEWS'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t as any)}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-black transition-all ${
                filter === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group flex flex-col shadow-xl hover:border-indigo-500/30 transition-all">
            <div className="aspect-video relative overflow-hidden bg-slate-950">
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute top-4 left-4">
                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                  item.type === 'PODCAST' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {item.type}
                </span>
              </div>
              {!item.isSynced && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                  <button 
                    onClick={() => handleSync(item.id)}
                    disabled={isSyncing}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                  >
                    <i className={`fa-solid ${isSyncing ? 'fa-sync animate-spin' : 'fa-cloud-arrow-down'}`}></i>
                    {isSyncing ? 'Syncing...' : 'Sync to B-LAN Server'}
                  </button>
                </div>
              )}
              {item.type === 'PODCAST' && item.isSynced && (
                <button 
                  onClick={() => setActivePodcast(item)}
                  className="absolute bottom-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white text-xl transition-all"
                >
                  <i className="fa-solid fa-play ml-1"></i>
                </button>
              )}
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-slate-500 font-mono uppercase">{item.category}</span>
                <span className="text-[10px] text-slate-600 font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-3 line-clamp-1">{item.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-6 flex-1">
                {item.content}
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-indigo-400 border border-indigo-500/20">
                  <i className="fa-solid fa-user-ninja"></i>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">By {item.author}</span>
                <div className="ml-auto flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                   <span className="text-[9px] font-mono text-green-500/60">LOCAL_CACHE</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Audio Player */}
      {activePodcast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-2xl bg-slate-900 border border-indigo-500/30 shadow-2xl rounded-3xl p-4 md:p-6 backdrop-blur-2xl z-50 animate-slideUp">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 hidden sm:block">
              <img src={activePodcast.thumbnail} className="w-full h-full object-cover" alt="pod" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Now Playing</div>
              <div className="text-white font-bold truncate">{activePodcast.title}</div>
              <div className="text-[10px] text-slate-500 mt-1">{activePodcast.author}</div>
            </div>
            <div className="flex items-center gap-4">
              <audio 
                controls 
                autoPlay 
                src={activePodcast.audioUrl} 
                className="h-8 md:h-10 opacity-70 hover:opacity-100 transition-opacity"
              />
              <button 
                onClick={() => setActivePodcast(null)}
                className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-mono text-indigo-400 uppercase">
              Streaming via Local Media Shard // Offline Validated
            </div>
          </div>
        </div>
      )}

      {/* Admin Broadcast Info */}
      <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl shrink-0">
          <i className="fa-solid fa-tower-broadcast"></i>
        </div>
        <div className="text-center md:text-left">
          <h4 className="text-sm font-bold text-white mb-1">Mesh Shard Media Hosting</h4>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            This B-LAN Media Server acts as a local proxy for all neighborhood content. To conserve community battery power, data is downloaded once to the master mesh shard and redistributed to user PIMs via low-energy SDR links.
          </p>
        </div>
        <div className="md:ml-auto">
           <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-all">
              Server Settings
           </button>
        </div>
      </div>
    </div>
  );
};

export default MediaHub;
