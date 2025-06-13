
import useProductStore from "../../store/products";

const TableHeader = ({ weeks, getCurrentWeekIndex, inventoryItems, zoomLevel = 100 }) => {
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
              // style={{
              //   width: `${16 * zoomFactor}px`,
              //   height: `${16 * zoomFactor}px`,
              // }}
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
          <div className="truncate">
            Aktueller Bestand
          </div>
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

export default TableHeader;
