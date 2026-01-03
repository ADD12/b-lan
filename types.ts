
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PIM = 'PIM',
  SECURITY = 'SECURITY',
  JOBS = 'JOBS',
  LEDGER = 'LEDGER',
  CHAT = 'CHAT',
  ADMIN = 'ADMIN'
}

export interface UserProfile {
  id: string;
  name: string;
  address: string;
  skills: string[];
  bio: string;
  karmaBalance: number;
  solarWatts: number;
  isElderly: boolean;
  avatar: string;
}

export interface KarmaTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  reason: string;
  hash: string;
}

export interface HoneyDoJob {
  id: string;
  title: string;
  description: string;
  postedBy: string;
  posterName: string;
  reward: number;
  requiredSkills: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
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

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  type?: 'USER' | 'SYSTEM' | 'SECURITY';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'SECURITY' | 'CHAT' | 'SYSTEM';
  timestamp: number;
}
