import { statusOptions } from "../../constant/table";

const ReorderForm = ({
  weekKey,
  reorderQtyMap,
  reorderStatusMap,
  setReorderQtyMap,
  setReorderStatusMap,
  onAddReorder,
}) => (
  <div className="flex flex-col gap-y-2">
    <input
      type="number"
      min={0}
      value={reorderQtyMap[weekKey] ?? 0}
      onChange={(e) =>
        setReorderQtyMap((prev) => ({
          ...prev,
          [weekKey]: Number(e.target.value),
        }))
      }
      className="px-2 py-1 text-sm text-center rounded-md border outline-none border-gray-5"
    />
    <select
      value={reorderStatusMap[weekKey] ?? "-"}
      onChange={(e) =>
        setReorderStatusMap((prev) => ({
          ...prev,
          [weekKey]: e.target.value,
        }))
      }
      className="px-2 py-1 text-sm bg-white rounded-md border border-gray-5 focus:outline-none"
    >
      {statusOptions.map((option) => (
        <option className="text-sm" key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <button
      onClick={onAddReorder}
      className="py-1 text-xs text-white bg-purple-600 rounded-md"
    >
      hinzufügen
    </button>
  </div>
);

export default ReorderForm;
