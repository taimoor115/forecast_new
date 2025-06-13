import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { DownSvg } from "../../assets/svgs";
import { providers } from "../../constant/home";
import { useOutsideClick } from "../../hooks";
import useProductStore from "../../store/products";
import { useQueryParamsManager } from "../context/params";

const ProviderDropdown = memo(() => {
  const { queryParams, toggleArrayItem, updateQueryParams } =
    useQueryParamsManager();
  const { selectedProviders } = queryParams;
  const [showAllProviders, setShowAllProviders] = useState(false);
  const { loading = false } = useProductStore((state) => state);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useOutsideClick(dropdownRef, () => {
    setIsOpen(false);
    setSearchTerm("");
  });

  const filteredProviders = useMemo(() => {
    if (!searchTerm) return providers;
    return providers.filter((provider) =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const selectedProviderList = useMemo(() => {
    return providers.filter((p) => selectedProviders.includes(p.id));
  }, [selectedProviders]);

  const unselectedProviders = useMemo(() => {
    return filteredProviders.filter((p) => !selectedProviders.includes(p.id));
  }, [filteredProviders, selectedProviders]);

  const handleProviderClick = useCallback(
    (providerId) => {
      if (loading) return;
      toggleArrayItem("selectedProviders", providerId);
      updateQueryParams("page", 1);
      updateQueryParams("inventoryStatus", ["total"]);
    },
    [toggleArrayItem, loading, updateQueryParams]
  );

  const selectedNames = useMemo(() => {
    return (
      selectedProviderList.map((p) => p.name).join(", ") || "Anbieter auswählen"
    );
  }, [selectedProviderList]);

  return (
    <div className="relative w-full max-w-md font-sans" ref={dropdownRef}>
      {selectedProviderList.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedProviderList.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center px-3 py-1 text-sm text-white bg-purple-600 rounded-full"
            >
              <span>{provider.name}</span>
              <button
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleProviderClick(provider.id);
                }}
                className="ml-2 text-gray-500 hover:text-purple-200 focus:outline-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className="flex justify-between items-center p-3 w-full bg-white rounded-xl border shadow-sm transition-colors cursor-pointer border-gray-6 hover:border-purple-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium truncate text-gray-6">
          {selectedNames}
        </span>
        <DownSvg fill="gray" />
      </div>

      {isOpen && (
        <div className="overflow-y-auto absolute z-30 mt-2 w-full max-h-80 bg-white rounded-xl border shadow-lg border-gray-6">
          <div className="p-3 border-b border-gray-6">
            <input
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-2 w-full text-sm rounded-lg border border-gray-6 focus:outline-none focus:ring-0 focus:ring-purple-500"
            />
          </div>

          {filteredProviders.length > 0 ? (
            <>
              {selectedProviderList.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center px-4 py-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProviderClick(provider.id);
                  }}
                >
                  <input
                    type="checkbox"
                    disabled={loading }
                    checked={true}
                    onChange={() => {}}
                    className="mr-3 w-4 h-4 cursor-pointer accent-purple-600"
                  />
                  <span className="text-sm font-medium text-gray-6">
                    {provider.name}
                  </span>
                </div>
              ))}
              {unselectedProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center px-4 py-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProviderClick(provider.id);
                  }}
                >
                  <input
                    type="checkbox"
                    disabled={loading}
                    checked={false}
                    onChange={() => {}}
                    className="mr-3 w-4 h-4 cursor-pointer accent-purple-600"
                  />
                  <span className="text-sm font-medium text-gray-6">
                    {provider.name}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-6">
              No providers found
            </div>
          )}

          {!showAllProviders && filteredProviders.length > 5 && (
            <div
              className="px-4 py-2 text-sm text-center text-purple-600 border-t cursor-pointer border-gray-6 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setShowAllProviders(true);
              }}
            >
              Mehr anzeigen
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default ProviderDropdown;
