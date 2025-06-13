import React, { useCallback, useEffect, useMemo, useState } from "react";
import PreviousSvg from "../../assets/svgs/previous";
import { expandedRowsConfig } from "../../config/table-config";
import { deliveryTimeOptions } from "../../constant/table";
import { useUpdateProduct } from "../../hooks";
import useExpectedSalesChangesStore from "../../store/expected-sales/usePreviousExpectedSales";
import useExpandedRowsStore from "../../store/expended-rows";
import { useGrowthRateChangesStore } from "../../store/growth-rate";
import useMinStockChangesStore from "../../store/min-stock/useRevetMinStock";
import useProductStore from "../../store/products";
import { calculateStock } from "../../utils/calculate-stock";
import { isPastWeek } from "../../utils/check-past-week";
import { getWeekNumber } from "../../utils/get-current-week-number";
import { getInventoryStatus } from "../../utils/get-inventory-status";
import GrowthRateInput from "./growth-rate-input";
import ReorderForm from "./reorder-form";
import ReorderItem from "./reorder-item";
import RowHeader from "./row-headers";
import StatusIndicator from "./status-indicator";
import { toast } from "sonner";

const TableRow = ({
  inventoryItem,
  getWeeks,
  zoomLevel,
  searchTerm,
  isSearchMatch,
}) => {
  const {
    updateDeliveryTimeWithMinStock,
    removeReorder,
    addReorderAndUpdateForecast,
    updateGrowthRateAndExpectedSales,
    getForecastByVariantId,
    toggleSelectedVariant,
    calculateCurrentWeekStatus,
    selectedVariantsIds: selectedItems,
    setProducts,
  } = useProductStore((state) => state);

  const {
    changedMinStockWeeks,
    revertMinStockWeek,
    getOriginalMinStockValue,
    removeVariant,
  } = useMinStockChangesStore();

  const {
    changedWeeks,
    revertWeek,
    getOriginalExpectedSalesValue,
    getOriginalValuesForWeek,
    removeWeekData: removeExpectedSales,
  } = useExpectedSalesChangesStore();

  useEffect(() => {
    const newLocalGrowthRates = {};
    const newLocalExpectedSales = {};
    if (inventoryItem.forecast) {
      inventoryItem.forecast.forEach((forecastYear) => {
        forecastYear.weeks.forEach((week) => {
          const weekKey = `${forecastYear.year}-${week.week}`;
          if (
            newLocalGrowthRates[weekKey] === undefined ||
            newLocalGrowthRates[weekKey] !== String(week.growthRate)
          ) {
            newLocalGrowthRates[weekKey] = String(week.growthRate || 0);
          }
          if (
            newLocalExpectedSales[weekKey] === undefined ||
            newLocalExpectedSales[weekKey] !== String(week.expectedSales)
          ) {
            newLocalExpectedSales[weekKey] = String(week.expectedSales || 0);
          }
        });
      });
    }
    setLocalGrowthRates(newLocalGrowthRates);
    setLocalExpectedSales(newLocalExpectedSales);
  }, [inventoryItem.forecast]);

  const searchableFields = ["productName", "sku", "variantId"];

  const matchFields = useMemo(() => {
    if (!searchTerm || !isSearchMatch) return [];
    const searchLower = searchTerm.toLowerCase();
    return searchableFields.filter((field) =>
      inventoryItem[field]?.toString().toLowerCase().includes(searchLower)
    );
  }, [searchTerm, isSearchMatch, inventoryItem]);

  const shouldHighlight = useCallback(
    (fieldName) => matchFields.includes(fieldName),
    [matchFields]
  );

  const { expandedRows, toggleExpandedRow } = useExpandedRowsStore();
  const {
    setOriginalValue,
    addChangedWeek: addGrowthRateChangedWeek,
    revertWeek: revertGrowthRateWeek,
    changedWeeks: growthRateChangedWeeks,
    originalValues: growthRateOriginalValues,
    removeWeekData,
  } = useGrowthRateChangesStore();

  const getOriginalGrowthRateValue =
    growthRateOriginalValues[inventoryItem.variantId] || {};
  const isGrowthRateChanged = useCallback(
    (weekKey) =>
      growthRateChangedWeeks[inventoryItem.variantId]?.has(weekKey) || false,
    [growthRateChangedWeeks, inventoryItem.variantId]
  );

  const isMinStockChanged = useCallback(
    (weekKey) =>
      changedMinStockWeeks[inventoryItem.variantId]?.has(weekKey) || false,
    [changedMinStockWeeks, inventoryItem.variantId]
  );

  const isExpectedSalesChanged = useCallback(
    (weekKey) => changedWeeks[inventoryItem.variantId]?.has(weekKey) || false,
    [changedWeeks, inventoryItem.variantId]
  );

  const { updateProduct, loading } = useUpdateProduct();

  const [localGrowthRates, setLocalGrowthRates] = useState({});
  const [localExpectedSales, setLocalExpectedSales] = useState({});
  const [reorderQtyMap, setReorderQtyMap] = useState({});
  const [reorderStatusMap, setReorderStatusMap] = useState({});

  const zoomFactor = zoomLevel / 100;

  const productColWidth = 256 * zoomFactor;
  const stockColWidth = 256 * zoomFactor;
  const weekColWidth = 128 * zoomFactor;

  const toggleRowExpand = useCallback(() => {
    toggleExpandedRow(inventoryItem.variantId);
  }, [inventoryItem.variantId, toggleExpandedRow]);

  const toggleItemSelect = useCallback(
    (e) => {
      toggleSelectedVariant(inventoryItem.variantId, e.target.checked);
      e.stopPropagation();
    },
    [inventoryItem.variantId, toggleSelectedVariant]
  );

  const getForecastValue = useCallback(
    (type, week) => {
      if (!inventoryItem.forecast || inventoryItem.forecast.length === 0) {
        return null;
      }

      for (const forecastYear of inventoryItem.forecast) {
        const weekData = forecastYear.weeks.find(
          (w) => w.week === week.weekNumber && forecastYear.year === week.year
        );
        if (weekData) {
          return weekData[type];
        }
      }
      return null;
    },
    [inventoryItem.forecast]
  );

  const handleRemoveReorder = useCallback(
    (week, idx, e) => {
      removeReorder(inventoryItem.variantId, week.year, week.weekNumber, idx);

      const {
        forecast = [],
        currentWeekStatus = "",
        reorderStatus = [],
      } = getForecastByVariantId(inventoryItem.variantId);
      updateProduct({
        variantId: inventoryItem.variantId,
        forecast,
        currentWeekStatus,
        reorderStatus,
      });
    },
    [
      inventoryItem.variantId,
      removeReorder,
      getForecastByVariantId,
      updateProduct,
    ]
  );

  const handleAddReorder = useCallback(
    (week) => {
      const weekKey = `${week.year}-${week.weekNumber}`;
      const qty = Number(reorderQtyMap[weekKey] ?? 0);
      const status = reorderStatusMap[weekKey] ?? "HPL";

      if (qty <= 0 || isNaN(qty)) {
        alert("Please enter a valid positive quantity");
        return;
      }

      const reorderData = {
        amount: qty,
        status: status,
      };

      addReorderAndUpdateForecast(
        inventoryItem.variantId,
        week.year,
        week.weekNumber,
        reorderData
      );

      setReorderQtyMap((prev) => ({ ...prev, [weekKey]: "" }));
      setReorderStatusMap((prev) => ({ ...prev, [weekKey]: "HPL" }));

      const {
        forecast = [],
        currentWeekStatus = "",
        reorderStatus = [],
      } = getForecastByVariantId(inventoryItem.variantId);
      updateProduct({
        variantId: inventoryItem.variantId,
        forecast,
        currentWeekStatus,
        reorderStatus,
      });
    },
    [
      reorderQtyMap,
      reorderStatusMap,
      addReorderAndUpdateForecast,
      inventoryItem.variantId,
      updateProduct,
      getForecastByVariantId,
    ]
  );

  const handleDeliveryTimeChange = useCallback(
    (e) => {
      const newDeliveryTime = Number(e.target.value);
      updateDeliveryTimeWithMinStock({
        variantId: inventoryItem.variantId,
        newDeliveryTime,
      });

      const { forecast = [], reorderStatus = [] } = getForecastByVariantId(
        inventoryItem.variantId
      );

      const currentWeekStatus = calculateCurrentWeekStatus(
        inventoryItem.variantId
      )(useProductStore.getState());

      updateProduct({
        variantId: inventoryItem.variantId,
        deliveryTime: newDeliveryTime,
        forecast,
        currentWeekStatus,
        reorderStatus,
      });
      removeVariant(inventoryItem.variantId);
    },
    [
      inventoryItem.variantId,
      updateDeliveryTimeWithMinStock,
      updateProduct,
      getForecastByVariantId,
    ]
  );

  const handleGrowthRateInput = useCallback((week, value) => {
    const weekKey = `${week.year}-${week.weekNumber}`;
    if (value === "" || /^-?\d*$/.test(value)) {
      setLocalGrowthRates((prev) => ({
        ...prev,
        [weekKey]: value,
      }));
    }
  }, []);

  const handleGrowthRateEnter = useCallback(
    async (week) => {
      const weekKey = `${week.year}-${week.weekNumber}`;
      const currentValue = getForecastValue("growthRate", week);
      const inputValue =
        localGrowthRates[weekKey] !== undefined
          ? Number(localGrowthRates[weekKey])
          : currentValue;

      setOriginalValue(inventoryItem.variantId, weekKey, currentValue);

      updateGrowthRateAndExpectedSales(
        inventoryItem.variantId,
        week.year,
        week.weekNumber,
        inputValue
      );

      const originalValue =
        getOriginalGrowthRateValue[weekKey] !== undefined
          ? getOriginalGrowthRateValue[weekKey]
          : currentValue;

      if (inputValue !== originalValue) {
        addGrowthRateChangedWeek(inventoryItem.variantId, weekKey);
      }

      const {
        forecast = [],
        currentWeekStatus = "",
        reorderStatus = [],
      } = getForecastByVariantId(inventoryItem.variantId);
      const res = await updateProduct({
        variantId: inventoryItem.variantId,
        forecast,
        currentWeekStatus,
        reorderStatus,
      });

      if (res.success) {
        toast.success("Prognose aktualisiert");
      }
    },
    [
      inventoryItem.variantId,
      getForecastValue,
      localGrowthRates,
      setOriginalValue,
      updateGrowthRateAndExpectedSales,
      getOriginalGrowthRateValue,
      addGrowthRateChangedWeek,
      getForecastByVariantId,
      updateProduct,
    ]
  );

  const handleExpectedSalesInput = useCallback((week, value) => {
    const weekKey = `${week.year}-${week.weekNumber}`;
    if (value === "" || /^\d*$/.test(value)) {
      setLocalExpectedSales((prev) => ({
        ...prev,
        [weekKey]: value,
      }));
    }
  }, []);

  const handleExpectedSalesEnter = useCallback(
    async (week) => {
      const weekKey = `${week.year}-${week.weekNumber}`;
      const currentExpectedSales = getForecastValue("expectedSales", week);
      const currentGrowthRate = getForecastValue("growthRate", week);

      setOriginalValue(inventoryItem.variantId, weekKey, currentGrowthRate);

      const inputValue =
        localExpectedSales[weekKey] !== undefined
          ? Number(localExpectedSales[weekKey])
          : currentExpectedSales;

      if (currentExpectedSales) {
        const { setOriginalExpectedSalesValue } =
          useExpectedSalesChangesStore.getState();
        setOriginalExpectedSalesValue(
          inventoryItem.variantId,
          weekKey,
          currentExpectedSales
        );
      }

      if (currentGrowthRate) {
        const { setOriginalGrowthRateValue } =
          useExpectedSalesChangesStore.getState();
        setOriginalGrowthRateValue(
          inventoryItem.variantId,
          weekKey,
          currentGrowthRate || 0
        );
      }

      const salesYear = week.year - 1;
      const prevYearSalesEntry = inventoryItem.sales
        ?.find((s) => s.year === salesYear)
        ?.weeks?.find((w) => w.week === week.weekNumber);
      const prevYearSales = prevYearSalesEntry?.sales || 0;

      // Calculate new growth rate based on expected sales
      let calculatedGrowthRate = currentGrowthRate || 0;
      if (prevYearSales > 0) {
        const growth = (inputValue - prevYearSales) / prevYearSales;
        calculatedGrowthRate = Math.round(growth * 100);
      } else {
        toast.error("Keine Verkaufsdaten für den vorigen Jahr");
        return;
      }

      if (calculatedGrowthRate !== currentGrowthRate) {
        addGrowthRateChangedWeek(inventoryItem.variantId, weekKey);
      }
      // Update both expected sales and calculated growth rate
      const updatedProduct = {
        ...inventoryItem,
        forecast: inventoryItem.forecast.map((forecastYear) => {
          if (forecastYear.year === week.year) {
            return {
              ...forecastYear,
              weeks: forecastYear.weeks.map((w) => {
                if (w.week === week.weekNumber) {
                  return {
                    ...w,
                    expectedSales: inputValue,
                    growthRate: calculatedGrowthRate,
                  };
                }
                return w;
              }),
            };
          }
          return forecastYear;
        }),
      };

      // Recalculate stock with updated values
      const recalculatedProducts = calculateStock([updatedProduct]);
      const recalculatedProduct = recalculatedProducts[0];

      // Update the store with recalculated product
      const currentState = useProductStore.getState().products;
      setProducts({
        products: currentState.products.map((product) =>
          product.variantId === inventoryItem.variantId
            ? recalculatedProduct
            : product
        ),
        pagination: currentState.pagination,
      });

      // Update local growth rate state to reflect the calculated value
      setLocalGrowthRates((prev) => ({
        ...prev,
        [weekKey]: calculatedGrowthRate.toString(),
      }));

      // Mark both expected sales and growth rate as changed
      const { addChangedWeek } = useExpectedSalesChangesStore.getState();
      addChangedWeek(inventoryItem.variantId, weekKey);

      // Update the product via API
      const res = await updateProduct({
        variantId: inventoryItem.variantId,
        forecast: recalculatedProduct.forecast,
        currentWeekStatus: recalculatedProduct.currentWeekStatus,
        reorderStatus: recalculatedProduct.reorderStatus,
      });

      if (res.success) {
        toast.success("Expected sales updated");
      }
    },
    [
      inventoryItem,
      getForecastValue,
      localExpectedSales,
      calculateStock,
      setProducts,
      updateProduct,
      setLocalGrowthRates,
    ]
  );

  const handleRevertGrowthRate = useCallback(
    async (week) => {
      const weekKey = `${week.year}-${week.weekNumber}`;
      const originalValue =
        getOriginalGrowthRateValue[weekKey] !== undefined
          ? getOriginalGrowthRateValue[weekKey]
          : getForecastValue("growthRate", week) || 0;

      setLocalGrowthRates((prev) => ({
        ...prev,
        [weekKey]: originalValue.toString(),
      }));

      updateGrowthRateAndExpectedSales(
        inventoryItem.variantId,
        week.year,
        week.weekNumber,
        originalValue
      );

      removeExpectedSales(inventoryItem.variantId, weekKey);
      revertGrowthRateWeek(inventoryItem.variantId, weekKey);

      const {
        forecast = [],
        currentWeekStatus = "",
        reorderStatus = [],
      } = getForecastByVariantId(inventoryItem.variantId);
      const res = await updateProduct({
        variantId: inventoryItem.variantId,
        forecast,
        currentWeekStatus,
        reorderStatus,
      });
      if (res.success) {
        toast.success("Prognose aktualisiert");
      }
    },
    [
      inventoryItem.variantId,
      updateGrowthRateAndExpectedSales,
      getOriginalGrowthRateValue,
      getForecastValue,
      revertGrowthRateWeek,
      removeExpectedSales,
      updateProduct,
      getForecastByVariantId,
    ]
  );

  const handleRevertMinimumStock = useCallback(
    async (weekKey) => {
      const [year, weekNumber] = weekKey.split("-").map(Number);
      const originalMinStock =
        getOriginalMinStockValue(inventoryItem.variantId, weekKey) ?? 0;

      const updatedProduct = {
        ...inventoryItem,
        forecast: inventoryItem.forecast.map((forecastYear) => {
          if (forecastYear.year === year) {
            return {
              ...forecastYear,
              weeks: forecastYear.weeks.map((week) => {
                if (week.week === weekNumber) {
                  return { ...week, minStock: originalMinStock };
                }
                return week;
              }),
            };
          }
          return forecastYear;
        }),
      };

      const recalculatedProducts = calculateStock([updatedProduct]);
      const recalculatedProduct = recalculatedProducts[0];

      const currentState = useProductStore.getState().products;
      setProducts({
        products: currentState.products.map((product) =>
          product.variantId === inventoryItem.variantId
            ? recalculatedProduct
            : product
        ),
        pagination: currentState.pagination,
      });

      await updateProduct({
        variantId: inventoryItem.variantId,
        forecast: recalculatedProduct.forecast,
        currentWeekStatus: recalculatedProduct.currentWeekStatus,
        reorderStatus: recalculatedProduct.reorderStatus,
      });

      revertMinStockWeek(inventoryItem.variantId, weekKey);
    },
    [
      inventoryItem,
      getOriginalMinStockValue,
      setProducts,
      updateProduct,
      revertMinStockWeek,
    ]
  );

  const handleRevertExpectedSales = useCallback(
    async (weekKey) => {
      const [year, weekNumber] = weekKey.split("-").map(Number);
      const originalValue = getOriginalValuesForWeek(inventoryItem.variantId, {
        year,
        weekNumber,
      });
      const updatedProduct = {
        ...inventoryItem,
        forecast: inventoryItem.forecast.map((forecastYear) => {
          if (forecastYear.year === year) {
            return {
              ...forecastYear,
              weeks: forecastYear.weeks.map((week) => {
                if (week.week === weekNumber) {
                  return {
                    ...week,
                    expectedSales: originalValue.expectedSales,
                    growthRate: originalValue.growthRate,
                  };
                }
                return week;
              }),
            };
          }
          return forecastYear;
        }),
      };

      const recalculatedProducts = calculateStock([updatedProduct]);
      const recalculatedProduct = recalculatedProducts[0];

      const currentState = useProductStore.getState().products;
      setProducts({
        products: currentState.products.map((product) =>
          product.variantId === inventoryItem.variantId
            ? recalculatedProduct
            : product
        ),
        pagination: currentState.pagination,
      });

      await updateProduct({
        variantId: inventoryItem.variantId,
        forecast: recalculatedProduct.forecast,
        currentWeekStatus: recalculatedProduct.currentWeekStatus,
        reorderStatus: recalculatedProduct.reorderStatus,
      });

      setLocalExpectedSales((prev) => ({
        ...prev,
        [weekKey]: originalValue.expectedSales.toString(),
      }));

      revertWeek(inventoryItem.variantId, weekKey);
      removeWeekData(inventoryItem.variantId, weekKey);
    },
    [
      inventoryItem,
      getOriginalValuesForWeek,
      setProducts,
      updateProduct,
      revertWeek,
      removeWeekData,
      setLocalExpectedSales,
    ]
  );

  const getReordersForWeek = useCallback(
    (week) => {
      if (!inventoryItem.forecast || inventoryItem.forecast.length === 0) {
        return [];
      }

      for (const forecastYear of inventoryItem.forecast) {
        if (forecastYear.year === week.year) {
          const weekData = forecastYear.weeks.find(
            (w) => w.week === week.weekNumber
          );
          return weekData?.reorders || [];
        }
      }
      return [];
    },
    [inventoryItem.forecast]
  );

  const renderMainRowCell = useCallback(
    (week, i) => {
      if (isPastWeek(week)) {
        return (
          <td
            key={i}
            className="px-6 py-4 text-sm text-center text-gray-5"
            style={{
              width: `${weekColWidth}px`,
              minWidth: `${weekColWidth}px`,
              maxWidth: `${weekColWidth}px`,
              fontSize: `${14 * zoomFactor}px`,
              padding: `${16 * zoomFactor}px ${24 * zoomFactor}px`,
            }}
          >
            Vergangen
          </td>
        );
      }

      const expectedSales = getForecastValue("inventory", week);
      const minStock = getForecastValue("minStock", week);

      if (expectedSales === null || expectedSales === undefined) {
        return (
          <td
            key={i}
            className="px-6 py-4 text-center"
            style={{
              width: `${weekColWidth}px`,
              minWidth: `${weekColWidth}px`,
              maxWidth: `${weekColWidth}px`,
              padding: `${16 * zoomFactor}px ${24 * zoomFactor}px`,
            }}
          ></td>
        );
      }

      const status = getInventoryStatus(expectedSales, minStock);
      const reorders = getReordersForWeek(week);

      return (
        <td
          key={i}
          className="relative text-center"
          style={{
            width: `${weekColWidth}px`,
            minWidth: `${weekColWidth}px`,
            maxWidth: `${weekColWidth}px`,
            padding: `${16 * zoomFactor}px ${24 * zoomFactor}px`,
            fontSize: `${14 * zoomFactor}px`,
          }}
        >
          <StatusIndicator status={status} />
          <div
            className="flex flex-col gap-2 items-center"
            style={{ gap: `${8 * zoomFactor}px` }}
          >
            <span>{expectedSales}</span>
            {reorders.length > 0 && (
              <div
                className="flex flex-col gap-2 items-center"
                style={{ gap: `${8 * zoomFactor}px` }}
              >
                {reorders.map((r, idx) => (
                  <ReorderItem
                    key={`${week.year}-${week.weekNumber}-${idx}-${r.amount}-${r.status}`}
                    reorder={r}
                    onRemove={(e) => handleRemoveReorder(week, idx, e)}
                    week={week}
                    idx={idx}
                    zoomLevel={zoomLevel}
                  />
                ))}
              </div>
            )}
          </div>
        </td>
      );
    },
    [
      getForecastValue,
      getReordersForWeek,
      handleRemoveReorder,
      zoomLevel,
      weekColWidth,
      zoomFactor,
    ]
  );

  const renderExpandedRowCell = useCallback(
    (type, week, i) => {
      const weekKey = `${week.year}-${week.weekNumber}`;
      const showPrevious =
        type === "growthRate"
          ? isGrowthRateChanged(weekKey)
          : type === "minStock"
          ? isMinStockChanged(weekKey)
          : isExpectedSalesChanged(weekKey);

      if (isPastWeek(week)) {
        return (
          <td
            key={i}
            className="px-6 py-2 text-sm text-center text-gray-5"
            style={{
              width: `${weekColWidth}px`,
              minWidth: `${weekColWidth}px`,
              maxWidth: `${weekColWidth}px`,
              fontSize: `${14 * zoomFactor}px`,
              padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
            }}
          >
            Vergangen
          </td>
        );
      }

      const value = getForecastValue(type, week);
      if (value === null || value === undefined) {
        return (
          <td
            key={i}
            className="px-6 py-2 text-center"
            style={{
              width: `${weekColWidth}px`,
              minWidth: `${weekColWidth}px`,
              maxWidth: `${weekColWidth}px`,
              padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
            }}
          ></td>
        );
      }

      if (type === "growthRate") {
        const inputValue =
          localGrowthRates[weekKey] !== undefined
            ? localGrowthRates[weekKey]
            : value.toString();
        return (
          <td
            key={i}
            className="px-6 py-2 text-center"
            style={{
              width: `${weekColWidth}px`,
              minWidth: `${weekColWidth}px`,
              maxWidth: `${weekColWidth}px`,
              padding: `${8 * zoomFactor}px ${16}px`,
            }}
          >
            <GrowthRateInput
              isLoading={loading}
              value={inputValue}
              onChange={(e) => handleGrowthRateInput(week, e.target.value)}
              onEnter={() => handleGrowthRateEnter(week)}
              onBlur={(e) => {
                if (e.target.value === "") {
                  handleGrowthRateInput(week, "0");
                }
              }}
              onRevert={() => handleRevertGrowthRate(week)}
              showPrevious={showPrevious}
              zoomLevel={zoomLevel}
            />
          </td>
        );
      }

      if (type === "minStock") {
        return (
          <td
            key={i}
            className={`px-6 py-2 text-sm text-center ${
              showPrevious ? "text-black" : ""}`}
            style={{
              width: `${weekColWidth}px`,
              minWidth: `${weekColWidth}px`,
              maxWidth: `${weekColWidth}px`,
              fontSize: `${14 * zoomFactor}px`,
              padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
            }}
          >
            <span className="flex justify-center items-center">
              {value}
              {showPrevious && (
                <PreviousSvg
                  onClick={() => handleRevertMinimumStock(weekKey)}
                />
              )}
            </span>
          </td>
        );
      }

      if (type === "expectedSales") {
        const inputValue =
          localExpectedSales[weekKey] !== undefined
            ? localExpectedSales[weekKey]
            : value.toString();
        return (
          <td
            key={i}
            className="px-6 py-2 text-center"
            style={{
              width: `${weekColWidth}px`,
              minWidth: `${weekColWidth}px`,
              maxWidth: `${weekColWidth}px`,
              padding: `${8 * zoomFactor}px ${16}px`,
            }}
          >
            <div className="flex gap-x-1 justify-start items-center ml-6">
              <input
                type="text"
                className="w-12 text-center text-purple-900 bg-purple-200 rounded outline-none"
                value={inputValue}
                onChange={(e) => handleExpectedSalesInput(week, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleExpectedSalesEnter(week);
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    handleExpectedSalesInput(week, "0");
                    handleExpectedSalesEnter(week);
                  }
                }}
                disabled={loading}
                style={{
                  fontSize: `${14 * zoomFactor}px`,
                  padding: `${4 * zoomFactor}px ${8 * zoomFactor}px`,
                }}
              />
              {showPrevious && (
                <span
                  className="cursor-pointer"
                  onClick={() => handleRevertExpectedSales(weekKey)}
                >
                  <PreviousSvg />
                </span>
              )}
            </div>
          </td>
        );
      }

      return (
        <td
          key={i}
          className="px-6 py-2 text-sm text-center"
          style={{
            width: `${weekColWidth}px`,
            minWidth: `${weekColWidth}px`,
            maxWidth: `${weekColWidth}px`,
            fontSize: `${14 * zoomFactor}px`,
            padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
          }}
        >
          {value}
        </td>
      );
    },
    [
      getForecastValue,
      handleGrowthRateInput,
      handleGrowthRateEnter,
      handleRevertGrowthRate,
      handleRevertMinimumStock,
      handleExpectedSalesInput,
      handleExpectedSalesEnter,
      handleRevertExpectedSales,
      localGrowthRates,
      localExpectedSales,
      zoomLevel,
      weekColWidth,
      zoomFactor,
      isGrowthRateChanged,
      isMinStockChanged,
      isExpectedSalesChanged,
      loading,
    ]
  );

  const renderSalesRowCell = useCallback(
    (week, i) => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentWeek = getWeekNumber(today);

      const isPastOrCurrentWeek =
        week.year < currentYear ||
        (week.year === currentYear && week.weekNumber < currentWeek);

      let salesValue = 0;
      if (isPastOrCurrentWeek) {
        const actualSales =
          inventoryItem.sales
            .find((y) => y.year === week.year)
            ?.weeks.find((w) => w.week === week.weekNumber)?.sales ?? 0;
        salesValue = actualSales;
      } else {
        salesValue =
          inventoryItem.sales
            .find((y) => y.year === week.year - 1)
            ?.weeks.find((w) => w.week === week.weekNumber)?.sales ?? 0;
      }

      return (
        <td
          key={i}
          className="px-6 py-2 text-center"
          style={{
            width: `${weekColWidth}px`,
            minWidth: `${weekColWidth}px`,
            maxWidth: `${weekColWidth}px`,
            padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
            fontSize: `${14 * zoomFactor}px`,
          }}
        >
          <span
            className="px-3.5 py-1 rounded-lg bg-purple-200 text-sm text-purple-900"
            style={{
              padding: `${4 * zoomFactor}px ${14 * zoomFactor}px`,
              fontSize: `${14 * zoomFactor}px`,
            }}
          >
            {salesValue}
          </span>
        </td>
      );
    },
    [inventoryItem.sales, zoomLevel, weekColWidth, zoomFactor]
  );

  const renderReorderRowCell = useCallback(
    (week, i) => {
      const weekKey = `${week.year}-${week.weekNumber}`;
      if (isPastWeek(week)) {
        return (
          <td
            key={i}
            className="px-6 py-2 text-sm text-center text-gray-5"
            style={{
              width: `${weekColWidth}px`,
              minWidth: `${weekColWidth}px`,
              maxWidth: `${weekColWidth}px`,
              fontSize: `${14 * zoomFactor}px`,
              padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
            }}
          >
            Vergangen
          </td>
        );
      }

      return (
        <td
          key={i}
          className="px-6 py-2 text-center"
          style={{
            width: `${weekColWidth}px`,
            minWidth: `${weekColWidth}px`,
            maxWidth: `${weekColWidth}px`,
            padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
          }}
        >
          <ReorderForm
            weekKey={weekKey}
            reorderQtyMap={reorderQtyMap}
            reorderStatusMap={reorderStatusMap}
            setReorderQtyMap={setReorderQtyMap}
            setReorderStatusMap={setReorderStatusMap}
            onAddReorder={() => handleAddReorder(week)}
            zoomLevel={zoomLevel}
          />
        </td>
      );
    },
    [
      reorderQtyMap,
      reorderStatusMap,
      handleAddReorder,
      zoomLevel,
      weekColWidth,
      zoomFactor,
    ]
  );

  const renderCellByType = useCallback(
    (type, week, i) => {
      switch (type) {
        case "minStock":
        case "expectedSales":
        case "growthRate":
          return renderExpandedRowCell(type, week, i);
        case "sales":
          return renderSalesRowCell(week, i);
        case "reorder":
          return renderReorderRowCell(week, i);
        default:
          return null;
      }
    },
    [renderExpandedRowCell, renderSalesRowCell, renderReorderRowCell]
  );

  return useMemo(
    () => (
      <>
        <tr className="bg-white cursor-pointer" onClick={toggleRowExpand}>
          <td
            className="left-0 z-20 py-4 pr-8 bg-white md:sticky"
            style={{
              width: `${productColWidth}px`,
              minWidth: `${productColWidth}px`,
              maxWidth: `${productColWidth}px`,
              padding: `${16 * zoomFactor}px ${16 * zoomFactor}px ${
                16 * zoomFactor
              }px 0`,
            }}
          >
            <RowHeader
              inventoryItem={inventoryItem}
              expandedRows={expandedRows}
              selectedItems={selectedItems}
              toggleItemSelect={toggleItemSelect}
              zoomLevel={zoomLevel}
              shouldHighlight={shouldHighlight}
            />
          </td>
          <td
            className="z-20 px-6 py-4 text-center bg-white md:sticky"
            style={{
              left: `${productColWidth}px`,
              width: `${stockColWidth}px`,
              minWidth: `${stockColWidth}px`,
              maxWidth: `${stockColWidth}px`,
              padding: `${16 * zoomFactor}px ${16 * zoomFactor}px`,
              fontSize: `${14 * zoomFactor}px`,
            }}
          >
            <div className="truncate">{inventoryItem.inventory_quantity}</div>
          </td>
          {getWeeks.map((week, i) => renderMainRowCell(week, i))}
        </tr>
        {expandedRows.has(inventoryItem.variantId) && (
          <>
            {expandedRowsConfig.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white">
                <td
                  className="left-0 z-20 py-2 font-medium bg-white md:sticky"
                  style={{
                    width: `${productColWidth}px`,
                    minWidth: `${productColWidth}px`,
                    maxWidth: `${productColWidth}px`,
                    padding: `${8 * zoomFactor}px 0 ${8 * zoomFactor}px ${
                      40 * zoomFactor
                    }px`,
                    fontSize: `${14 * zoomFactor}px`,
                  }}
                >
                  <div className="truncate">{row.title}</div>
                </td>
                {row.type === "deliveryTime" ? (
                  <td
                    className="z-20 px-6 py-2 bg-white md:sticky"
                    style={{
                      left: `${productColWidth}px`,
                      width: `${stockColWidth}px`,
                      minWidth: `${stockColWidth}px`,
                      maxWidth: `${stockColWidth}px`,
                      padding: `${8 * zoomFactor}px ${16 * zoomFactor}px`,
                    }}
                  >
                    <select
                      value={inventoryItem.deliveryTime}
                      onChange={handleDeliveryTimeChange}
                      className="p-1 px-2 text-sm rounded border border-gray-5 focus:outline-none"
                      style={{
                        padding: `${4 * zoomFactor}px ${8 * zoomFactor}px`,
                        fontSize: `${14 * zoomFactor}px`,
                      }}
                    >
                      {deliveryTimeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                ) : (
                  <td
                    className="z-20 px-6 py-2 bg-white md:sticky"
                    style={{
                      left: `${productColWidth}px`,
                      width: `${stockColWidth}px`,
                      minWidth: `${stockColWidth}px`,
                      maxWidth: `${stockColWidth}px`,
                      padding: `${8 * zoomFactor}px ${16 * zoomFactor}px`,
                    }}
                  ></td>
                )}
                {getWeeks.map((week, i) => renderCellByType(row.type, week, i))}
              </tr>
            ))}
          </>
        )}
      </>
    ),
    [
      inventoryItem,
      expandedRows,
      getWeeks,
      zoomLevel,
      selectedItems,
      toggleRowExpand,
      toggleItemSelect,
      renderMainRowCell,
      renderCellByType,
      handleDeliveryTimeChange,
      localGrowthRates,
      localExpectedSales,
      reorderQtyMap,
      reorderStatusMap,
      changedMinStockWeeks,
      changedWeeks,
    ]
  );
};

