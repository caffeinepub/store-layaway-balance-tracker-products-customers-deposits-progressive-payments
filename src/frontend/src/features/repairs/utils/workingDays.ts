/**
 * Calculates the number of working days (Mon-Fri) elapsed since a given timestamp
 * @param timestampMs - Timestamp in milliseconds
 * @returns Number of working days elapsed
 */
export function calculateWorkingDaysElapsed(timestampMs: number): number {
  const startDate = new Date(timestampMs);
  const endDate = new Date();
  
  let workingDays = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Subtract 1 because we don't count the current day as fully elapsed
  return Math.max(0, workingDays - 1);
}

/**
 * Calculates the number of working days overdue (beyond 3 working days threshold)
 * @param timestampMs - Timestamp in milliseconds
 * @returns Number of working days overdue (0 if not overdue)
 */
export function calculateWorkingDaysOverdue(timestampMs: number): number {
  const elapsed = calculateWorkingDaysElapsed(timestampMs);
  return Math.max(0, elapsed - 3);
}
