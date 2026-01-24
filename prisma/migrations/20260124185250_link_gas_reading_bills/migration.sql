-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GasReading" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "homeId" INTEGER NOT NULL,
    "supplyPointId" INTEGER,
    "billId" INTEGER,
    "readingDate" DATETIME NOT NULL,
    "readingM3" DECIMAL NOT NULL,
    "notes" TEXT,
    "isEstimated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GasReading_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GasReading_supplyPointId_fkey" FOREIGN KEY ("supplyPointId") REFERENCES "GasSupplyPoint" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GasReading_billId_fkey" FOREIGN KEY ("billId") REFERENCES "GasBill" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_GasReading" ("createdAt", "homeId", "id", "isEstimated", "notes", "readingDate", "readingM3", "supplyPointId", "updatedAt") SELECT "createdAt", "homeId", "id", "isEstimated", "notes", "readingDate", "readingM3", "supplyPointId", "updatedAt" FROM "GasReading";
DROP TABLE "GasReading";
ALTER TABLE "new_GasReading" RENAME TO "GasReading";
CREATE INDEX "GasReading_homeId_readingDate_idx" ON "GasReading"("homeId", "readingDate");
CREATE INDEX "GasReading_billId_idx" ON "GasReading"("billId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
