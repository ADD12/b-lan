
import { getFogStatus } from './fogService';
import { processSyncQueueIntoBundles, simulateDtnPropagation, getDtnStats } from './dtnService';
import { getSyncQueue, updateSyncTaskStatus, getLocalData, setLocalData } from './dbService';
import { SyncTask, DtnBundle } from '../types';

class SyncManager {
  private interval: any = null;
  private nodeId: string;

  constructor() {
    this.nodeId = getFogStatus().nodeId;
  }

  start() {
    if (this.interval) return;
    
    // Run sync cycle every 5 seconds
    this.interval = setInterval(() => {
      this.syncCycle();
    }, 5000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private syncCycle() {
    // 1. Convert pending local changes into DTN bundles
    processSyncQueueIntoBundles(this.nodeId);

    // 2. Simulate mesh propagation (store-and-forward)
    simulateDtnPropagation();

    // 3. Mark tasks as SYNCED if their bundles are DELIVERED
    const queue = getSyncQueue();
    const bundles = getLocalData<DtnBundle[]>('dtn_bundles', []);
    
    queue.forEach(task => {
      if (task.status === 'BUNDLED' && task.bundleId) {
        const bundle = bundles.find(b => b.id === task.bundleId);
        if (bundle && bundle.status === 'DELIVERED') {
          updateSyncTaskStatus(task.id, 'SYNCED');
        }
      }
    });
  }

  getSyncStatus() {
    const queue = getSyncQueue();
    const dtn = getDtnStats();
    
    return {
      pendingTasks: queue.filter(t => t.status !== 'SYNCED').length,
      queuedBundles: dtn.queuedCount,
      deliveredBundles: dtn.deliveredCount,
      meshStatus: dtn.linkHealth
    };
  }
}

export const syncManager = new SyncManager();
