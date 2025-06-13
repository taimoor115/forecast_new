// // "use client";

import PreviousSvg from "../../assets/svgs/previous";

// // import PreviousSvg from "../../assets/svgs/previous";

// // const GrowthRateInput = ({
// //   value,
// //   onChange,
// //   isLoading,
// //   onBlur,
// //   onRevert,
// //   showPrevious,
// // }) => {

// //   const handleChange = (e) => {
// //     // If current value is "0" and user starts typing, clear the input
// //     if (value === "0" && e.target.value.length > 0) {
// //       e.target.value = e.target.value.slice(-1);
// //     }
    
// //     if (e.target.value === "" || /^\d*$/.test(e.target.value)) {
// //       onChange(e);
// //     }
// //   };
// //   const handleKeyDown = (e) => {
// //     if (e.key === "Tab") {
// //       e.preventDefault();
// //     }
// //   };
// //   return (
// //     <div className="flex gap-x-1 items-center ml-3">
// //       <input
// //         type="text"
// //         className="w-12 text-center text-purple-900 bg-purple-200 rounded outline-none"
// //         value={value || ""}
// //         onChange={handleChange}
// //         disabled={isLoading}
// //         onKeyDown={handleKeyDown}
// //         onBlur={onBlur}
// //       />
// //       {showPrevious && (
// //         <span className="cursor-pointer" onClick={onRevert}>
// //           <PreviousSvg />
// //         </span>
// //       )}
// //     </div>
// //   );
// // };

// // export default GrowthRateInput;

const GrowthRateInput = ({
  value,
  onChange,
  onEnter,
  isLoading,
  onBlur,
  onRevert,
  showPrevious,
  zoomLevel,
}) => {
  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Allow empty string (for deletion) or numeric values
    if (inputValue === "" || /^-?\d*$/.test(inputValue)) {
      onChange(e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onEnter();
    }
  };

  return (
    <div className="flex gap-x-1 items-center ml-6">
      <input
        type="text"
        className="w-12 text-center text-purple-900 bg-purple-200 rounded outline-none"
        value={value || ""}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        disabled={isLoading}
        style={{
          fontSize: `${14 * (zoomLevel / 100)}px`,
          padding: `${4 * (zoomLevel / 100)}px ${8 * (zoomLevel / 100)}px`,
        }}
      />
      {showPrevious && (
        <span className="cursor-pointer" onClick={onRevert}>
          <PreviousSvg />
        </span>
      )}
    </div>
  );
};

export default GrowthRateInput
// "use client";

// import PreviousSvg from "../../assets/svgs/previous";

// const GrowthRateInput = ({
//   value,
//   onChange,
//   onEnter,
//   isLoading,
//   onBlur,
//   onRevert,
//   showPrevious,
// }) => {
//   const handleChange = (e) => {
//     if (value === "0" && e.target.value.length > 0) {
//       e.target.value = e.target.value.slice(-1);
//     }
    
//     if (e.target.value === "" || /^\d*$/.test(e.target.value)) {
//       onChange(e);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       onEnter();
//     }
//     if (e.key === "Tab") {
//       e.preventDefault();
//     }
//   };

//   return (
//     <div className="flex gap-x-1 items-center ml-3">
//       <input
//         type="text"
//         className="w-12 text-center text-purple-900 bg-purple-200 rounded outline-none"
//         value={value || ""}
//         onChange={handleChange}
//         onKeyDown={handleKeyDown}
//         onBlur={onBlur}
//         disabled={isLoading}
//       />
//       {showPrevious && (
//         <span className="cursor-pointer" onClick={onRevert}>
//           <PreviousSvg />
//         </span>
//       )}
//     </div>
//   );
// };

// export default GrowthRateInput;

// "use client";

// import { useState } from "react";
// import PreviousSvg from "../../assets/svgs/previous";

// const GrowthRateInput = ({
//   value,
//   onChange,
//   onEnter,
//   isLoading,
//   onBlur,
//   onRevert,
//   showPrevious,
//   zoomLevel = 100,
// }) => {
//   const [isEnterPressed, setIsEnterPressed] = useState(false);
//   const zoomFactor = zoomLevel / 100;

//   const handleChange = (e) => {
//     if (value === "0" && e.target.value.length > 0) {
//       e.target.value = e.target.value.slice(-1);
//     }
    
//     if (e.target.value === "" || /^\d*$/.test(e.target.value)) {
//       onChange(e);
//     }
//   };

//   const handleKeyDown = async (e) => {
//     if (e.key === "Enter" && !isEnterPressed && !isLoading) {
//       e.preventDefault();
//       setIsEnterPressed(true);
      
//       try {
//         await onEnter();
//       } finally {
//         setIsEnterPressed(false);
//       }
//     }
//     if (e.key === "Tab") {
//       e.preventDefault();
//     }
//   };

//   const handleBlur = (e) => {
//     if (!isEnterPressed) {
//       onBlur(e);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center gap-2">
//       <input
//         type="text"
//         value={value}
//         onChange={handleChange}
//         onKeyDown={handleKeyDown}
//         onBlur={handleBlur}
//         disabled={isLoading || isEnterPressed}
//         className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
//         style={{
//           width: `${64 * zoomFactor}px`,
//           padding: `${4 * zoomFactor}px ${8 * zoomFactor}px`,
//           fontSize: `${14 * zoomFactor}px`,
//         }}
//       />
//       {showPrevious && (
//         <button
//           onClick={onRevert}
//           disabled={isLoading}
//           className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
//           style={{
//             padding: `${4 * zoomFactor}px`,
//           }}
//         >
//           <PreviousSvg />
//         </button>
//       )}
//     </div>
//   );
// };

// export default GrowthRateInput;