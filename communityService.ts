
import { Community } from '../types';
import { getLocalData, setLocalData } from './dbService';

const DEFAULT_COMMUNITIES: Community[] = [
  {
    id: 'cim-001',
    name: 'Rye Shard Alpha',
    description: 'The primary testing community for B-LAN core protocols.',
    meshId: 'MESH_RYE_001',
    governanceType: 'DAO',
    cimStatus: 'ACTIVE'
  },
  {
    id: 'cim-002',
    name: 'Greenway Quad',
    description: 'Focus on sustainable urban farming and solar cooperatives.',
    meshId: 'MESH_GW_44',
    governanceType: 'FLAT_CONSENSUS',
    cimStatus: 'ACTIVE'
  },
  {
    id: 'cim-003',
    name: 'Laurel Grove',
    description: 'A residential mesh focused on historic preservation and local artisan commerce.',
    meshId: 'MESH_LG_77',
    governanceType: 'DAO',
    cimStatus: 'ACTIVE'
  }
];

export const getCommunities = (): Community[] => {
  return getLocalData('communities', DEFAULT_COMMUNITIES);
};

export const getCommunityById = (id: string): Community | undefined => {
  return getCommunities().find(c => c.id === id);
};

export const registerCommunity = (community: Community): void => {
  const communities = getCommunities();
  if (!communities.find(c => c.id === community.id)) {
    setLocalData('communities', [...communities, community]);
  }
};
