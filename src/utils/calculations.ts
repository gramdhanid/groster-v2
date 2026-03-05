/**
 * Dashboard calculation utilities
 */

/**
 * Calculate growth percentage between current and previous values
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Growth percentage (positive for growth, negative for decline)
 */
export const calculateGrowthPercentage = (
  current: number,
  previous: number
): number => {
  if (previous === 0) {
    // If previous was 0 and current is > 0, show 100% growth
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};

/**
 * Calculate percentage of a value relative to a total
 * @param value - The value to calculate percentage for
 * @param total - The total value
 * @returns Percentage (0-100)
 */
export const calculatePercentage = (
  value: number,
  total: number
): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};
