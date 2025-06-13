import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const useExpectedSalesChangesStore = create(
  devtools(
    persist(
      (set, get) => ({
        changedWeeks: {},
        originalValues: {
          growthRate: {},
          expectedSales: {},
        },

        addChangedWeek: (variantId, weekKey) => {
          if (!variantId || !weekKey) {
            console.warn("Invalid variantId or weekKey:", {
              variantId,
              weekKey,
            });
            return;
          }
          set((state) => {
            const currentWeeks = state.changedWeeks[variantId]
              ? new Set(state.changedWeeks[variantId])
              : new Set();
            currentWeeks.add(weekKey);
            return {
              changedWeeks: {
                ...state.changedWeeks,
                [variantId]: currentWeeks,
              },
            };
          });
        },

        setOriginalGrowthRateValue: (variantId, weekKey, value) => {
          if (!variantId || !weekKey) {
            console.warn("Invalid variantId or weekKey:", {
              variantId,
              weekKey,
            });
            return;
          }

          set((state) => {
            const currentGrowthRateValues =
              state.originalValues.growthRate[variantId] || {};

            return {
              originalValues: {
                ...state.originalValues,
                growthRate: {
                  ...state.originalValues.growthRate,
                  [variantId]: {
                    ...currentGrowthRateValues,
                    [weekKey]: value,
                  },
                },
              },
            };
          });
        },

        // setOriginalGrowthRateValue: (variantId, weekKey, value) => {
        //   if (!variantId || !weekKey) {
        //     console.warn("Invalid variantId or weekKey:", {
        //       variantId,
        //       weekKey,
        //     });
        //     return;
        //   }
        //   set((state) => {
        //     const currentGrowthRateValues =
        //       state.originalValues.growthRate[variantId] || {};
        //     if (currentGrowthRateValues[weekKey] === undefined) {
        //       return {
        //         originalValues: {
        //           ...state.originalValues,
        //           growthRate: {
        //             ...state.originalValues.growthRate,
        //             [variantId]: {
        //               ...currentGrowthRateValues,
        //               [weekKey]: value,
        //             },
        //           },
        //         },
        //       };
        //     }
        //     return state;
        //   });
        // },

        setOriginalExpectedSalesValue: (variantId, weekKey, value) => {
          if (!variantId || !weekKey) {
            console.warn("Invalid variantId or weekKey:", {
              variantId,
              weekKey,
            });
            return;
          }
        
          set((state) => {
            const currentExpectedSalesValues =
              state.originalValues.expectedSales[variantId] || {};
        
            return {
              originalValues: {
                ...state.originalValues,
                expectedSales: {
                  ...state.originalValues.expectedSales,
                  [variantId]: {
                    ...currentExpectedSalesValues,
                    [weekKey]: value,
                  },
                },
              },
            };
          });
        },
        
        // setOriginalExpectedSalesValue: (variantId, weekKey, value) => {
        //   if (!variantId || !weekKey) {
        //     console.warn("Invalid variantId or weekKey:", {
        //       variantId,
        //       weekKey,
        //     });
        //     return;
        //   }
        //   set((state) => {
        //     const currentExpectedSalesValues =
        //       state.originalValues.expectedSales[variantId] || {};
        //     if (currentExpectedSalesValues[weekKey] === undefined) {
        //       return {
        //         originalValues: {
        //           ...state.originalValues,
        //           expectedSales: {
        //             ...state.originalValues.expectedSales,
        //             [variantId]: {
        //               ...currentExpectedSalesValues,
        //               [weekKey]: value,
        //             },
        //           },
        //         },
        //       };
        //     }
        //     return state;
        //   });
        // },
        removeVariantsData: (variantIds) => {
          if (!Array.isArray(variantIds) || variantIds.length === 0) {
            console.warn("Invalid variantIds array:", variantIds);
            return;
          }

          set((state) => {
            const updatedChangedWeeks = { ...state.changedWeeks };
            const updatedGrowthRate = { ...state.originalValues.growthRate };
            const updatedExpectedSales = {
              ...state.originalValues.expectedSales,
            };

            variantIds.forEach((variantId) => {
              delete updatedChangedWeeks[variantId];
              delete updatedGrowthRate[variantId];
              delete updatedExpectedSales[variantId];
            });

            return {
              changedWeeks: updatedChangedWeeks,
              originalValues: {
                growthRate: updatedGrowthRate,
                expectedSales: updatedExpectedSales,
              },
            };
          });
        },

        revertWeek: (variantId, weekKey) => {
          if (!variantId || !weekKey) {
            console.warn("Invalid variantId or weekKey:", {
              variantId,
              weekKey,
            });
            return;
          }
          set((state) => {
            const currentWeeks = state.changedWeeks[variantId]
              ? new Set(state.changedWeeks[variantId])
              : new Set();
            currentWeeks.delete(weekKey);

            const updatedOriginalValues = {
              growthRate: {
                ...state.originalValues.growthRate,
                [variantId]: {
                  ...(state.originalValues.growthRate[variantId] || {}),
                },
              },
              expectedSales: {
                ...state.originalValues.expectedSales,
                [variantId]: {
                  ...(state.originalValues.expectedSales[variantId] || {}),
                },
              },
            };
            delete updatedOriginalValues.growthRate[variantId][weekKey];
            delete updatedOriginalValues.expectedSales[variantId][weekKey];

            const updatedChangedWeeks = {
              ...state.changedWeeks,
              [variantId]: currentWeeks,
            };

            if (currentWeeks.size === 0) {
              delete updatedChangedWeeks[variantId];
            }
            if (
              Object.keys(updatedOriginalValues.growthRate[variantId])
                .length === 0
            ) {
              delete updatedOriginalValues.growthRate[variantId];
            }
            if (
              Object.keys(updatedOriginalValues.expectedSales[variantId])
                .length === 0
            ) {
              delete updatedOriginalValues.expectedSales[variantId];
            }

            return {
              changedWeeks: updatedChangedWeeks,
              originalValues: updatedOriginalValues,
            };
          });
        },

        clearStore: () => {
          set({
            changedWeeks: {},
            originalValues: {
              growthRate: {},
              expectedSales: {},
            },
          });
        },

        getOriginalGrowthRateValue: (variantId, weekKey) => {
          const state = get();
          return state.originalValues.growthRate[variantId]?.[weekKey] ?? null;
        },

        getOriginalExpectedSalesValue: (variantId, weekKey) => {
          const state = get();
          return (
            state.originalValues.expectedSales[variantId]?.[weekKey] ?? null
          );
        },
        removeWeekData: (variantId, weekKey) => {
          if (!variantId || !weekKey) {
            console.warn("Invalid variantId or weekKey:", {
              variantId,
              weekKey,
            });
            return;
          }
          set((state) => {
            const currentWeeks = state.changedWeeks[variantId]
              ? new Set(state.changedWeeks[variantId])
              : new Set();
            currentWeeks.delete(weekKey);

            const updatedOriginalValues = {
              growthRate: {
                ...state.originalValues.growthRate,
                [variantId]: {
                  ...(state.originalValues.growthRate[variantId] || {}),
                },
              },
              expectedSales: {
                ...state.originalValues.expectedSales,
                [variantId]: {
                  ...(state.originalValues.expectedSales[variantId] || {}),
                },
              },
            };
            delete updatedOriginalValues.growthRate[variantId][weekKey];
            delete updatedOriginalValues.expectedSales[variantId][weekKey];

            const updatedChangedWeeks = {
              ...state.changedWeeks,
              [variantId]: currentWeeks,
            };

            if (currentWeeks.size === 0) {
              delete updatedChangedWeeks[variantId];
            }
            if (
              Object.keys(updatedOriginalValues.growthRate[variantId])
                .length === 0
            ) {
              delete updatedOriginalValues.growthRate[variantId];
            }
            if (
              Object.keys(updatedOriginalValues.expectedSales[variantId])
                .length === 0
            ) {
              delete updatedOriginalValues.expectedSales[variantId];
            }

            return {
              changedWeeks: updatedChangedWeeks,
              originalValues: updatedOriginalValues,
            };
          });
        },

        getOriginalValuesForWeek: (variantId, week) => {
          if (!variantId || !week || !week.year || !week.weekNumber) {
            console.warn("Invalid variantId or week:", { variantId, week });
            return { growthRate: null, expectedSales: null };
          }
          const weekKey = `${week.year}-${week.weekNumber}`;
          const state = get();
          return {
            growthRate:
              state.originalValues.growthRate[variantId]?.[weekKey] ?? null,
            expectedSales:
              state.originalValues.expectedSales[variantId]?.[weekKey] ?? null,
          };
        },
      }),
      {
        name: "expected-sales-changes-storage",
        partialize: (state) => ({
          changedWeeks: Object.fromEntries(
            Object.entries(state.changedWeeks).map(([key, value]) => [
              key,
              Array.from(value),
            ])
          ),
          originalValues: state.originalValues,
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.changedWeeks) {
            state.changedWeeks = Object.fromEntries(
              Object.entries(state.changedWeeks).map(([key, value]) => [
                key,
                new Set(value),
              ])
            );
          }
        },
      }
    )
  )
);

export default useExpectedSalesChangesStore;
