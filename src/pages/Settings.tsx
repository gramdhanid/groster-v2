import { useState } from 'react';
import {
    User,
    Settings as SettingsIcon,
    Database,
    LogOut,
    ChevronRight,
    Store,
    MapPin,
    Phone,
    ShieldCheck,
    RefreshCcw,
    Users
} from 'lucide-react';


export default function Settings() {
    const [storeName] = useState('Toko Madju Jaya');
    const [storeAddress] = useState('Jl. Merdeka No. 123, Bandung');
    const [storePhone] = useState('081234567890');

    const handleLogout = () => {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            alert('Logout berhasil!');
        }
    };

    const clearLocalData = () => {
        if (confirm('Ini akan menghapus data offline lokal. Data di server tetap aman. Lanjutkan?')) {
            alert('Data lokal dibersihkan.');
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col gap-1 items-center justify-center py-6 bg-primary/10 rounded-2xl border border-primary/20">
                <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mb-2 shadow-lg ring-4 ring-primary/20">
                    <Store size={40} />
                </div>
                <h1 className="text-xl font-black text-white">{storeName}</h1>
                <p className="text-sm text-slate-400 font-medium">{storePhone}</p>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <div className="space-y-3">
                    <h2 className="px-1 text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <User size={14} /> Profil Toko
                    </h2>
                    <div className="bg-[#0f172a] rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
                        <div className="flex items-center gap-4 p-4 active:bg-slate-800 transition-colors cursor-pointer border-b border-slate-800">
                            <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                                <Store size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-slate-500 font-medium">Nama Toko</div>
                                <div className="text-sm font-bold text-slate-200">{storeName}</div>
                            </div>
                            <ChevronRight size={20} className="text-slate-700" />
                        </div>
                        <div className="flex items-center gap-4 p-4 active:bg-slate-800 transition-colors cursor-pointer border-b border-slate-800">
                            <div className="bg-orange-100 p-2.5 rounded-xl text-orange-600">
                                <MapPin size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-slate-500 font-medium">Alamat</div>
                                <div className="text-sm font-bold text-slate-200">{storeAddress}</div>
                            </div>
                            <ChevronRight size={20} className="text-slate-700" />
                        </div>
                        <div className="flex items-center gap-4 p-4 active:bg-slate-800 transition-colors cursor-pointer">
                            <div className="bg-green-100 p-2.5 rounded-xl text-green-600">
                                <Phone size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-slate-500 font-medium">Telepon / WhatsApp</div>
                                <div className="text-sm font-bold text-slate-200">{storePhone}</div>
                            </div>
                            <ChevronRight size={20} className="text-slate-700" />
                        </div>
                    </div>
                </div>

                {/* Accounting Section */}
                <div className="space-y-3">
                    <h2 className="px-1 text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Database size={14} /> Manajemen Data
                    </h2>
                    <div className="bg-[#0f172a] rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
                        <div className="flex items-center gap-4 p-4 active:bg-slate-800 transition-colors cursor-pointer border-b border-slate-800 group">
                            <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                <Users size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-slate-200">Manajemen Pelanggan</div>
                            </div>
                            <ChevronRight size={20} className="text-slate-700" />
                        </div>
                        <div className="flex items-center gap-4 p-4 active:bg-slate-800 transition-colors cursor-pointer border-b border-slate-800 group" onClick={clearLocalData}>
                            <div className="bg-red-500/10 p-2.5 rounded-xl text-red-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                                <RefreshCcw size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-slate-200">Reset Data Offline</div>
                            </div>
                            <ChevronRight size={20} className="text-slate-700" />
                        </div>
                        <div className="flex items-center gap-4 p-4 active:bg-slate-800 transition-colors cursor-pointer group">
                            <div className="bg-slate-800 p-2.5 rounded-xl text-slate-400 group-hover:bg-slate-700 group-hover:text-white transition-all">
                                <SettingsIcon size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-slate-200">Preferensi Aplikasi</div>
                            </div>
                            <ChevronRight size={20} className="text-slate-700" />
                        </div>
                    </div>
                </div>

                {/* Security / Account Section */}
                <div className="space-y-3">
                    <h2 className="px-1 text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={14} /> Akun & Keamanan
                    </h2>
                    <div className="bg-[#0f172a] rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-800">
                            <div className="text-xs text-slate-500 font-medium">Logged in as</div>
                            <div className="text-sm font-bold text-slate-200">kasir@tokomadju.com</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 p-4 active:bg-red-500/10 text-red-400 transition-colors cursor-pointer font-bold"
                        >
                            <LogOut size={20} />
                            <div className="flex-1 text-left text-sm">Keluar dari Aplikasi</div>
                            <ChevronRight size={20} className="text-red-900" />
                        </button>
                    </div>
                </div>

                <div className="text-center space-y-1">
                    <div className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em]">PWA Version 1.0.0</div>
                    <div className="text-[10px] text-slate-700 font-medium italic">Handcrafted for Warung Indonesia</div>
                </div>
            </div>
        </div>
    );
}
