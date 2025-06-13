import React from "react";

const StatisticsCard = React.memo(({ title = "", stats = "", color = "" }) => {
  return (
    <div className="p-6 space-y-5 bg-white shadow-md rounded-[2rem] min-h-[120px] max-w-[300px] ">
      <p className="text-xl font-semibold text-custom_black lg:min-h-[56px] xl:min-h-0">
        {title}
      </p>
      <p className={`text-lg font-semibold  ${color}`}>{stats}</p>
    </div>
  );
});

export default StatisticsCard;
