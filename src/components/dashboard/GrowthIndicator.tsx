import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrowthIndicatorProps {
  growth: number;
  className?: string;
}

/**
 * Growth indicator component
 * Shows growth percentage with green up arrow for positive growth,
 * red down arrow for negative growth
 */
export default function GrowthIndicator({
  growth,
  className,
}: GrowthIndicatorProps) {
  const isPositive = growth >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={cn("flex flex-col items-end", className)}>
      {/* Baris Atas: Ikon dan Persentase */}
      <div
        className={cn(
          "flex items-center gap-1 text-sm font-medium",
          isPositive ? "text-green-500" : "text-red-500",
        )}
      >
        <Icon size={16} />
        <span>{Math.abs(growth).toFixed(1)}%</span>
      </div>

      {/* Baris Bawah: Teks Keterangan */}
      <span className="text-xs text-slate-500">vs kemarin</span>
    </div>
    // <div
    //   className={cn(
    //     "flex flex-col items-center gap-1 text-sm font-medium",
    //     isPositive ? "text-green-500" : "text-red-500",
    //     className,
    //   )}
    // >
    //   <Icon size={16} />
    //   <span>{Math.abs(growth).toFixed(1)}%</span>
    //   <span className="text-xs text-slate-500">vs kemarin</span>
    // </div>
  );
}
