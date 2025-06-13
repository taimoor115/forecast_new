import React, { memo, useRef, useState } from "react";
import { DownSvg } from "../../assets/svgs";
import { useOutsideClick } from "../../hooks";

const ZOOM_OPTIONS = [
  { label: "100%", value: 100 },
  { label: "75%", value: 75 },
  { label: "50%", value: 50 },
  // { label: "25%", value: 25 },
];

const ZoomDropdown = memo(({ zoomLevel, setZoomLevel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useOutsideClick(dropdownRef, () => {
    setIsOpen(false);
  });

  const selectedOption = ZOOM_OPTIONS.find((opt) => opt.value === zoomLevel);

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div
        className="flex justify-between items-center p-3 w-full bg-white rounded-xl border shadow-sm cursor-pointer border-gray-6 hover:border-purple-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium truncate text-gray-6">
          {selectedOption ? selectedOption.label : "Zoom wählen"}
        </span>
        <DownSvg />
      </div>
      {isOpen && (
        <div className="absolute z-30 mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-lg">
          {ZOOM_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                option.value === zoomLevel ? "bg-gray-50" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setZoomLevel(option.value);
                setIsOpen(false);
              }}
            >
              <input
                type="checkbox"
                checked={option.value === zoomLevel}
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

export default ZoomDropdown;
