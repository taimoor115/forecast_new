import { memo } from "react";
import useProductStore from "../../../store/products";

const DashboardCard = memo(
  ({ title, value, color = "text-black", isActive, onClick }) => {

    const {  loading = false } = useProductStore(
      (state) => state
    );


    return (
    <div
      disabled={loading}
      className={`bg-white rounded-3xl p-6 shadow-sm cursor-pointer transition-all
      ${isActive ? "ring-2 ring-purple-500" : "hover:shadow-md"}`}
      onClick={loading ? undefined : onClick}
    >
      <div className="mb-1 text-sm text-gray-500">{title}</div>
      <div className={`text-3xl font-medium ${color}`}>{value}</div>
    </div>
    )
  }
);

export default DashboardCard;
