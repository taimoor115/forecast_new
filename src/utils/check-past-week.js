export const isPastWeek = (week) => {
  const [endDay, endMonth] = week.endDate.split(". ");
  const monthIndex = new Date(Date.parse(endMonth + " 1, 2000")).getMonth();
  const endDateObj = new Date(week.year, monthIndex, parseInt(endDay, 10));
  const today = new Date();

  endDateObj.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return endDateObj < today;
};
