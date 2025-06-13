import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const useMinStockChangesStore = create(
  devtools(
    persist(
      (set, get) => ({
        changedMinStockWeeks: {},
        originalMinStockValues: {},

        addChangedMinStockWeek: (variantId, weekKey) => {
          if (!variantId || !weekKey) {
            console.warn("Invalid variantId or weekKey:", {
              variantId,
              weekKey,
            });
            return;
          }
          set((state) => {
            const currentWeeks = state.changedMinStockWeeks[variantId]
              ? new Set(state.changedMinStockWeeks[variantId])
              : new Set();
            currentWeeks.add(weekKey);
            return {
              changedMinStockWeeks: {
                ...state.changedMinStockWeeks,
                [variantId]: currentWeeks,
              },
            };
          });
        },

        removeVariant: (variantId) => {
          if (!variantId) {
            console.warn("Invalid variantId:", { variantId });
            return;
          }
          set((state) => {
            const updatedChangedMinStockWeeks = {
              ...state.changedMinStockWeeks,
            };
            const updatedOriginalMinStockValues = {
              ...state.originalMinStockValues,
            };

            // Remove variantId from both stores
            delete updatedChangedMinStockWeeks[variantId];
            delete updatedOriginalMinStockValues[variantId];

            return {
              changedMinStockWeeks: updatedChangedMinStockWeeks,
              originalMinStockValues: updatedOriginalMinStockValues,
            };
          });
        },

        setOriginalMinStockValue: (variantId, weekKey, value) => {
          if (!variantId || !weekKey) {
            console.warn("Invalid variantId or weekKey:", {
              variantId,
              weekKey,
            });
            return;
          }

          set((state) => {
            const currentValues = state.originalMinStockValues[variantId] || {};

            return {
              originalMinStockValues: {
                ...state.originalMinStockValues,
                [variantId]: {
                  ...currentValues,
                  [weekKey]: value,
                },
              },
            };
          });
        },

        // setOriginalMinStockValue: (variantId, weekKey, value) => {
        //   if (!variantId || !weekKey) {
        //     console.warn('Invalid variantId or weekKey:', { variantId, weekKey });
        //     return;
        //   }
        //   set((state) => {
        //     const currentValues = state.originalMinStockValues[variantId] || {};
        //     // Only set the original value if it hasn't been set before to avoid overwriting
        //     if (currentValues[weekKey] === undefined) {
        //       return {
        //         originalMinStockValues: {
        //           ...state.originalMinStockValues,
        //           [variantId]: {
        //             ...currentValues,
        //             [weekKey]: value,
        //           },
        //         },
        //       };
        //     }
        //     return state; // No change if value already exists
        //   });
        // },

        revertMinStockWeek: (variantId, weekKey) => {
          if (!variantId || !weekKey) {
            console.warn("Invalid variantId or weekKey:", {
              variantId,
              weekKey,
            });
            return;
          }
          set((state) => {
            const currentWeeks = state.changedMinStockWeeks[variantId]
              ? new Set(state.changedMinStockWeeks[variantId])
              : new Set();
            currentWeeks.delete(weekKey);

            const updatedOriginalValues = {
              ...state.originalMinStockValues,
              [variantId]: {
                ...(state.originalMinStockValues[variantId] || {}),
              },
            };
            delete updatedOriginalValues[variantId][weekKey];

            const updatedChangedMinStockWeeks = {
              ...state.changedMinStockWeeks,
              [variantId]: currentWeeks,
            };

            if (currentWeeks.size === 0) {
              delete updatedChangedMinStockWeeks[variantId];
            }
            if (Object.keys(updatedOriginalValues[variantId]).length === 0) {
              delete updatedOriginalValues[variantId];
            }

            return {
              changedMinStockWeeks: updatedChangedMinStockWeeks,
              originalMinStockValues: updatedOriginalValues,
            };
          });
        },

        clearStore: () => {
          set({
            changedMinStockWeeks: {},
            originalMinStockValues: {},
          });
        },

        getOriginalMinStockValue: (variantId, weekKey) => {
          const state = get();
          return state.originalMinStockValues[variantId]?.[weekKey] ?? null;
        },
      }),
      {
        name: "min-stock-changes-storage", // Unique key for localStorage
        partialize: (state) => ({
          changedMinStockWeeks: Object.fromEntries(
            Object.entries(state.changedMinStockWeeks).map(([key, value]) => [
              key,
              Array.from(value),
            ])
          ),
          originalMinStockValues: state.originalMinStockValues,
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.changedMinStockWeeks) {
            state.changedMinStockWeeks = Object.fromEntries(
              Object.entries(state.changedMinStockWeeks).map(([key, value]) => [
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

export default useMinStockChangesStore;
