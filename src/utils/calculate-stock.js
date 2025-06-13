import { getWeekNumber } from "./get-current-week-number";

export const calculateStock = (productsData) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentWeek = getWeekNumber(currentDate);

  return productsData.map((product) => {
    let currentInventory = Number(product.inventory_quantity); // Start with inventory_quantity
    let currentWeekStatus = product.currentWeekStatus || "good"; // Initialize currentWeekStatus

    const updatedForecast = product.forecast.map((forecastYear) => {
      const sortedWeeks = [...(forecastYear.weeks || [])].sort(
        (a, b) => a.week - b.week
      );

      const updatedWeeks = sortedWeeks.map((week, index) => {
        const isCurrentWeek =
          forecastYear.year === currentYear && week.week === currentWeek;
        const isFutureWeek =
          forecastYear.year > currentYear ||
          (forecastYear.year === currentYear && week.week >= currentWeek);

        if (!isFutureWeek && !isCurrentWeek) {
          return week; // Keep past weeks unchanged
        }

        // Calculate expected sales based on previous year's sales and growth rate
        const prevYearSalesEntry = product.sales
          ?.find((s) => s.year === forecastYear.year - 1)
          ?.weeks?.find((w) => w.week === week.week);
        const prevYearSales = prevYearSalesEntry?.sales || 0;
        const growth = prevYearSales * (week.growthRate / 100);
        const newExpectedSales =
          Number(prevYearSales) + Number(Math.round(growth));

        // Calculate new inventory
        const reorderAmount =
          week.reorders?.reduce((sum, r) => sum + r.amount, 0) || 0;

        let newInventory;
        if (isCurrentWeek) {
          // For current week, use the current inventory, subtract sales, add reorders
          newInventory =
            Number(currentInventory) -
            Number(newExpectedSales) +
            Number(reorderAmount);
        } else {
          // For future weeks, use the previous week's ending inventory
          newInventory =
            Number(currentInventory) -
            Number(newExpectedSales) +
            Number(reorderAmount);
        }

        newInventory = Math.max(0, newInventory);

        // Update currentInventory for the next iteration
        currentInventory = newInventory;

        // Determine stock status
        const newStatus =
          newInventory <= 0
            ? "critical"
            : newInventory < week.minStock
            ? "warning"
            : "good";

        // Update currentWeekStatus if this is the current week
        if (isCurrentWeek) {
          currentWeekStatus = newStatus;
        }

        

        return {
          ...week,
          expectedSales: Number(newExpectedSales),
          inventory: Number(newInventory),
          calculatedStock: Number(newInventory),
          status: newStatus,
        };
      });

      return { ...forecastYear, weeks: updatedWeeks };
    });

    return { ...product, forecast: updatedForecast, currentWeekStatus };
  });
};