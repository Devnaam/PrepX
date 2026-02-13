// Get date in YYYY-MM-DD format
export const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

// Get start and end of current week (Monday to Sunday)
export const getCurrentWeek = (): { start: string; end: string } => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday

  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: getDateString(monday),
    end: getDateString(sunday),
  };
};

// Get start and end of current month
export const getCurrentMonth = (): { start: string; end: string } => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start: getDateString(firstDay),
    end: getDateString(lastDay),
  };
};

// Get all dates in a range
export const getDateRange = (start: string, end: string): string[] => {
  const dates: string[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    dates.push(getDateString(date));
  }

  return dates;
};

// Get day name from date string
export const getDayName = (dateString: string): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateString);
  return days[date.getDay()];
};

// Get dates for last N months (for activity graph)
export const getLastNMonthsDates = (months: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setMonth(today.getMonth() - months);

  for (
    let date = new Date(startDate);
    date <= today;
    date.setDate(date.getDate() + 1)
  ) {
    dates.push(getDateString(date));
  }

  return dates;
};
