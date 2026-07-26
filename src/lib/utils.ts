export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`;
}
