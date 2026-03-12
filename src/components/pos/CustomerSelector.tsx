import { useState } from 'react';
import { User, Search, X, Plus, Star, Phone } from 'lucide-react';
import type { Customer } from '../../store/useCartStore';
import { useScrollLock } from '../../hooks/useScrollLock';

interface CustomerSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (customer: Customer | null) => void;
    currentCustomer?: Customer | null;
}

// Mock customers data - should be replaced with real API
const MOCK_CUSTOMERS: Customer[] = [
    { id: '1', name: 'Bu Siti', phone: '08123456789', isMember: true },
    { id: '2', name: 'Pak Budi', phone: '08198765432', isMember: true },
    { id: '3', name: 'Ibu Ani', phone: '08234567890', isMember: false },
    { id: '4', name: 'Pak Joko', phone: '08345678901', isMember: false },
    { id: '5', name: 'Mas Agus', phone: '08456789012', isMember: true },
];

export default function CustomerSelector({
    isOpen,
    onClose,
    onSelect,
    currentCustomer,
}: CustomerSelectorProps) {
    useScrollLock(isOpen);

    const [search, setSearch] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');

    if (!isOpen) return null;

    const filteredCustomers = MOCK_CUSTOMERS.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
    );

    const handleSelectCustomer = (customer: Customer) => {
        onSelect(customer);
        onClose();
    };

    const handleClearCustomer = () => {
        onSelect(null);
        onClose();
    };

    const handleAddCustomer = () => {
        if (!newName.trim()) return;
        const newCustomer: Customer = {
            id: crypto.randomUUID(),
            name: newName.trim(),
            phone: newPhone.trim() || undefined,
            isMember: false,
        };
        onSelect(newCustomer);
        setShowAddForm(false);
        setNewName('');
        setNewPhone('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f172a] rounded-t-3xl shadow-2xl w-full max-w-2xl p-6 animate-slide-up max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 shrink-0">
                    <h3 className="text-xl font-black text-white">Pelanggan</h3>
                    <div className="flex gap-2">
                        {currentCustomer && (
                            <button
                                onClick={handleClearCustomer}
                                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-bold text-sm flex items-center gap-1"
                            >
                                <X size={16} />
                                Hapus
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Current Customer Display */}
                {currentCustomer && (
                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                                <User size={24} className="text-primary" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{currentCustomer.name}</span>
                                    {currentCustomer.isMember && (
                                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full flex items-center gap-1">
                                            <Star size={10} fill="currentColor" />
                                            Member
                                        </span>
                                    )}
                                </div>
                                {currentCustomer.phone && (
                                    <div className="text-sm text-slate-400 flex items-center gap-1">
                                        <Phone size={12} />
                                        {currentCustomer.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="relative mb-4 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Cari nama atau nomor HP..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary font-medium text-white placeholder:text-slate-500"
                        autoFocus
                    />
                </div>

                {/* Add New Customer Button */}
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="w-full mb-4 py-3 bg-slate-800 border border-slate-700 rounded-xl font-bold text-slate-300 flex items-center justify-center gap-2 hover:border-slate-600 transition-colors shrink-0"
                    >
                        <Plus size={18} />
                        Tambah Pelanggan Baru
                    </button>
                )}

                {/* Add New Customer Form */}
                {showAddForm && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4 shrink-0">
                        <h4 className="font-bold text-white mb-3">Pelanggan Baru</h4>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Nama pelanggan"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-primary font-medium text-white placeholder:text-slate-500"
                            />
                            <input
                                type="tel"
                                placeholder="Nomor HP (opsional)"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-primary font-medium text-white placeholder:text-slate-500"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setShowAddForm(false); setNewName(''); setNewPhone(''); }}
                                    className="flex-1 py-2 bg-slate-700 text-slate-300 rounded-lg font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleAddCustomer}
                                    disabled={!newName.trim()}
                                    className="flex-1 py-2 bg-primary text-white rounded-lg font-bold disabled:opacity-30 disabled:grayscale"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Customer List */}
                <div className="flex-1 overflow-y-auto -mx-6 px-6">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3 sticky top-0 bg-[#0f172a] py-2">
                        Pelanggan Terbaru
                    </div>
                    {filteredCustomers.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <User size={48} className="mx-auto mb-3 opacity-20" />
                            <p>Tidak ada pelanggan ditemukan</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredCustomers.map((customer) => (
                                <button
                                    key={customer.id}
                                    onClick={() => handleSelectCustomer(customer)}
                                    className={`w-full p-4 rounded-xl text-left transition-all border ${
                                        currentCustomer?.id === customer.id
                                            ? 'bg-primary border-primary shadow-lg shadow-primary/20'
                                            : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            currentCustomer?.id === customer.id
                                                ? 'bg-white/20'
                                                : 'bg-slate-700'
                                        }`}>
                                            <User size={20} className={currentCustomer?.id === customer.id ? 'text-white' : 'text-slate-400'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold truncate ${
                                                    currentCustomer?.id === customer.id ? 'text-white' : 'text-slate-200'
                                                }`}>
                                                    {customer.name}
                                                </span>
                                                {customer.isMember && (
                                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full flex items-center gap-1 shrink-0 ${
                                                        currentCustomer?.id === customer.id
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                        <Star size={8} fill="currentColor" />
                                                        Member
                                                    </span>
                                                )}
                                            </div>
                                            {customer.phone && (
                                                <div className={`text-sm flex items-center gap-1 ${
                                                    currentCustomer?.id === customer.id ? 'text-white/70' : 'text-slate-400'
                                                }`}>
                                                    <Phone size={12} />
                                                    {customer.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
