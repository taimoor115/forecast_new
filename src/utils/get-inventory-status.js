export const getInventoryStatus = (inventory, minStock) => {
  if (inventory <= 0) return "critical";
  if (inventory < minStock) return "warning";
  return "good";
};
