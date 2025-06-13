import { useCallback } from "react";
import { DashboardCard } from "../../components";
import useProductStore from "../../store/products";
import { useQueryParamsManager } from "../context/params";

const DashboardHeader = () => {
  const { queryParams, updateQueryParams } = useQueryParamsManager();
  const { inventoryStatus: stock = {} } = useProductStore();

  const statusOptions = [
    {
      title: "Alle anzeigen",
      value: stock?.total || 0,
      key: "total",
      color: "text-black",
    },
    {
      title: "Ausreichender Bestand",
      value: stock?.sufficient || 0,
      key: "sufficient",
      color: "text-green-500",
    },
    {
      title: "Geringer Bestand",
      value: stock?.low || 0,
      key: "low",
      color: "text-yellow-500",
    },
    {
      title: "Kritischer Bestand",
      value: stock?.critical || 0,
      key: "critical",
      color: "text-red-500",
    },
  ];

  const handleCardClick = useCallback(
    (key) => {
      let currentStatus = Array.isArray(queryParams.inventoryStatus)
        ? [...queryParams.inventoryStatus]
        : [queryParams.inventoryStatus || "total"];

      let newStatus = currentStatus;

      if (key === "total") {
        if (currentStatus.includes("total")) {
          newStatus = [];
        } else {
          newStatus = ["total"];
        }
      } else {
        if (currentStatus.includes(key)) {
          newStatus = newStatus.filter(
            (status) => status !== key && status !== "total"
          );
        } else {
          newStatus = newStatus.filter((status) => status !== "total");
          newStatus.push(key);

          const selectedSet = new Set(newStatus);
          if (
            selectedSet.has("sufficient") &&
            selectedSet.has("low") &&
            selectedSet.has("critical")
          ) {
            newStatus = ["total"];
          }
        }
      }

      if (newStatus.length === 0) {
        newStatus = ["total"];
      }

      updateQueryParams({
        inventoryStatus: newStatus,
        page: 1,
      });
    },
    [queryParams, updateQueryParams]
  );

  return (
    <>
      <div className="flex gap-x-2 justify-between mb-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 xl:grid-cols-4">
        {statusOptions.map(({ title, value, key, color }) => (
          <DashboardCard
            key={key}
            title={title}
            value={value}
            color={color}
            isActive={queryParams.inventoryStatus.includes(key)}
            onClick={() => handleCardClick(key)}
          />
        ))}
      </div>
    </>
  );
};

export default DashboardHeader;