export default React.memo(TableRow);
// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import PreviousSvg from "../../assets/svgs/previous";
// import { expandedRowsConfig } from "../../config/table-config";
// import { deliveryTimeOptions } from "../../constant/table";
// import { useUpdateProduct } from "../../hooks";
// import useExpectedSalesChangesStore from "../../store/expected-sales/usePreviousExpectedSales";
// import useExpandedRowsStore from "../../store/expended-rows";
// import { useGrowthRateChangesStore } from "../../store/growth-rate";
// import useMinStockChangesStore from "../../store/min-stock/useRevetMinStock";
// import useProductStore from "../../store/products";
// import { calculateStock } from "../../utils/calculate-stock";
// import { isPastWeek } from "../../utils/check-past-week";
// import { getWeekNumber } from "../../utils/get-current-week-number";
// import { getInventoryStatus } from "../../utils/get-inventory-status";
// import GrowthRateInput from "./growth-rate-input";
// import ReorderForm from "./reorder-form";
// import ReorderItem from "./reorder-item";
// import RowHeader from "./row-headers";
// import StatusIndicator from "./status-indicator";
// import { toast } from "sonner";

// const TableRow = ({
//   inventoryItem,
//   getWeeks,
//   zoomLevel,
//   searchTerm,
//   isSearchMatch,
// }) => {
//   const {
//     updateDeliveryTimeWithMinStock,
//     removeReorder,
//     addReorderAndUpdateForecast,
//     updateGrowthRateAndExpectedSales,
//     getForecastByVariantId,
//     toggleSelectedVariant,
//     calculateCurrentWeekStatus,
//     selectedVariantsIds: selectedItems,
//     setProducts,
//   } = useProductStore((state) => state);

