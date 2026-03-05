import { Wallet, TrendingUp, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';
import GrowthIndicator from './GrowthIndicator';

type IconType = 'revenue' | 'profit' | 'transactions';

interface DailySnapshotCardProps {
  title: string;
  value: number;
  growth: number;
  icon: IconType;
  isCurrency?: boolean;
}

const iconConfig = {
  revenue: {
    Icon: TrendingUp,
    bgClass: 'bg-green-100',
    textClass: 'text-green-600',
  },
  profit: {
    Icon: Wallet,
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-600',
  },
  transactions: {
    Icon: Receipt,
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-600',
  },
};

/**
 * Daily snapshot card component
 * Displays a metric with icon, value, and growth indicator
 */
export default function DailySnapshotCard({
  title,
  value,
  growth,
  icon,
  isCurrency = true,
}: DailySnapshotCardProps) {
  const config = iconConfig[icon];
  const { Icon } = config;

  return (
    <Card className="bg-[#0f172a] border-slate-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${config.bgClass} ${config.textClass}`}>
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-slate-400 font-medium">{title}</div>
            <div className="text-xl font-bold text-white">
              {isCurrency ? formatCurrency(value) : value}
            </div>
          </div>
          <GrowthIndicator growth={growth} />
        </div>
      </CardContent>
    </Card>
  );
}
