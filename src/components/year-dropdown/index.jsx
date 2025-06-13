import React, { memo, useRef, useState } from "react";
import { DownSvg } from "../../assets/svgs";
import { useOutsideClick } from "../../hooks";
import { useQueryParamsManager } from "../context/params";
import useProductStore from "../../store/products";

const YEAR_OPTIONS = [
  { label: "2023", value: 2023 },
  { label: "2024", value: 2024 },
  { label: "2025", value: 2025 },
];

const YearDropdown = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const { loading } = useProductStore();
  const { updateQueryParams, queryParams } = useQueryParamsManager();
  const dropdownRef = useRef(null);

  useOutsideClick(dropdownRef, () => {
    setIsOpen(false);
  });

  const selectedOption = YEAR_OPTIONS.find(
    (opt) => opt.value === queryParams.year
  );

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div
        className="flex justify-between items-center p-3 w-full bg-white rounded-xl border shadow-sm cursor-pointer border-gray-6 hover:border-purple-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium truncate text-gray-6">
          {selectedOption ? selectedOption.label : "Jahr wählen"}
        </span>
        <DownSvg />
      </div>
      {isOpen && (
        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-lg">
          {YEAR_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                option.value === queryParams.year ? "bg-gray-50" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                updateQueryParams("year", option.value);
                setIsOpen(false);
              }}
            >
              <input
                type="checkbox"
                checked={option.value === queryParams.year}
                disabled={loading}
                readOnly
                className="mr-3 w-4 h-4 cursor-pointer accent-purple-600"
              />
              <span className="text-sm font-medium text-gray-6">
                {option.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default YearDropdown;
