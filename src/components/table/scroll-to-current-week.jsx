"use client";

import { Calendar } from "lucide-react";

const ScrollToCurrentWeekButton = ({ onClick, currentWeekIndex, weeks }) => {
  const currentWeekInfo =
    currentWeekIndex >= 0 && weeks[currentWeekIndex]
      ? {
          weekNumber: weeks[currentWeekIndex].weekNumber,
          year: weeks[currentWeekIndex].year,
        }
      : null;

      
  const buttonText = currentWeekInfo
    ? `KW ${currentWeekInfo.weekNumber} (${currentWeekInfo.year})`
    : "Current Week";

  return (
    <button
      onClick={() => onClick(true)}
      className="flex gap-2 items-center px-4 py-2 text-white bg-purple-600 rounded-md"
    >
      <Calendar className="w-4 h-4" />
      <span>{buttonText}</span>
    </button>
  );
};

export default ScrollToCurrentWeekButton;
