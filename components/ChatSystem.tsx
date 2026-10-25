
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage, CalendarEvent } from '../types';
import { getLocalData, setLocalData } from '../services/dbService';
import { createDtnBundle, simulateDtnPropagation } from '../services/dtnService';
import { chatWithGrounding, chatWithGroundingStream } from '../services/geminiService';

interface ChatSystemProps {
  user: UserProfile;
  onNewAlert?: (msg: string) => void;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ user, onNewAlert }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(getLocalData('chat_messages', [
    { id: 'm1', senderId: 'u-elderly-1', senderName: 'Mrs. Gable', text: 'Thank you for the sink fix, Alex!', timestamp: Date.now() - 3600000, type: 'USER' },
    { id: 'm2', senderId: 'u-777', senderName: 'Alex Rivera', text: 'No problem at all! Let me know if it leaks again.', timestamp: Date.now() - 3500000, type: 'USER' },
  ]));
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isBusyState, setIsBusyState] = useState(false);
  const [isRecordingVoicemail, setIsRecordingVoicemail] = useState(false);
  const [currentCallNeighbor, setCurrentCallNeighbor] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Poll for simulated "real-time" updates and DTN propagation
  useEffect(() => {
    const interval = setInterval(() => {
      simulateDtnPropagation();
      const current = getLocalData<ChatMessage[]>('chat_messages', []);
      if (current.length > messages.length) {
        setMessages(current);
        const latest = current[current.length - 1];
        if (latest.senderId !== user.id && onNewAlert) {
          onNewAlert(latest.text);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length, user.id, onNewAlert]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startVideoCall = (neighborName: string) => {
    // Check neighbor busy state (mocked)
    const isBusy = Math.random() > 0.6; // 40% chance of busy for demo
    setCurrentCallNeighbor(neighborName);
    
    if (isBusy) {
      setIsBusyState(true);
      setIsCalling(true);
    } else {
      setIsCalling(true);
      setIsBusyState(false);
      setupMedia();
    }
  };

  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch (e) {
      console.error("Camera access denied", e);
    }
  };

  const endCall = () => {
    setIsCalling(false);
    setIsBusyState(false);
    setIsRecordingVoicemail(false);
    if (localVideoRef.current?.srcObject) {
      (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  const sendVoicemail = () => {
    const msgId = `m-v-${Date.now()}`;
    const newMessage: ChatMessage = {
      id: msgId,
      senderId: user.id,
      senderName: user.name,
      text: "Video Message (Shard)",
      timestamp: Date.now(),
      type: 'VOICE_MAIL',
      mediaUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
    };
    const updated = [...messages, newMessage];
    setMessages(updated);
    setLocalData('chat_messages', updated);
    endCall();
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMsgText = inputText;
    const msgId = `m-${Date.now()}`;
    const bundle = createDtnBundle({
      type: 'CHAT',
      id: msgId,
      source: user.id,
      dest: 'BROADCAST'
    });

    const newMessage: ChatMessage = {
      id: msgId,
      senderId: user.id,
      senderName: user.name,
      text: userMsgText,
      timestamp: Date.now(),
      type: 'USER',
      bundleId: bundle.id,
      isDtnPending: true
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    setLocalData('chat_messages', updated);
    setInputText('');

    if (useAI) {
      setIsTyping(true);
      try {
        const stream = await chatWithGroundingStream(userMsgText, useMaps);
        
        const aiMsgId = `m-ai-${Date.now()}`;
        const aiMsg: ChatMessage = {
          id: aiMsgId,
          senderId: 'SYSTEM_AI',
          senderName: 'Gemini Neural Link',
          text: '',
          timestamp: Date.now(),
          type: 'SYSTEM'
        };
        
        setMessages(prev => [...prev, aiMsg]);
        
        let fullText = '';
        for await (const chunk of stream) {
          if (chunk.text) {
            fullText += chunk.text;
            setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText } : m));
          }
        }
        
        const finalMessages = getLocalData<ChatMessage[]>('chat_messages', []);
        setLocalData('chat_messages', [...finalMessages, { ...aiMsg, text: fullText }]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const getCurrentRoute = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const route = user.deviceRoutes?.find(r => currentTime >= r.startTime && currentTime <= r.endTime);
    return route?.name || 'Default PIM';
  };

  return (
    <div className="flex h-full gap-4 md:gap-6 relative">
      <div className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col hidden lg:flex shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-address-book text-indigo-500"></i>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Neighbors</span>
            </div>
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-white/5">
              Route: {getCurrentRoute()}
            </div>
          </div>
          <input 
            type="text" 
            placeholder="Search B-LAN..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-2 space-y-1">
            <ChatContact name="Mrs. Gable" status="online" onCall={() => startVideoCall("Mrs. Gable")} />
            <ChatContact name="Mr. Henderson" status="offline" onCall={() => startVideoCall("Mr. Henderson")} />
            <ChatContact name="Rye Community Bot" status="online" type="bot" />
            <ChatContact name="Gemini Neural Link" status="online" type="bot" active={useAI} />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl relative overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div>
              <div className="text-sm font-bold text-white">General B-LAN Broadcast</div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest animate-pulse">Mesh Link Active</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={() => startVideoCall("General Broadcast")}
                className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
             >
                <i className="fa-solid fa-video"></i>
             </button>

            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-white/5">
              <i className="fa-solid fa-brain text-[10px] text-indigo-400"></i>
              <button 
                onClick={() => setUseAI(!useAI)}
                className={`w-8 h-4 rounded-full relative transition-all ${useAI ? 'bg-indigo-600' : 'bg-slate-800'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${useAI ? 'left-4.5' : 'left-0.5'}`}></div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-slate-950/10">
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user.id;
            const isAI = msg.senderId === 'SYSTEM_AI';
            const showName = idx === 0 || messages[idx-1].senderId !== msg.senderId;

            if (msg.type === 'VOICE_MAIL') {
               return (
                 <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl overflow-hidden max-w-sm shadow-xl">
                       <video src={msg.mediaUrl} className="w-full h-auto aspect-video object-cover opacity-80" muted />
                       <div className="p-3 flex items-center justify-between">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                             <i className="fa-solid fa-film"></i>
                             Video Shard
                          </span>
                          <span className="text-[9px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                       </div>
                    </div>
                 </div>
               );
            }

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showName && !isMe && <span className="text-[10px] font-bold text-slate-500 ml-1 mb-1 uppercase tracking-tighter">{msg.senderName}</span>}
                <div className={`group relative max-w-[85%] md:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all hover:shadow-md ${
                  isMe 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : isAI ? 'bg-indigo-900/20 text-indigo-200 border border-indigo-500/30 rounded-tl-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/30'
                }`}>
                  {msg.text}
                  <div className="flex items-center justify-between mt-1.5">
                    <div className={`text-[9px] opacity-40 font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex items-center gap-2 text-slate-500 text-[10px] italic animate-pulse">
              <div className="flex gap-1 ml-2">
                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></span>
                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></span>
              </div>
              Neural processing active...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
          <div className="flex gap-2 items-center">
            <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-indigo-400">
              <i className="fa-solid fa-paperclip"></i>
            </button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder={useAI ? "Ask Gemini Neural Link..." : "Message B-LAN Neighbors..."}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
            </div>
            <button 
              onClick={sendMessage}
              disabled={!inputText.trim() || isTyping}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all shadow-lg ${
                inputText.trim() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 text-slate-600'
              }`}
            >
              <i className="fa-solid fa-paper-plane text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Video Call Overlay (FaceTime Interface) */}
      {isCalling && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-fadeIn">
           <div className="absolute top-8 left-8 z-10">
              <div className="flex flex-col">
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">{currentCallNeighbor}</h2>
                 <p className="text-indigo-400 text-xs font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                    {isBusyState ? 'Busy Shard Signal' : 'B-LAN FaceTime Uplink'}
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                 </p>
              </div>
           </div>

           <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              {!isBusyState ? (
                 <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentCallNeighbor}`} className="w-48 h-48 rounded-full border-4 border-white/10 opacity-40 grayscale" alt="Neighbor" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-32 text-center w-full">
                       <p className="text-white/60 font-bold uppercase text-xs tracking-[0.3em] animate-pulse">Connecting PIM Nodes...</p>
                    </div>
                 </div>
              ) : (
                 <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-24 h-24 rounded-full bg-amber-600/20 flex items-center justify-center text-amber-500 text-4xl mb-8 border border-amber-500/20">
                       <i className="fa-solid fa-calendar-day"></i>
                    </div>
                    <h3 className="text-white text-2xl font-black uppercase mb-4 tracking-tighter">{currentCallNeighbor} is currently Busy</h3>
                    <p className="text-slate-400 text-sm max-w-md italic leading-relaxed mb-8">
                       Calendar check indicates an active "Solar Maintenance" event. Would you like to leave a video shard (voicemail)?
                    </p>
                    <div className="flex gap-4">
                       <button onClick={endCall} className="px-8 py-3 bg-slate-800 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest border border-white/5 hover:bg-slate-700 transition-all">Dismiss</button>
                       <button onClick={() => setIsRecordingVoicemail(true)} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all">Record Message</button>
                    </div>
                 </div>
              )}

              {/* Local Video Inset */}
              {!isBusyState || isRecordingVoicemail ? (
                 <div className="absolute top-8 right-8 w-40 h-56 bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-20">
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale-[0.2]" />
                    {isRecordingVoicemail && (
                       <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded text-[8px] font-black text-white uppercase animate-pulse">
                          <span className="w-1 h-1 bg-white rounded-full"></span>
                          REC
                       </div>
                    )}
                 </div>
              ) : null}

              {isRecordingVoicemail && (
                 <div className="absolute bottom-32 left-0 right-0 flex justify-center z-30">
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] flex items-center gap-8 shadow-2xl">
                       <button onClick={endCall} className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-all">
                          <i className="fa-solid fa-xmark"></i>
                       </button>
                       <div className="text-center">
                          <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Recording Shard</div>
                          <div className="text-white font-mono text-sm">00:08</div>
                       </div>
                       <button onClick={sendVoicemail} className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-500 transition-all shadow-xl shadow-red-600/20">
                          <i className="fa-solid fa-square"></i>
                       </button>
                    </div>
                 </div>
              )}
           </div>

           <div className="p-12 bg-slate-950 flex justify-center gap-12 border-t border-white/5">
              {!isBusyState && (
                <>
                  <button className="w-16 h-16 rounded-full bg-slate-900 text-white text-xl flex items-center justify-center border border-white/5 hover:bg-slate-800 transition-all">
                    <i className="fa-solid fa-microphone-slash"></i>
                  </button>
                  <button onClick={endCall} className="w-20 h-20 rounded-full bg-red-600 text-white text-3xl flex items-center justify-center hover:bg-red-500 transition-all shadow-2xl shadow-red-600/40">
                    <i className="fa-solid fa-phone-slash"></i>
                  </button>
                  <button className="w-16 h-16 rounded-full bg-slate-900 text-white text-xl flex items-center justify-center border border-white/5 hover:bg-slate-800 transition-all">
                    <i className="fa-solid fa-video-slash"></i>
                  </button>
                </>
              )}
           </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

const ChatContact: React.FC<{ name: string; status: 'online' | 'offline' | 'away'; active?: boolean; type?: 'user' | 'bot' | 'security'; onCall?: () => void }> = ({ name, status, active, type = 'user', onCall }) => (
  <div className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${active ? 'bg-indigo-600/20 border border-indigo-600/40' : 'hover:bg-slate-800/60 border border-transparent'} group`}>
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="relative shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border ${
          type === 'security' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
          type === 'bot' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 
          'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {type === 'security' ? <i className="fa-solid fa-shield"></i> : 
           type === 'bot' ? <i className="fa-solid fa-robot"></i> : 
           name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
          status === 'online' ? 'bg-green-500' : status === 'away' ? 'bg-amber-500' : 'bg-slate-600'
        }`}></div>
      </div>
      <div className="text-left overflow-hidden">
        <div className={`text-sm font-bold truncate ${active ? 'text-indigo-400' : 'text-slate-200'}`}>{name}</div>
        <div className="text-[10px] text-slate-500 truncate uppercase tracking-tighter">
          {type === 'security' ? 'Emergency' : type === 'bot' ? 'AI Shard' : 'Neighbor'}
        </div>
      </div>
    </div>
    {type === 'user' && (
       <button 
         onClick={onCall}
         className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
       >
          <i className="fa-solid fa-video text-[10px]"></i>
       </button>
    )}
  </div>
);

export default ChatSystem;
