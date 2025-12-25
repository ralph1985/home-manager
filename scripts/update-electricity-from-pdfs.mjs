#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || "file:./data/dev.db",
  }),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultPdfDir = path.join(__dirname, "..", "data", "Facturas de luz de 2024");
const defaultHomeName = "Meco";
const defaultProviderName = "Naturgy Clientes, S.A.U.";
const defaultOcrLang = "spa";
const defaultOcrCacheDir = path.join("data", "ocr-cache");

function parseEuroString(value) {
  if (!value) return null;
  const normalized = value.toString().replace("−", "-").replace(/\./g, "").replace(",", ".");
  const numberValue = Number(normalized);
  return Number.isNaN(numberValue) ? null : numberValue;
}

function extractEuroValues(text) {
  const matches = text.match(/-?\d{1,3}(?:\.\d{3})*(?:,\d{2})/g) || [];
  return matches.map(parseEuroString).filter((value) => value != null);
}

function findMatch(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function buildLines(items) {
  const sorted = items
    .filter((item) => item.str && item.str.trim())
    .map((item) => ({
      text: item.str.trim(),
      x: item.transform[4],
      y: item.transform[5],
    }))
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const lines = [];
  let current = null;
  const threshold = 2;

  for (const item of sorted) {
    if (!current || Math.abs(current.y - item.y) > threshold) {
      current = { y: item.y, parts: [item] };
      lines.push(current);
      continue;
    }
    current.parts.push(item);
  }

  return lines.map((line) =>
    line.parts
      .sort((a, b) => a.x - b.x)
      .map((part) => part.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

async function parsePdf(filePath, pdfjsLib) {
  const data = fs.readFileSync(filePath);
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(data) }).promise;
  const lines = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    lines.push(...buildLines(content.items));
  }

  return lines;
}

function extractKwhValues(lines) {
  const values = [];
  for (const line of lines) {
    const match = line.match(/(\d+(?:[.,]\d+)?)\s*kWh/i);
    if (match) {
      values.push(parseEuroString(match[1]));
    }
  }
  return values.filter((value) => value != null);
}

function extractBetween(lines, start, endMarkers, includeStart = false) {
  const startIndex = lines.findIndex((line) => line.includes(start));
  if (startIndex === -1) return null;
  let endIndex = lines.length;
  for (const marker of endMarkers) {
    const idx = lines.findIndex((line, index) => index > startIndex && line.includes(marker));
    if (idx !== -1 && idx < endIndex) {
      endIndex = idx;
    }
  }
  return lines.slice(includeStart ? startIndex : startIndex + 1, endIndex);
}

function sumLineTotals(lines) {
  const totals = lines
    .map((line) => {
      const values = extractEuroValues(line);
      return values.length ? values[values.length - 1] : null;
    })
    .filter((value) => value != null);
  if (!totals.length) return null;
  return totals.reduce((sum, value) => sum + value, 0);
}

function lineAmount(lines, label) {
  const line = lines.find((item) => item.toLowerCase().includes(label.toLowerCase()));
  if (!line) return null;
  const values = extractEuroValues(line);
  return values.length ? values[values.length - 1] : null;
}

function findLine(lines, label) {
  return lines.find((item) => item.toLowerCase().includes(label.toLowerCase())) || null;
}

function findAmountNearLabel(lines, label, searchAhead = 5) {
  const index = lines.findIndex((line) => line.toLowerCase().includes(label.toLowerCase()));
  if (index === -1) return null;
  const current = extractEuroValues(lines[index]);
  if (current.length) return current[current.length - 1];
  for (let offset = 1; offset <= searchAhead && index + offset < lines.length; offset += 1) {
    const nextValues = extractEuroValues(lines[index + offset]);
    if (nextValues.length) return nextValues[nextValues.length - 1];
  }
  return null;
}

function extractTotalAmount(lines) {
  return (
    findAmountNearLabel(lines, "Total a pagar") ??
    findAmountNearLabel(lines, "Total factura") ??
    findAmountNearLabel(lines, "Total facturado") ??
    findAmountNearLabel(lines, "Importe total") ??
    lineAmount(lines, "Total a pagar") ??
    lineAmount(lines, "Total factura") ??
    lineAmount(lines, "Total facturado") ??
    lineAmount(lines, "Importe total")
  );
}

function extractInvoiceNumber(lines, fallback) {
  for (const line of lines) {
    const match = line.match(/FE\d{8,}/);
    if (match) return match[0];
  }
  return fallback || null;
}

function extractReference(lines) {
  for (const line of lines) {
    const value = findMatch(line, /N[^\n]{0,10}referencia:\s*(\d+)/i);
    if (value) return value;
  }
  return null;
}

function extractTariff(lines) {
  for (const line of lines) {
    const value = findMatch(line, /Peaje de transporte y distribuci[oó]n:\s*([0-9A-Za-z.]+)/i);
    if (value) return value;
  }
  return null;
}

function extractContract(lines) {
  const marker = "Nº contrato de acceso";
  const index = lines.findIndex((line) => line.includes(marker));
  if (index === -1) return null;
  for (let i = index; i < Math.min(lines.length, index + 3); i += 1) {
    const match = lines[i].match(/\b(\d{6,})\b/);
    if (match) return match[1];
  }
  return null;
}

function extractSupplyPoint(lines) {
  let cups = null;
  let address = null;
  let distributor = null;

  for (const line of lines) {
    if (!cups) {
      const match = line.match(/CUPS:\s*([A-Z0-9]+)/i);
      if (match) cups = match[1];
    }
    if (!address) {
      const match = line.match(/Direcci[oó]n suministro:\s*(.+)/i);
      if (match) address = match[1].trim();
    }
    if (!distributor && line.includes("REDES")) {
      const match = line.match(/\(([^)]+)\)/);
      if (match) distributor = match[1].trim();
    }
  }

  return { cups, address, distributor };
}

function parseDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value);
  }
  const match = value.match(/(\d{2})[./](\d{2})[./](\d{2,4})/);
  if (!match) return null;
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return new Date(`${year}-${match[2]}-${match[1]}`);
}

function parseDates(lines) {
  let issueDate = null;
  let paymentDate = null;
  let periodStart = null;
  let periodEnd = null;

  for (const line of lines) {
    if (!issueDate) {
      const match = line.match(/Fecha de emisi[oó]n:\s*([0-9./-]+)/i);
      if (match) issueDate = parseDate(match[1]);
    }
    if (!paymentDate) {
      const match = line.match(/Fecha (?:de cargo|estimada de cargo):\s*([0-9./-]+)/i);
      if (match) paymentDate = parseDate(match[1]);
    }
    if (!periodStart || !periodEnd) {
      const match = line.match(/del\s*([0-9./-]+)\s*al\s*([0-9./-]+)/i);
      if (match) {
        periodStart = parseDate(match[1]);
        periodEnd = parseDate(match[2]);
      }
    }
  }

  return { issueDate, paymentDate, periodStart, periodEnd };
}

function computePeriodDays(start, end) {
  if (!start || !end) return null;
  const diff = end.getTime() - start.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  return Number.isFinite(days) ? days : null;
}

async function resolveCategories() {
  const categories = await prisma.costCategory.findMany();
  const map = new Map(categories.map((category) => [category.name, category.id]));
  return {
    consumo: map.get("Consumo electricidad"),
    potenciaP1: map.get("Potencia P1"),
    potenciaP2: map.get("Potencia P2"),
    bonoSocial: map.get("Bono social"),
    impuesto: map.get("Impuesto electricidad"),
    alquiler: map.get("Alquiler contador"),
    iva: map.get("IVA"),
  };
}

async function upsertLine({ billId, categoryId, amount }) {
  if (!categoryId || amount == null) return false;
  const existing = await prisma.billCostLine.findFirst({
    where: { billId, categoryId },
  });
  if (!existing) {
    await prisma.billCostLine.create({
      data: {
        billId,
        categoryId,
        amount: new Prisma.Decimal(amount),
      },
    });
    return true;
  }
  await prisma.billCostLine.update({
    where: { id: existing.id },
    data: { amount: new Prisma.Decimal(amount) },
  });
  return true;
}