//   const {
//     changedMinStockWeeks,
//     revertMinStockWeek,
//     getOriginalMinStockValue,
//     removeVariant,
//   } = useMinStockChangesStore();

//   const {
//     changedWeeks,
//     revertWeek,
//     getOriginalExpectedSalesValue,
//     getOriginalValuesForWeek,
//     removeWeekData: removeExpectedSales,
//   } = useExpectedSalesChangesStore();

//   useEffect(() => {
//     const newLocalGrowthRates = {};
//     if (inventoryItem.forecast) {
//       inventoryItem.forecast.forEach((forecastYear) => {
//         forecastYear.weeks.forEach((week) => {
//           const weekKey = `${forecastYear.year}-${week.week}`;
//           if (
//             localGrowthRates[weekKey] === undefined ||
//             localGrowthRates[weekKey] !== String(week.growthRate)
//           ) {
//             newLocalGrowthRates[weekKey] = String(week.growthRate || 0);
//           } else {
//             newLocalGrowthRates[weekKey] = localGrowthRates[weekKey];
//           }
//         });
//       });
//     }
//     setLocalGrowthRates(newLocalGrowthRates);
//   }, [inventoryItem.forecast]);
//   const searchableFields = ["productName", "sku", "variantId"];

//   const matchFields = useMemo(() => {
//     if (!searchTerm || !isSearchMatch) return [];
//     const searchLower = searchTerm.toLowerCase();
//     return searchableFields.filter((field) =>
//       inventoryItem[field]?.toString().toLowerCase().includes(searchLower)
//     );
//   }, [searchTerm, isSearchMatch, inventoryItem]);

