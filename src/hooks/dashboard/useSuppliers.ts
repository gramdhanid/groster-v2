import { useQuery } from '@tanstack/react-query';
import type { Supplier } from '@/types/restock';

/**
 * Hook for fetching supplier data
 *
 * TO INTEGRATE WITH SUPABASE LATER:
 * Replace the queryFn with actual Supabase query:
 *
 * ```typescript
 * import { supabase } from '@/lib/supabase';
 *
 * queryFn: async () => {
 *   const { data, error } = await supabase
 *     .from('suppliers')
 *     .select('*')
 *     .order('supplier_name', { ascending: true });
 *
 *   if (error) throw error;
 *   return data as Supplier[];
 * }
 * ```
 */
export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async (): Promise<Supplier[]> => {
      // DUMMY DATA - Replace with Supabase query when ready
      await new Promise(resolve => setTimeout(resolve, 200));

      return [
        {
          id: 'sup-1',
          supplierName: 'CV. Maju Jaya',
          phoneNumber: '6281234567890',
        },
        {
          id: 'sup-2',
          supplierName: 'Toko Grosir Sumber Rejeki',
          phoneNumber: '6289876543210',
        },
        {
          id: 'sup-3',
          supplierName: 'UD. Berkah Abadi',
          phoneNumber: '6285678901234',
        },
      ];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - suppliers change rarely
  });
};
