-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WaterBill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "homeId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "supplyPointId" INTEGER,
    "invoiceNumber" TEXT,
    "billType" TEXT NOT NULL DEFAULT 'factura_regular',
    "cancelsBillId" INTEGER,
    "cancelsInvoiceNumber" TEXT,
    "cancellationReason" TEXT,
    "status" TEXT,
    "issueDate" DATETIME NOT NULL,
    "dueDate" DATETIME,
    "paymentDate" DATETIME,
    "periodStart" DATETIME,
    "periodEnd" DATETIME,
    "periodType" TEXT,
    "totalAmount" DECIMAL NOT NULL,
    "totalToPay" DECIMAL,
    "creditAmount" DECIMAL,
    "consumptionM3" DECIMAL,
    "averageMonthlyConsumptionM3" DECIMAL,
    "readingType" TEXT,
    "averageDailyCost" DECIMAL,
    "pdfUrl" TEXT,
    "meterNumber" TEXT,
    "meterDiameterMm" INTEGER,
    CONSTRAINT "WaterBill_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WaterBill_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "WaterProvider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WaterBill_supplyPointId_fkey" FOREIGN KEY ("supplyPointId") REFERENCES "WaterSupplyPoint" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WaterBill_cancelsBillId_fkey" FOREIGN KEY ("cancelsBillId") REFERENCES "WaterBill" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WaterBill" ("averageDailyCost", "consumptionM3", "dueDate", "homeId", "id", "invoiceNumber", "issueDate", "paymentDate", "pdfUrl", "periodEnd", "periodStart", "periodType", "providerId", "status", "supplyPointId", "totalAmount") SELECT "averageDailyCost", "consumptionM3", "dueDate", "homeId", "id", "invoiceNumber", "issueDate", "paymentDate", "pdfUrl", "periodEnd", "periodStart", "periodType", "providerId", "status", "supplyPointId", "totalAmount" FROM "WaterBill";
DROP TABLE "WaterBill";
ALTER TABLE "new_WaterBill" RENAME TO "WaterBill";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