//   const shouldHighlight = useCallback(
//     (fieldName) => matchFields.includes(fieldName),
//     [matchFields]
//   );

//   const { expandedRows, toggleExpandedRow } = useExpandedRowsStore();
//   const {
//     setOriginalValue,
//     addChangedWeek: addGrowthRateChangedWeek,
//     revertWeek: revertGrowthRateWeek,
//     changedWeeks: growthRateChangedWeeks,
//     originalValues: growthRateOriginalValues,
//     removeWeekData,
//   } = useGrowthRateChangesStore();

//   const getOriginalGrowthRateValue =
//     growthRateOriginalValues[inventoryItem.variantId] || {};
//   const isGrowthRateChanged = useCallback(
//     (weekKey) =>
//       growthRateChangedWeeks[inventoryItem.variantId]?.has(weekKey) || false,
//     [growthRateChangedWeeks, inventoryItem.variantId]
//   );

//   const isMinStockChanged = useCallback(
//     (weekKey) =>
//       changedMinStockWeeks[inventoryItem.variantId]?.has(weekKey) || false,
//     [changedMinStockWeeks, inventoryItem.variantId]
//   );

//   const isExpectedSalesChanged = useCallback(
//     (weekKey) => changedWeeks[inventoryItem.variantId]?.has(weekKey) || false,
//     [changedWeeks, inventoryItem.variantId]
//   );

