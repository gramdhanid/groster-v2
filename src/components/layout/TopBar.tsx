import { useState } from 'react';
import { Wifi, RefreshCw } from 'lucide-react';
import SyncStatusModal from './SyncStatusModal';

export default function TopBar() {
    const pendingCount = 0; // TODO: Connect to sync store
    const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error'>('synced');
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

    return (
        <>
            <div className="fixed top-0 left-0 right-0 h-[64px] bg-[#0f172a] border-b border-slate-800 z-50 flex items-center justify-between px-4 text-white shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                    {/* <div className="bg-primary/20 p-2 rounded-xl">
                        <Wifi className="text-primary" size={20} />
                    </div> */}
                    <div className="font-black text-xl tracking-tight truncate max-w-[180px]">
                        Madju Jaya
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSyncModalOpen(true)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all active:scale-95 text-xs font-bold ${syncStatus === 'synced'
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : syncStatus === 'pending'
                                ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                    >
                        <Wifi size={14} className={syncStatus === 'pending' ? 'animate-pulse' : ''} />
                        <span>{syncStatus === 'synced' ? 'Online' : syncStatus === 'pending' ? 'Syncing...' : 'Disconnected'}</span>
                        {pendingCount > 0 && (
                            <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-md text-[10px]">
                                {pendingCount}
                            </span>
                        )}
                    </button>

                    {syncStatus === 'error' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); /* trigger sync */ }}
                            className="p-2 bg-red-500/10 text-red-400 rounded-full border border-red-500/20"
                        >
                            <RefreshCw size={16} />
                        </button>
                    )}
                </div>
            </div>

            <SyncStatusModal
                isOpen={isSyncModalOpen}
                onClose={() => setIsSyncModalOpen(false)}
                syncStatus={syncStatus as any}
                pendingCount={pendingCount}
                onSync={() => { /* implementation planned for later */ }}
            />
        </>
    );
}
