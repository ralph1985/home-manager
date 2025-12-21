export type NumericValue = number | string | { toString(): string };

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const formatCurrency = (value: NumericValue) =>
  currencyFormatter.format(Number(value.toString()));

export const formatDate = (value: Date) => dateFormatter.format(value);