//   const { updateProduct, loading } = useUpdateProduct();

//   const [localGrowthRates, setLocalGrowthRates] = useState({});
//   const [reorderQtyMap, setReorderQtyMap] = useState({});
//   const [reorderStatusMap, setReorderStatusMap] = useState({});

//   const zoomFactor = zoomLevel / 100;

//   const productColWidth = 256 * zoomFactor;
//   const stockColWidth = 256 * zoomFactor;
//   const weekColWidth = 128 * zoomFactor;

//   const toggleRowExpand = useCallback(() => {
//     toggleExpandedRow(inventoryItem.variantId);
//   }, [inventoryItem.variantId, toggleExpandedRow]);

//   const toggleItemSelect = useCallback(
//     (e) => {
//       toggleSelectedVariant(inventoryItem.variantId, e.target.checked);
//       e.stopPropagation();
//     },
//     [inventoryItem.variantId, toggleSelectedVariant]
//   );

//   const getForecastValue = useCallback(
//     (type, week) => {
//       if (!inventoryItem.forecast || inventoryItem.forecast.length === 0) {
//         return null;
//       }

//       for (const forecastYear of inventoryItem.forecast) {
//         const weekData = forecastYear.weeks.find(
//           (w) => w.week === week.weekNumber && forecastYear.year === week.year
//         );
//         if (weekData) {
//           return weekData[type];
//         }
//       }
//       return null;
//     },
//     [inventoryItem.forecast]
//   );
//   const handleRemoveReorder = useCallback(
//     (week, idx, e) => {
//       removeReorder(inventoryItem.variantId, week.year, week.weekNumber, idx);

//       const {
//         forecast = [],
//         currentWeekStatus = "",
//         reorderStatus = [],
//       } = getForecastByVariantId(inventoryItem.variantId);
//       updateProduct({
//         variantId: inventoryItem.variantId,
//         forecast,
//         currentWeekStatus,
//         reorderStatus,
//       });
//     },
//     [
//       inventoryItem.variantId,
//       removeReorder,
//       getForecastByVariantId,
//       updateProduct,
//     ]
//   );

//   const handleAddReorder = useCallback(
//     (week) => {
//       const weekKey = `${week.year}-${week.weekNumber}`;
//       const qty = Number(reorderQtyMap[weekKey] ?? 0);
//       const status = reorderStatusMap[weekKey] ?? "HPL";

