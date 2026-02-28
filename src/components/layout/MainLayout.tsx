import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import POSModal from '../pos/POSModal';

export default function MainLayout() {
    const [isPosOpen, setIsPosOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col text-slate-100">
            <TopBar />

            {/* Content Area */}
            <main className="flex-1 pt-[56px] pb-[80px] px-4 overflow-y-auto w-full max-w-2xl mx-auto shadow-sm">
                <Outlet />
            </main>

            <div className="w-full max-w-2xl mx-auto">
                <BottomNav onOpenPOS={() => setIsPosOpen(true)} />
            </div>

            <POSModal isOpen={isPosOpen} onClose={() => setIsPosOpen(false)} />
        </div>
    );
}
