import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function MainLayout() {
  const location = useLocation();

  // Hide bottom nav on form pages (Add Product, Transaction pages)
  const hideBottomNav = [
    "/products/new",
    "/transactions/new",
    "/transactions/payment"
  ].includes(location.pathname);

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
          <BottomNav />
        </div>
      )}
    </div>
  );
}
