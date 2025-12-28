export const fuelProductCatalog = [
  { id: "4", labelKey: "dieselA" },
  { id: "5", labelKey: "dieselAPremium" },
  { id: "1", labelKey: "gas95" },
  { id: "3", labelKey: "gas98" },
] as const;

export type FuelProductId = (typeof fuelProductCatalog)[number]["id"];