//       if (qty <= 0 || isNaN(qty)) {
//         alert("Please enter a valid positive quantity");
//         return;
//       }

//       const reorderData = {
//         amount: qty,
//         status: status,
//       };

//       addReorderAndUpdateForecast(
//         inventoryItem.variantId,
//         week.year,
//         week.weekNumber,
//         reorderData
//       );

//       setReorderQtyMap((prev) => ({ ...prev, [weekKey]: "" }));
//       setReorderStatusMap((prev) => ({ ...prev, [weekKey]: "HPL" }));

//       const {
//         forecast = [],
//         currentWeekStatus = "",
//         reorderStatus = [],
//       } = getForecastByVariantId(inventoryItem.variantId);
//       updateProduct({
//         variantId: inventoryItem.variantId,
//         forecast,
//         currentWeekStatus,
//         reorderStatus,
//       });
//     },
//     [
//       reorderQtyMap,
//       reorderStatusMap,
//       addReorderAndUpdateForecast,
//       inventoryItem.variantId,
//       updateProduct,
//       getForecastByVariantId,
//     ]
//   );

//   const handleDeliveryTimeChange = useCallback(
//     (e) => {
//       const newDeliveryTime = Number(e.target.value);
//       updateDeliveryTimeWithMinStock({
//         variantId: inventoryItem.variantId,
//         newDeliveryTime,
//       });

//       const { forecast = [], reorderStatus = [] } = getForecastByVariantId(
//         inventoryItem.variantId
//       );

//       const currentWeekStatus = calculateCurrentWeekStatus(
//         inventoryItem.variantId
//       )(useProductStore.getState());

//       updateProduct({
//         variantId: inventoryItem.variantId,
//         deliveryTime: newDeliveryTime,
//         forecast,
//         currentWeekStatus,
//         reorderStatus,
//       });
//       removeVariant(inventoryItem.variantId);
//     },
//     [
//       inventoryItem.variantId,
//       updateDeliveryTimeWithMinStock,
//       updateProduct,
//       getForecastByVariantId,
//     ]
//   );

//   const handleGrowthRateInput = useCallback(
//     (week, value) => {
//       const weekKey = `${week.year}-${week.weekNumber}`;

//       if (value === "" || /^-?\d*$/.test(value)) {
//         setLocalGrowthRates((prev) => ({
//           ...prev,
//           [weekKey]: value,
//         }));
//       }
//     },
//     [
//       inventoryItem.variantId,
//       updateGrowthRateAndExpectedSales,
//       getOriginalGrowthRateValue,
//       getForecastValue,
//       setOriginalValue,
//       addGrowthRateChangedWeek,
//       revertGrowthRateWeek,
//     ]
//   );

//   const handleGrowthRateEnter = useCallback(
//     async (week) => {
//       const weekKey = `${week.year}-${week.weekNumber}`;
//       const currentValue = getForecastValue("growthRate", week);
//       console.log("🚀 ~ currentValue:", currentValue);
//       const inputValue =
//         localGrowthRates[weekKey] !== undefined
//           ? Number(localGrowthRates[weekKey])
//           : currentValue;

//       console.log(inputValue);
//       console.log(currentValue, "testing..");
//       setOriginalValue(inventoryItem.variantId, weekKey, currentValue);

//       updateGrowthRateAndExpectedSales(
//         inventoryItem.variantId,
//         week.year,
//         week.weekNumber,
//         inputValue
//       );

//       const originalValue =
//         getOriginalGrowthRateValue[weekKey] !== undefined
//           ? getOriginalGrowthRateValue[weekKey]
//           : currentValue;

//       if (inputValue !== originalValue) {
//         addGrowthRateChangedWeek(inventoryItem.variantId, weekKey);
//       }

//       const {
//         forecast = [],
//         currentWeekStatus = "",
//         reorderStatus = [],
//       } = getForecastByVariantId(inventoryItem.variantId);
//       const res = await updateProduct({
//         variantId: inventoryItem.variantId,
//         forecast,
//         currentWeekStatus,
//         reorderStatus,
//       });

//       if (res.success) {
//         toast.success("Prognose aktualisiert");
//       }
//     },
//     [inventoryItem.variantId, getForecastByVariantId, updateProduct]
//   );

//   const handleRevertGrowthRate = useCallback(
//     async (week) => {
//       const weekKey = `${week.year}-${week.weekNumber}`;
//       const originalValue =
//         getOriginalGrowthRateValue[weekKey] !== undefined
//           ? getOriginalGrowthRateValue[weekKey]
//           : getForecastValue("growthRate", week) || 0;

//       setLocalGrowthRates((prev) => ({
//         ...prev,
//         [weekKey]: originalValue.toString(),
//       }));

//       updateGrowthRateAndExpectedSales(
//         inventoryItem.variantId,
//         week.year,
//         week.weekNumber,
//         originalValue
//       );

//       removeExpectedSales(inventoryItem.variantId, weekKey);

//       revertGrowthRateWeek(inventoryItem.variantId, weekKey);

//       const {
//         forecast = [],
//         currentWeekStatus = "",
//         reorderStatus = [],
//       } = getForecastByVariantId(inventoryItem.variantId);
//       const res = await updateProduct({
//         variantId: inventoryItem.variantId,
//         forecast,
//         currentWeekStatus,
//         reorderStatus,
//       });
//       if (res.success) {
//         toast.success("Prognose aktualisiert");
//       }
//     },
//     [
//       inventoryItem.variantId,
//       updateGrowthRateAndExpectedSales,
//       getOriginalGrowthRateValue,
//       getForecastValue,
//       revertGrowthRateWeek,
//       removeExpectedSales,
//       updateProduct,
//       getForecastByVariantId,
//     ]
//   );

//   const handleRevertMinimumStock = useCallback(
//     async (weekKey) => {
//       const [year, weekNumber] = weekKey.split("-").map(Number);
//       const originalMinStock =
//         getOriginalMinStockValue(inventoryItem.variantId, weekKey) ?? 0;

//       const updatedProduct = {
//         ...inventoryItem,
//         forecast: inventoryItem.forecast.map((forecastYear) => {
//           if (forecastYear.year === year) {
//             return {
//               ...forecastYear,
//               weeks: forecastYear.weeks.map((week) => {
//                 if (week.week === weekNumber) {
//                   return { ...week, minStock: originalMinStock };
//                 }
//                 return week;
//               }),
//             };
//           }
//           return forecastYear;
//         }),
//       };

//       const recalculatedProducts = calculateStock([updatedProduct]);
//       const recalculatedProduct = recalculatedProducts[0];

//       const currentState = useProductStore.getState().products;
//       setProducts({
//         products: currentState.products.map((product) =>
//           product.variantId === inventoryItem.variantId
//             ? recalculatedProduct
//             : product
//         ),
//         pagination: currentState.pagination,
//       });

//       await updateProduct({
//         variantId: inventoryItem.variantId,
//         forecast: recalculatedProduct.forecast,
//         currentWeekStatus: recalculatedProduct.currentWeekStatus,
//         reorderStatus: recalculatedProduct.reorderStatus,
//       });

//       revertMinStockWeek(inventoryItem.variantId, weekKey);
//     },
//     [
//       inventoryItem,
//       getOriginalMinStockValue,
//       setProducts,
//       updateProduct,
//       revertMinStockWeek,
//     ]
//   );

//   const handleRevertExpectedSales = useCallback(
//     async (weekKey) => {
//       const [year, weekNumber] = weekKey.split("-").map(Number);
//       const originalValue = getOriginalValuesForWeek(inventoryItem.variantId, {
//         year,
//         weekNumber,
//       });
//       const updatedProduct = {
//         ...inventoryItem,
//         forecast: inventoryItem.forecast.map((forecastYear) => {
//           if (forecastYear.year === year) {
//             return {
//               ...forecastYear,
//               weeks: forecastYear.weeks.map((week) => {
//                 if (week.week === weekNumber) {
//                   return {
//                     ...week,
//                     expectedSales: originalValue.expectedSales,
//                     growthRate: originalValue.growthRate,
//                   };
//                 }
//                 return week;
//               }),
//             };
//           }
//           return forecastYear;
//         }),
//       };

//       const recalculatedProducts = calculateStock([updatedProduct]);
//       const recalculatedProduct = recalculatedProducts[0];

