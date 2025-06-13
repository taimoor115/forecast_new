import React, { createContext, useCallback, useContext, useState } from "react";

const defaultQueryParams = {
  search: "",
  products: [],
  selectedProviders: [],
  statusFilters: [],
  inventoryStatus: ["total"],
  page: 1,
  year: 2025,
};

const QueryParamsContext = createContext();

export const QueryParamsProvider = ({ children }) => {
  const [queryParams, setQueryParams] = useState(defaultQueryParams);

  const ALL_STATUSES = ["HPL", "MA", "VA", "S"];

  const updateQueryParams = useCallback((keyOrObject, value) => {
    if (typeof keyOrObject === 'object') {
      // Handle batch update
      setQueryParams(prev => ({ ...prev, ...keyOrObject }));
    } else {
      // Handle single update
      setQueryParams(prev => ({
        ...prev,
        [keyOrObject]: value,
      }));
    }
  }, []);

  const toggleArrayItem = useCallback((key, item) => {
    setQueryParams((prev) => {
      const currentArray = prev[key] || [];
      const updatedArray = currentArray.includes(item)
        ? currentArray.filter((i) => i !== item)
        : [...currentArray, item];
      return { ...prev, [key]: updatedArray };
    });
  }, []);

  const resetQueryParams = useCallback(() => {
    setQueryParams(defaultQueryParams);
  }, []);

  const toggleAllStatusFilters = useCallback(() => {
    setQueryParams((prev) => ({
      ...prev,
      statusFilters:
        prev.statusFilters.length === ALL_STATUSES.length ? [] : ALL_STATUSES,
    }));
  }, []);

  const value = {
    queryParams,
    updateQueryParams,
    toggleArrayItem,
    resetQueryParams,
    toggleAllStatusFilters,
  };

  return (
    <QueryParamsContext.Provider value={value}>
      {children}
    </QueryParamsContext.Provider>
  );
};

export const useQueryParamsManager = () => {
  const context = useContext(QueryParamsContext);
  if (!context) {
    throw new Error(
      "useQueryParamsManager must be used within a QueryParamsProvider"
    );
  }
  return context;
};
