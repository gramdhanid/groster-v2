import { NavLink } from 'react-router-dom';
import { Home, Package, Plus, BarChart3, User } from 'lucide-react';

export default function BottomNav() {
    const navItems = [
        { to: '/', icon: Home, label: 'Beranda' },
        { to: '/products', icon: Package, label: 'Produk' },
        { to: '/transactions/new', icon: Plus, label: 'Trx', isButton: true },
        { to: '/reports', icon: BarChart3, label: 'Laporan' },
        { to: '/settings', icon: User, label: 'Akun' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[70px] bg-[#0f172a] border-t border-gray-800 z-50 flex items-center justify-around px-2">
            {navItems.map((item, index) => {
                const Icon = item.icon;

                if (item.isButton) {
                    return (
                        <div key={index} className="relative -top-5 flex flex-col items-center">
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                                        isActive
                                            ? 'bg-primary/20 text-primary border-2 border-primary'
                                            : 'bg-primary text-white hover:bg-primary/90'
                                    }`
                                }
                            >
                                <Icon size={32} />
                            </NavLink>
                        </div>
                    );
                }

                return (
                    <NavLink
                        key={index}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center p-2 min-w-[64px] transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-200'
                            }`
                        }
                    >
                        <Icon size={24} />
                        <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                    </NavLink>
                );
            })}
        </div>
    );
}
