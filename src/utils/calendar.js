export function getCalendarWeeks(year) {
  function formatDate(date) {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    return `${day}. ${month}`;
  }

  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  let currentMonday = new Date(jan4);
  currentMonday.setDate(jan4.getDate() + daysToMonday);

  const weeks = [];
  while (true) {
    const thursday = new Date(currentMonday);
    thursday.setDate(currentMonday.getDate() + 3);
    if (thursday.getFullYear() !== year) break;

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate() + i);
      week.push(formatDate(d));
    }
    weeks.push(week);
    currentMonday.setDate(currentMonday.getDate() + 7);
  }
  return {
    totalWeeks: weeks.length,
    weeks: weeks,
  };
}

export function getFlatWeeksForYears(years) {
  let result = [];
  years.forEach((year) => {
    const { weeks } = getCalendarWeeks(year);
    weeks.forEach((weekDays, idx) => {
      result.push({
        year,
        weekNumber: idx + 1,
        startDate: weekDays[0],
        endDate: weekDays[6],
        weekDays,
      });
    });
  });
  return result;
}
