import { ChevronDown } from "lucide-react";

const RowHeader = ({
  inventoryItem,
  expandedRows,
  selectedItems,
  toggleItemSelect,
  shouldHighlight,
}) => {
  const { sku, title, vendorName } = inventoryItem;
  return (
    <div className="flex gap-3 items-center h-full">
      <input
        type="checkbox"
        checked={selectedItems.has(inventoryItem.variantId)}
        onChange={toggleItemSelect}
      onClick={(e) => e.stopPropagation()}
      className="ml-2 w-4 h-4 rounded border border-gray-4 accent-purple-600"
    />
    <ChevronDown
      size={20}
      className={`text-purple-800 flex-shrink-0 transform transition-transform ${
        expandedRows.has(inventoryItem.variantId) ? "rotate-180" : ""
      }`}
    />
    <div className="min-w-0 text-sm">
      <div className="font-medium truncate" style={{
        color: shouldHighlight("sku") ? "#FFC107" : "inherit", // Yellow for matched sku
      }}>{sku}</div>
      <div className="text-gray-500 truncate" style={{
        color: shouldHighlight("title") ? "#FFC107" : "inherit", // Yellow for matched title
      }}>{title}</div>
      <div className="text-gray-500 truncate" style={{
        color: shouldHighlight("vendorName") ? "#FFC107" : "inherit", // Yellow for matched vendorName
      }}>{vendorName}</div>
    </div>
  </div>
)};

export default RowHeader;