import React, { memo } from "react";
import { useQueryParamsManager } from "../context/params";
import useProductStore from "../../store/products";

const StatusCheckbox = memo(
  ({ status, checked, onChange, backgroundColor }) => {
    const { loading = false } = useProductStore((state) => state);
    return (
      <div
        className="flex items-center px-3 py-1 rounded-lg cursor-pointer"
        style={{ backgroundColor }}
      >
        <input
          type="checkbox"
          disabled={loading}
          id={`status-${status}`}
          checked={checked}
          onChange={onChange}
          className="mr-2 w-4 h-4 rounded border-gray-300 cursor-pointer accent-purple-600"
        />
        <label
          htmlFor={`status-${status}`}
          className="text-sm font-medium cursor-pointer text-gray-6"
        >
          {status}
        </label>
      </div>
    );
  }
);

const StatusFilters = memo(() => {
  const {
    queryParams,
    toggleArrayItem,
    toggleAllStatusFilters,
    updateQueryParams,
  } = useQueryParamsManager();
  const { statusFilters } = queryParams;

  const { loading = false } = useProductStore((state) => state);

  const allStatuses = ["HPL", "MA", "VA", "S"];
  const handleStatusChange = (status) => {
    if (loading) return;
    toggleArrayItem("statusFilters", status);
    updateQueryParams("page", 1);
    updateQueryParams("inventoryStatus", ["total"]);
  };

  const areAllSelected = allStatuses.every((status) =>
    statusFilters.includes(status)
  );

  return (
    <div className="mt-3">
      <div className="mb-2 text-sm font-medium text-gray-6">
        Status-Filter
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center px-3 py-1 bg-gray-100 rounded-lg">
          <input
            type="checkbox"
            id="all-status"
            checked={areAllSelected}
            disabled={loading}
            onChange={toggleAllStatusFilters}
            className="mr-2 w-4 h-4 cursor-pointer accent-purple-600"
          />
          <label
            htmlFor="all-status"
            className="text-sm font-medium cursor-pointer text-gray-6"
          >
            ALLE
          </label>
        </div>

        {allStatuses.map((status) => {
          const backgroundColor =
            status === "HPL"
              ? "rgb(254, 226, 226)"
              : status === "MA"
              ? "rgb(254, 240, 138)"
              : status === "VA"
              ? "rgb(219, 234, 254)"
              : "rgb(220, 252, 231)";

          return (
            <StatusCheckbox
              key={status}
              status={status}
              checked={statusFilters.includes(status)}
              onChange={() => handleStatusChange(status)}
              backgroundColor={backgroundColor}
            />
          );
        })}

        <button
          onClick={() => updateQueryParams("statusFilters", [])}
          className="px-3 py-1 mt-2 text-sm text-white bg-purple-600 rounded-xl md:px-5"
        >
          Zurücksetzen
        </button>
      </div>
    </div>
  );
});

export default StatusFilters;
