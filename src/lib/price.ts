// "350 $" in French, "$350" in English; ranges as "50–75 $" / "$50–75".
export const formatPrice = (locale: string, min: number, max?: number | null): string => {
  const format = new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    style: "currency",
    currency: "CAD",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  });
  return max && max !== min ? format.formatRange(min, max) : format.format(min);
};
