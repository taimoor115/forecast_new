export const getStockStatus = (currentStock, minStock, expectedSales) => {
  if (currentStock <= 0) return "critical";
  if (currentStock < minStock) return "warning";
  return "good";
};

export const calculateMinStock = (sku, weekIndex, previousYearSales) => {
  return Math.max(20, weekIndex % 50);
};

export const calculateExpectedSales = (previousSales, growthRate) => {
  if (!previousSales || !growthRate) return 0;
  return Math.round(previousSales * (1 + growthRate / 100));
};

export const calculateStock = (currentStock, expectedSales) => {
  return Math.max(0, currentStock - expectedSales);
};
