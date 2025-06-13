import { useQueryParamsManager } from "../context/params";

const SelectedSupplierTags = () => {
  const { queryParams, updateQueryParams } = useQueryParamsManager();
  const { selectedProviders } = queryParams;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {Array.from(selectedProviders).map((id) => {
        const supplier = { id, name: `Supplier ${id}` }; 
        return (
          <div
            key={id}
            className="flex gap-2 items-center px-3 py-1 text-sm text-purple-800 bg-purple-100 rounded-full"
          >
            <span>{supplier?.name}</span>
            <button
              onClick={() => {
                const newSelected = new Set(selectedProviders);
                newSelected.delete(id);
                updateQueryParams("selectedProviders", Array.from(newSelected));
              }}
              className="text-purple-600 hover:text-purple-800"
              aria-label="Entfernen"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default SelectedSupplierTags;
