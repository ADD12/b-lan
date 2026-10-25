import { 
  ShieldCheck, 
  ListChecks, 
  Coins, 
  Radio, 
  MessageSquare, 
  Gavel, 
  Image as ImageIcon,
  Server,
  FlaskConical,
  AlertTriangle,
  Brain,
  Sun,
  PieChart,
  UserCircle
} from 'lucide-react';
import React from 'react';

export interface ShardDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  category: 'CORE' | 'UTILITY' | 'SOCIAL' | 'SECURITY';
}

export const AVAILABLE_SHARDS: ShardDefinition[] = [
  {
    id: 'SECURITY_CAM',
    name: 'Security Cam B-LAN',
    description: 'Advanced mesh-linked security camera with zone detection and sentry mode.',
    icon: <ShieldCheck className="w-6 h-6" />,
    path: '/security',
    category: 'SECURITY'
  },
  {
    id: 'JOB_BOARD',
    name: 'Honey Do Economy',
    description: 'Local community job board and task management system.',
    icon: <ListChecks className="w-6 h-6" />,
    path: '/jobs',
    category: 'UTILITY'
  },
  {
    id: 'KARMA_LEDGER',
    name: 'Karma Ledger',
    description: 'Decentralized credit and reputation tracking system.',
    icon: <Coins className="w-6 h-6" />,
    path: '/ledger',
    category: 'CORE'
  },
  {
    id: 'MEDIA_HUB',
    name: 'Media Hub',
    description: 'Local mesh media streaming and sharing service.',
    icon: <Radio className="w-6 h-6" />,
    path: '/media',
    category: 'SOCIAL'
  },
  {
    id: 'CHAT_SYSTEM',
    name: 'Mesh Chat',
    description: 'Encrypted peer-to-peer messaging for the local shard.',
    icon: <MessageSquare className="w-6 h-6" />,
    path: '/chat',
    category: 'SOCIAL'
  },
  {
    id: 'PHOTO_ALBUM',
    name: 'Photo Album',
    description: 'Local storage for community photos and memories.',
    icon: <ImageIcon className="w-6 h-6" />,
    path: '/photos',
    category: 'SOCIAL'
  },
  {
    id: 'AI_HUB',
    name: 'Neural Shard (AI)',
    description: 'Local LLM and AI processing hub for mesh intelligence.',
    icon: <FlaskConical className="w-6 h-6" />,
    path: '/ai',
    category: 'CORE'
  },
  {
    id: 'VOICE_ASSISTANT',
    name: 'Voice Assistant',
    description: 'Voice-activated mesh control and information system.',
    icon: <Brain className="w-6 h-6" />,
    path: '/voice',
    category: 'CORE'
  },
  {
    id: 'SOLAR_CARD',
    name: 'Solar Card',
    description: 'Manage your solar energy production and gift cards.',
    icon: <Sun className="w-6 h-6" />,
    path: '/solar-config',
    category: 'UTILITY'
  },
  {
    id: 'LEMONADE_SERVER',
    name: 'Lemonade Server',
    description: 'Local mesh server for hosting community resources.',
    icon: <Server className="w-6 h-6" />,
    path: '/server',
    category: 'CORE'
  }
];
