import Dexie, { type Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabase';

export interface SyncEvent {
    id: string;
    event_type: string;
    payload: any;
    client_timestamp: string;
    sync_status: 'PENDING' | 'SYNCED' | 'FAILED';
    retry_count: number;
    error_message?: string;
}

export interface OfflineTransaction {
    id: string;
    created_at: string;
    payload: any;
}

export interface CachedProduct {
    id: string;
    barcode?: string;
    name: string;
    data: any;
}

export class POSDatabase extends Dexie {
    offline_transactions!: Table<OfflineTransaction, string>;
    sync_events!: Table<SyncEvent, string>;
    cached_products!: Table<CachedProduct, string>;

    constructor() {
        super('POSWarung');
        this.version(1).stores({
            offline_transactions: 'id, created_at',
            sync_events: 'id, sync_status, client_timestamp',
            cached_products: 'id, barcode, name'
        });
    }
}

export const db = new POSDatabase();

export class SyncManager {
    private clientId: string;

    constructor() {
        this.clientId = localStorage.getItem('client_id') || uuidv4();
        localStorage.setItem('client_id', this.clientId);
    }

    async queueEvent(eventType: string, payload: any) {
        const event: SyncEvent = {
            id: uuidv4(),
            event_type: eventType,
            payload,
            client_timestamp: new Date().toISOString(),
            sync_status: 'PENDING',
            retry_count: 0
        };
        await db.sync_events.add(event);
        if (navigator.onLine) this.syncPendingEvents();
    }

    async syncPendingEvents() {
        const pending = await db.sync_events
            .where('sync_status').equals('PENDING')
            .limit(20)
            .toArray();

        if (pending.length === 0) return;

        try {
            const { data, error } = await supabase.functions.invoke('sync-events', {
                body: { client_id: this.clientId, events: pending }
            });

            if (error) throw error;

            // Update status based on response
            if (data && data.results) {
                for (const result of data.results) {
                    if (result.success) {
                        await db.sync_events.update(result.event_id, { sync_status: 'SYNCED' });
                    } else {
                        const current = await db.sync_events.get(result.event_id);
                        if (current) {
                            await db.sync_events.update(result.event_id, {
                                sync_status: 'FAILED',
                                error_message: result.error,
                                retry_count: current.retry_count + 1
                            });
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Sync failed:', err);
        }
    }

    async getPendingCount(): Promise<number> {
        return await db.sync_events.where('sync_status').equals('PENDING').count();
    }
}

export const syncManager = new SyncManager();

window.addEventListener('online', () => {
    syncManager.syncPendingEvents();
});
