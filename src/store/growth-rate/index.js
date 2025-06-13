import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

const indexedDBStorage = {
  getItem: async (name) => {
    const value = await get(name);
    return value ? JSON.parse(value) : null;
  },
  setItem: async (name, value) => {
    await set(name, JSON.stringify(value));
  },
  removeItem: async (name) => {
    await del(name);
  },
};

export const useGrowthRateChangesStore = create(
  persist(
    (set, get) => ({
      originalValues: {},
      changedWeeks: {},



      setOriginalValue: (variantId, weekKey, value) => {
        return set((state) => ({
          originalValues: {
            ...state.originalValues,
            [variantId]: {
              ...(state.originalValues[variantId] || {}),
              [weekKey]: value,
            },
          },
        }));
      },

      addChangedWeek: (variantId, weekKey) =>
        set((state) => ({
          changedWeeks: {
            ...state.changedWeeks,
            [variantId]: new Set(state.changedWeeks[variantId] || []).add(
              weekKey
            ),
          },
        })),

      revertWeek: (variantId, weekKey) =>
        set((state) => {
          const newChangedWeeks = { ...state.changedWeeks };
          const newOriginalValues = { ...state.originalValues };

          if (newChangedWeeks[variantId]) {
            newChangedWeeks[variantId].delete(weekKey);
            if (newChangedWeeks[variantId].size === 0) {
              delete newChangedWeeks[variantId];
            }
          }

          if (newOriginalValues[variantId]) {
            delete newOriginalValues[variantId][weekKey];
            if (Object.keys(newOriginalValues[variantId]).length === 0) {
              delete newOriginalValues[variantId];
            }
          }

          // Update IndexedDB by persisting the new state
          indexedDBStorage.setItem("growth-rate-changes-storage", {
            originalValues: newOriginalValues,
            changedWeeks: Object.fromEntries(
              Object.entries(newChangedWeeks).map(([key, value]) => [
                key,
                Array.from(value),
              ])
            ),
          });

          return {
            changedWeeks: newChangedWeeks,
            originalValues: newOriginalValues,
          };
        }),

      addBulkChanges: (variantIds, weekKeys) =>
        set((state) => {
          const newChangedWeeks = { ...state.changedWeeks };

          variantIds.forEach((variantId) => {
            weekKeys.forEach((weekKey) => {
              if (!newChangedWeeks[variantId]) {
                newChangedWeeks[variantId] = new Set();
              }
              newChangedWeeks[variantId].add(weekKey);
            });
          });

          return { changedWeeks: newChangedWeeks };
        }),

      clearChangesForVariants: (variantIds) =>
        set((state) => {
          const newChangedWeeks = { ...state.changedWeeks };
          const newOriginalValues = { ...state.originalValues };

          variantIds.forEach((id) => {
            delete newChangedWeeks[id];
            delete newOriginalValues[id];
          });

          return {
            changedWeeks: newChangedWeeks,
            originalValues: newOriginalValues,
          };
        }),

      isWeekChanged: (variantId, weekKey) => {
        return Boolean(get().changedWeeks[variantId]?.has(weekKey));
      },
      removeWeekData: (variantId, weekKey) =>
        set((state) => {
          const newChangedWeeks = { ...state.changedWeeks };
          const newOriginalValues = { ...state.originalValues };

          // Remove the specific weekKey from changedWeeks
          if (newChangedWeeks[variantId]) {
            newChangedWeeks[variantId].delete(weekKey);
            if (newChangedWeeks[variantId].size === 0) {
              delete newChangedWeeks[variantId];
            }
          }

          // Remove the specific weekKey from originalValues
          if (newOriginalValues[variantId]) {
            delete newOriginalValues[variantId][weekKey];
            if (Object.keys(newOriginalValues[variantId]).length === 0) {
              delete newOriginalValues[variantId];
            }
          }

          // Update IndexedDB by persisting the new state
          indexedDBStorage.setItem("growth-rate-changes-storage", {
            originalValues: newOriginalValues,
            changedWeeks: Object.fromEntries(
              Object.entries(newChangedWeeks).map(([key, value]) => [
                key,
                Array.from(value),
              ])
            ),
          });

          return {
            changedWeeks: newChangedWeeks,
            originalValues: newOriginalValues,
          };
        }),

      removeVariantsData: (variantIds) =>
        set((state) => {
          const newChangedWeeks = { ...state.changedWeeks };
          const newOriginalValues = { ...state.originalValues };

          variantIds.forEach((id) => {
            delete newChangedWeeks[id];
            delete newOriginalValues[id];
          });

          return {
            changedWeeks: newChangedWeeks,
            originalValues: newOriginalValues,
          };
        }),
    }),
    {
      name: "growth-rate-changes-storage",
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        originalValues: state.originalValues,
        changedWeeks: Object.fromEntries(
          Object.entries(state.changedWeeks).map(([key, value]) => [
            key,
            Array.from(value),
          ])
        ),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
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
);
