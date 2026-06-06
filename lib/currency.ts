export const CONVERSION_RATES: Record<string, number> = {
  INR_TO_USD: 0.012,
  INR_TO_GBP: 0.0095,
  INR_TO_EUR: 0.011,
  USD_TO_INR: 83.5,
}

export function convertToINR(amount: number, from: string): number {
  if (from === 'INR') return amount
  const rate = CONVERSION_RATES[`${from}_TO_INR`] ?? 1
  return amount * rate
}

export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'INR') {
    if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`
    if (amount >= 100_000)   return `₹${(amount / 100_000).toFixed(2)} L`
    return `₹${amount.toLocaleString('en-IN')}`
  }
  if (currency === 'USD') {
    const usd = amount * CONVERSION_RATES['INR_TO_USD']!
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(usd)
  }
  if (currency === 'GBP') {
    const gbp = amount * CONVERSION_RATES['INR_TO_GBP']!
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(gbp)
  }
  return `${amount}`
}