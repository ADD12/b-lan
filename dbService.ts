
/**
 * Local Data Service
 */
import { GovernanceConfig, UserProfile, CalendarEvent, DeviceRoute, KarmaTransaction, CimBalanceState, MeshCommit, SyncTask } from '../types';

export const getLocalData = <T,>(key: string, defaultValue: T): T => {
  const saved = localStorage.getItem(`blan_${key}`);
  return saved ? JSON.parse(saved) : defaultValue;
};

export const setLocalData = <T,>(key: string, data: T): void => {
  localStorage.setItem(`blan_${key}`, JSON.stringify(data));
};

// Tracking unpushed changes (shards)
export const trackPendingShard = (type: string) => {
  const pending = getLocalData<string[]>('pending_shards', []);
  setLocalData('pending_shards', [...pending, type]);
};

export const clearPendingShards = () => {
  setLocalData('pending_shards', []);
};

export const queueSyncTask = (type: SyncTask['type'], data: any) => {
  const queue = getLocalData<SyncTask[]>('sync_queue', []);
  const newTask: SyncTask = {
    id: `sync-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    type,
    data,
    timestamp: Date.now(),
    status: 'PENDING'
  };
  setLocalData('sync_queue', [...queue, newTask]);
  trackPendingShard(type);
};

export const getSyncQueue = (): SyncTask[] => {
  return getLocalData<SyncTask[]>('sync_queue', []);
};

export const updateSyncTaskStatus = (taskId: string, status: SyncTask['status'], bundleId?: string) => {
  const queue = getLocalData<SyncTask[]>('sync_queue', []);
  const updated = queue.map(t => t.id === taskId ? { ...t, status, bundleId } : t);
  setLocalData('sync_queue', updated);
};

export const getGovernanceConfig = (): GovernanceConfig => {
  return getLocalData('gov_config', {
    minRamGb: 4,
    minStorageGb: 64,
    computeCostPerHour: 5
  });
};

const MOCK_CALENDAR: CalendarEvent[] = [
  { id: 'cal-1', title: 'Solar Maintenance', start: new Date().toISOString(), end: new Date(Date.now() + 3600000).toISOString(), isBusy: true }
];

const MOCK_ROUTES: DeviceRoute[] = [
  { id: 'dr-1', name: 'Home Hub', startTime: '00:00', endTime: '09:00' },
  { id: 'dr-2', name: 'Handheld 0x1', startTime: '09:00', endTime: '18:00' },
  { id: 'dr-3', name: 'Home Hub', startTime: '18:00', endTime: '23:59' }
];

// Simulated User Registry for Authentication
export const registerLocalUser = (user: UserProfile, password?: string): void => {
  const users = getLocalData<UserProfile[]>('user_registry', []);
  const credentials = getLocalData<Record<string, string>>('user_credentials', {});
  
  const exists = users.find(u => u.name.toLowerCase() === user.name.toLowerCase() || u.address === user.address);
  if (!exists) {
    user.deviceStats = { ramGb: 8, storageGb: 256, cpuCores: 8 };
    user.hasPersonalServer = user.deviceStats.ramGb >= 8;
    user.calendar = MOCK_CALENDAR;
    user.deviceRoutes = MOCK_ROUTES;
    user.socialProfiles = user.socialProfiles || {};
    setLocalData('user_registry', [...users, user]);
    if (password) {
      credentials[user.name.toLowerCase()] = password;
      setLocalData('user_credentials', credentials);
    }
    trackPendingShard('IDENTITY_INIT');
  }
};

export const awardReferralKarma = (referrerId: string): number => {
  const users = getLocalData<UserProfile[]>('user_registry', []);
  const referralReward = 500;
  let updatedBalance = 0;

  const updatedUsers = users.map(u => {
    if (u.id === referrerId) {
      updatedBalance = u.karmaBalance + referralReward;
      return { ...u, karmaBalance: updatedBalance };
    }
    return u;
  });

  setLocalData('user_registry', updatedUsers);
  
  const currentUser = getLocalData<UserProfile | null>('current_auth_user', null);
  if (currentUser && currentUser.id === referrerId) {
    const updatedCurrentUser = { ...currentUser, karmaBalance: updatedBalance };
    setLocalData('current_auth_user', updatedCurrentUser);
  }
  
  trackPendingShard('LEDGER_INBOUND');
  return referralReward;
};

export const processJobPayment = (creatorId: string, workerId: string, amount: number, reason: string): UserProfile | null => {
  return performKarmaTransfer(creatorId, workerId, amount, reason);
};

export const performKarmaTransfer = (
  fromId: string, 
  toId: string, 
  amount: number, 
  reason: string, 
  taskId?: string
): UserProfile | null => {
  const users = getLocalData<UserProfile[]>('user_registry', []);
  const ledger = getLocalData<KarmaTransaction[]>('ledger', []);
  
  const sender = users.find(u => u.id === fromId);
  if (!sender || sender.karmaBalance < amount) {
    throw new Error("Insufficient local Karma balance for sidechain transfer.");
  }

  // Immutable Sidechain Hashing
  const lastTx = ledger[0];
  const prevHash = lastTx ? lastTx.hash : '0x0000000000000000000000000000000000000000000000000000000000000000';
  
  let updatedSender: UserProfile | null = null;
  let updatedRecipient: UserProfile | null = null;

  const updatedUsers = users.map(u => {
    if (u.id === fromId) {
      updatedSender = { ...u, karmaBalance: u.karmaBalance - amount };
      return updatedSender;
    }
    if (u.id === toId) {
      updatedRecipient = { ...u, karmaBalance: u.karmaBalance + amount };
      return updatedRecipient;
    }
    return u;
  });

  setLocalData('user_registry', updatedUsers);

  const newTx: KarmaTransaction = {
    id: `tx-${Date.now()}`,
    from: fromId,
    to: toId,
    amount,
    timestamp: Date.now(),
    reason,
    taskId,
    previousHash: prevHash,
    hash: generateHash({ fromId, toId, amount, timestamp: Date.now(), prevHash })
  };
  
  setLocalData('ledger', [newTx, ...ledger]);
  trackPendingShard('LEDGER_TRANSFER');

  // Update current session user
  const currentAuth = getLocalData<UserProfile | null>('current_auth_user', null);
  if (currentAuth) {
    if (currentAuth.id === fromId && updatedSender) {
      setLocalData('current_auth_user', updatedSender);
      return updatedSender;
    }
    if (currentAuth.id === toId && updatedRecipient) {
      setLocalData('current_auth_user', updatedRecipient);
      return updatedRecipient;
    }
  }
  
  return null;
};

export const syncCimWithAlan = (communityId: string) => {
  const users = getLocalData<UserProfile[]>('user_registry', []);
  const balances = getLocalData<CimBalanceState[]>('cim_balances', []);
  
  const localTotal = users
    .filter(u => u.communityId === communityId)
    .reduce((sum, u) => sum + u.karmaBalance, 0);
  
  const alanClaim = getLocalData<number>(`alan_claim_${communityId}`, localTotal + Math.floor(Math.random() * 1000));
  
  const existingIndex = balances.findIndex(b => b.communityId === communityId);
  const newState: CimBalanceState = {
    communityId,
    localTotalBalance: localTotal,
    alanClaimedBalance: alanClaim,
    lastSyncTimestamp: Date.now(),
    isSynced: localTotal <= alanClaim
  };

  if (existingIndex > -1) {
    balances[existingIndex] = newState;
  } else {
    balances.push(newState);
  }

  setLocalData('cim_balances', balances);
  return newState;
};

export const authenticateLocalUser = (name: string, password?: string): UserProfile | null => {
  const users = getLocalData<UserProfile[]>('user_registry', []);
  const credentials = getLocalData<Record<string, string>>('user_credentials', {});
  
  const superUserName = 'a-lan';
  const superUserPass = 'Asw1Nnw2!';
  
  const adminExists = users.find(u => u.name.toLowerCase() === superUserName);
  
  if (!adminExists) {
    const adminUser: UserProfile = {
      id: 'u-admin-001',
      name: 'a-lan',
      address: 'Admin Shard 0x1',
      communityId: 'cim-001',
      skills: ['Superuser', 'Network Admin', 'Kernel Dev'],
      bio: 'B-LAN Primary Administrator',
      karmaBalance: 999999,
      solarWatts: 1000, // Updated for demo starting consistency
      isElderly: false,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=alan',
      role: 'ADMIN',
      deviceStats: { ramGb: 32, storageGb: 2048, cpuCores: 16 },
      hasPersonalServer: true,
      installedShards: [
        'SECURITY_CAM',
        'JOB_BOARD',
        'KARMA_LEDGER',
        'MEDIA_HUB',
        'CHAT_SYSTEM',
        'PHOTO_ALBUM',
        'AI_HUB',
        'VOICE_ASSISTANT',
        'SOLAR_CARD',
        'LEMONADE_SERVER'
      ],
      calendar: MOCK_CALENDAR,
      deviceRoutes: MOCK_ROUTES,
      socialProfiles: {
        twitter: 'https://x.com/alan_mesh',
        reddit: 'https://reddit.com/r/blan'
      }
    };
    users.push(adminUser);
    credentials[superUserName] = superUserPass;
    setLocalData('user_registry', users);
    setLocalData('user_credentials', credentials);
  }

  const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (user) {
    const savedPass = credentials[name.toLowerCase()];
    if (!savedPass || savedPass === password) {
      return user;
    }
  }
  return null;
};

export const generateHash = (data: any): string => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
};