async function runOcr(files, ocrLang, outputDir, forceOcr, invalidateSignatures, maxImageMpx) {
  const ocrFiles = [];
  fs.mkdirSync(outputDir, { recursive: true });
  for (const filePath of files) {
    const outputPath = path.join(outputDir, path.basename(filePath));
    if (!fs.existsSync(outputPath)) {
      const args = ["--language", ocrLang];
      if (forceOcr) {
        args.push("--force-ocr");
      } else {
        args.push("--skip-text");
      }
      if (invalidateSignatures) {
        args.push("--invalidate-digital-signatures");
      }
      if (maxImageMpx) {
        args.push("--max-image-mpixels", String(maxImageMpx));
      }
      args.push(filePath, outputPath);
      const result = spawnSync("ocrmypdf", args, { stdio: "inherit" });
      if (result.status !== 0) {
        throw new Error(`OCR failed for ${filePath}.`);
      }
    }
    ocrFiles.push(outputPath);
  }
  return ocrFiles;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const useOcr = args.includes("--ocr");
  const debug = args.includes("--debug");
  const forceOcr = args.includes("--force-ocr") || args.includes("--ocr-force");
  const invalidateSignatures =
    forceOcr || args.includes("--invalidate-signatures") || args.includes("--break-signatures");
  const maxImageArg = args.find((arg) => arg.startsWith("--ocr-max-mpixels="));
  const maxImageMpx = maxImageArg ? Number(maxImageArg.split("=")[1]) : 600;
  const grepArg = args.find((arg) => arg.startsWith("--grep="));
  const grepText = grepArg ? grepArg.split("=").slice(1).join("=").toLowerCase() : null;
  const ocrLangArg = args.find((arg) => arg.startsWith("--ocr-lang="));
  const ocrLang = ocrLangArg ? ocrLangArg.split("=")[1] : defaultOcrLang;
  const ocrOutputArg = args.find((arg) => arg.startsWith("--ocr-output="));
  const targetArg = args.find((arg) => !arg.startsWith("--"));
  const targetPath = targetArg ? path.resolve(targetArg) : defaultPdfDir;
  const stat = fs.statSync(targetPath);
  const files = stat.isDirectory()
    ? fs
        .readdirSync(targetPath)
        .filter((file) => file.toLowerCase().endsWith(".pdf"))
        .sort()
        .map((file) => path.join(targetPath, file))
    : [targetPath];

  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const ocrBaseDir = ocrOutputArg
    ? path.resolve(ocrOutputArg.split("=")[1])
    : path.join(defaultOcrCacheDir, `electricity-${Date.now()}`);
  const processedFiles = useOcr
    ? await runOcr(files, ocrLang, ocrBaseDir, forceOcr, invalidateSignatures, maxImageMpx)
    : files;

  if (useOcr) {
    console.log(`OCR output: ${ocrBaseDir}`);
  }

  if (dryRun) {
    const previews = [];
    for (const filePath of processedFiles) {
      const lines = await parsePdf(filePath, pdfjsLib);
      const invoiceFromFilename = findMatch(path.basename(filePath), /(FE\d{8,})/);
      const invoiceNumber = extractInvoiceNumber(lines, invoiceFromFilename);
      const dates = parseDates(lines);
      const amounts = {
        consumo: sectionAmount(lines, "Consumo electricidad", [
          "Término de potencia P1",
          "Término de potencia P2",
          "Subtotal",
          "Impuesto electricidad",
        ]),
        potenciaP1: sectionAmount(lines, "Término de potencia P1", [
          "Término de potencia P2",
          "Subtotal",
          "Impuesto electricidad",
        ]),
        potenciaP2: sectionAmount(lines, "Término de potencia P2", [
          "Importe de la energía asociada",
          "mecanismo ibérico",
          "mecanismo iberico",
          "Financiación del Bono Social",
          "Bono social",
          "Subtotal",
          "Impuesto electricidad",
        ]),
        bonoSocial: lineAmount(lines, "Bono social"),
        impuesto: lineAmount(lines, "Impuesto electricidad"),
        alquiler: lineAmount(lines, "Alquiler de contador"),
        iva: lineAmount(lines, "Total IVA"),
      };
      const totalFromBreakdown = Object.values(amounts).reduce((sum, value) => {
        if (value == null) return sum;
        return sum + value;
      }, 0);
      const hasBreakdown = Object.values(amounts).some((value) => value != null);
      const totalAmount = extractTotalAmount(lines) ?? (hasBreakdown ? totalFromBreakdown : null);
      const consumoLinesForKwh = extractBetween(
        lines,
        "Consumo electricidad",
        ["Término de potencia P1", "Término de potencia P2", "Subtotal", "Impuesto electricidad"],
        true
      );
      const consumptionKwh = consumoLinesForKwh ? extractKwhValues(consumoLinesForKwh) : [];
      const totalKwh = consumptionKwh.length
        ? consumptionKwh.reduce((sum, value) => sum + value, 0)
        : null;

      const preview = {
        file: path.basename(filePath),
        invoiceNumber,
        referenceNumber: extractReference(lines),
        tariff: extractTariff(lines),
        contractNumber: extractContract(lines),
        issueDate: dates.issueDate,
        paymentDate: dates.paymentDate,
        periodStart: dates.periodStart,
        periodEnd: dates.periodEnd,
        totalAmount,
        consumptionKwh: totalKwh,
        costLines: amounts,
      };

      if (debug) {
        preview.debugLines = {
          totalCandidates: [
            { label: "Total a pagar", line: findLine(lines, "Total a pagar") },
            { label: "Total factura", line: findLine(lines, "Total factura") },
            { label: "Total facturado", line: findLine(lines, "Total facturado") },
            { label: "Importe total", line: findLine(lines, "Importe total") },
          ],
          consumo: findLine(lines, "Consumo electricidad"),
          potenciaP1: findLine(lines, "Término de potencia P1"),
          potenciaP2: findLine(lines, "Término de potencia P2"),
          bonoSocial: findLine(lines, "Bono social"),
          impuesto: findLine(lines, "Impuesto electricidad"),
          alquiler: findLine(lines, "Alquiler de contador"),
          iva: findLine(lines, "Total IVA"),
        };
      }

      if (grepText) {
        preview.grepMatches = lines.filter((line) => line.toLowerCase().includes(grepText));
      }

      previews.push(preview);
    }

    console.log(JSON.stringify(previews, null, 2));
    return;
  }

  const categories = await resolveCategories();
  const home = await prisma.home.findFirst({ where: { name: defaultHomeName } });
  if (!home) {
    throw new Error(`Home "${defaultHomeName}" not found.`);
  }

  let provider = await prisma.provider.findFirst({ where: { name: defaultProviderName } });
  if (!provider) {
    provider = await prisma.provider.create({ data: { name: defaultProviderName } });
  }

  const missing = [];
  let updatedBills = 0;
  let createdBills = 0;

  for (const filePath of processedFiles) {
    const file = path.basename(filePath);
    const lines = await parsePdf(filePath, pdfjsLib);
    const invoiceFromFilename = findMatch(file, /(FE\d{8,})/);
    const invoiceNumber = extractInvoiceNumber(lines, invoiceFromFilename);

    if (!invoiceNumber) {
      missing.push({ file, reason: "missing invoice number" });
      continue;
    }

    let bill = await prisma.electricityBill.findFirst({
      where: { invoiceNumber },
    });

    const amounts = {
      consumo: sectionAmount(lines, "Consumo electricidad", [
        "Término de potencia P1",
        "Término de potencia P2",
        "Subtotal",
        "Impuesto electricidad",
      ]),
      potenciaP1: sectionAmount(lines, "Término de potencia P1", [
        "Término de potencia P2",
        "Subtotal",
        "Impuesto electricidad",
      ]),
      potenciaP2: sectionAmount(lines, "Término de potencia P2", [
        "Importe de la energía asociada",
        "mecanismo ibérico",
        "mecanismo iberico",
        "Financiación del Bono Social",
        "Bono social",
        "Subtotal",
        "Impuesto electricidad",
      ]),
      bonoSocial: lineAmount(lines, "Bono social"),
      impuesto: lineAmount(lines, "Impuesto electricidad"),
      alquiler: lineAmount(lines, "Alquiler de contador"),
      iva: lineAmount(lines, "Total IVA"),
    };
    const totalFromBreakdown = Object.values(amounts).reduce((sum, value) => {
      if (value == null) return sum;
      return sum + value;
    }, 0);
    const hasBreakdown = Object.values(amounts).some((value) => value != null);
    const totalAmount = extractTotalAmount(lines) ?? (hasBreakdown ? totalFromBreakdown : null);

    const supplyPointData = extractSupplyPoint(lines);
    let supplyPoint = null;
    if (supplyPointData.cups) {
      supplyPoint = await prisma.supplyPoint.findUnique({
        where: { cups: supplyPointData.cups },
      });
    }

    if (!supplyPoint) {
      supplyPoint = await prisma.supplyPoint.findFirst({
        where: { homeId: home.id },
      });
    }

    if (!supplyPoint) {
      supplyPoint = await prisma.supplyPoint.create({
        data: {
          homeId: home.id,
          cups: supplyPointData.cups ?? `UNKNOWN-${invoiceNumber}`,
          distributor: supplyPointData.distributor ?? null,
          addressLine: supplyPointData.address ?? null,
        },
      });
    }

    const consumoLinesForKwh = extractBetween(
      lines,
      "Consumo electricidad",
      ["Término de potencia P1", "Término de potencia P2", "Subtotal", "Impuesto electricidad"],
      true
    );
    const consumptionKwh = consumoLinesForKwh ? extractKwhValues(consumoLinesForKwh) : [];
    const totalKwh = consumptionKwh.length
      ? consumptionKwh.reduce((sum, value) => sum + value, 0)
      : null;

    const dates = parseDates(lines);
    const periodDays = computePeriodDays(dates.periodStart, dates.periodEnd);

    const billUpdates = {
      referenceNumber: extractReference(lines) || (bill ? bill.referenceNumber : null),
      tariff: extractTariff(lines) || (bill ? bill.tariff : null),
      contractNumber: extractContract(lines) || (bill ? bill.contractNumber : null),
      issueDate: dates.issueDate || (bill ? bill.issueDate : null),
      paymentDate: dates.paymentDate || (bill ? bill.paymentDate : null),
      periodStart: dates.periodStart || (bill ? bill.periodStart : null),
      periodEnd: dates.periodEnd || (bill ? bill.periodEnd : null),
      periodDays: periodDays ?? (bill ? bill.periodDays : null),
      totalAmount: totalAmount ?? (bill ? bill.totalAmount : null),
      consumptionKwh: totalKwh ?? (bill ? bill.consumptionKwh : null),
      supplyPointId: supplyPoint.id,
      providerId: provider.id,
      homeId: home.id,
    };

    if (!bill) {
      if (!billUpdates.issueDate || billUpdates.totalAmount == null) {
        missing.push({ file, reason: `missing required fields (${invoiceNumber})` });
        continue;
      }
      const electricityBill = await prisma.electricityBill.create({
        data: {
          homeId: home.id,
          providerId: provider.id,
          supplyPointId: supplyPoint.id,
          invoiceNumber,
          issueDate: billUpdates.issueDate,
          paymentDate: billUpdates.paymentDate,
          periodStart: billUpdates.periodStart,
          periodEnd: billUpdates.periodEnd,
          periodDays: billUpdates.periodDays,
          totalAmount: new Prisma.Decimal(billUpdates.totalAmount),
          consumptionKwh:
            billUpdates.consumptionKwh != null
              ? new Prisma.Decimal(billUpdates.consumptionKwh)
              : new Prisma.Decimal(0),
          tariff: billUpdates.tariff,
          contractNumber: billUpdates.contractNumber,
          referenceNumber: billUpdates.referenceNumber,
        },
      });
      bill = electricityBill;
      createdBills += 1;
    } else {
      await prisma.electricityBill.update({
        where: { id: bill.id },
        data: {
          referenceNumber: billUpdates.referenceNumber ?? undefined,
          tariff: billUpdates.tariff ?? undefined,
          contractNumber: billUpdates.contractNumber ?? undefined,
          issueDate: billUpdates.issueDate ?? undefined,
          paymentDate: billUpdates.paymentDate ?? undefined,
          periodStart: billUpdates.periodStart ?? undefined,
          periodEnd: billUpdates.periodEnd ?? undefined,
          periodDays: billUpdates.periodDays ?? undefined,
          totalAmount:
            billUpdates.totalAmount != null
              ? new Prisma.Decimal(billUpdates.totalAmount)
              : undefined,
          consumptionKwh:
            billUpdates.consumptionKwh != null
              ? new Prisma.Decimal(billUpdates.consumptionKwh)
              : undefined,
          supplyPointId: billUpdates.supplyPointId ?? undefined,
        },
      });
    }

    if (!hasBreakdown) {
      missing.push({ file, reason: `no cost breakdown (${invoiceNumber})` });
      continue;
    }

    const wrote = await Promise.all([
      upsertLine({ billId: bill.id, categoryId: categories.consumo, amount: amounts.consumo }),
      upsertLine({
        billId: bill.id,
        categoryId: categories.potenciaP1,
        amount: amounts.potenciaP1,
      }),
      upsertLine({
        billId: bill.id,
        categoryId: categories.potenciaP2,
        amount: amounts.potenciaP2,
      }),
      upsertLine({
        billId: bill.id,
        categoryId: categories.bonoSocial,
        amount: amounts.bonoSocial,
      }),
      upsertLine({ billId: bill.id, categoryId: categories.impuesto, amount: amounts.impuesto }),
      upsertLine({ billId: bill.id, categoryId: categories.alquiler, amount: amounts.alquiler }),
      upsertLine({ billId: bill.id, categoryId: categories.iva, amount: amounts.iva }),
    ]);

    if (wrote.some(Boolean)) {
      updatedBills += 1;
    }
  }

  console.log(
    `Processed ${processedFiles.length} PDFs. Updated bills: ${updatedBills}. Created bills: ${createdBills}.`
  );
  if (missing.length) {
    console.log("Missing/invalid PDFs:");
    missing.forEach((item) => {
      console.log(`- ${item.file}: ${item.reason}`);
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
function sectionAmount(lines, label, endMarkers) {
  const sectionLines = extractBetween(lines, label, endMarkers, true);
  if (!sectionLines) return null;
  const total = sumLineTotals(sectionLines);
  if (total != null) return total;
  return lineAmount(lines, label);
}
