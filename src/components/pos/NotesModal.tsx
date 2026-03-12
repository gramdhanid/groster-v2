import { useState } from 'react';
import { X, FileText } from 'lucide-react';

interface NotesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (notes: string) => void;
    currentNotes?: string;
}

export default function NotesModal({ isOpen, onClose, onSave, currentNotes = '' }: NotesModalProps) {
    const [notes, setNotes] = useState(currentNotes);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(notes.trim());
        onClose();
    };

    const handleClear = () => {
        setNotes('');
    };

    const quickNotes = [
        'Diantar ke alamat',
        'Ditunggu di toko',
        'Barang dikirim nanti sore',
        'Pembayaran lunas',
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f172a] rounded-t-3xl shadow-2xl w-full max-w-2xl p-6 animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <FileText size={24} className="text-primary" />
                        <h3 className="text-xl font-black text-white">Catatan Transaksi</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Quick Notes */}
                <div className="mb-4">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">
                        Cepat
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {quickNotes.map((quickNote) => (
                            <button
                                key={quickNote}
                                onClick={() => setNotes(notes ? `${notes}\n${quickNote}` : quickNote)}
                                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:border-slate-600 transition-colors"
                            >
                                {quickNote}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes Input */}
                <div className="mb-6">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tulis catatan untuk transaksi ini..."
                        rows={5}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary font-medium text-white placeholder:text-slate-600 resize-none"
                    />
                    <div className="flex justify-between mt-2">
                        <span className="text-xs text-slate-500">
                            {notes.length} karakter
                        </span>
                        {notes && (
                            <button
                                onClick={handleClear}
                                className="text-xs text-red-400 font-bold hover:text-red-300"
                            >
                                Hapus catatan
                            </button>
                        )}
                    </div>
                </div>

                {/* Preview */}
                {notes.trim() && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">
                            Preview
                        </div>
                        <div className="text-sm text-slate-300 whitespace-pre-wrap">
                            {notes}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-xl font-bold text-slate-400 bg-slate-800 border border-slate-700"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-4 rounded-xl font-black text-white bg-primary shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                    >
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}
