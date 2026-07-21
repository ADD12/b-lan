
/**
 * Fog-Over-DTN Service
 * Implementation of Delay-Tolerant Networking for Fog Mesh.
 * Supports store-and-forward bundles when mesh links are intermittent.
 * Ref: https://github.com/ADD12/fog-over-dtn
 */

import { DtnBundle, SyncTask } from '../types';
import { getLocalData, setLocalData, getSyncQueue, updateSyncTaskStatus } from './dbService';

export const createDtnBundle = (payload: { type: DtnBundle['payloadType'], id: string, source: string, dest: string, data?: any }): DtnBundle => {
  const bundles = getLocalData<DtnBundle[]>('dtn_bundles', []);
  const newBundle: DtnBundle = {
    id: `bundle-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    source: payload.source,
    destination: payload.dest,
    payloadType: payload.type,
    payloadId: payload.id,
    payload: payload.data,
    timestamp: Date.now(),
    hops: 0,
    status: 'QUEUED'
  };

  const updated = [newBundle, ...bundles].slice(0, 100);
  setLocalData('dtn_bundles', updated);
  return newBundle;
};

export const processSyncQueueIntoBundles = (sourceNodeId: string) => {
  const queue = getSyncQueue();
  const pending = queue.filter(t => t.status === 'PENDING');
  
  pending.forEach(task => {
    const bundle = createDtnBundle({
      type: task.type === 'PIM_UPDATE' ? 'PIM' : 
            task.type === 'LEDGER_TX' ? 'LEDGER' : 
            task.type === 'JOB_POST' ? 'JOBS' : 'CHAT',
      id: task.id,
      source: sourceNodeId,
      dest: 'MESH_BROADCAST',
      data: task.data
    });
    updateSyncTaskStatus(task.id, 'BUNDLED', bundle.id);
  });
};

export const getDtnStats = () => {
  const bundles = getLocalData<DtnBundle[]>('dtn_bundles', []);
  const queuedCount = bundles.filter(b => b.status === 'QUEUED').length;
  const forwardedCount = bundles.filter(b => b.status === 'FORWARDED').length;
  const deliveredCount = bundles.filter(b => b.status === 'DELIVERED').length;

  return {
    queuedCount,
    forwardedCount,
    deliveredCount,
    totalCount: bundles.length,
    lastBundleId: bundles[0]?.id || 'NONE',
    linkHealth: queuedCount > 5 ? 'CONGESTED' : 'HEALTHY'
  };
};

export const simulateDtnPropagation = () => {
  const bundles = getLocalData<DtnBundle[]>('dtn_bundles', []);
  if (bundles.length === 0) return;

  const updated = bundles.map(b => {
    if (b.status === 'QUEUED' && Math.random() > 0.8) {
      return { ...b, status: 'FORWARDED' as const, hops: b.hops + 1 };
    }
    if (b.status === 'FORWARDED' && Math.random() > 0.9) {
      return { ...b, status: 'DELIVERED' as const };
    }
    return b;
  });

  setLocalData('dtn_bundles', updated);
};
