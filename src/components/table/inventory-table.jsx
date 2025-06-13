import { useVirtualizer } from "@tanstack/react-virtual";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import EditProducts from "../../common/modal/edit-products";
import { expandedRowsConfig } from "../../config/table-config";
import { useModal } from "../../context/modal";
import usePreviousProductStore from "../../store/previous-product-state";
import useProductStore from "../../store/products";
import BulkRevertModal from "../modals/bulk-revert";
import ScrollToCurrentWeekButton from "./scroll-to-current-week";
import TableRow from "./table-row";
import { useQueryParamsManager } from "../context/params";

// Calendar utility functions
export function getCalendarWeeks(year) {
  function formatDate(date) {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    return `${day}. ${month}`;
  }

  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  let currentMonday = new Date(jan4);
  currentMonday.setDate(jan4.getDate() + daysToMonday);

  const weeks = [];
  while (true) {
    const thursday = new Date(currentMonday);
    thursday.setDate(currentMonday.getDate() + 3);
    if (thursday.getFullYear() !== year) break;

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate() + i);
      week.push(formatDate(d));
    }
    weeks.push(week);
    currentMonday.setDate(currentMonday.getDate() + 7);
  }
  return {
    totalWeeks: weeks.length,
    weeks: weeks,
  };
}

export function getFlatWeeksForYears(years) {
  let result = [];
  years.forEach((year) => {
    const { weeks } = getCalendarWeeks(year);
    weeks.forEach((weekDays, idx) => {
      result.push({
        year,
        weekNumber: idx + 1,
        startDate: weekDays[0],
        endDate: weekDays[6],
        weekDays,
      });
    });
  });
  return result;
}

