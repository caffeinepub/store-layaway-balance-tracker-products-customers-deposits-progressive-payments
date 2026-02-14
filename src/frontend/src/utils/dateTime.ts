/**
 * Utility functions for formatting dates and times in Italian locale
 */

/**
 * Format a timestamp (in nanoseconds) to Italian date and time format
 * @param timestampNs - Timestamp in nanoseconds
 * @returns Formatted date and time string in Italian locale
 */
export function formatDateTime(timestampNs: bigint | number): string {
  const timestampMs = typeof timestampNs === 'bigint' 
    ? Number(timestampNs) / 1_000_000 
    : timestampNs / 1_000_000;
  
  const date = new Date(timestampMs);
  
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

/**
 * Format a timestamp (in nanoseconds) to Italian date format only
 * @param timestampNs - Timestamp in nanoseconds
 * @returns Formatted date string in Italian locale
 */
export function formatDate(timestampNs: bigint | number): string {
  const timestampMs = typeof timestampNs === 'bigint' 
    ? Number(timestampNs) / 1_000_000 
    : timestampNs / 1_000_000;
  
  const date = new Date(timestampMs);
  
  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'medium',
  }).format(date);
}

/**
 * Format a timestamp (in nanoseconds) to Italian time format only
 * @param timestampNs - Timestamp in nanoseconds
 * @returns Formatted time string in Italian locale
 */
export function formatTime(timestampNs: bigint | number): string {
  const timestampMs = typeof timestampNs === 'bigint' 
    ? Number(timestampNs) / 1_000_000 
    : timestampNs / 1_000_000;
  
  const date = new Date(timestampMs);
  
  return new Intl.DateTimeFormat('it-IT', {
    timeStyle: 'short',
  }).format(date);
}
