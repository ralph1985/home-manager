-- CreateTable
CREATE TABLE "GasReading" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "homeId" INTEGER NOT NULL,
    "supplyPointId" INTEGER,
    "readingDate" DATETIME NOT NULL,
    "readingM3" DECIMAL NOT NULL,
    "notes" TEXT,
    "isEstimated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GasReading_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GasReading_supplyPointId_fkey" FOREIGN KEY ("supplyPointId") REFERENCES "GasSupplyPoint" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GasReading_homeId_readingDate_idx" ON "GasReading"("homeId", "readingDate");
