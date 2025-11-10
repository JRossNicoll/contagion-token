/**
 * Format a bigint or string balance to human-readable tokens
 */
export function formatBalance(balance: bigint | string | number, decimals = 9): string {
  const bal = typeof balance === "bigint" ? balance : BigInt(balance || 0)
  const divisor = BigInt(10 ** decimals)
  const tokens = Number(bal) / Number(divisor)
  return tokens.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

/**
 * Format an Ethereum address to shortened format
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format a date string to localized format
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString()
}

/**
 * Parse a string or bigint to BigInt safely
 */
export function toBigInt(value: string | bigint | number): bigint {
  if (typeof value === "bigint") return value
  return BigInt(value || 0)
}
