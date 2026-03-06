import { useState } from "react";
import { Loader2 } from "lucide-react";
import DailySnapshotCard from "@/components/dashboard/DailySnapshotCard";
import LowStockAlertTable from "@/components/dashboard/LowStockAlertTable";
import TopSellingProducts from "@/components/dashboard/TopSellingProducts";
import SalesTrendChart from "@/components/dashboard/SalesTrendChart";
import RestockModal from "@/components/dashboard/RestockModal";
import ProductDetailModal from "@/components/dashboard/ProductDetailModal";
import CashflowCard from "@/components/dashboard/CashflowCard";
import CashflowModal from "@/components/dashboard/CashflowModal";
import { useDailyMetrics } from "@/hooks/dashboard/useDailyMetrics";
import { useLowStockProducts } from "@/hooks/dashboard/useLowStockProducts";
import { useTopSellingProducts } from "@/hooks/dashboard/useTopSellingProducts";
import { useSalesTrend } from "@/hooks/dashboard/useSalesTrend";
import { useSuppliers } from "@/hooks/dashboard/useSuppliers";
import { useCashflow } from "@/hooks/dashboard/useCashflow";
import type { TimeFilter, LowStockProduct } from "@/types/dashboard";

export default function Dashboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7days');
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isCashflowModalOpen, setIsCashflowModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<LowStockProduct | null>(null);

  // Fetch all data using TanStack Query hooks
  const { data: dailyData, isLoading: dailyLoading } = useDailyMetrics();
  const { data: lowStockData, isLoading: lowStockLoading } = useLowStockProducts();
  const { data: topSellingData, isLoading: topSellingLoading } = useTopSellingProducts();
  const { data: salesTrendData, isLoading: salesTrendLoading } = useSalesTrend(timeFilter);
  const { data: suppliersData } = useSuppliers();
  const { data: cashflowData, isLoading: cashflowLoading } = useCashflow();

  const isLoading = dailyLoading || lowStockLoading || topSellingLoading || salesTrendLoading;

  const handleRestockClick = (productId: string) => {
    setIsRestockModalOpen(true);
    setSelectedProductId(productId);
  };

  const handleProductDetailClick = (product: LowStockProduct) => {
    setSelectedDetailProduct(product);
    setIsDetailModalOpen(true);
  };

  // Show loading state
  if (isLoading && !dailyData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-6">
      <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>

      {/* Daily Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {dailyData && (
          <>
            <DailySnapshotCard
              title="Hari Ini - Pendapatan"
              value={dailyData.metrics.revenue}
              growth={dailyData.growth.revenueGrowth}
              icon="revenue"
            />
            <DailySnapshotCard
              title="Hari Ini - Laba Bersih"
              value={dailyData.metrics.netProfit}
              growth={dailyData.growth.profitGrowth}
              icon="profit"
            />
            <DailySnapshotCard
              title="Hari Ini - Transaksi"
              value={dailyData.metrics.transactions}
              growth={dailyData.growth.transactionGrowth}
              icon="transactions"
              isCurrency={false}
            />
          </>
        )}
      </div>

      {/* Cashflow Card */}
      <CashflowCard
        data={cashflowData}
        isLoading={cashflowLoading}
        onClick={() => setIsCashflowModalOpen(true)}
      />

      {/* Sales Trend Chart */}
      {salesTrendData && (
        <SalesTrendChart
          data={salesTrendData}
          onTimeFilterChange={setTimeFilter}
          currentTimeFilter={timeFilter}
        />
      )}

      {/* Two Column Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        {lowStockData && (
          <LowStockAlertTable
            products={lowStockData}
            onRestock={handleRestockClick}
            onProductClick={handleProductDetailClick}
          />
        )}

        {/* Top Selling Products */}
        {topSellingData && (
          <TopSellingProducts products={topSellingData} />
        )}
      </div>

      {/* Restock Modal */}
      {lowStockData && suppliersData && (
        <RestockModal
          isOpen={isRestockModalOpen}
          onClose={() => setIsRestockModalOpen(false)}
          lowStockItems={lowStockData}
          suppliers={suppliersData}
          selectedProductId={selectedProductId}
        />
      )}

      {/* Cashflow Modal */}
      <CashflowModal
        isOpen={isCashflowModalOpen}
        onClose={() => setIsCashflowModalOpen(false)}
        data={cashflowData}
        isLoading={cashflowLoading}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={selectedDetailProduct}
        onRestock={handleRestockClick}
      />
    </div>
  );
}