//       const currentState = useProductStore.getState().products;
//       setProducts({
//         products: currentState.products.map((product) =>
//           product.variantId === inventoryItem.variantId
//             ? recalculatedProduct
//             : product
//         ),
//         pagination: currentState.pagination,
//       });

//       await updateProduct({
//         variantId: inventoryItem.variantId,
//         forecast: recalculatedProduct.forecast,
//         currentWeekStatus: recalculatedProduct.currentWeekStatus,
//         reorderStatus: recalculatedProduct.reorderStatus,
//       });

//       revertWeek(inventoryItem.variantId, weekKey);
//       removeWeekData(inventoryItem.variantId, weekKey);
//     },
//     [
//       inventoryItem,
//       getOriginalExpectedSalesValue,
//       getForecastValue,
//       setProducts,
//       updateProduct,
//       revertWeek,
//     ]
//   );

//   const getReordersForWeek = useCallback(
//     (week) => {
//       if (!inventoryItem.forecast || inventoryItem.forecast.length === 0) {
//         return [];
//       }

//       for (const forecastYear of inventoryItem.forecast) {
//         if (forecastYear.year === week.year) {
//           const weekData = forecastYear.weeks.find(
//             (w) => w.week === week.weekNumber
//           );
//           return weekData?.reorders || [];
//         }
//       }
//       return [];
//     },
//     [inventoryItem.forecast]
//   );

//   const renderMainRowCell = useCallback(
//     (week, i) => {
//       if (isPastWeek(week)) {
//         return (
//           <td
//             key={i}
//             className="px-6 py-4 text-sm text-center text-gray-5"
//             style={{
//               width: `${weekColWidth}px`,
//               minWidth: `${weekColWidth}px`,
//               maxWidth: `${weekColWidth}px`,
//               fontSize: `${14 * zoomFactor}px`,
//               padding: `${16 * zoomFactor}px ${24 * zoomFactor}px`,
//             }}
//           >
//             Vergangen
//           </td>
//         );
//       }

//       const expectedSales = getForecastValue("inventory", week);
//       const minStock = getForecastValue("minStock", week);

//       if (expectedSales === null || expectedSales === undefined) {
//         return (
//           <td
//             key={i}
//             className="px-6 py-4 text-center"
//             style={{
//               width: `${weekColWidth}px`,
//               minWidth: `${weekColWidth}px`,
//               maxWidth: `${weekColWidth}px`,
//               padding: `${16 * zoomFactor}px ${24 * zoomFactor}px`,
//             }}
//           ></td>
//         );
//       }

//       const status = getInventoryStatus(expectedSales, minStock);
//       const reorders = getReordersForWeek(week);

//       return (
//         <td
//           key={i}
//           className="relative text-center"
//           style={{
//             width: `${weekColWidth}px`,
//             minWidth: `${weekColWidth}px`,
//             maxWidth: `${weekColWidth}px`,
//             padding: `${16 * zoomFactor}px ${24 * zoomFactor}px`,
//             fontSize: `${14 * zoomFactor}px`,
//           }}
//         >
//           <StatusIndicator status={status} />
//           <div
//             className="flex flex-col gap-2 items-center"
//             style={{ gap: `${8 * zoomFactor}px` }}
//           >
//             <span>{expectedSales}</span>
//             {reorders.length > 0 && (
//               <div
//                 className="flex flex-col gap-2 items-center"
//                 style={{ gap: `${8 * zoomFactor}px` }}
//               >
//                 {reorders.map((r, idx) => (
//                   <ReorderItem
//                     key={`${week.year}-${week.weekNumber}-${idx}-${r.amount}-${r.status}`}
//                     reorder={r}
//                     onRemove={(e) => handleRemoveReorder(week, idx, e)}
//                     week={week}
//                     idx={idx}
//                     zoomLevel={zoomLevel}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         </td>
//       );
//     },
//     [
//       getForecastValue,
//       getReordersForWeek,
//       handleRemoveReorder,
//       zoomLevel,
//       weekColWidth,
//       zoomFactor,
//     ]
//   );

//   const renderExpandedRowCell = useCallback(
//     (type, week, i) => {
//       const weekKey = `${week.year}-${week.weekNumber}`;
//       const showPrevious =
//         type === "growthRate"
//           ? isGrowthRateChanged(weekKey)
//           : type === "minStock"
//           ? isMinStockChanged(weekKey)
//           : isExpectedSalesChanged(weekKey);

//       if (isPastWeek(week)) {
//         return (
//           <td
//             key={i}
//             className="px-6 py-2 text-sm text-center text-gray-5"
//             style={{
//               width: `${weekColWidth}px`,
//               minWidth: `${weekColWidth}px`,
//               maxWidth: `${weekColWidth}px`,
//               fontSize: `${14 * zoomFactor}px`,
//               padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
//             }}
//           >
//             Vergangen
//           </td>
//         );
//       }

//       const value = getForecastValue(type, week);
//       if (value === null || value === undefined) {
//         return (
//           <td
//             key={i}
//             className="px-6 py-2 text-center"
//             style={{
//               width: `${weekColWidth}px`,
//               minWidth: `${weekColWidth}px`,
//               maxWidth: `${weekColWidth}px`,
//               padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
//             }}
//           ></td>
//         );
//       }

//       if (type === "growthRate") {
//         const inputValue =
//           localGrowthRates[weekKey] !== undefined
//             ? localGrowthRates[weekKey]
//             : value.toString();
//         return (
//           <td
//             key={i}
//             className="px-6 py-2 text-center"
//             style={{
//               width: `${weekColWidth}px`,
//               minWidth: `${weekColWidth}px`,
//               maxWidth: `${weekColWidth}px`,
//               padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
//             }}
//           >
//             <GrowthRateInput
//               isLoading={loading}
//               value={inputValue}
//               onChange={(e) => handleGrowthRateInput(week, e.target.value)}
//               onEnter={() => handleGrowthRateEnter(week)}
//               onBlur={(e) => {
//                 if (e.target.value === "") {
//                   handleGrowthRateInput(week, "0");
//                 }
//               }}
//               onRevert={() => handleRevertGrowthRate(week)}
//               showPrevious={showPrevious}
//               zoomLevel={zoomLevel}
//             />
//           </td>
//         );
//       }

//       if (type === "minStock") {
//         return (
//           <td
//             key={i}
//             className={`px-6 py-2 text-sm text-center ${
//               showPrevious ? "text-black" : ""// }`}
//             style={{
//               width: `${weekColWidth}px`,
//               minWidth: `${weekColWidth}px`,
//               maxWidth: `${weekColWidth}px`,
//               fontSize: `${14 * zoomFactor}px`,
//               padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
//             }}
//           >
//             <span className="flex justify-center items-center">
//               {value}
//               {showPrevious && (
//                 <PreviousSvg
//                   onClick={() => handleRevertMinimumStock(weekKey)}
//                 />
//               )}
//             </span>
//           </td>
//         );
//       }

//       if (type === "expectedSales") {
//         return (
//           <td
//             key={i}
//             className={`px-6 py-2 text-sm text-center ${
//               showPrevious ? "text-black" : "text-black"
//             }`}
//             style={{
//               width: `${weekColWidth}px`,
//               minWidth: `${weekColWidth}px`,
//               maxWidth: `${weekColWidth}px`,
//               fontSize: `${14 * zoomFactor}px`,
//               padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
//             }}
//           >
//             <span className="flex justify-center items-center">
//               {value}
//               {showPrevious && (
//                 <PreviousSvg
//                   onClick={() => handleRevertExpectedSales(weekKey)}
//                 />
//               )}
//             </span>
//           </td>
//         );
//       }

//       return (
//         <td
//           key={i}
//           className="px-6 py-2 text-sm text-center"
//           style={{
//             width: `${weekColWidth}px`,
//             minWidth: `${weekColWidth}px`,
//             maxWidth: `${weekColWidth}px`,
//             fontSize: `${14 * zoomFactor}px`,
//             padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
//           }}
//         >
//           {value}
//         </td>
//       );
//     },
//     [
//       getForecastValue,
//       handleGrowthRateInput,
//       handleGrowthRateEnter,
//       handleRevertGrowthRate,
//       handleRevertMinimumStock,
//       handleRevertExpectedSales,
//       localGrowthRates,
//       zoomLevel,
//       weekColWidth,
//       zoomFactor,
//       isGrowthRateChanged,
//       isMinStockChanged,
//       isExpectedSalesChanged,
//     ]
//   );

