
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { getLocalData, setLocalData } from '../services/dbService';

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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Poll for simulated "real-time" updates (like security alerts pushed from SecurityView)
  useEffect(() => {
    const interval = setInterval(() => {
      const current = getLocalData<ChatMessage[]>('chat_messages', []);
      if (current.length > messages.length) {
        setMessages(current);
        // If the new message is a security alert, we could trigger a browser vibration/sound here
        const latest = current[current.length - 1];
        if (latest.senderId !== user.id && onNewAlert) {
          onNewAlert(latest.text);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [messages.length, user.id, onNewAlert]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      text: inputText,
      timestamp: Date.now(),
      type: 'USER'
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    setLocalData('chat_messages', updated);
    setInputText('');

    // Simulate community member reply after 2 seconds
    if (inputText.toLowerCase().includes('help') || inputText.toLowerCase().includes('status')) {
      setIsTyping(true);
      setTimeout(() => {
        const reply: ChatMessage = {
          id: `m-reply-${Date.now()}`,
          senderId: 'SYSTEM',
          senderName: 'Neighborhood Bot',
          text: "Hi Alex! If you need assistance, please use the 'Honey Do' board or trigger an emergency alert in the Security tab.",
          timestamp: Date.now(),
          type: 'SYSTEM'
        };
        const updatedWithReply = [...updated, reply];
        setMessages(updatedWithReply);
        setLocalData('chat_messages', updatedWithReply);
        setIsTyping(false);
        if (onNewAlert) onNewAlert("Neighborhood Bot: " + reply.text);
      }, 2000);
    }
  };

  return (
    <div className="flex h-full gap-4 md:gap-6 relative">
      {/* Contact List (Desktop Only/Hidden on small mobile) */}
      <div className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col hidden lg:flex shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-address-book text-indigo-500"></i>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Community Directory</span>
          </div>
          <input 
            type="text" 
            placeholder="Search neighbors..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-2 space-y-1">
            <ChatContact name="Mrs. Gable" status="online" active />
            <ChatContact name="Mr. Henderson" status="offline" />
            <ChatContact name="Neighborhood Hub" status="online" type="bot" />
            <ChatContact name="Security Cluster" status="online" type="security" />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl relative overflow-hidden">
        {/* Chat Header */}
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
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest animate-pulse">Encrypted Local</span>
                <span className="text-[10px] text-slate-500">•</span>
                <span className="text-[10px] text-slate-500">12 neighbors active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <i className="fa-solid fa-phone-slash"></i>
            </button>
            <button className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-slate-950/10">
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user.id;
            const showName = idx === 0 || messages[idx-1].senderId !== msg.senderId;

            if (msg.type === 'SECURITY') {
              return (
                <div key={msg.id} className="flex justify-center my-4">
                  <div className="bg-red-900/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-center max-w-md shadow-lg animate-bounce">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
                      <span className="text-[10px] font-black uppercase tracking-widest">SECURITY EMERGENCY</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                    <div className="text-[9px] text-red-400/60 mt-2 font-mono">BROADCASTED {new Date(msg.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              );
            }

            if (msg.type === 'SYSTEM') {
               return (
                <div key={msg.id} className="flex justify-center my-4">
                   <div className="bg-slate-800/40 border border-slate-700/50 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-medium italic">
                      {msg.text}
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
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/30'
                }`}>
                  {msg.text}
                  <div className={`text-[9px] mt-1.5 opacity-40 font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex items-center gap-2 text-slate-500 text-[10px] italic animate-pulse">
              <div className="flex gap-1 ml-2">
                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></span>
                <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></span>
              </div>
              Someone is typing...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
          <div className="flex gap-2 items-center">
            <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-colors">
              <i className="fa-solid fa-paperclip"></i>
            </button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Message B-LAN neighbors..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button className="absolute right-3 top-2.5 text-slate-600 hover:text-slate-400">
                <i className="fa-solid fa-face-smile"></i>
              </button>
            </div>
            <button 
              onClick={sendMessage}
              disabled={!inputText.trim()}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all shadow-lg ${
                inputText.trim() ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <i className="fa-solid fa-paper-plane text-sm"></i>
            </button>
          </div>
          <div className="mt-2 text-[10px] text-center text-slate-600">
             <i className="fa-solid fa-tower-broadcast mr-1 opacity-50"></i>
             Connected via Local SDR Mesh Node #04
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatContact: React.FC<{ name: string; status: 'online' | 'offline' | 'away'; active?: boolean; type?: 'user' | 'bot' | 'security' }> = ({ name, status, active, type = 'user' }) => (
  <button className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-indigo-600/10 border border-indigo-600/20' : 'hover:bg-slate-800/60 border border-transparent'}`}>
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
        {type === 'security' ? 'Emergency Dispatch' : type === 'bot' ? 'Automated Service' : 'B-LAN Neighbor'}
      </div>
    </div>
  </button>
);

export default ChatSystem;
