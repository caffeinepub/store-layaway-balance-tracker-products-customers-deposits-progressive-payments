/**
 * Checks if the overdue reminder has been shown today for the given user
 * @param userId - User identifier (principal or 'anonymous')
 * @returns true if reminder was already shown today
 */
export function hasShownReminderToday(userId: string): boolean {
  const key = `overdueReminder_${userId}`;
  const lastShown = localStorage.getItem(key);
  
  if (!lastShown) {
    return false;
  }
  
  const lastShownDate = new Date(lastShown);
  const today = new Date();
  
  // Check if it's the same calendar day
  return (
    lastShownDate.getFullYear() === today.getFullYear() &&
    lastShownDate.getMonth() === today.getMonth() &&
    lastShownDate.getDate() === today.getDate()
  );
}

/**
 * Marks the overdue reminder as shown for today for the given user
 * @param userId - User identifier (principal or 'anonymous')
 */
export function markReminderShown(userId: string): void {
  const key = `overdueReminder_${userId}`;
  localStorage.setItem(key, new Date().toISOString());
}