//   const renderSalesRowCell = useCallback(
//     (week, i) => {
//       const today = new Date();
//       const currentYear = today.getFullYear();
//       const currentWeek = getWeekNumber(today);

//       const isPastOrCurrentWeek =
//         week.year < currentYear ||
//         (week.year === currentYear && week.weekNumber < currentWeek);

//       let salesValue = 0;
//       if (isPastOrCurrentWeek) {
//         const actualSales =
//           inventoryItem.sales
//             .find((y) => y.year === week.year)
//             ?.weeks.find((w) => w.week === week.weekNumber)?.sales ?? 0;
//         salesValue = actualSales;
//       } else {
//         salesValue =
//           inventoryItem.sales
//             .find((y) => y.year === week.year - 1)
//             ?.weeks.find((w) => w.week === week.weekNumber)?.sales ?? 0;
//       }

//       return (
//         <td
//           key={i}
//           className="px-6 py-2 text-center"
//           style={{
//             width: `${weekColWidth}px`,
//             minWidth: `${weekColWidth}px`,
//             maxWidth: `${weekColWidth}px`,
//             padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
//             fontSize: `${14 * zoomFactor}px`,
//           }}
//         >
//           <span
//             className="px-3.5 py-1 rounded-lg bg-purple-200 text-sm text-purple-900"
//             style={{
//               padding: `${4 * zoomFactor}px ${14 * zoomFactor}px`,
//               fontSize: `${14 * zoomFactor}px`,
//             }}
//           >
//             {salesValue}
//           </span>
//         </td>
//       );
//     },
//     [inventoryItem.sales, zoomLevel, weekColWidth, zoomFactor]
//   );

//   const renderReorderRowCell = useCallback(
//     (week, i) => {
//       const weekKey = `${week.year}-${week.weekNumber}`;
//       if (isPastWeek(week)) {
//         return (
//           <td
//             key={i}
//             className="px-6 py-2 text-sm text-center text-gray-5"
//             style={{
//               width: `${weekColWidth}px`,
//               minWidth: `${weekColWidth}px`,
//               maxWidth: `${weekColWidth}px`,
//               fontSize: `${14 * zoomFactor}px`,
//               padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
//             }}
//           >
//             Vergangen
//           </td>
//         );
//       }

//       return (
//         <td
//           key={i}
//           className="px-6 py-2 text-center"
//           style={{
//             width: `${weekColWidth}px`,
//             minWidth: `${weekColWidth}px`,
//             maxWidth: `${weekColWidth}px`,
//             padding: `${8 * zoomFactor}px ${24 * zoomFactor}px`,
//           }}
//         >
//           <ReorderForm
//             weekKey={weekKey}
//             reorderQtyMap={reorderQtyMap}
//             reorderStatusMap={reorderStatusMap}
//             setReorderQtyMap={setReorderQtyMap}
//             setReorderStatusMap={setReorderStatusMap}
//             onAddReorder={() => handleAddReorder(week)}
//             zoomLevel={zoomLevel}
//           />
//         </td>
//       );
//     },
//     [
//       reorderQtyMap,
//       reorderStatusMap,
//       handleAddReorder,
//       zoomLevel,
//       weekColWidth,
//       zoomFactor,
//     ]
//   );

//   const renderCellByType = useCallback(
//     (type, week, i) => {
//       switch (type) {
//         case "minStock":
//         case "expectedSales":
//         case "growthRate":
//           return renderExpandedRowCell(type, week, i);
//         case "sales":
//           return renderSalesRowCell(week, i);
//         case "reorder":
//           return renderReorderRowCell(week, i);
//         default:
//           return null;
//       }
//     },
//     [renderExpandedRowCell, renderSalesRowCell, renderReorderRowCell]
//   );

//   return useMemo(
//     () => (
//       <>
//         <tr className="bg-white cursor-pointer" onClick={toggleRowExpand}>
//           <td
//             className="left-0 z-20 py-4 pr-8 bg-white md:sticky"
//             style={{
//               width: `${productColWidth}px`,
//               minWidth: `${productColWidth}px`,
//               maxWidth: `${productColWidth}px`,
//               padding: `${16 * zoomFactor}px ${16 * zoomFactor}px ${
//                 16 * zoomFactor
//               }px 0`,
//             }}
//           >
//             <RowHeader
//               inventoryItem={inventoryItem}
//               expandedRows={expandedRows}
//               selectedItems={selectedItems}
//               toggleItemSelect={toggleItemSelect}
//               zoomLevel={zoomLevel}
//               shouldHighlight={shouldHighlight}
//             />
//           </td>
//           <td
//             className="z-20 px-6 py-4 text-center bg-white md:sticky"
//             style={{
//               left: `${productColWidth}px`,
//               width: `${stockColWidth}px`,
//               minWidth: `${stockColWidth}px`,
//               maxWidth: `${stockColWidth}px`,
//               padding: `${16 * zoomFactor}px ${16 * zoomFactor}px`,
//               fontSize: `${14 * zoomFactor}px`,
//             }}
//           >
//             <div className="truncate">{inventoryItem.inventory_quantity}</div>
//           </td>
//           {getWeeks.map((week, i) => renderMainRowCell(week, i))}
//         </tr>
//         {expandedRows.has(inventoryItem.variantId) && (
//           <>
//             {expandedRowsConfig.map((row, rowIndex) => (
//               <tr key={rowIndex} className="bg-white">
//                 <td
//                   className="left-0 z-20 py-2 font-medium bg-white md:sticky"
//                   style={{
//                     width: `${productColWidth}px`,
//                     minWidth: `${productColWidth}px`,
//                     maxWidth: `${productColWidth}px`,
//                     padding: `${8 * zoomFactor}px 0 ${8 * zoomFactor}px ${
//                       40 * zoomFactor
//                     }px`,
//                     fontSize: `${14 * zoomFactor}px`,
//                   }}
//                 >
//                   <div className="truncate">{row.title}</div>
//                 </td>
//                 {row.type === "deliveryTime" ? (
//                   <td
//                     className="z-20 px-6 py-2 bg-white md:sticky"
//                     style={{
//                       left: `${productColWidth}px`,
//                       width: `${stockColWidth}px`,
//                       minWidth: `${stockColWidth}px`,
//                       maxWidth: `${stockColWidth}px`,
//                       padding: `${8 * zoomFactor}px ${16 * zoomFactor}px`,
//                     }}
//                   >
//                     <select
//                       value={inventoryItem.deliveryTime}
//                       onChange={handleDeliveryTimeChange}
//                       className="p-1 px-2 text-sm rounded border border-gray-5 focus:outline-none"
//                       style={{
//                         padding: `${4 * zoomFactor}px ${8 * zoomFactor}px`,
//                         fontSize: `${14 * zoomFactor}px`,
//                       }}
//                     >
//                       {deliveryTimeOptions.map((option) => (
//                         <option key={option.value} value={option.value}>
//                           {option.label}
//                         </option>
//                       ))}
//                     </select>
//                   </td>
//                 ) : (
//                   <td
//                     className="z-20 px-6 py-2 bg-white md:sticky"
//                     style={{
//                       left: `${productColWidth}px`,
//                       width: `${stockColWidth}px`,
//                       minWidth: `${stockColWidth}px`,
//                       maxWidth: `${stockColWidth}px`,
//                       padding: `${8 * zoomFactor}px ${16 * zoomFactor}px`,
//                     }}
//                   ></td>
//                 )}
//                 {getWeeks.map((week, i) => renderCellByType(row.type, week, i))}
//               </tr>
//             ))}
//           </>
//         )}
//       </>
//     ),
//     [
//       inventoryItem,
//       expandedRows,
//       getWeeks,
//       zoomLevel,
//       selectedItems,
//       toggleRowExpand,
//       toggleItemSelect,
//       renderMainRowCell,
//       renderCellByType,
//       handleDeliveryTimeChange,
//       localGrowthRates,
//       reorderQtyMap,
//       reorderStatusMap,
//       changedMinStockWeeks,
//       changedWeeks,
//     ]
//   );
// };

// export default React.memo(TableRow);