export const TableHeader = ({
  weeks,
  getCurrentWeekIndex,
  inventoryItems,
  zoomLevel = 100,
}) => {
  const { selectedVariantsIds, selectAllVariants, clearSelectedVariants } =
    useProductStore((state) => state);

  const zoomFactor = zoomLevel / 100;

  const allSelected =
    inventoryItems.length > 0 &&
    inventoryItems.every((item) => selectedVariantsIds.has(item.variantId));
  const someSelected =
    !allSelected &&
    inventoryItems.some((item) => selectedVariantsIds.has(item.variantId));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allVariantIds = inventoryItems.map((item) => item.variantId);
      selectAllVariants(allVariantIds);
    } else {
      clearSelectedVariants();
    }
  };

  // Calculate exact column widths to match the colgroup
  const productColWidth = 256 * zoomFactor;
  const stockColWidth = 256 * zoomFactor;
  const weekColWidth = 128 * zoomFactor;

  return (
    <thead className="sticky top-0 z-99999">
      <tr className="text-left border-b border-gray-100">
        <th
          className="sticky left-0 z-20 py-3 font-medium bg-white"
          style={{
            width: `${productColWidth}px`,
            minWidth: `${productColWidth}px`,
            maxWidth: `${productColWidth}px`,
            padding: `${12 * zoomFactor}px ${10 * zoomFactor}px`,
            fontSize: `${14 * zoomFactor}px`,
          }}
        >
          <div
            className="flex gap-3 items-center"
            style={{
              gap: `${12 * zoomFactor}px`,
            }}
          >
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = someSelected;
                }
              }}
              onChange={handleSelectAll}
              className="w-4 h-4 border accent-purple-600"
            />
            <span className="truncate">Produkt</span>
          </div>
        </th>

        <th
          className="sticky py-3 font-medium text-center bg-white z-99999"
          style={{
            left: `${productColWidth}px`,
            width: `${stockColWidth}px`,
            minWidth: `${stockColWidth}px`,
            maxWidth: `${stockColWidth}px`,
            padding: `${12 * zoomFactor}px ${16 * zoomFactor}px`,
            fontSize: `${14 * zoomFactor}px`,
          }}
        >
          <div className="truncate">Aktueller Bestand</div>
        </th>

        {weeks.map((week, i) => {
          const weekNum = week.weekNumber;
          const year = week.year;
          const dateRange = `${week.startDate} - ${week.endDate}`;
          const isCurrentWeek = i === getCurrentWeekIndex();

          return (
            <th
              key={i}
              className={`py-3 font-medium text-center top-0 sticky ${
                isCurrentWeek ? "bg-purple-100" : "bg-white"
              } ${i < weeks.length - 1 ? "" : ""}`}
              style={{
                width: `${weekColWidth}px`,
                minWidth: `${weekColWidth}px`,
                maxWidth: `${weekColWidth}px`,
                padding: `${8 * zoomFactor}px ${4 * zoomFactor}px`,
                fontSize: `${12 * zoomFactor}px`,
              }}
            >
              <div
                className={`whitespace-nowrap truncate ${
                  isCurrentWeek ? "font-bold text-purple-800" : ""}`}
                style={{ fontSize: `${12 * zoomFactor}px` }}
              >
                KW {weekNum} - {year}
              </div>
              <div
                className="text-xs text-gray-500 truncate whitespace-nowrap"
                style={{ fontSize: `${10 * zoomFactor}px` }}
              >
                {dateRange}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

const InventoryTable = forwardRef(({
  mainTableRef,
  upperScrollRef,
  zoomLevel,
  expandedRows,
  setExpandedRows,
}, ref) => {
  const {
    products: data = {},
    selectedVariantsIds,
    hasScrolled,
    setHasScrolled,
    batchLoading,
  } = useProductStore((state) => state);

  const { queryParams: params } = useQueryParamsManager();
  const year = Number(params.year);
  const { getExistingVariantIdsCount } = usePreviousProductStore();
  let existingVariantIdsCount = 0;
  if (selectedVariantsIds.size > 0) {
    existingVariantIdsCount = getExistingVariantIdsCount(selectedVariantsIds);
  }
  const IS_SHOW_REVERT_BUTTON = existingVariantIdsCount.count > 0;
  const { products: inventoryData = [] } = data || {};
  const now = new Date();
  const years = useMemo(
    () => [year - 1, year, year + 1], // Dynamic years: previous, current, next
    [year]
  );
  const allWeeks = useMemo(() => getFlatWeeksForYears(years), [years]);

  const getWeeks = useCallback(() => allWeeks, [allWeeks]);
  const weeks = useMemo(() => getWeeks(), [getWeeks]);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Debounce search term to prevent performance issues
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const getCurrentWeekIndex = useCallback(
    (filterByCurrentYear = false) => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const currentDate = today.getDate();

      for (let i = 0; i < allWeeks.length; i++) {
        const { year: weekYear, weekDays } = allWeeks[i];

        if (filterByCurrentYear && weekYear !== currentYear) {
          continue;
        }

        const parseDay = (dayStr) => {
          const [day, monthStr] = dayStr.split(". ");
          const month = new Date(`${monthStr} 1, 2000`).getMonth();
          return { day: parseInt(day, 10), month };
        };

        const firstDay = parseDay(weekDays[0]);
        const lastDay = parseDay(weekDays[6]);

        if (weekYear === currentYear) {
          if (
            (currentMonth > firstDay.month ||
              (currentMonth === firstDay.month &&
                currentDate >= firstDay.day)) &&
            (currentMonth < lastDay.month ||
              (currentMonth === lastDay.month && currentDate <= lastDay.day))
          ) {
            return i;
          }
        } else {
          if (firstDay.month === 11 && lastDay.month === 0) {
            if (
              (currentMonth === 11 && currentDate >= firstDay.day) ||
              (currentMonth === 0 && currentDate <= lastDay.day)
            ) {
              return i;
            }
          }
        }
      }
      return -1;
    },
    [allWeeks]
  );

  const currentWeekIndex = useMemo(
    () => getCurrentWeekIndex(),
    [getCurrentWeekIndex]
  );
  const currentWeekIndexInCurrentYear = useMemo(
    () => getCurrentWeekIndex(true),
    [getCurrentWeekIndex]
  );

  const localTableRef = useRef(null);
  const tableRef = mainTableRef || localTableRef;
  const prevZoomLevel = useRef(zoomLevel);

  // Optimized search - only search when debounced term changes
  const matches = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];

    const results = [];
    const searchLower = debouncedSearchTerm.toLowerCase();

    // Limit search to prevent hanging - only search first 1000 items if dataset is large
    const searchLimit = Math.min(inventoryData.length, 1000);

    for (let i = 0; i < searchLimit; i++) {
      const item = inventoryData[i];
      let isMatch = false;
      let matchFields = [];

      if (
        item.productName &&
        item.productName.toLowerCase().includes(searchLower)
      ) {
        isMatch = true;
        matchFields.push("productName");
      }
      if (item.sku && item.sku.toLowerCase().includes(searchLower)) {
        isMatch = true;
        matchFields.push("sku");
      }
      if (
        item.variantId &&
        item.variantId.toString().toLowerCase().includes(searchLower)
      ) {
        isMatch = true;
        matchFields.push("variantId");
      }

      if (isMatch) {
        results.push({
          index: i,
          item,
          matchFields,
        });
      }
    }

    return results;
  }, [inventoryData, debouncedSearchTerm]);

  const scrollToCurrentWeek = useCallback(
    (forceScroll = false, animate = false) => {
      const weekIndexToUse =
        currentWeekIndexInCurrentYear >= 0
          ? currentWeekIndexInCurrentYear
          : currentWeekIndex;

      if (!tableRef.current || weekIndexToUse < 0) {
        console.warn("Scroll aborted", {
          hasTableRef: !!tableRef.current,
          weekIndex: weekIndexToUse,
        });
        return;
      }

      const attemptScroll = () => {
        const zoomFactor = zoomLevel / 100;
        const weekColumnWidth = 128 * zoomFactor;
        const zoom =
          zoomFactor === 1
            ? 680
            : zoomFactor === 0.75
            ? 920
            : zoomFactor === 0.5
            ? 1420
            : 2750;
        const fixedColumnsWidth = zoom * zoomFactor;
        const targetScrollPosition =
          fixedColumnsWidth + weekIndexToUse * weekColumnWidth;
        const containerWidth =
          tableRef.current.clientWidth || window.innerWidth;
        const centerOffset = containerWidth / 2 - weekColumnWidth / 2;
        const finalScrollPosition = Math.max(
          0,
          targetScrollPosition - centerOffset
        );

        const scrollWidth = tableRef.current.scrollWidth;
        const maxScroll = Math.max(0, scrollWidth - containerWidth);
        const boundedScrollPosition = Math.min(finalScrollPosition, maxScroll);

        tableRef.current.scrollTo({
          left: boundedScrollPosition,
          behavior: animate ? "smooth" : "instant",
        });

        setHasScrolled(true);
        prevZoomLevel.current = zoomLevel;
      };

      let attempts = 0;
      const maxAttempts = 5;
      const retryScroll = () => {
        if (attempts >= maxAttempts) {
          console.warn("Max scroll attempts reached");
          return;
        }
        if (
          tableRef.current &&
          tableRef.current.clientWidth > 0 &&
          tableRef.current.scrollWidth > tableRef.current.clientWidth
        ) {
          attemptScroll();
        } else {
          attempts++;
          setTimeout(retryScroll, 200);
        }
      };

      if (forceScroll || !hasScrolled || prevZoomLevel.current !== zoomLevel) {
        setTimeout(retryScroll, 100);
      } else {
        console.log(
          "Scroll skipped due to hasScrolled being true and no zoom change"
        );
      }
    },
    [
      tableRef,
      currentWeekIndex,
      currentWeekIndexInCurrentYear,
      zoomLevel,
      setHasScrolled,
      hasScrolled,
    ]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToCurrentWeek();
    }, 200);
    return () => clearTimeout(timer);
  }, [scrollToCurrentWeek, zoomLevel]);

  useImperativeHandle(ref, () => ({
    scrollToCurrentWeek: (forceScroll = false) =>
      scrollToCurrentWeek(forceScroll),
  }));
  const tableContainerStyle = useMemo(
    () => ({
      maxHeight: "70vh",
      overflowY: "auto",
      overflowX: "auto",
      position: "relative",
      width: "100%",
    }),
    []
  );

  const tableStyle = useMemo(() => {
    const zoomFactor = zoomLevel / 100;
    const baseColumnWidth = 128;
    const baseFixedWidth = 512;
    const totalBaseWidth = baseFixedWidth + weeks.length * baseColumnWidth;

    return {
      fontSize: `${16 * zoomFactor}px`,
      width: `${totalBaseWidth * zoomFactor}px`,
      tableLayout: "fixed",
      minWidth: "100%",
    };
  }, [zoomLevel, weeks.length]);

  const colGroupStyle = useMemo(() => {
    const zoomFactor = zoomLevel / 100;
    return {
      productColWidth: `${256 * zoomFactor}px`,
      stockColWidth: `${256 * zoomFactor}px`,
      weekColWidth: `${128 * zoomFactor}px`,
    };
  }, [zoomLevel]);

  const { openModal } = useModal();

  const selectedProductsCount = useMemo(
  () => selectedVariantsIds.size,
    [selectedVariantsIds]
  );

  const IS_SHOW_EDIT_MODAL = selectedProductsCount > 0;
  const handleEditProducts = () => {
    openModal(<EditProducts selectedProductsCount={selectedProductsCount} />);
  };

  const handleRevertProductsModal = useCallback(() => {
    openModal(<BulkRevertModal variantIds={existingVariantIdsCount.ids} />);
  }, [existingVariantIdsCount.ids, openModal]);

  // Function to get reorders for a specific week
  const getReordersForWeek = useCallback((item, week) => {
    if (!item.forecast || item.forecast.length === 0) {
      return [];
    }

    for (const forecastYear of item.forecast) {
      if (forecastYear.year === week.year) {
        const weekData = forecastYear.weeks.find(
          (w) => w.week === week.weekNumber
        );
        return weekData?.reorders || [];
      }
    }
    return [];
  }, []);

  // Search keyboard shortcuts and functionality
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

      // Ctrl+F or Cmd+F to open search
      if (
        (isMac && e.metaKey && e.key === "f") ||
        (!isMac && e.ctrlKey && e.key === "f")
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }

      // Escape to close search
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchTerm("");
        setDebouncedSearchTerm("");
        setCurrentMatchIndex(0);
      }

      // Enter or F3 for navigation
      if (
        (e.key === "Enter" || e.key === "F3") &&
        matches.length > 0 &&
        isSearchOpen
      ) {
        e.preventDefault();
        if (e.shiftKey) {
          // Previous match
          setCurrentMatchIndex((prev) =>
            prev <= 0 ? matches.length - 1 : prev - 1
          );
        } else {
          // Next match
          setCurrentMatchIndex((prev) =>
            prev >= matches.length - 1 ? 0 : prev + 1
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, matches.length]);

  // Navigation functions
  const goToNextMatch = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev >= matches.length - 1 ? 0 : prev + 1));
  }, [matches.length]);

  const goToPrevMatch = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev <= 0 ? matches.length - 1 : prev - 1));
  }, [matches.length]);

  // Check if current row is a match
  const isCurrentMatch = useCallback(
    (itemIndex) => {
      if (matches.length === 0) return false;
      const currentMatch = matches[currentMatchIndex];
      return currentMatch && currentMatch.index === itemIndex;
    },
    [matches, currentMatchIndex]
  );

  // Check if row has any match
  const hasMatch = useCallback(
    (itemIndex) => {
      return matches.some((match) => match.index === itemIndex);
    },
    [matches]
  );

  // Calculate dynamic row height based on expanded state and reorders
  const getRowHeight = useCallback(
    (index) => {
      const item = inventoryData[index];
      const zoomFactor = zoomLevel / 100;
      const baseRowHeight =
        zoomLevel === 100
          ? 75 * zoomFactor
          : zoomLevel === 75
          ? 100 * zoomFactor
          : 128 * zoomFactor;
      const expandedRowHeight =
        zoomLevel === 100
          ? 60 * zoomFactor
          : zoomLevel === 75
          ? 70 * zoomFactor
          : 120 * zoomFactor;
      const reorderItemHeight = 32 * zoomFactor;
      const isExpanded = expandedRows.has(item.variantId);
      const expandedRowsCount = isExpanded ? expandedRowsConfig.length : 0;

      let maxReorderHeight = 0;
      weeks.forEach((week) => {
        if (!isPastWeek(week)) {
          const reorders = getReordersForWeek(item, week);
          const reorderHeight = reorders.length * reorderItemHeight;
          maxReorderHeight = Math.max(maxReorderHeight, reorderHeight);
        }
      });

      const totalHeight =
        baseRowHeight +
        (expandedRowsCount * expandedRowHeight + maxReorderHeight);
      return totalHeight;
    },
    [inventoryData, expandedRows, zoomLevel, weeks, getReordersForWeek]
  );

  // TanStack Virtualizer setup
  const parentRef = useRef(null);
  const virtualizer = useVirtualizer({
    count: inventoryData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: getRowHeight,
    overscan: 10,
  });

  // Reset virtualizer when dependencies change
  useEffect(() => {
    virtualizer.measure();
  }, [expandedRows, zoomLevel, inventoryData, virtualizer]);

  const scrollToMatch = useCallback(() => {
    if (matches.length > 0 && currentMatchIndex >= 0) {
      const currentMatch = matches[currentMatchIndex];
      if (currentMatch) {
        requestAnimationFrame(() => {
          virtualizer.scrollToIndex(currentMatch.index, {
            align: "center",
          });
        });
      }
    }
  }, [currentMatchIndex, matches, virtualizer]);

  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(scrollToMatch, 100);
    return () => clearTimeout(timeoutId);
  }, [scrollToMatch]);

  return (
    <>
      <div className="flex justify-between mb-4">
        {IS_SHOW_EDIT_MODAL && (
          <button
            disabled={batchLoading}
            className="px-4 py-2 text-white bg-purple-600 rounded"
            style={{
              fontSize: `${14 * (zoomLevel / 100)}px`,
              padding: `${8 * (zoomLevel / 100)}px ${16 * (zoomLevel / 100)}px`,
            }}
            onClick={handleEditProducts}
          >
            Produkt bearbeiten
          </button>
        )}
        <div className="flex gap-x-3 items-center">
          {IS_SHOW_REVERT_BUTTON && (
            <button
              onClick={handleRevertProductsModal}
              disabled={batchLoading}
              className="px-4 py-2 text-white bg-purple-600 rounded"
            >
              {existingVariantIdsCount?.count} Produkte zum Wiederherstellen
            </button>
          )}
          <ScrollToCurrentWeekButton
            onClick={() => scrollToCurrentWeek(true, true)}
            currentWeekIndex={
              currentWeekIndexInCurrentYear >= 0
                ? currentWeekIndexInCurrentYear
                : currentWeekIndex
            }
            weeks={allWeeks}
          />
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="flex w-1/2 gap-2 items-center p-3 mb-4 bg-white rounded-lg border border-[#e6e3e3] shadow-sm">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Produkte suchen..."
            className="flex-1 px-3 py-2 rounded-md border border-[#e6e3e3] focus:outline-none "
            style={{
              fontSize: `${14 * (zoomLevel / 100)}px`,
            }}
          />
          {searchTerm && !debouncedSearchTerm && (
            <div className="text-sm text-gray-500">Suche...</div>
          )}
          {matches.length > 0 && (
            <div className="flex gap-1 items-center text-sm text-gray-600">
              <span>
                {currentMatchIndex + 1} von {matches.length}
              </span>
              <button
                onClick={goToPrevMatch}
                className="p-1 rounded hover:bg-gray-100"
                title="Vorheriges Ergebnis (Shift+Enter)"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <button
                onClick={goToNextMatch}
                className="p-1 rounded hover:bg-gray-100"
                title="Nächstes Ergebnis (Enter)"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          )}
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchTerm("");
              setDebouncedSearchTerm("");
              setCurrentMatchIndex(0);
            }}
            className="p-1 rounded hover:bg-gray-100"
            title="Suche schließen (Escape)"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      <div
        className="bg-white rounded-3xl shadow-sm drop-shadow-2"
        style={tableContainerStyle}
        ref={(el) => {
          parentRef.current = el;
          tableRef.current = el;
        }}
      >
        <table className="w-full table-fixed" style={tableStyle}>
          <colgroup>
            <col style={{ width: colGroupStyle.productColWidth }} />
            <col style={{ width: colGroupStyle.stockColWidth }} />
            {weeks.map((_, i) => (
              <col key={i} style={{ width: colGroupStyle.weekColWidth }} />
            ))}
          </colgroup>
          <TableHeader
            weeks={weeks}
            getCurrentWeekIndex={getCurrentWeekIndex}
            inventoryItems={inventoryData}
            zoomLevel={zoomLevel}
          />
          <tbody>
            <tr>
              <td colSpan={2 + weeks.length} style={{ padding: 0 }}>
                {Array.isArray(inventoryData) && inventoryData.length > 0 && (
                  <div
                    style={{
                      height: `${virtualizer.getTotalSize()}px`,
                      position: "relative",
                    }}
                  >
                    {virtualizer.getVirtualItems().map((virtualRow) => {
                      const item = inventoryData[virtualRow.index];
                      const isHighlighted = isCurrentMatch(virtualRow.index);
                      const hasSearchMatch = hasMatch(virtualRow.index);

                      return (
                        <div
                          key={virtualRow.key}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                            border: isHighlighted
                              ? "2px solid rgba(255, 235, 59, 0.5)"
                              : "none",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <TableRow
                            inventoryItem={item}
                            expandedRows={expandedRows}
                            setExpandedRows={setExpandedRows}
                            getWeeks={weeks}
                            zoomLevel={zoomLevel}
                            searchTerm={debouncedSearchTerm}
                            isSearchMatch={hasSearchMatch}
                            isCurrentSearchMatch={isHighlighted}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Search shortcut hint */}
      {!isSearchOpen && (
        <div className="mt-2 text-sm text-center text-gray-500">
          Drücken Sie Strg+F zum Suchen
        </div>
      )}
    </>
  );
});

// Utility function to check if a week is in the past
const isPastWeek = (week) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentWeek = getWeekNumber(today);

  if (week.year < currentYear) return true;
  if (week.year === currentYear && week.weekNumber < currentWeek) return true;
  return false;
};

// Helper function to calculate week number
const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear =
    (date - firstDayOfYear) / 86400000 + firstDayOfYear.getDay() + 1;
  return Math.ceil(pastDaysOfYear / 7);
};

export default InventoryTable;
