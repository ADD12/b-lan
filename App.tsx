
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { MemoryRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

// Lazy load heavy components for faster initial response
const Dashboard = lazy(() => import('./components/Dashboard'));
const PIMProfile = lazy(() => import('./components/PIMProfile'));
const SecurityView = lazy(() => import('./modules/security/SecurityView'));
const JobBoard = lazy(() => import('./components/JobBoard'));
const KarmaLedger = lazy(() => import('./components/KarmaLedger'));
const KarmaTransferView = lazy(() => import('./components/KarmaTransferView'));
const ChatSystem = lazy(() => import('./components/ChatSystem'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const MediaHub = lazy(() => import('./components/MediaHub'));
const VoiceAssistant = lazy(() => import('./components/VoiceAssistant'));
const UserGuide = lazy(() => import('./components/UserGuide'));
const TriageView = lazy(() => import('./components/TriageView'));
const AIHub = lazy(() => import('./components/AIHub'));
const LemonadeServer = lazy(() => import('./components/LemonadeServer'));
const PhotoAlbum = lazy(() => import('./components/PhotoAlbum'));
const LegalPages = lazy(() => import('./components/LegalPages'));
const PrivacyDocumentView = lazy(() => import('./components/PrivacyDocumentView'));
const AuditLogsView = lazy(() => import('./components/AuditLogsView'));
const SolarCardConfigView = lazy(() => import('./components/SolarCardConfigView'));
const WordPressPlugin = lazy(() => import('./components/WordPressPlugin'));

import LandingPage from './components/LandingPage';
import { AVAILABLE_SHARDS } from './constants/shards';
import { 
  PieChart, 
  UserCircle, 
  Sun, 
  Image as ImageIcon, 
  Server, 
  FlaskConical, 
  AlertTriangle, 
  Brain, 
  ShieldCheck, 
  ListChecks, 
  Coins, 
  Radio, 
  MessageSquare, 
  Gavel, 
  Lock, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  GitBranch, 
  Bell, 
  X,
  PlusCircle,
  Share2
} from 'lucide-react';
import { AppView, UserProfile, AppNotification, ChatMessage } from './types';
import { getLocalData, setLocalData } from './services/dbService';
import { getTeslaStatus, simulateOwnerNotification } from './services/teslaService';
import { syncManager } from './services/syncService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const user = getLocalData<UserProfile | null>('current_auth_user', null);
    if (user && !user.installedShards) {
      user.installedShards = [
        'JOB_BOARD',
        'KARMA_LEDGER',
        'MEDIA_HUB',
        'CHAT_SYSTEM',
        'PHOTO_ALBUM',
        'AI_HUB',
        'VOICE_ASSISTANT',
        'SOLAR_CARD',
        'LEMONADE_SERVER'
      ];
    }
    return user;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    syncManager.start();
    
    // Remove initial loader after mount
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }

    return () => syncManager.stop();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const pending = getLocalData<string[]>('pending_shards', []);
      setPendingCount(pending.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const freshUser = getLocalData<UserProfile | null>('current_auth_user', null);
      if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(freshUser);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [currentUser]);

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

  const handleUpdateUser = useCallback((updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    setLocalData('current_auth_user', updatedUser);
    const users = getLocalData<UserProfile[]>('user_registry', []);
    const updatedRegistry = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setLocalData('user_registry', updatedRegistry);
    const pending = getLocalData<string[]>('pending_shards', []);
    setLocalData('pending_shards', [...pending, 'PIM_UPDATE']);
  }, []);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setLocalData('current_auth_user', user);
    const tesla = getTeslaStatus();
    if (tesla.ownerName === user.name && tesla.status === 'CONNECTED') {
      simulateOwnerNotification(user.name);
      addNotification({ 
        title: 'TESLA-USB ASSOCIATED', 
        message: 'Your vehicle Sentry Mode is now synced with the B-LAN Mesh.', 
        type: 'TESLA' 
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLocalData('current_auth_user', null);
  };

  if (!currentUser) {
    return <LandingPage onLogin={handleLogin} />;
  }

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const sidebarWidth = isSidebarOpen ? (isDesktop ? 'w-80' : 'w-72') : (isMobile ? 'w-0' : 'w-24');

  return (
    <Router>
      <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
        
        {/* Mobile Sidebar Backdrop */}
        {isMobile && isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <nav className={`
          ${isMobile ? (isMobileMenuOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full') : sidebarWidth}
          fixed lg:relative h-full transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col z-50 overflow-hidden
        `}>
          <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-indigo-600/20 text-xl md:text-2xl">B</div>
              {(isSidebarOpen || (isMobile && isMobileMenuOpen)) && <span className="text-xl md:text-2xl font-black tracking-tight uppercase">B-LAN</span>}
            </div>
            {isMobile && (
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 p-2">
                <X className="w-8 h-8" />
              </button>
            )}
          </div>
          
          <div className="flex-1 py-6 overflow-y-auto px-4 space-y-2 md:space-y-3 custom-scrollbar">
            <SidebarItem icon={<PieChart className="w-6 h-6 md:w-7 md:h-7" />} label="Dashboard" path="/" isOpen={isSidebarOpen || (isMobile && isMobileMenuOpen)} onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem icon={<UserCircle className="w-6 h-6 md:w-7 md:h-7" />} label="PIM Profile" path="/pim" isOpen={isSidebarOpen || (isMobile && isMobileMenuOpen)} onClick={() => setIsMobileMenuOpen(false)} />
            
            {/* Dynamic Shards */}
            {AVAILABLE_SHARDS.filter(shard => currentUser.installedShards?.includes(shard.id)).map(shard => (
              <SidebarItem 
                key={shard.id}
                icon={shard.icon} 
                label={shard.name.replace(' B-LAN', '')} 
                path={shard.path} 
                isOpen={isSidebarOpen || (isMobile && isMobileMenuOpen)} 
                onClick={() => setIsMobileMenuOpen(false)} 
              />
            ))}

            <div className="pt-4 pb-2 px-4">
              <div className="h-px bg-slate-800 w-full" />
            </div>

            <SidebarItem icon={<PlusCircle className="w-6 h-6 md:w-7 md:h-7 text-indigo-400" />} label="Add Feature" path="/pim" isOpen={isSidebarOpen || (isMobile && isMobileMenuOpen)} onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem icon={<Share2 className="w-6 h-6 md:w-7 md:h-7 text-indigo-400" />} label="WP Integration" path="/wordpress" isOpen={isSidebarOpen || (isMobile && isMobileMenuOpen)} onClick={() => setIsMobileMenuOpen(false)} />
            
            <div className="pt-4 pb-2 px-4">
              <div className="h-px bg-slate-800 w-full" />
            </div>

            <SidebarItem icon={<AlertTriangle className="w-6 h-6 md:w-7 md:h-7" />} label="Triage" path="/triage" isOpen={isSidebarOpen || (isMobile && isMobileMenuOpen)} isUrgent onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarItem icon={<Gavel className="w-6 h-6 md:w-7 md:h-7" />} label="Legal" path="/legal" isOpen={isSidebarOpen || (isMobile && isMobileMenuOpen)} onClick={() => setIsMobileMenuOpen(false)} />
            {currentUser.role === 'ADMIN' && (
              <SidebarItem icon={<Lock className="w-6 h-6 md:w-7 md:h-7" />} label="Admin" path="/admin" isOpen={isSidebarOpen || (isMobile && isMobileMenuOpen)} onClick={() => setIsMobileMenuOpen(false)} />
            )}
          </div>

          <div className="p-6 border-t border-slate-800 shrink-0">
            <div className="flex items-center gap-4">
              <img src={currentUser.avatar} alt="User" className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-indigo-500 shrink-0" />
              {(isSidebarOpen || (isMobile && isMobileMenuOpen)) && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-base font-bold leading-none truncate">{currentUser.name}</span>
                  <span className="text-xs text-indigo-400 mt-1 truncate font-black">{currentUser.karmaBalance} Karma</span>
                </div>
              )}
            </div>
            {(isSidebarOpen || (isMobile && isMobileMenuOpen)) && (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3 mt-6 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-black uppercase text-sm tracking-wider"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            )}
            {!isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-full flex justify-center text-slate-400 hover:text-white transition-colors py-2 mt-2"
              >
                {isSidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
              </button>
            )}
            <div className="mt-4 text-center">
              <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">B-LAN Core v3.0</span>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* Responsive Header */}
          <header className="h-20 md:h-24 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 md:px-8 lg:px-10 z-20 shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
              {isMobile && (
                <button onClick={() => setIsMobileMenuOpen(true)} className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-xl text-slate-200">
                  <Menu className="w-6 h-6" />
                </button>
              )}
              <div className="flex items-center gap-2 md:gap-3 bg-slate-950/40 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/5">
                <GitBranch className="w-3 h-3 md:w-4 md:h-4 text-indigo-500" />
                <span className="text-xs md:text-sm font-mono text-slate-400 uppercase tracking-widest hidden xs:inline">mesh-master</span>
                <span className="text-xs font-mono text-slate-400 xs:hidden">M-M</span>
              </div>
              <span className="flex items-center gap-2 md:gap-3 text-green-500 text-xs md:text-sm font-black uppercase bg-green-500/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-green-500/20">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="hidden sm:inline">B-LAN LOCAL v3.0</span>
                <span className="sm:hidden">LOCAL v3.0</span>
              </span>
              <span className="hidden lg:flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                <i className="fa-solid fa-desktop"></i>
                Desktop Ready
              </span>
            </div>

            <div className="flex items-center gap-3 md:gap-8">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 md:gap-3 text-amber-400">
                  <Sun className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-base md:text-xl font-black tracking-tight">{currentUser.solarWatts.toLocaleString()} <span className="hidden xs:inline">Wh</span></span>
                </div>
                {!isMobile && (
                  <a href="https://solargiftcards.com/" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm font-black text-indigo-400 uppercase hover:text-indigo-300 transition-colors mt-1">
                    <b>Buy Watts</b>
                  </a>
                )}
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-slate-400 hover:text-white relative p-2 md:p-3"
                >
                  <Bell className="w-6 h-6 md:w-7 md:h-7" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 md:top-2 right-1 md:right-2 w-5 h-5 bg-red-500 rounded-full text-xs font-black flex items-center justify-center text-white border-2 border-slate-900">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-72 md:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                      <span className="text-sm font-black uppercase tracking-wider text-slate-400">Alerts</span>
                      <button onClick={() => setNotifications([])} className="text-xs font-black text-indigo-400 hover:text-indigo-300 uppercase">Clear</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 italic">No new alerts</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/30">
                            <div className="text-sm font-black text-slate-200 uppercase">{n.title}</div>
                            <div className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
            <div className="max-w-7xl mx-auto w-full">
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Initializing Module...</span>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Dashboard user={currentUser} onUpdate={handleUpdateUser} />} />
                  <Route path="/pim" element={<PIMProfile user={currentUser} onUpdate={handleUpdateUser} />} />
                  <Route path="/solar-config" element={<SolarCardConfigView user={currentUser} onUpdate={handleUpdateUser} />} />
                  <Route path="/photos" element={<PhotoAlbum user={currentUser} />} />
                  <Route path="/server" element={<LemonadeServer user={currentUser} />} />
                  <Route path="/ai" element={<AIHub />} />
                  <Route path="/triage" element={<TriageView user={currentUser} onNewAlert={(msg) => addNotification({ title: 'EMERGENCY', message: msg, type: 'SECURITY' })} />} />
                  <Route path="/voice" element={<VoiceAssistant user={currentUser} />} />
                  <Route path="/security" element={<SecurityView onBroadcast={(msg) => addNotification({ title: 'SECURITY ALERT', message: msg, type: 'SECURITY' })} />} />
                  <Route path="/jobs" element={<JobBoard user={currentUser} onUserUpdate={handleUpdateUser} />} />
                  <Route path="/ledger" element={<KarmaLedger user={currentUser} />} />
                  <Route path="/ledger/transfer" element={<KarmaTransferView user={currentUser} />} />
                  <Route path="/media" element={<MediaHub />} />
                  <Route path="/chat" element={<ChatSystem user={currentUser} onNewAlert={(msg) => addNotification({ title: 'New Message', message: msg, type: 'CHAT' })} />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/legal" element={<LegalPages />} />
                  <Route path="/privacy-document" element={<PrivacyDocumentView />} />
                  <Route path="/audit-logs" element={<AuditLogsView />} />
                  <Route path="/wordpress" element={<WordPressPlugin />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </main>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        @media (max-width: 480px) {
          .xs\\:hidden { display: none; }
          .xs\\:inline { display: inline; }
        }
      `}</style>
    </Router>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; path: string; isOpen: boolean; isUrgent?: boolean; onClick?: () => void }> = ({ icon, label, path, isOpen, isUrgent, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === path;
  
  return (
    <Link 
      to={path} 
      onClick={onClick}
      className={`flex items-center gap-4 md:gap-5 px-4 py-3 md:py-4 rounded-xl transition-all duration-200 group ${
        isActive 
          ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/40 shadow-inner' 
          : isUrgent ? 'text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      }`}
    >
      <div className={`w-8 flex justify-center group-hover:scale-110 transition-transform ${isUrgent && !isActive ? 'animate-pulse' : ''}`}>
        {icon}
      </div>
      {isOpen && <span className="text-sm md:text-base font-black uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
    </Link>
  );
};

export default App;
