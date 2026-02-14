/**
 * Formats a bigint amount (in cents) to a currency string
 */
export function formatCurrency(amount: bigint): string {
  const euros = Number(amount) / 100;
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(euros);
}

/**
 * Parses a currency input string to bigint (in cents)
 * Handles both comma and dot as decimal separators
 */
export function parseCurrency(value: string): bigint {
  // Remove currency symbols and spaces
  const cleaned = value.replace(/[€\s]/g, '').trim();
  
  // Replace comma with dot for parsing
  const normalized = cleaned.replace(',', '.');
  
  const parsed = parseFloat(normalized);
  
  if (isNaN(parsed) || parsed < 0) {
    return BigInt(0);
  }
  
  // Convert to cents
  return BigInt(Math.round(parsed * 100));
}

/**
 * Validates that a currency input is a valid non-negative number
 */
export function isValidCurrencyInput(value: string): boolean {
  if (!value.trim()) return false;
  
  const cleaned = value.replace(/[€\s]/g, '').trim();
  const normalized = cleaned.replace(',', '.');
  const parsed = parseFloat(normalized);
  
  return !isNaN(parsed) && parsed >= 0;
}

/**
 * Calculates total paid from payments array
 */
export function calculateTotalPaid(payments: Array<{ amount: bigint }>): bigint {
  return payments.reduce((sum, payment) => sum + payment.amount, BigInt(0));
}

/**
 * Calculates remaining balance
 */
export function calculateRemaining(salePrice: bigint, totalPaid: bigint): bigint {
  const remaining = salePrice - totalPaid;
  return remaining > 0 ? remaining : BigInt(0);
}
