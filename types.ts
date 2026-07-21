
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PIM = 'PIM',
  SECURITY = 'SECURITY',
  JOBS = 'JOBS',
  LEDGER = 'LEDGER',
  CHAT = 'CHAT',
  ADMIN = 'ADMIN',
  MEDIA = 'MEDIA',
  VOICE = 'VOICE',
  GUIDE = 'GUIDE',
  TRIAGE = 'TRIAGE',
  SERVER = 'SERVER',
  PHOTOS = 'PHOTOS',
  LEGAL = 'LEGAL',
  SOLAR_CONFIG = 'SOLAR_CONFIG'
}

export interface SolarCardConfig {
  apiKey?: string;
  isLinked: boolean;
  lastSync: number;
}

export interface DeviceStats {
  ramGb: number;
  storageGb: number;
  cpuCores: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  isBusy: boolean;
}

export interface DeviceRoute {
  id: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface SocialProfiles {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  whatsapp?: string;
  reddit?: string;
  pinterest?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  address: string;
  communityId: string;
  skills: string[];
  bio: string;
  karmaBalance: number;
  solarWatts: number;
  isElderly: boolean;
  avatar: string;
  role: 'USER' | 'ADMIN';
  deviceStats: DeviceStats;
  hasPersonalServer: boolean;
  calendar: CalendarEvent[];
  deviceRoutes: DeviceRoute[];
  socialProfiles: SocialProfiles;
  solarCardConfig?: SolarCardConfig;
  installedShards: string[];
}

export interface GovernanceConfig {
  minRamGb: number;
  minStorageGb: number;
  computeCostPerHour: number;
}

export interface PhotoEntry {
  id: string;
  url: string;
  caption: string;
  timestamp: number;
  isPublicInMesh: boolean;
}

export interface LemonadeService {
  id: string;
  name: string;
  status: 'RUNNING' | 'STOPPED' | 'ERROR';
  port: number;
  cpuUsage: number;
  memoryUsage: string;
}

export interface ResidentSafetyStatus {
  userId: string;
  userName: string;
  address: string;
  status: 'SAFE' | 'NEED_HELP' | 'UNKNOWN';
  note?: string;
  timestamp: number;
}

export interface EmergencyIncident {
  id: string;
  startTime: number;
  type: 'FIRE' | 'POLICE' | 'MEDICAL' | 'GENERAL';
  status: 'ACTIVE' | 'RESOLVED';
  triggeredBy: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  meshId: string;
  governanceType: 'DAO' | 'ADMIN_CONTROLLED' | 'FLAT_CONSENSUS';
  cimStatus: 'ACTIVE' | 'INITIALIZING' | 'MAINTENANCE';
}

export interface CimBalanceState {
  communityId: string;
  localTotalBalance: number;
  alanClaimedBalance: number;
  lastSyncTimestamp: number;
  isSynced: boolean;
}

export interface KarmaTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  reason: string;
  hash: string;
  previousHash: string;
  taskId?: string;
  bundleId?: string;
  isDtnPending?: boolean;
}

export interface MeshCommit {
  id: string;
  message: string;
  author: string;
  timestamp: number;
  hash: string;
  filesChanged: number;
  type: 'PIM' | 'LEDGER' | 'SECURITY' | 'SYSTEM';
}

export interface HoneyDoJob {
  id: string;
  title: string;
  description: string;
  postedBy: string;
  posterName: string;
  reward: number;
  requiredSkills: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING_APPROVAL';
  assignedTo?: string;
  location: string;
}

export interface SecurityAlert {
  id: string;
  camera: string;
  timestamp: number;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface SecurityClip {
  id: string;
  cameraName: string;
  timestamp: number;
  thumbnail: string;
  videoUrl?: string;
  duration: number;
  triggerType: 'MANUAL' | 'MOTION';
  isTeslaSentry?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  type?: 'USER' | 'SYSTEM' | 'SECURITY' | 'VIDEO_CALL' | 'VOICE_MAIL';
  bundleId?: string;
  isDtnPending?: boolean;
  mediaUrl?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'SECURITY' | 'CHAT' | 'SYSTEM' | 'TESLA';
  timestamp: number;
}

export interface MediaItem {
  id: string;
  type: 'PODCAST' | 'NEWS';
  title: string;
  author: string;
  content: string;
  audioUrl?: string;
  timestamp: number;
  isSynced: boolean;
  thumbnail?: string;
  category: string;
}

export interface DtnBundle {
  id: string;
  source: string;
  destination: string;
  payloadType: 'CHAT' | 'LEDGER' | 'SYSTEM' | 'PIM' | 'JOBS';
  payloadId: string;
  payload?: any;
  timestamp: number;
  hops: number;
  status: 'QUEUED' | 'FORWARDED' | 'DELIVERED' | 'FAILED';
}

export interface SyncTask {
  id: string;
  type: 'PIM_UPDATE' | 'LEDGER_TX' | 'JOB_POST' | 'CHAT_MSG';
  data: any;
  timestamp: number;
  status: 'PENDING' | 'BUNDLED' | 'SYNCED';
  bundleId?: string;
}
