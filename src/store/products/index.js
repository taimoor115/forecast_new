import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getWeekNumber } from "../../utils/get-current-week-number";

const useProductStore = create(
  devtools(
    (set) => ({
      products: [],
      selectedVariantsIds: new Set(),
      batchLoading: false,
      loading: false,
      error: null,
      hasScrolled: false,
      inventoryStatus: {
        total: 0,
        sufficient: 0,
        critical: 0,
        warning: 0,
      },
      setInventoryStatus: (inventoryStatus) => set({ inventoryStatus }),
      setHasScrolled: (value) => set({ hasScrolled: value }),

      setProducts: (products) => set({ products }),
      setLoading: (loading) => set({ loading }),
      setBatchLoading: (batchLoading) => set({ batchLoading }),
      setError: (error) => set({ error }),

      setSelectedVariantsIds: (selectedVariantsIds) =>
        set({ selectedVariantsIds: new Set(selectedVariantsIds) }), // Ensure we always use Set

      addSelectedVariant: (variantId) =>
        set((state) => {
          const newSelected = new Set(state.selectedVariantsIds);
          newSelected.add(variantId);
          return { selectedVariantsIds: newSelected };
        }),

      removeSelectedVariant: (variantId) =>
        set((state) => {
          const newSelected = new Set(state.selectedVariantsIds);
          newSelected.delete(variantId);
          return { selectedVariantsIds: newSelected };
        }),

      toggleSelectedVariant: (variantId, checked) =>
        set((state) => {
          const newSelected = new Set(state.selectedVariantsIds);
          if (checked) {
            newSelected.add(variantId);
          } else {
            newSelected.delete(variantId);
          }
          return { selectedVariantsIds: newSelected };
        }),

      selectAllVariants: (variantIds) =>
        set({ selectedVariantsIds: new Set(variantIds) }),

      clearSelectedVariants: () => set({ selectedVariantsIds: new Set() }),

      handleDeliveryTimeChange: ({ variantId, newDeliveryTime }) =>
        set((state) => ({
          products: {
            ...state.products,
            products: state.products?.products?.map((product) =>
              product?.variantId === variantId
                ? { ...product, deliveryTime: newDeliveryTime }
                : product
            ),
          },
        })),

      updateDeliveryTimeWithMinStock: ({ variantId, newDeliveryTime }) =>
        set((state) => ({
          products: {
            ...state.products,
            products: state.products?.products?.map((product) => {
              if (product?.variantId === variantId) {
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const currentWeek = getWeekNumber(currentDate);

                const prevYear = currentYear - 1;
                const prevYearSales =
                  product?.sales?.find((s) => s?.year === prevYear)?.weeks ||
                  [];

                const weeksToInclude = Math.ceil(newDeliveryTime / 7);

                const updatedForecast = product?.forecast?.map(
                  (forecastYear) => {
                    return {
                      ...forecastYear,
                      weeks: forecastYear?.weeks?.map((week) => {
                        if (
                          forecastYear?.year > currentYear ||
                          (forecastYear?.year === currentYear &&
                            week?.week >= currentWeek)
                        ) {
                          let minStockSum = 0;
                          for (let i = 0; i < weeksToInclude; i++) {
                            const targetWeek = week?.week + i;
                            const prevYearWeekData = prevYearSales?.find(
                              (w) => w?.week === targetWeek
                            );
                            minStockSum += prevYearWeekData?.sales || 0;
                          }
                          return { ...week, minStock: minStockSum };
                        }
                        return week;
                      }),
                    };
                  }
                );

                return {
                  ...product,
                  deliveryTime: newDeliveryTime,
                  forecast: updatedForecast,
                };
              }
              return product;
            }),
          },
        })),

      addReorderAndUpdateForecast: (variantId, year, weekNumber, reorderData) =>
        set((state) => {
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentWeek = getWeekNumber(currentDate);

          return {
            products: {
              ...state.products,
              products: state.products?.products?.map((product) => {
                if (product?.variantId === variantId) {
                  let currentInventory = Number(product.inventory_quantity);
                  let currentWeekStatus = product.currentWeekStatus;

                  const updatedForecast = product?.forecast?.map(
                    (forecastYear) => {
                      const sortedWeeks = [...(forecastYear?.weeks || [])].sort(
                        (a, b) => a?.week - b?.week
                      );

                      const updatedWeeks = sortedWeeks?.map((week, index) => {
                        const isCurrentWeek =
                          forecastYear?.year === currentYear &&
                          week?.week === currentWeek;
                        const isFutureWeek =
                          forecastYear?.year > currentYear ||
                          (forecastYear?.year === currentYear &&
                            week?.week >= currentWeek);
                        const isTargetWeek =
                          forecastYear?.year === year &&
                          week?.week === weekNumber;

                        if (!isFutureWeek && !isCurrentWeek) {
                          return week;
                        }

                        const updatedReorders = isTargetWeek
                          ? [...(week?.reorders || []), reorderData]
                          : week?.reorders || [];

                        const prevYearSalesEntry = product?.sales
                          ?.find((s) => s?.year === forecastYear?.year - 1)
                          ?.weeks?.find((w) => w?.week === week?.week);
                        const prevYearSales = prevYearSalesEntry?.sales || 0;
                        const growth = prevYearSales * (week?.growthRate / 100);
                        const newExpectedSales =
                          Number(prevYearSales) + Number(Math.round(growth));

                        const reorderAmount = updatedReorders?.reduce(
                          (sum, r) => sum + r?.amount,
                          0
                        );

                        const newInventory = Math.max(
                          0,
                          Number(currentInventory) -
                            Number(newExpectedSales) +
                            Number(reorderAmount)
                        );

                        currentInventory = newInventory;

                        const newStatus =
                          newInventory <= 0
                            ? "critical"
                            : newInventory < week?.minStock
                            ? "warning"
                            : "good";

                        // Update currentWeekStatus if this is the current week
                        if (isCurrentWeek) {
                          currentWeekStatus = newStatus;
                        }

                        return {
                          ...week,
                          reorders: updatedReorders,
                          expectedSales: Number(newExpectedSales),
                          inventory: Number(newInventory),
                          calculatedStock: Number(newInventory),
                          status: newStatus,
                        };
                      });

                      return { ...forecastYear, weeks: updatedWeeks };
                    }
                  );

                  // Update reorderStatus with unique statuses from future weeks
                  const futureReorders = updatedForecast
                    .flatMap((fy) =>
                      fy.weeks
                        .filter(
                          (w) =>
                            fy.year > currentYear ||
                            (fy.year === currentYear && w.week >= currentWeek)
                        )
                        .flatMap((w) => w.reorders)
                    )
                    .map((r) => r.status)
                    .filter(
                      (status, index, arr) => arr.indexOf(status) === index
                    ); // Get unique statuses

                  return {
                    ...product,
                    forecast: updatedForecast,
                    currentWeekStatus,
                    reorderStatus: futureReorders,
                  };
                }
                return product;
              }),
            },
          };
        }),

      removeReorder: (variantId, year, weekNumber, reorderIndex) =>
        set((state) => {
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentWeek = getWeekNumber(currentDate);

          return {
            products: {
              ...state.products,
              products: state.products?.products?.map((product) => {
                if (product?.variantId === variantId) {
                  let currentInventory = Number(product.inventory_quantity);
                  let currentWeekStatus = product.currentWeekStatus;

                  const updatedForecast = product?.forecast?.map(
                    (forecastYear) => {
                      const sortedWeeks = [...(forecastYear?.weeks || [])].sort(
                        (a, b) => a?.week - b?.week
                      );

                      const updatedWeeks = sortedWeeks?.map((week) => {
                        const isCurrentWeek =
                          forecastYear?.year === currentYear &&
                          week?.week === currentWeek;
                        const isFutureWeek =
                          forecastYear?.year > currentYear ||
                          (forecastYear?.year === currentYear &&
                            week?.week >= currentWeek);
                        const isTargetWeek =
                          forecastYear?.year === year &&
                          week?.week === weekNumber;

                        if (!isFutureWeek && !isCurrentWeek) {
                          return week;
                        }

                        const updatedReorders = isTargetWeek
                          ? week?.reorders?.filter(
                              (_, idx) => idx !== reorderIndex
                            ) || []
                          : week?.reorders || [];

                        const prevYearSalesEntry = product?.sales
                          ?.find((s) => s?.year === forecastYear?.year - 1)
                          ?.weeks?.find((w) => w?.week === week?.week);
                        const prevYearSales = prevYearSalesEntry?.sales || 0;
                        const growth = prevYearSales * (week?.growthRate / 100);
                        const newExpectedSales =
                          Number(prevYearSales) + Number(Math.round(growth));

                        const reorderAmount = updatedReorders?.reduce(
                          (sum, r) => sum + r?.amount,
                          0
                        );

                        const newInventory = Math.max(
                          0,
                          Number(currentInventory) -
                            Number(newExpectedSales) +
                            Number(reorderAmount)
                        );

                        currentInventory = newInventory;

                        const newStatus =
                          newInventory <= 0
                            ? "critical"
                            : newInventory < week?.minStock
                            ? "warning"
                            : "good";

                        // Update currentWeekStatus if this is the current week
                        if (isCurrentWeek) {
                          currentWeekStatus = newStatus;
                        }

                        return {
                          ...week,
                          reorders: updatedReorders,
                          expectedSales: Number(newExpectedSales),
                          inventory: Number(newInventory),
                          calculatedStock: Number(newInventory),
                          status: newStatus,
                        };
                      });

                      return { ...forecastYear, weeks: updatedWeeks };
                    }
                  );

                  // Update reorderStatus with unique statuses from future weeks
                  const futureReorders = updatedForecast
                    .flatMap((fy) =>
                      fy.weeks
                        .filter(
                          (w) =>
                            fy.year > currentYear ||
                            (fy.year === currentYear && w.week >= currentWeek)
                        )
                        .flatMap((w) => w.reorders)
                    )
                    .map((r) => r.status)
                    .filter(
                      (status, index, arr) => arr.indexOf(status) === index
                    ); // Get unique statuses

                  return {
                    ...product,
                    forecast: updatedForecast,
                    currentWeekStatus,
                    reorderStatus: futureReorders,
                  };
                }
                return product;
              }),
            },
          };
        }),

      calculateCurrentWeekStatus: (variantId) => (state) => {
        const product = state.products?.products?.find(
          (product) => product?.variantId === variantId
        );

        if (!product) return "good"; // Default status if product not found

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentWeek = getWeekNumber(currentDate);

        // Find the current week in the forecast
        const currentForecastYear = product.forecast?.find(
          (yearData) => yearData.year === currentYear
        );

        if (!currentForecastYear) return "good"; // Default status if current year forecast not found

        const currentWeekData = currentForecastYear.weeks?.find(
          (week) => week.week === currentWeek
        );

        if (!currentWeekData) return "good"; // Default status if current week data not found

        // Calculate status based on inventory levels
        if (currentWeekData.inventory <= 0) {
          return "critical";
        } else if (currentWeekData.inventory < currentWeekData.minStock) {
          return "warning";
        } else {
          return "good";
        }
      },
      // addReorderAndUpdateForecast: (variantId, year, weekNumber, reorderData) =>
      //   set((state) => ({
      //     products: {
      //       ...state.products,
      //       products: state.products?.products?.map((product) => {
      //         if (product?.variantId === variantId) {
      //           const currentDate = new Date();
      //           const currentYear = currentDate.getFullYear();
      //           const currentWeek = getWeekNumber(currentDate);

      //           let currentInventory = Number(product.inventory_quantity);

      //           const updatedForecast = product?.forecast?.map(
      //             (forecastYear) => {
      //               const sortedWeeks = [...(forecastYear?.weeks || [])].sort(
      //                 (a, b) => a?.week - b?.week
      //               );

      //               const updatedWeeks = sortedWeeks?.map((week, index) => {
      //                 const isCurrentWeek =
      //                   forecastYear?.year === currentYear &&
      //                   week?.week === currentWeek;
      //                 const isFutureWeek =
      //                   forecastYear?.year > currentYear ||
      //                   (forecastYear?.year === currentYear &&
      //                     week?.week >= currentWeek);
      //                 const isTargetWeek =
      //                   forecastYear?.year === year &&
      //                   week?.week === weekNumber;

      //                 if (!isFutureWeek && !isCurrentWeek) {
      //                   return week;
      //                 }

      //                 const updatedReorders = isTargetWeek
      //                   ? [...(week?.reorders || []), reorderData]
      //                   : week?.reorders || [];

      //                 const prevYearSalesEntry = product?.sales
      //                   ?.find((s) => s?.year === forecastYear?.year - 1)
      //                   ?.weeks?.find((w) => w?.week === week?.week);
      //                 const prevYearSales = prevYearSalesEntry?.sales || 0;
      //                 const growth = prevYearSales * (week?.growthRate / 100);
      //                 const newExpectedSales =
      //                   Number(prevYearSales) + Number(Math.round(growth));

      //                 const reorderAmount = updatedReorders?.reduce(
      //                   (sum, r) => sum + r?.amount,
      //                   0
      //                 );

      //                 // Use the previous week's inventory for future weeks
      //                 const newInventory = Math.max(
      //                   0,
      //                   Number(currentInventory) -
      //                     Number(newExpectedSales) +
      //                     Number(reorderAmount)
      //                 );

      //                 // Update currentInventory for the next week
      //                 currentInventory = newInventory;

      //                 const newStatus =
      //                   newInventory <= 0
      //                     ? "critical"
      //                     : newInventory < week?.minStock
      //                     ? "warning"
      //                     : "good";

      //                 return {
      //                   ...week,
      //                   reorders: updatedReorders,
      //                   expectedSales: Number(newExpectedSales),
      //                   inventory: Number(newInventory),
      //                   calculatedStock: Number(newInventory),
      //                   status: newStatus,
      //                 };
      //               });

      //               return { ...forecastYear, weeks: updatedWeeks };
      //             }
      //           );

      //           return { ...product, forecast: updatedForecast };
      //         }
      //         return product;
      //       }),
      //     },
      //   })),

      // removeReorder: (variantId, year, weekNumber, reorderIndex) =>
      //   set((state) => ({
      //     products: {
      //       ...state.products,
      //       products: state.products?.products?.map((product) => {
      //         if (product?.variantId === variantId) {
      //           const currentDate = new Date();
      //           const currentYear = currentDate.getFullYear();
      //           const currentWeek = getWeekNumber(currentDate);

      //           let currentInventory = Number(product.inventory_quantity);

      //           const updatedForecast = product?.forecast?.map(
      //             (forecastYear) => {
      //               const sortedWeeks = [...(forecastYear?.weeks || [])].sort(
      //                 (a, b) => a?.week - b?.week
      //               );

      //               const updatedWeeks = sortedWeeks?.map((week) => {
      //                 const isCurrentWeek =
      //                   forecastYear?.year === currentYear &&
      //                   week?.week === currentWeek;
      //                 const isFutureWeek =
      //                   forecastYear?.year > currentYear ||
      //                   (forecastYear?.year === currentYear &&
      //                     week?.week >= currentWeek);
      //                 const isTargetWeek =
      //                   forecastYear?.year === year &&
      //                   week?.week === weekNumber;

      //                 if (!isFutureWeek && !isCurrentWeek) {
      //                   return week;
      //                 }

      //                 const updatedReorders = isTargetWeek
      //                   ? week?.reorders?.filter(
      //                       (_, idx) => idx !== reorderIndex
      //                     ) || []
      //                   : week?.reorders || [];

      //                 const prevYearSalesEntry = product?.sales
      //                   ?.find((s) => s?.year === forecastYear?.year - 1)
      //                   ?.weeks?.find((w) => w?.week === week?.week);
      //                 const prevYearSales = prevYearSalesEntry?.sales || 0;
      //                 const growth = prevYearSales * (week?.growthRate / 100);
      //                 const newExpectedSales =
      //                   Number(prevYearSales) + Number(Math.round(growth));

      //                 const reorderAmount = updatedReorders?.reduce(
      //                   (sum, r) => sum + r?.amount,
      //                   0
      //                 );

      //                 // Use the previous week's inventory for future weeks
      //                 const newInventory = Math.max(
      //                   0,
      //                   Number(currentInventory) -
      //                     Number(newExpectedSales) +
      //                     Number(reorderAmount)
      //                 );

      //                 // Update currentInventory for the next week
      //                 currentInventory = newInventory;

      //                 const newStatus =
      //                   newInventory <= 0
      //                     ? "critical"
      //                     : newInventory < week?.minStock
      //                     ? "warning"
      //                     : "good";

      //                 return {
      //                   ...week,
      //                   reorders: updatedReorders,
      //                   expectedSales: Number(newExpectedSales),
      //                   inventory: Number(newInventory),
      //                   calculatedStock: Number(newInventory),
      //                   status: newStatus,
      //                 };
      //               });

      //               return { ...forecastYear, weeks: updatedWeeks };
      //             }
      //           );

      //           return { ...product, forecast: updatedForecast };
      //         }
      //         return product;
      //       }),
      //     },
      //   })),

      // updateGrowthRateAndExpectedSales: (
      //   variantId,
      //   year,
      //   weekNumber,
      //   newGrowthRate
      // ) =>
      //   set((state) => ({
      //     products: {
      //       ...state.products,
      //       products: state.products?.products?.map((product) => {
      //         if (product?.variantId === variantId) {
      //           const currentDate = new Date();
      //           const currentYear = currentDate.getFullYear();
      //           const currentWeek = getWeekNumber(currentDate);

      //           let currentInventory = Number(product.inventory_quantity);

      //           const updatedForecast = product?.forecast?.map(
      //             (forecastYear) => {
      //               if (forecastYear?.year >= year) {
      //                 const sortedWeeks = [...(forecastYear?.weeks || [])].sort(
      //                   (a, b) => a?.week - b?.week
      //                 );

      //                 const updatedWeeks = sortedWeeks?.map((week) => {
      //                   const isCurrentWeek =
      //                     forecastYear?.year === currentYear &&
      //                     week?.week === currentWeek;
      //                   const isFutureWeek =
      //                     forecastYear?.year > currentYear ||
      //                     (forecastYear?.year === currentYear &&
      //                       week?.week >= currentWeek);
      //                   const isTargetWeek =
      //                     forecastYear?.year === year &&
      //                     week?.week === weekNumber;

      //                   if (!isFutureWeek && !isCurrentWeek) {
      //                     return week;
      //                   }

      //                   const growthRateToUse = isTargetWeek
      //                     ? newGrowthRate
      //                     : week?.growthRate;

      //                   const prevYearSalesEntry = product?.sales
      //                     ?.find((s) => s?.year === forecastYear?.year - 1)
      //                     ?.weeks?.find((w) => w?.week === week?.week);
      //                   const prevYearSales = prevYearSalesEntry?.sales || 0;

      //                   const growth = prevYearSales * (growthRateToUse / 100);
      //                   const newExpectedSales =
      //                     Number(prevYearSales) + Number(Math.round(growth));

      //                   const reorderAmount =
      //                     week?.reorders?.reduce(
      //                       (sum, r) => sum + r?.amount,
      //                       0
      //                     ) || 0;

      //                   // Use the previous week's inventory for future weeks
      //                   const newInventory = Math.max(
      //                     0,
      //                     Number(currentInventory) -
      //                       Number(newExpectedSales) +
      //                       Number(reorderAmount)
      //                   );

      //                   // Update currentInventory for the next week
      //                   currentInventory = newInventory;

      //                   const newStatus =
      //                     newInventory <= 0
      //                       ? "critical"
      //                       : newInventory < week?.minStock
      //                       ? "warning"
      //                       : "good";

      //                   return {
      //                     ...week,
      //                     growthRate: isTargetWeek
      //                       ? newGrowthRate
      //                       : week?.growthRate,
      //                     expectedSales: Number(newExpectedSales),
      //                     inventory: Number(newInventory),
      //                     calculatedStock: Number(newInventory),
      //                     status: newStatus,
      //                   };
      //                 });

      //                 return { ...forecastYear, weeks: updatedWeeks };
      //               }
      //               return forecastYear;
      //             }
      //           );

      //           return { ...product, forecast: updatedForecast };
      //         }
      //         return product;
      //       }),
      //     },
      //   })),

      updateGrowthRateAndExpectedSales: (
        variantId,
        year,
        weekNumber,
        newGrowthRate
      ) =>
        set((state) => {
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentWeek = getWeekNumber(currentDate);

          return {
            products: {
              ...state.products,
              products: state.products?.products?.map((product) => {
                if (product?.variantId === variantId) {
                  let currentInventory = Number(product.inventory_quantity);
                  let currentWeekStatus = product.currentWeekStatus || "good";
                  const reorderSet = new Set(); // Track unique reorder statuses

                  const updatedForecast = product?.forecast?.map(
                    (forecastYear) => {
                      if (forecastYear?.year >= year) {
                        const sortedWeeks = [
                          ...(forecastYear?.weeks || []),
                        ].sort((a, b) => a?.week - b?.week);

                        const updatedWeeks = sortedWeeks?.map((week) => {
                          const isCurrentWeek =
                            forecastYear?.year === currentYear &&
                            week?.week === currentWeek;
                          const isFutureWeek =
                            forecastYear?.year > currentYear ||
                            (forecastYear?.year === currentYear &&
                              week?.week >= currentWeek);
                          const isTargetWeek =
                            forecastYear?.year === year &&
                            week?.week === weekNumber;

                          // Add reorder statuses for current and future weeks
                          if (
                            (isCurrentWeek || isFutureWeek) &&
                            week?.reorders?.length > 0
                          ) {
                            week.reorders.forEach((reorder) => {
                              reorderSet.add(reorder.status);
                            });
                          }

                          if (!isFutureWeek && !isCurrentWeek) {
                            return week;
                          }

                          const growthRateToUse = isTargetWeek
                            ? newGrowthRate
                            : week?.growthRate;

                          const prevYearSalesEntry = product?.sales
                            ?.find((s) => s?.year === forecastYear?.year - 1)
                            ?.weeks?.find((w) => w?.week === week?.week);
                          const prevYearSales = prevYearSalesEntry?.sales || 0;

                          const growth =
                            prevYearSales * (growthRateToUse / 100);
                          const newExpectedSales =
                            Number(prevYearSales) + Number(Math.round(growth));

                          const reorderAmount =
                            week?.reorders?.reduce(
                              (sum, r) => sum + r?.amount,
                              0
                            ) || 0;

                          const newInventory = Math.max(
                            0,
                            Number(currentInventory) -
                              Number(newExpectedSales) +
                              Number(reorderAmount)
                          );

                          currentInventory = newInventory;

                          const newStatus =
                            newInventory <= 0
                              ? "critical"
                              : newInventory < week?.minStock
                              ? "warning"
                              : "good";

                          // Update currentWeekStatus if this is the current week
                          if (isCurrentWeek) {
                            currentWeekStatus = newStatus;
                          }

                          return {
                            ...week,
                            growthRate: isTargetWeek
                              ? newGrowthRate
                              : week?.growthRate,
                            expectedSales: Number(newExpectedSales),
                            inventory: Number(newInventory),
                            calculatedStock: Number(newInventory),
                            status: newStatus,
                          };
                        });

                        return { ...forecastYear, weeks: updatedWeeks };
                      }
                      return forecastYear;
                    }
                  );

                  return {
                    ...product,
                    forecast: updatedForecast,
                    currentWeekStatus,
                    reorderStatus: Array.from(reorderSet),
                  };
                }
                return product;
              }),
            },
          };
        }),

      getCurrentWeekStatus: (variantId) => {
        const state = useProductStore.getState();
        const product = state.products?.products?.find(
          (product) => product?.variantId === variantId
        );
        return product?.currentWeekStatus;
      },
      getForecastByVariantId: (variantId) => {
        const state = useProductStore.getState();
        const product = state.products?.products?.find(
          (product) => product?.variantId === variantId
        );
        return {
          forecast: product?.forecast || [],
          currentWeekStatus: product?.currentWeekStatus,
          reorderStatus: product?.reorderStatus,
        };
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    { name: "ProductStore" }
  )
);

export default useProductStore;
