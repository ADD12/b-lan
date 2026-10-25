
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ShieldCheck, 
  Car, 
  Eye, 
  EyeOff, 
  Video, 
  Play, 
  Pause, 
  Camera, 
  Square, 
  Circle, 
  Settings, 
  X as XIcon, 
  Terminal, 
  Film,
  AlertCircle,
  ExternalLink,
  Trash2,
  LayoutDashboard
} from 'lucide-react';
import { SecurityAlert, SecurityClip } from '../../types';
import { getLocalData, setLocalData } from '../../services/dbService';
import { toggleTeslaSentry, getTeslaStatus } from '../../services/teslaService';

interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
  id: string;
}

interface CameraState {
  isPaused: boolean;
  volume: number;
  isMuted: boolean;
  motionDetected: boolean;
  isRecording: boolean;
  isFlashing: boolean;
  recordingStartTime?: number;
  motionDetectionEnabled: boolean;
  sensitivity: number;
  sizeThreshold: number;
  showSettings: boolean;
  customZones: Zone[];
}

interface CameraPersistentSettings {
  sensitivity: number;
  sizeThreshold: number;
  motionDetectionEnabled: boolean;
  customZones: Zone[];
}

interface DrawingState {
  camId: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface SecurityViewProps {
  onBroadcast: (message: string) => void;
}

const SecurityView: React.FC<SecurityViewProps> = ({ onBroadcast }) => {
  const [activeTab, setActiveTab] = useState<'FEEDS' | 'DASHBOARD'>('FEEDS');
  const [now, setNow] = useState(Date.now());
  const [selectedClip, setSelectedClip] = useState<SecurityClip | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playbackVolume, setPlaybackVolume] = useState(0.5);
  const [teslaStatus, setTeslaStatus] = useState(getTeslaStatus());
  const [isPrivacyMode, setIsPrivacyMode] = useState(getLocalData('privacy_mode', false));
  const [pendingAction, setPendingAction] = useState<{ id: number; type: 'RECORD' | 'SNAPSHOT' } | null>(null);
  const [drawing, setDrawing] = useState<DrawingState | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const cameras = [
    { id: 1, name: 'Tesla Front (Sentry)', url: 'https://picsum.photos/seed/tesla-front/400/300', theme: 'tesla', isTesla: true },
    { id: 2, name: 'Main Walkway', url: 'https://picsum.photos/seed/walking-person/400/300', theme: 'walking' },
    { id: 3, name: 'North Perimeter', url: 'https://picsum.photos/seed/stray-dog/400/300', theme: 'dog' },
    { id: 4, name: 'Tesla Repeater R', url: 'https://picsum.photos/seed/tesla-right/400/300', theme: 'tesla', isTesla: true },
    { id: 5, name: 'Tesla Repeater L', url: 'https://picsum.photos/seed/tesla-left/400/300', theme: 'tesla', isTesla: true },
    { id: 7, name: 'Tesla Rear', url: 'https://picsum.photos/seed/tesla-rear/400/300', theme: 'tesla', isTesla: true },
    { id: 6, name: 'Community Entrance', url: 'https://picsum.photos/seed/gate-entry/400/300', theme: 'security' },
    { id: 8, name: 'Tesla Rear Camera', url: 'https://picsum.photos/seed/tesla-rear/400/300', theme: 'tesla', isTesla: true },
  ];

  const initialSettings = getLocalData<Record<number, CameraPersistentSettings>>('camera_settings', {
    1: { sensitivity: 70, sizeThreshold: 15, motionDetectionEnabled: true, customZones: [] },
    2: { sensitivity: 50, sizeThreshold: 20, motionDetectionEnabled: true, customZones: [] },
    3: { sensitivity: 50, sizeThreshold: 20, motionDetectionEnabled: true, customZones: [] },
    4: { sensitivity: 70, sizeThreshold: 15, motionDetectionEnabled: true, customZones: [] },
    5: { sensitivity: 70, sizeThreshold: 15, motionDetectionEnabled: true, customZones: [] },
    6: { sensitivity: 50, sizeThreshold: 20, motionDetectionEnabled: true, customZones: [] },
    7: { sensitivity: 70, sizeThreshold: 15, motionDetectionEnabled: true, customZones: [] },
    8: { sensitivity: 70, sizeThreshold: 15, motionDetectionEnabled: true, customZones: [] },
  });

