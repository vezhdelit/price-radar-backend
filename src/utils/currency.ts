export function extractPriceInCents(priceStr: string | number | undefined): number | undefined {
  if (typeof priceStr === "string") {
    const numericPrice = Number.parseFloat(priceStr.replace(/[^0-9.]/g, ""));
    return Number.isNaN(numericPrice) ? undefined : Math.round(numericPrice * 100);
  }
  else if (typeof priceStr === "number") {
    return Math.round(priceStr * 100);
  }
  return undefined;
}
