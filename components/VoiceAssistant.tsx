
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { UserProfile } from '../types';

interface VoiceAssistantProps {
  user: UserProfile;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ user }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'offline'>('idle');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [transcription, setTranscription] = useState<{ role: 'user' | 'assistant', text: string }[]>([]);
  
  const audioContextIn = useRef<AudioContext | null>(null);
  const audioContextOut = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const currentInputText = useRef('');
  const currentOutputText = useRef('');

  // Manual Base64 Implementation
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();
    setIsActive(false);
    setStatus('idle');
    setLoadingProgress(0);
    setLoadingText('');
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      if (isActive) stopSession();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isActive, stopSession]);

  const startSession = async () => {
    try {
      setStatus('connecting');
      setIsActive(true);
      setLoadingProgress(10);
      
      if (isOffline) {
        setLoadingText('Initializing Gemma 4 Offline Core...');
        setLoadingProgress(30);
        // Simulate local model loading
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoadingProgress(70);
        setLoadingText('Loading Local Neural Weights...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoadingProgress(100);
        setLoadingText('Gemma 4 Online (Local Mesh)');
        setTimeout(() => setStatus('listening'), 500);
        return;
      }

      setLoadingText('Initializing Neural Engine...');
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      setLoadingProgress(20);
      setLoadingText('Preparing Audio Hardware...');
      
      // Start hardware setup and mic request in parallel
      const hardwareSetup = async () => {
        audioContextIn.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextOut.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        return await navigator.mediaDevices.getUserMedia({ audio: true });
      };

      const streamPromise = hardwareSetup();
      
      setLoadingProgress(40);
      setLoadingText('Requesting Mic Access...');
      
      const stream = await streamPromise;
      streamRef.current = stream;
      
      setLoadingProgress(60);
      setLoadingText('Establishing Neural Uplink...');
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are Rye, the B-LAN Community Assistant. 
          The current user is ${user.name} living at ${user.address}.
          IMPORTANT: Greet ${user.name} by name warmly as soon as the connection is established to start the session.
          Assist neighbors with community life and DAO task routing.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setLoadingProgress(100);
            setLoadingText('Uplink Established.');
            setTimeout(() => setStatus('listening'), 500);
            
            const source = audioContextIn.current!.createMediaStreamSource(streamRef.current!);
            processorRef.current = audioContextIn.current!.createScriptProcessor(4096, 1, 1);
            
            processorRef.current.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ audio: pcmBlob });
              });
            };
            
            source.connect(processorRef.current);
            processorRef.current.connect(audioContextIn.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextOut.current) {
              setStatus('speaking');
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextOut.current.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), audioContextOut.current, 24000, 1);
              const source = audioContextOut.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContextOut.current.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('listening');
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current) {
                try { source.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.inputTranscription) {
              currentInputText.current += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              currentOutputText.current += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const uText = currentInputText.current;
              const aText = currentOutputText.current;
              if (uText || aText) {
                setTranscription(prev => [
                  ...prev, 
                  ...(uText ? [{ role: 'user' as const, text: uText }] : []),
                  ...(aText ? [{ role: 'assistant' as const, text: aText }] : [])
                ].slice(-10));
              }
              currentInputText.current = '';
              currentOutputText.current = '';
            }
          },
          onerror: (e) => {
            console.error('Live API Error:', e);
            stopSession();
          },
          onclose: () => {
            stopSession();
          },
        },
      });

      setLoadingProgress(85);
      setLoadingText('Synchronizing Neural Stream...');
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start session:', err);
      stopSession();
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  const handleOfflineInput = async (text: string) => {
    if (!text.trim()) return;
    
    setTranscription(prev => [...prev, { role: 'user', text }].slice(-10));
    setStatus('speaking');
    
    // Simulated Gemma 4 response for offline mode
    // In a real scenario, this would call window.ai or a local WASM model
    setTimeout(() => {
      const responses = [
        "Gemma 4 Offline Core active. I'm processing your request via the local B-LAN mesh.",
        "Connection lost, but my local neural weights are still operational. How can I help?",
        "Rye is currently in low-power Gemma 4 mode. Local DAO tasks are still accessible.",
        "Uplink down. Switching to local inference. I'm standing by."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setTranscription(prev => [...prev, { role: 'assistant', text: randomResponse }].slice(-10));
      setStatus('listening');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white mb-1 uppercase">
            {isOffline ? 'Gemma 4 Offline Core' : 'Rye Neural Voice Link'}
          </h2>
          <p className="text-slate-400 text-sm">
            {isOffline ? 'Local-first neural inference (Mesh Mode)' : 'Real-time conversational community intelligence.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">v2.0</span>
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
            status === 'listening' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
            status === 'speaking' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse' :
            status === 'connecting' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            isOffline ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
            'bg-slate-800 text-slate-500 border-white/5'
          }`}>
            {isOffline ? 'OFFLINE' : status}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          {isOffline && (
            <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              <i className="fa-solid fa-cloud-slash"></i>
              Gemma 4 Fallback Active
            </div>
          )}
          
          <div className="relative z-10 flex flex-col items-center gap-12 w-full">
            <div className={`w-48 h-48 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${
              status === 'speaking' ? 'border-indigo-500 scale-110' :
              status === 'listening' ? 'border-green-500' : 
              status === 'connecting' ? 'border-amber-500 animate-pulse' : 
              isOffline ? 'border-blue-500' : 'border-slate-800'
            }`}>
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                status === 'speaking' ? 'bg-indigo-600' : 
                status === 'listening' ? 'bg-green-600' : 
                status === 'connecting' ? 'bg-amber-600' : 
                isOffline ? 'bg-blue-600' : 'bg-slate-800'
              }`}>
                <i className={`fa-solid text-4xl text-white ${
                  status === 'speaking' ? 'fa-waveform-lines animate-pulse' : 
                  status === 'connecting' ? 'fa-sync animate-spin' : 
                  isOffline ? 'fa-brain' : 'fa-microphone'
                }`}></i>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 w-full max-w-xs">
              {status === 'connecting' && (
                <div className="w-full space-y-3">
                  <div className="flex justify-between text-[10px] font-black text-amber-400 uppercase tracking-widest">
                    <span>{loadingText}</span>
                    <span>{loadingProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-300" 
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {isOffline && status === 'listening' && (
                <div className="w-full animate-fadeIn">
                  <input 
                    type="text"
                    placeholder="Type to Gemma 4..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleOfflineInput(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <p className="text-[9px] text-slate-500 mt-2 text-center uppercase tracking-widest">Voice disabled in offline mode</p>
                </div>
              )}

              <div className="flex gap-4">
                {isActive ? (
                  <>
                    {!isOffline && status !== 'connecting' && (
                      <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                        <i className={`fa-solid ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                      </button>
                    )}
                    <button onClick={stopSession} className="bg-red-600 hover:bg-red-500 text-white px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-600/20">
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button onClick={startSession} className={`${isOffline ? 'bg-blue-600 hover:bg-blue-500' : 'bg-indigo-600 hover:bg-indigo-500'} text-white px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-3`}>
                    <i className={`fa-solid ${isOffline ? 'fa-plug-circle-bolt' : 'fa-bolt-lightning'}`}></i>
                    {isOffline ? 'Activate Gemma 4' : 'Initialize Rye'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <i className="fa-solid fa-align-left text-indigo-500"></i>
            Neural Transcription Stream
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/20">
            {transcription.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-12">
                <i className="fa-solid fa-robot text-4xl mb-4"></i>
                <p className="text-sm italic">Awaiting audio uplink...</p>
              </div>
            ) : (
              transcription.map((entry, idx) => (
                <div key={idx} className={`flex flex-col ${entry.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${entry.role === 'user' ? 'text-slate-500' : 'text-indigo-400'}`}>
                    {entry.role === 'user' ? user.name : 'Rye'}
                  </div>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${entry.role === 'user' ? 'bg-slate-800 text-slate-200 rounded-tr-none' : 'bg-indigo-600/10 text-indigo-300 border border-indigo-500/20 rounded-tl-none'}`}>
                    {entry.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
