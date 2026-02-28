import { X, RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface SyncStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    syncStatus: 'synced' | 'pending' | 'error';
    pendingCount: number;
    onSync: () => void;
}

export default function SyncStatusModal({ isOpen, onClose, syncStatus, pendingCount, onSync }: SyncStatusModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1e293b] w-full max-w-sm rounded-3xl shadow-2xl border border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${syncStatus === 'synced' ? 'bg-green-500/10 text-green-400' : syncStatus === 'pending' ? 'bg-orange-500/10 text-orange-400' : 'bg-red-500/10 text-red-400'}`}>
                            <RefreshCw size={20} className={syncStatus === 'pending' ? 'animate-spin' : ''} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white leading-none mb-1">Status Sinkronisasi</h3>
                            <p className="text-xs text-slate-400 font-medium">
                                {syncStatus === 'synced' ? 'Online • Semua data aman' : syncStatus === 'pending' ? `Sinkronisasi • ${pendingCount} item` : 'Error • Data tertunda'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center text-center">
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-6 relative ${syncStatus === 'synced' ? 'bg-green-500/10' : syncStatus === 'pending' ? 'bg-orange-500/10' : 'bg-red-500/10'}`}>
                        {syncStatus === 'synced' ? (
                            <CheckCircle2 size={56} className="text-green-500" />
                        ) : syncStatus === 'pending' ? (
                            <Clock size={56} className="text-orange-500" />
                        ) : (
                            <AlertCircle size={56} className="text-red-500" />
                        )}
                        <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${syncStatus === 'synced' ? 'bg-green-500' : syncStatus === 'pending' ? 'bg-orange-500' : 'bg-red-500'}`} />
                    </div>

                    <h2 className="text-2xl font-black text-white mb-3">
                        {syncStatus === 'synced' ? 'Sinkronisasi Berhasil' : syncStatus === 'pending' ? 'Sedang Sinkronisasi...' : 'Gagal Sinkronisasi'}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-[240px]">
                        {syncStatus === 'synced'
                            ? 'Semua data transaksi dan produk Anda sudah tersimpan aman di server.'
                            : syncStatus === 'pending'
                                ? 'Beberapa data sedang diunggah ke server. Jangan tutup aplikasi.'
                                : 'Terjadi masalah saat menghubungkan ke server. Silakan coba lagi.'}
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0">
                    <button
                        onClick={syncStatus === 'synced' ? onClose : onSync}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${syncStatus === 'synced'
                            ? 'bg-slate-800 text-white hover:bg-slate-700'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                            }`}
                    >
                        {syncStatus === 'synced' ? 'Tutup' : 'Coba Sinkron Sekarang'}
                    </button>
                </div>
            </div>
        </div>
    );
}
