import { useState } from 'react';
import LineChart from '../components/charts/LineChart';
import { formatCurrency } from '../utils/format';
import { TrendingUp, Users, Package, Wallet } from 'lucide-react';

export default function Dashboard() {
    const [filter, setFilter] = useState('7_days');

    // Dummy Chart Data: [Timestamps in Seconds, Values]
    // Generates past 7 days of dummy data
    const now = Math.floor(Date.now() / 1000);
    const daySecs = 86400;
    const dummyChartData: [number[], number[]] = [
        [now - 6 * daySecs, now - 5 * daySecs, now - 4 * daySecs, now - 3 * daySecs, now - 2 * daySecs, now - 1 * daySecs, now],
        [1200000, 1500000, 900000, 2100000, 1800000, 2400000, 3100000]
    ];

    return (
        <div className="space-y-6">
            {/* Revenue Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-[#0f172a] p-4 rounded-xl shadow-sm border border-slate-800 flex items-center gap-4 text-white">
                    <div className="bg-green-100 p-3 rounded-lg text-green-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-400 font-medium">Hari Ini</div>
                        <div className="text-xl font-bold text-white">{formatCurrency(3100000)}</div>
                    </div>
                </div>
                <div className="bg-[#0f172a] p-4 rounded-xl shadow-sm border border-slate-800 flex items-center gap-4 text-white">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-400 font-medium">Minggu Ini</div>
                        <div className="text-xl font-bold text-white">{formatCurrency(12500000)}</div>
                    </div>
                </div>
                <div className="bg-[#0f172a] p-4 rounded-xl shadow-sm border border-slate-800 flex items-center gap-4 text-white">
                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-400 font-medium">Pelanggan Aktif</div>
                        <div className="text-xl font-bold text-white">42</div>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-[#0f172a] p-4 rounded-xl shadow-sm border border-slate-800 text-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg">Tren Pendapatan</h2>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none cursor-pointer text-white"
                    >
                        <option value="today">Hari Ini</option>
                        <option value="7_days">7 Hari Terakhir</option>
                        <option value="30_days">30 Hari Terakhir</option>
                    </select>
                </div>
                <div className="w-full overflow-hidden">
                    <LineChart data={dummyChartData} height={250} />
                </div>
            </div>

            {/* Top 5 Products Table */}
            <div className="bg-[#0f172a] p-4 rounded-xl shadow-sm border border-slate-800 text-white">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
                    <Package className="text-primary" size={20} />
                    Top 5 Produk (Terlaris)
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-sm">
                                <th className="pb-2 font-medium">Nama Produk</th>
                                <th className="pb-2 font-medium">Terjual</th>
                                <th className="pb-2 font-medium text-right">Pendapatan</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {/* Simplified the map slightly to save space in the diff */}
                            {[
                                { name: 'Indomie Goreng', qty: 245, rev: 857500 },
                                { name: 'Teh Pucuk Harum 350ml', qty: 180, rev: 720000 },
                                { name: 'Telur Ayam (Kg)', qty: 85, rev: 2380000 },
                                { name: 'Beras Raja Lele 5kg', qty: 42, rev: 3150000 },
                                { name: 'Kopi Kapal Api', qty: 110, rev: 165000 },
                            ].map((p, i) => (
                                <tr key={i} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors">
                                    <td className="py-3 font-medium text-slate-200">{p.name}</td>
                                    <td className="py-3 text-slate-400">{p.qty} item</td>
                                    <td className="py-3 text-right font-bold text-primary">{formatCurrency(p.rev)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
