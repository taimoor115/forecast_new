import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import useProductStore from "../../store/products";
import { useQueryParamsManager } from "../context/params";
import YearDropdown from "../year-dropdown";
import ProviderDropdown from "./provider-dropdown";
import StatusFilters from "./status-checkbox";
import ZoomDropdown from "./zoom-dropdown";

const FilterSection = ({ zoomLevel, setZoomLevel }) => {
  const { queryParams: params, updateQueryParams } = useQueryParamsManager();

  const { loading = false } = useProductStore((state) => state);

  const [localSearchTerm, setLocalSearchTerm] = useState(
    params.searchTerm ?? ""
  );

  useEffect(() => {
    if (localSearchTerm === "") {
      handleSearch();
    }
  }, [localSearchTerm]);
  const handleSearch = () => {
    updateQueryParams("search", localSearchTerm);
    updateQueryParams("page", 1);
    updateQueryParams("inventoryStatus", ["total"]);
  };

  return (
    <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-3">
      <div className="p-6 bg-white rounded-3xl shadow-sm">
        <div className="mb-3 text-gray-6">Suche</div>
        <div className="relative">
          <input
            type="text"
            value={localSearchTerm}
            disabled={loading}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Was für eine Artikelnummer suche?"
            className="flex justify-between items-center p-3 pl-4 w-full text-sm bg-white rounded-xl border shadow-sm border-gray-6 focus:outline-none hover:border-purple-500"
            aria-label="Artikelnummer suchen"
          />

          <Search
            onClick={handleSearch}
            className="absolute top-3 right-5 cursor-pointer"
            size={20}
          />
        </div>
      </div>

      <div className="p-6 bg-white rounded-3xl shadow-sm">
        <div className="mb-3 text-gray-6">Anbieter</div>
        <ProviderDropdown />
        <StatusFilters />
      </div>

      <div className="p-6 bg-white rounded-3xl shadow-sm">
        <div className="mb-3 text-gray-6">Zoom</div>
        <ZoomDropdown zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      </div>

      <div className="p-6 bg-white rounded-3xl shadow-sm">
        <div className="mb-3 text-gray-6">Jahr</div>
        <YearDropdown />
      </div>
    </div>
  );
};

export default FilterSection;
