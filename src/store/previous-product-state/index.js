import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

const usePreviousProductStore = create(
  persist(
    (set, get) => ({
      previousProducts: {},

      savePreviousProducts: (variantIds, products, getCurrentWeekStatus) => {
        set((state) => {
          const newPreviousProducts = { ...state.previousProducts };
          variantIds.forEach((variantId) => {
            const product = products.find((p) => p.variantId === variantId);
            if (product) {
              newPreviousProducts[variantId] = {
                variantId: product.variantId,
                forecastByYear: product.forecast,
                // sales: product.sales,
                currentWeekStatus: getCurrentWeekStatus(variantId),
              };
            }
          });
          return { previousProducts: newPreviousProducts };
        });
      },
      removeVariant: (variantId) =>
        set((state) => {
          const updatedProducts = { ...state.previousProducts };
          delete updatedProducts[variantId];
          
          // Update IndexedDB by persisting the new state
          set("previous-products-storage", JSON.stringify({ previousProducts: updatedProducts }));
          
          return { previousProducts: updatedProducts };
        }),

      getExistingVariantIdsCount: (variantIds) => {
        const { previousProducts } = get();
        const idsArray = Array.from(variantIds);
        const existingIds = idsArray.filter((id) => id in previousProducts);
        return {
          ids: existingIds,
          count: existingIds.length,
        };
      },

      getPreviousProduct: (variantId) => {
        const { previousProducts } = get();
        return previousProducts[variantId] || null;
      },

      getPreviousProducts: (variantIds) => {
        const { previousProducts } = get();
        return Array.from(variantIds).map((variantId) => ({
          variantId,
          ...(previousProducts[variantId] || {}),
        }));
      },

      filterAndRemoveProducts: (variantIdsToRemove) => {
        set((state) => {
          const updatedProducts = { ...state.previousProducts };
          const idsToRemove = new Set(Array.from(variantIdsToRemove));
          idsToRemove.forEach((id) => {
            delete updatedProducts[id];
          });
          return { previousProducts: updatedProducts };
        });
      },

      revertToPrevious: (variantIds) =>
        set((state) => {
          const updatedProducts = { ...state.previousProducts };
          variantIds.forEach((variantId) => {
            delete updatedProducts[variantId];
          });
          return { previousProducts: updatedProducts };
        }),

      clearPreviousProducts: () => set({ previousProducts: {} }),
    }),
    {
      name: "previous-products-storage",
      storage: {
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
      },
    }
  )
);

export default usePreviousProductStore;
