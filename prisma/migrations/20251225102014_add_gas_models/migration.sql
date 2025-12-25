-- CreateTable
CREATE TABLE "GasProvider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "address" TEXT,
    "web" TEXT,
    "email" TEXT,
    "phones" JSONB
);

-- CreateTable
CREATE TABLE "GasSupplyPoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "homeId" INTEGER NOT NULL,
    "cups" TEXT NOT NULL,
    "accessTariff" TEXT,
    "commercialTariff" TEXT,
    "contractNumber" TEXT,
    "meterNumber" TEXT,
    "addressLine" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    CONSTRAINT "GasSupplyPoint_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GasBill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "homeId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "supplyPointId" INTEGER,
    "invoiceNumber" TEXT,
    "mandateReference" TEXT,
    "issueDate" DATETIME NOT NULL,
    "chargeDate" DATETIME,
    "periodStart" DATETIME,
    "periodEnd" DATETIME,
    "periodDays" INTEGER,
    "totalAmount" DECIMAL NOT NULL,
    "totalToPay" DECIMAL,
    "currency" TEXT,
    "totalGasAmount" DECIMAL,
    "vatRate" DECIMAL,
    "vatAmount" DECIMAL,
    "consumptionM3" DECIMAL,
    "conversionFactor" DECIMAL,
    "consumptionKwh" DECIMAL,
    "supplyPressureBar" DECIMAL,
    "meterNumber" TEXT,
    "readingPrevDate" DATETIME,
    "readingPrevType" TEXT,
    "readingPrevM3" DECIMAL,
    "readingCurrDate" DATETIME,
    "readingCurrType" TEXT,
    "readingCurrM3" DECIMAL,
    "accessTariff" TEXT,
    "commercialTariff" TEXT,
    "contractNumber" TEXT,
    "peajesAmount" DECIMAL,
    "cargosAmount" DECIMAL,
    "cnmcPercent" DECIMAL,
    "gtsPercent" DECIMAL,
    "bankEntity" TEXT,
    "bankIbanMasked" TEXT,
    "pdfUrl" TEXT,
    CONSTRAINT "GasBill_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GasBill_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "GasProvider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GasBill_supplyPointId_fkey" FOREIGN KEY ("supplyPointId") REFERENCES "GasSupplyPoint" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GasCostCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "GasBillCostLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "billId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "periodStart" DATETIME,
    "periodEnd" DATETIME,
    "days" INTEGER,
    "quantity" DECIMAL,
    "unit" TEXT,
    "unitPrice" DECIMAL,
    CONSTRAINT "GasBillCostLine_billId_fkey" FOREIGN KEY ("billId") REFERENCES "GasBill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GasBillCostLine_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "GasCostCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GasSupplyPoint_cups_key" ON "GasSupplyPoint"("cups");

-- CreateIndex
CREATE UNIQUE INDEX "GasBillCostLine_billId_categoryId_periodStart_periodEnd_key" ON "GasBillCostLine"("billId", "categoryId", "periodStart", "periodEnd");
