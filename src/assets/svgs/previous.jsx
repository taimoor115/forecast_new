import React from "react";

const PreviousSvg = ({ onClick }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      onClick={onClick}
      className="cursor-pointer"
    >
      <path
        fill="none"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 8H5V3m.291 13.357a8 8 0 1 0 .188-8.991"
      />
    </svg>
  );
};

export default PreviousSvg;
