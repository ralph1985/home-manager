-- CreateTable
CREATE TABLE "WaterProvider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "address" TEXT
);

-- CreateTable
CREATE TABLE "WaterSupplyPoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "homeId" INTEGER NOT NULL,
    "contractNumber" TEXT,
    "meterNumber" TEXT,
    "meterDiameterMm" INTEGER,
    "supplyType" TEXT,
    "usage" TEXT,
    "addressLine" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    CONSTRAINT "WaterSupplyPoint_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaterBill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "homeId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "supplyPointId" INTEGER,
    "invoiceNumber" TEXT,
    "status" TEXT,
    "issueDate" DATETIME NOT NULL,
    "dueDate" DATETIME,
    "paymentDate" DATETIME,
    "periodStart" DATETIME,
    "periodEnd" DATETIME,
    "periodType" TEXT,
    "totalAmount" DECIMAL NOT NULL,
    "consumptionM3" DECIMAL,
    "averageDailyCost" DECIMAL,
    "pdfUrl" TEXT,
    CONSTRAINT "WaterBill_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WaterBill_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "WaterProvider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WaterBill_supplyPointId_fkey" FOREIGN KEY ("supplyPointId") REFERENCES "WaterSupplyPoint" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaterCostCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "WaterBillCostLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "billId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    CONSTRAINT "WaterBillCostLine_billId_fkey" FOREIGN KEY ("billId") REFERENCES "WaterBill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WaterBillCostLine_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "WaterCostCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WaterBillCostLine_billId_categoryId_key" ON "WaterBillCostLine"("billId", "categoryId");
