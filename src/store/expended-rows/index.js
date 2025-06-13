import { create } from 'zustand';

const useExpandedRowsStore = create((set) => ({
  expandedRows: new Set(),
  toggleExpandedRow: (variantId) =>
    set((state) => {
      const newExpandedRows = new Set(state.expandedRows);
      if (newExpandedRows.has(variantId)) {
        newExpandedRows.delete(variantId);
      } else {
        newExpandedRows.add(variantId);
      }
      return { expandedRows: newExpandedRows };
    }),
  expandRow: (variantId) =>
    set((state) => {
      const newExpandedRows = new Set(state.expandedRows);
      newExpandedRows.add(variantId);
      return { expandedRows: newExpandedRows };
    }),
  collapseRow: (variantId) =>
    set((state) => {
      const newExpandedRows = new Set(state.expandedRows);
      newExpandedRows.delete(variantId);
      return { expandedRows: newExpandedRows };
    }),
  clearExpandedRows: () => set({ expandedRows: new Set() }),
}));

export default useExpandedRowsStore;