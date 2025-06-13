import { statusColors } from "../../constant/table";

const ReorderItem = ({ reorder, onRemove, week, idx, zoomLevel = 1 }) => {
  const handleRemove = (e) => {
    e.stopPropagation();
    onRemove(week, idx, e);
  };

  return (
    <div
      style={{
        background: statusColors[reorder.status],
        borderRadius: 6,
        padding: "1px 5px",
        display: "inline-flex",
        alignItems: "center",
        marginTop: 2,
      }}
    >
      <span
        className={`font-semibold ${
          zoomLevel === 128
            ? "text-[10px]"
            : zoomLevel === 192
            ? "text-xs"
            : "text-sm"
        }`}
      >
        {reorder.amount}x
      </span>
      <span
        className={`ml-2 ${
          zoomLevel === 128
            ? "text-[10px]"
            : zoomLevel === 192
            ? "text-xs"
            : "text-sm"
        }`}
      >
        {reorder.status}
      </span>
      <button
        className="text-sm cursor-pointer ml-2.5 text-red-400 border-0"
        onClick={handleRemove}
        title="Remove reorder"
      >
        ×
      </button>
    </div>
  );
};

export default ReorderItem;