export type ParsedMaintenanceDetails = {
  general: string[];
  jobs: string[];
  parts: Array<{ label: string; amount: number | null }>;
  totals: Array<{ label: string; amount: number | null }>;
};

const amountRegex = /\(([\d.,]+)\s*EUR\)$/i;

function normalizeAmount(value: string) {
  const lastComma = value.lastIndexOf(",");
  const lastDot = value.lastIndexOf(".");
  let normalized = value;

  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      normalized = value.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = value.replace(/,/g, "");
    }
  } else if (lastComma !== -1) {
    normalized = value.replace(/\./g, "").replace(",", ".");
  } else if (lastDot !== -1) {
    normalized = value.replace(/,/g, "");
  }

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseMaintenanceDescription(description?: string | null): ParsedMaintenanceDetails {
  if (!description) {
    return { general: [], jobs: [], parts: [], totals: [] };
  }

  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const details: ParsedMaintenanceDetails = { general: [], jobs: [], parts: [], totals: [] };

  for (const line of lines) {
    if (line.startsWith("Trabajos:")) {
      const content = line.replace("Trabajos:", "").trim();
      details.jobs = content
        ? content
            .split(";")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];
      continue;
    }

    if (line.startsWith("Piezas:")) {
      const content = line.replace("Piezas:", "").trim();
      const parts = content
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean);
      details.parts = parts.map((part) => {
        const match = part.match(amountRegex);
        if (!match) {
          return { label: part, amount: null };
        }

        return {
          label: part.replace(amountRegex, "").trim(),
          amount: normalizeAmount(match[1]),
        };
      });
      continue;
    }

    if (line.startsWith("Importes:")) {
      const content = line.replace("Importes:", "").trim();
      const totals = content
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean);
      details.totals = totals.map((item) => {
        const match = item.match(/([\d.,]+)\s*EUR/i);
        return {
          label: item.replace(/[\d.,]+\s*EUR/i, "").trim(),
          amount: match ? normalizeAmount(match[1]) : null,
        };
      });
      continue;
    }

    details.general.push(line);
  }

  return details;
}