  const [cameraStates, setCameraStates] = useState<Record<number, CameraState>>(() => {
    const states: Record<number, CameraState> = {};
    cameras.forEach(c => {
      const saved = initialSettings[c.id] || { sensitivity: 50, sizeThreshold: 20, motionDetectionEnabled: true, customZones: [] };
      states[c.id] = {
        isPaused: false,
        volume: 50,
        isMuted: false,
        motionDetected: false,
        isRecording: false,
        isFlashing: false,
        showSettings: false,
        ...saved
      };
    });
    return states;
  });

  const [alerts, setAlerts] = useState<SecurityAlert[]>(getLocalData('security_logs', []));
  const [savedClips, setSavedClips] = useState<SecurityClip[]>(getLocalData('security_clips', []));
  const activeTimers = useRef<Record<string, any>>({});

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.play();
      else videoRef.current.pause();
    }
  }, [isPlaying]);

  const persistSettings = (states: Record<number, CameraState>) => {
    const settings: Record<number, CameraPersistentSettings> = {};
    Object.keys(states).forEach(id => {
      const nid = Number(id);
      settings[nid] = {
        sensitivity: states[nid].sensitivity,
        sizeThreshold: states[nid].sizeThreshold,
        motionDetectionEnabled: states[nid].motionDetectionEnabled,
        customZones: states[nid].customZones
      };
    });
    setLocalData('camera_settings', settings);
  };

  const triggerFlash = (id: number) => {
    setCameraStates(prev => ({
      ...prev,
      [id]: { ...prev[id], isFlashing: true }
    }));
    setTimeout(() => {
      setCameraStates(prev => ({
        ...prev,
        [id]: { ...prev[id], isFlashing: false }
      }));
    }, 150);
  };

  const saveClip = useCallback((camId: number, trigger: 'MANUAL' | 'MOTION', isSnapshot: boolean = false) => {
    const cam = cameras.find(c => c.id === camId);
    if (!cam) return;

    if (isSnapshot) triggerFlash(camId);

    const currentState = cameraStates[camId];
    const durationSec = isSnapshot ? 0 : (currentState.recordingStartTime ? Math.floor((Date.now() - currentState.recordingStartTime) / 1000) : 10);

    const newClip: SecurityClip = {
      id: `${isSnapshot ? 'snap' : 'clip'}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      cameraName: cam.name,
      timestamp: Date.now(),
      thumbnail: `https://picsum.photos/seed/${cam.theme}-${Date.now()}/400/300`,
      videoUrl: isSnapshot ? undefined : 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      duration: durationSec,
      triggerType: trigger,
      isTeslaSentry: cam.isTesla
    };

    setSavedClips(prev => {
      const updated = [newClip, ...prev].slice(0, 30);
      setLocalData('security_clips', updated);
      return updated;
    });

    if (trigger === 'MOTION' && !isSnapshot) {
      setAlerts(prev => {
        const newAlert: SecurityAlert = {
          id: `a-${Date.now()}`,
          camera: cam.name,
          timestamp: Date.now(),
          message: `Dynamic motion sharded to local storage from ${cam.name}`,
          severity: 'WARNING'
        };
        const updated = [newAlert, ...prev].slice(0, 50);
        setLocalData('security_logs', updated);
        return updated;
      });
    }
  }, [cameras, cameraStates]);

  const toggleRecording = (camId: number) => {
    if (isPrivacyMode) return;
    setCameraStates(prev => {
      const state = prev[camId];
      if (state.isRecording) {
        saveClip(camId, 'MANUAL', false);
        return {
          ...prev,
          [camId]: { ...state, isRecording: false, recordingStartTime: undefined }
        };
      } else {
        return {
          ...prev,
          [camId]: { ...state, isRecording: true, recordingStartTime: Date.now() }
        };
      }
    });
  };

  const handleTeslaSentryToggle = () => {
    const next = toggleTeslaSentry(!teslaStatus.sentryActive);
    setTeslaStatus(next);
    onBroadcast(`Global Tesla Sentry ${next.sentryActive ? 'Armed' : 'Disarmed'}.`);
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === 'SNAPSHOT') {
      saveClip(pendingAction.id, 'MANUAL', true);
    } else if (pendingAction.type === 'RECORD') {
      toggleRecording(pendingAction.id);
    }
    setPendingAction(null);
  };

  // Zone Drawing Handlers
  const handleZoneMouseDown = (e: React.MouseEvent, camId: number) => {
    if (isPrivacyMode || cameraStates[camId].isPaused || !cameraStates[camId].showSettings) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDrawing({ camId, startX: x, startY: y, currentX: x, currentY: y });
  };

  const handleZoneMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDrawing({ ...drawing, currentX: x, currentY: y });
  };

  const handleZoneMouseUp = () => {
    if (!drawing) return;
    const { camId, startX, startY, currentX, currentY } = drawing;
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const w = Math.abs(currentX - startX);
    const h = Math.abs(currentY - startY);

    if (w > 2 && h > 2) {
      setCameraStates(prev => {
        const newZones = [...prev[camId].customZones, { x, y, w, h, id: `zone-${Date.now()}` }];
        const ns = { ...prev, [camId]: { ...prev[camId], customZones: newZones }};
        persistSettings(ns);
        return ns;
      });
    }
    setDrawing(null);
  };

  const deleteZone = (camId: number, zoneId: string) => {
    setCameraStates(prev => {
      const updated = prev[camId].customZones.filter(z => z.id !== zoneId);
      const ns = { ...prev, [camId]: { ...prev[camId], customZones: updated }};
      persistSettings(ns);
      return ns;
    });
  };

  const clearZones = (camId: number) => {
    setCameraStates(prev => {
      const ns = { ...prev, [camId]: { ...prev[camId], customZones: [] }};
      persistSettings(ns);
      return ns;
    });
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-fadeIn pb-12">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center gap-8 w-full md:w-auto">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-indigo-500" />
              Mesh Security Command
            </h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-slate-400 font-mono">B-LAN Local Sharding // Offline Loop</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isPrivacyMode ? 'bg-amber-500' : 'bg-green-500 animate-pulse'}`}></span>
                <span className="text-[10px] font-black uppercase text-slate-500">{isPrivacyMode ? 'Privacy Active' : 'Mesh Live'}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setActiveTab('FEEDS')}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'FEEDS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Video className="w-3.5 h-3.5" />
              Live Feeds
            </button>
            <button 
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'DASHBOARD' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Security Dashboard
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <a 
            href="https://aistudio.google.com/apps/84228fc4-795e-4541-8020-5890bcbb95b5?showPreview=true&showAssistant=true" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 transition-all mr-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            B-LAN BUILD
          </a>
          <button 
            onClick={handleTeslaSentryToggle}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
              teslaStatus.sentryActive 
                ? 'bg-red-600/10 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                : 'bg-slate-800 border-white/5 text-slate-500 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4" />
            Sentry Mode: {teslaStatus.sentryActive ? 'Armed' : 'Standby'}
          </button>
          
          <button 
            onClick={() => setIsPrivacyMode(!isPrivacyMode)}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
              isPrivacyMode 
                ? 'bg-amber-600/20 border-amber-500/40 text-amber-400' 
                : 'bg-slate-800 border-white/5 text-slate-500 hover:text-white'
            }`}
          >
            {isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isPrivacyMode ? 'Privacy: On' : 'Privacy: Off'}
          </button>
        </div>
      </div>

      {activeTab === 'DASHBOARD' ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem] p-12 text-center animate-fadeIn min-h-[500px]">
          <div className="w-24 h-24 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center text-indigo-500 mb-8 border border-indigo-500/20 shadow-2xl shadow-indigo-600/10">
            <LayoutDashboard className="w-12 h-12" />
          </div>
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">B-LAN Security Cam Dashboard</h3>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-10">
            Access advanced analytics, historical pattern recognition, and long-term storage shards via the dedicated Security Cam Build.
          </p>
          <a 
            href="https://aistudio.google.com/apps/84228fc4-795e-4541-8020-5890bcbb95b5?showPreview=true&showAssistant=true" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-600/40 transition-all flex items-center gap-4 active:scale-95"
          >
            Launch B-LAN BUILD
            <ExternalLink className="w-4 h-4" />
          </a>
          <div className="mt-12 flex gap-8">
            <div className="text-center">
              <div className="text-2xl font-black text-white">24/7</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">AI</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Detection</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">CLOUD</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Redundancy</div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {cameras.map(cam => {
          const state = cameraStates[cam.id];
          const isTeslaCam = cam.isTesla;
          const isRecording = !isPrivacyMode && state.isRecording;
          const isSentryArmed = isTeslaCam && teslaStatus.sentryActive;
          
          return (
            <div 
              key={cam.id} 
              className={`bg-slate-900 border-2 rounded-3xl overflow-hidden relative group transition-all duration-500 shadow-2xl h-fit ${
                !isPrivacyMode && state.motionDetected ? 'border-red-500 ring-4 ring-red-500/20' : 
                isRecording ? 'border-red-600 animate-[pulse_2s_infinite]' : 
                isSentryArmed ? 'border-red-900/50' : 'border-slate-800'
              }`}
            >
              <div 
                className={`aspect-video bg-black relative overflow-hidden ${state.showSettings ? 'cursor-crosshair' : ''}`}
                onMouseDown={(e) => handleZoneMouseDown(e, cam.id)}
                onMouseMove={(e) => handleZoneMouseMove(e)}
                onMouseUp={() => handleZoneMouseUp()}
              >
                <img 
                  src={cam.url} 
                  alt={cam.name} 
                  className={`w-full h-full object-cover transition-all duration-1000 select-none ${
                    isPrivacyMode ? 'opacity-20 blur-2xl grayscale' : 
                    state.isPaused ? 'opacity-30' : 'opacity-80 group-hover:opacity-60'
                  }`} 
                  draggable={false}
                />

                {/* Zones Visualization */}
                {!isPrivacyMode && state.customZones.map(zone => (
                  <div 
                    key={zone.id}
                    className="absolute border-2 border-indigo-400/50 bg-indigo-400/10 pointer-events-none"
                    style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%` }}
                  >
                    <div className="absolute top-0 left-0 bg-indigo-500 text-[6px] font-black text-white px-1 uppercase leading-none">SEC_ZONE</div>
                  </div>
                ))}

                {/* Active Drawing Visual */}
                {drawing && drawing.camId === cam.id && (
                  <div 
                    className="absolute border-2 border-white bg-white/20 pointer-events-none z-50"
                    style={{ 
                      left: `${Math.min(drawing.startX, drawing.currentX)}%`, 
                      top: `${Math.min(drawing.startY, drawing.currentY)}%`, 
                      width: `${Math.abs(drawing.currentX - drawing.startX)}%`, 
                      height: `${Math.abs(drawing.currentY - drawing.startY)}%` 
                    }}
                  />
                )}

                {state.isFlashing && (
                  <div className="absolute inset-0 bg-white z-50"></div>
                )}

                <div className="absolute top-3 left-3 z-10">
                  <div className="bg-slate-950/60 backdrop-blur-md text-white text-[8px] font-black px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest flex items-center gap-1.5">
                     {isTeslaCam ? <Car className="w-3 h-3 text-indigo-400" /> : <Video className="w-3 h-3 text-indigo-400" />}
                     {cam.name}
                  </div>
                </div>

                {/* Recording Indicator Overlay */}
                {isRecording && (
                  <div className="absolute top-3 right-3 z-10 animate-pulse">
                    <div className="bg-red-600/20 backdrop-blur-md text-red-500 text-[8px] font-black px-2 py-1 rounded border border-red-500/40 uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                      REC
                    </div>
                  </div>
                )}

                {/* Overlay Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-all duration-300 z-30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCameraStates(prev => ({ ...prev, [cam.id]: { ...state, isPaused: !state.isPaused }})) }}
                      disabled={isPrivacyMode}
                      className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/5 flex items-center justify-center text-white transition-all active:scale-90"
                    >
                      {state.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setPendingAction({ id: cam.id, type: 'SNAPSHOT' }) }}
                      disabled={isPrivacyMode || state.isPaused}
                      className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/5 flex items-center justify-center text-white transition-all active:scale-90"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleRecording(cam.id) }}
                      disabled={isPrivacyMode || state.isPaused}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                        state.isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-white/10 text-white'
                      }`}
                    >
                      {state.isRecording ? <Square className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCameraStates(prev => ({ ...prev, [cam.id]: { ...state, showSettings: !state.showSettings }})) }}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${state.showSettings ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-white'}`}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {/* Settings Overlay Sidebar (only occupies part of the feed) */}
                {state.showSettings && (
                  <div className="absolute top-0 right-0 bottom-0 w-48 bg-slate-950/95 backdrop-blur-xl z-40 p-5 flex flex-col gap-5 animate-slideInRight shadow-2xl border-l border-white/10 pointer-events-auto overflow-y-auto custom-scrollbar">
                     <div className="flex justify-between items-center border-b border-white/5 pb-2 shrink-0">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Configuration</span>
                        <button onClick={(e) => { e.stopPropagation(); setCameraStates(prev => ({ ...prev, [cam.id]: { ...state, showSettings: false }})) }} className="text-slate-500 hover:text-white"><XIcon className="w-4 h-4" /></button>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Motion Detection</label>
                           <button 
                             onClick={(e) => { e.stopPropagation(); setCameraStates(prev => {
                               const ns = { ...prev, [cam.id]: { ...state, motionDetectionEnabled: !state.motionDetectionEnabled }};
                               persistSettings(ns);
                               return ns;
                             })}}
                             className={`w-8 h-4 rounded-full transition-all relative ${state.motionDetectionEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
                           >
                             <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${state.motionDetectionEnabled ? 'left-4.5' : 'left-0.5'}`}></div>
                           </button>
                        </div>

                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sensitivity</label>
                              <span className="text-[9px] font-mono text-white">{state.sensitivity}%</span>
                           </div>
                           <input 
                              type="range" 
                              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                              value={state.sensitivity} 
                              onChange={(e) => { e.stopPropagation(); setCameraStates(prev => {
                                const ns = { ...prev, [cam.id]: { ...state, sensitivity: parseInt(e.target.value) }};
                                persistSettings(ns);
                                return ns;
                              })}}
                            />
                        </div>

                        <div className="pt-4 border-t border-white/5 space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Zones</label>
                            <button onClick={(e) => { e.stopPropagation(); clearZones(cam.id); }} className="text-[8px] font-black text-red-500 uppercase">Clear</button>
                          </div>
                          <div className="space-y-1.5">
                            {state.customZones.length === 0 ? (
                              <p className="text-[8px] text-slate-600 italic">Drag on feed to draw zones.</p>
                            ) : (
                              state.customZones.map((z, idx) => (
                                <div key={z.id} className="flex items-center justify-between bg-slate-900/50 px-2 py-1 rounded border border-white/5 text-[8px] font-mono text-slate-400 group/zone">
                                  <span className="truncate">ZONE_{idx+1}</span>
                                  <button onClick={(e) => { e.stopPropagation(); deleteZone(cam.id, z.id); }} className="text-slate-600 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
         <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-indigo-500" />
                  Security Logs
               </h3>
               <span className="text-[10px] font-mono text-slate-600">{alerts.length} events</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[10px] custom-scrollbar">
               {alerts.length === 0 ? (
                 <div className="h-full flex items-center justify-center opacity-20 italic">No mesh alerts detected...</div>
               ) : (
                 alerts.map(alert => (
                    <div key={alert.id} className="flex gap-3 leading-relaxed border-b border-white/5 pb-2">
                       <span className="text-slate-600 shrink-0">[{new Date(alert.timestamp).toLocaleTimeString([], {hour12: false})}]</span>
                       <span className={`${alert.severity === 'CRITICAL' ? 'text-red-400 font-bold' : alert.severity === 'WARNING' ? 'text-amber-400' : 'text-slate-400'}`}>
                          {alert.message}
                       </span>
                    </div>
                 ))
               )}
            </div>
         </div>

         <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                  <Film className="w-4 h-4 text-indigo-500" />
                  Mesh Shards
               </h3>
            </div>
            <div className="flex-1 p-6 overflow-x-auto overflow-y-hidden flex gap-4 custom-scrollbar">
               {savedClips.length === 0 ? (
                 <div className="w-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl opacity-20 italic">
                    No recordings sharded...
                 </div>
               ) : (
                 savedClips.map(clip => (
                    <button 
                      key={clip.id} 
                      onClick={() => { setSelectedClip(clip); setIsPlaying(true); }}
                      className="min-w-[200px] group flex flex-col gap-2 text-left"
                    >
                       <div className="aspect-video relative rounded-2xl overflow-hidden border border-slate-800 group-hover:border-indigo-500 transition-all shadow-lg">
                          <img src={clip.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Shard" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <Play className="w-8 h-8 text-white fill-white" />
                          </div>
                       </div>
                       <div className="px-1">
                          <div className="text-[11px] font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{clip.cameraName}</div>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase tracking-tighter">{new Date(clip.timestamp).toLocaleString()}</div>
                       </div>
                    </button>
                 ))
               )}
            </div>
         </div>
      </div>
        </>
      )}

      {/* Playback Modal */}
      {selectedClip && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 animate-fadeIn">
          <div className="w-full max-w-5xl bg-slate-900 border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-full">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
               <div>
                  <h3 className="text-white font-black text-lg leading-none">{selectedClip.cameraName}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-widest">{new Date(selectedClip.timestamp).toLocaleString()}</p>
               </div>
               <button onClick={() => setSelectedClip(null)} className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all text-2xl">
                  <XIcon className="w-6 h-6" />
               </button>
            </div>
            <div className="flex-1 relative bg-black flex items-center justify-center">
               <video ref={videoRef} src={selectedClip.videoUrl} className="w-full h-full object-contain" controls autoPlay />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-8">
            <h3 className="text-white font-black text-xl uppercase tracking-tight mb-4">Initialize Capture?</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Begin {pendingAction.type.toLowerCase()} operation on selected camera node? 
              This will create a new shard in the local mesh.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setPendingAction(null)} className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-500 font-black uppercase text-[10px]">Cancel</button>
              <button onClick={handleConfirmAction} className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-black uppercase text-[10px] shadow-lg shadow-amber-600/20">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default SecurityView;
