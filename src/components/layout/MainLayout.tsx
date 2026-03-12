import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import POSModal from "../pos/POSModal";

export default function MainLayout() {
  const [isPosOpen, setIsPosOpen] = useState(false);
  const location = useLocation();

  // Hide bottom nav on Add Product page
  const hideBottomNav = location.pathname === "/products/new";

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col text-slate-100">
      {/* Content Area - adjust padding based on nav visibility */}
      <main className={`flex-1 pt-4 px-4 overflow-y-auto w-full max-w-2xl mx-auto shadow-sm ${
        hideBottomNav ? "pb-4" : "pb-[80px]"
      }`}>
        <Outlet />
      </main>

      {/* Conditionally render BottomNav */}
      {!hideBottomNav && (
        <div className="w-full max-w-2xl mx-auto">
          <BottomNav onOpenPOS={() => setIsPosOpen(true)} />
        </div>
      )}

      <POSModal isOpen={isPosOpen} onClose={() => setIsPosOpen(false)} />
    </div>
  );
}
