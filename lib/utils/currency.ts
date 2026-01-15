/**
 * Format cents as USD currency string
 * @param cents - Amount in cents (e.g., 5000 for $50.00)
 * @returns Formatted currency string (e.g., "$50.00")
 */
export function formatCents(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}
