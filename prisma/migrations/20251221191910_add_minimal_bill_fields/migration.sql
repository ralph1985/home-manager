-- AlterTable
ALTER TABLE "Provider" ADD COLUMN "address" TEXT;
ALTER TABLE "Provider" ADD COLUMN "market" TEXT;
ALTER TABLE "Provider" ADD COLUMN "taxId" TEXT;

-- CreateTable
CREATE TABLE "SupplyPoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "homeId" INTEGER NOT NULL,
    "cups" TEXT NOT NULL,
    "distributor" TEXT,
    "accessContract" TEXT,
    "gridToll" TEXT,
    "addressLine" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "contractedPowerP1" DECIMAL,
    "contractedPowerP2" DECIMAL,
    "meters" TEXT,
    CONSTRAINT "SupplyPoint_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ElectricityBill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "totalAmount" DECIMAL NOT NULL,
    "issueDate" DATETIME NOT NULL,
    "paymentDate" DATETIME,
    "consumptionKwh" DECIMAL NOT NULL,
    "pdfUrl" TEXT,
    "homeId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "supplyPointId" INTEGER,
    "invoiceNumber" TEXT,
    "referenceNumber" TEXT,
    "periodStart" DATETIME,
    "periodEnd" DATETIME,
    "periodDays" INTEGER,
    "tariff" TEXT,
    "contractNumber" TEXT,
    CONSTRAINT "ElectricityBill_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ElectricityBill_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ElectricityBill_supplyPointId_fkey" FOREIGN KEY ("supplyPointId") REFERENCES "SupplyPoint" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ElectricityBill" ("consumptionKwh", "homeId", "id", "issueDate", "paymentDate", "pdfUrl", "providerId", "totalAmount") SELECT "consumptionKwh", "homeId", "id", "issueDate", "paymentDate", "pdfUrl", "providerId", "totalAmount" FROM "ElectricityBill";
DROP TABLE "ElectricityBill";
ALTER TABLE "new_ElectricityBill" RENAME TO "ElectricityBill";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SupplyPoint_cups_key" ON "SupplyPoint"("cups");
