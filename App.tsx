
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PIMProfile from './components/PIMProfile';
import SecurityView from './components/SecurityView';
import JobBoard from './components/JobBoard';
import KarmaLedger from './components/KarmaLedger';
import ChatSystem from './components/ChatSystem';
import AdminPanel from './components/AdminPanel';
import { AppView, UserProfile, AppNotification, ChatMessage } from './types';
import { getLocalData, setLocalData } from './services/dbService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'u-777',
    name: 'Alex Rivera',
    address: 'Sector B-4, Unit 12',
    skills: ['Carpentry', 'Plumbing', 'Electrical'],
    bio: 'Local handyman looking to build community strength.',
    karmaBalance: 1250,
    solarWatts: 420,
    isElderly: false,
    avatar: 'https://picsum.photos/seed/alex/100/100'
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Persistence of notifications
  useEffect(() => {
    const saved = getLocalData<AppNotification[]>('notifications', []);
    setNotifications(saved);
  }, []);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: Date.now()
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 10);
      setLocalData('notifications', updated);
      return updated;
    });
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
    setLocalData('notifications', []);
  };

  return (
    <Router>
      <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
        {/* Navigation Sidebar */}
        <nav className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col z-30`}>
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">B</div>
            {isSidebarOpen && <span className="text-xl font-bold tracking-tight overflow-hidden whitespace-nowrap">B-LAN Core</span>}
          </div>
          
          <div className="flex-1 py-6 overflow-y-auto overflow-x-hidden px-3 space-y-2">
            <SidebarItem icon="fa-chart-pie" label="Dashboard" path="/" isOpen={isSidebarOpen} />
            <SidebarItem icon="fa-user-circle" label="PIM Profile" path="/pim" isOpen={isSidebarOpen} />
            <SidebarItem icon="fa-shield-halved" label="Security" path="/security" isOpen={isSidebarOpen} />
            <SidebarItem icon="fa-list-check" label="Honey Do List" path="/jobs" isOpen={isSidebarOpen} />
            <SidebarItem icon="fa-coins" label="Karma Ledger" path="/ledger" isOpen={isSidebarOpen} />
            <SidebarItem icon="fa-comments" label="Two-Way Chat" path="/chat" isOpen={isSidebarOpen} />
            <SidebarItem icon="fa-lock" label="A-LAN Admin" path="/admin" isOpen={isSidebarOpen} />
          </div>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-full border border-indigo-500 shrink-0" />
              {isSidebarOpen && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium leading-none truncate">{currentUser.name}</span>
                  <span className="text-xs text-indigo-400 mt-1 truncate">{currentUser.karmaBalance} Karma</span>
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mt-4 w-full flex justify-center text-slate-400 hover:text-white transition-colors"
            >
              <i className={`fa-solid ${isSidebarOpen ? 'fa-angle-left' : 'fa-angle-right'}`}></i>
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 md:px-8 z-20">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-green-500 text-[10px] md:text-xs font-mono uppercase bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="hidden sm:inline">B-LAN Local Only</span>
                <span className="sm:hidden">Local</span>
              </span>
            </div>
            <div className="flex items-center gap-3 md:gap-6">
              <div className="hidden sm:flex items-center gap-2 text-amber-400">
                <i className="fa-solid fa-sun text-sm"></i>
                <span className="text-sm font-semibold">{currentUser.solarWatts} Wh Solarcard</span>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-slate-400 hover:text-white relative p-2"
                >
                  <i className="fa-solid fa-bell text-xl"></i>
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white border border-slate-900">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Notifications</span>
                      <button onClick={clearNotifications} className="text-[10px] text-indigo-400 hover:text-indigo-300">Clear All</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm italic">No new alerts</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                            <div className="flex gap-3">
                              <div className={`mt-1 shrink-0 ${n.type === 'SECURITY' ? 'text-red-500' : 'text-indigo-500'}`}>
                                <i className={`fa-solid ${n.type === 'SECURITY' ? 'fa-shield-halved' : 'fa-comment-dots'}`}></i>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-200">{n.title}</div>
                                <div className="text-xs text-slate-400 mt-1">{n.message}</div>
                                <div className="text-[10px] text-slate-600 mt-2 font-mono">{new Date(n.timestamp).toLocaleTimeString()}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard user={currentUser} />} />
              <Route path="/pim" element={<PIMProfile user={currentUser} onUpdate={setCurrentUser} />} />
              <Route path="/security" element={<SecurityView onBroadcast={(msg) => addNotification({ title: 'SECURITY ALERT', message: msg, type: 'SECURITY' })} />} />
              <Route path="/jobs" element={<JobBoard user={currentUser} />} />
              <Route path="/ledger" element={<KarmaLedger user={currentUser} />} />
              <Route path="/chat" element={<ChatSystem user={currentUser} onNewAlert={(msg) => addNotification({ title: 'New Message', message: msg, type: 'CHAT' })} />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

const SidebarItem: React.FC<{ icon: string; label: string; path: string; isOpen: boolean }> = ({ icon, label, path, isOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  
  return (
    <Link 
      to={path} 
      className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group ${
        isActive 
          ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      }`}
    >
      <i className={`fa-solid ${icon} text-lg w-6 flex justify-center group-hover:scale-110 transition-transform`}></i>
      {isOpen && <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
    </Link>
  );
};

export default App;
