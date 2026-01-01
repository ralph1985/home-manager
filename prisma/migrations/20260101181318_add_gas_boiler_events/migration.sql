-- CreateTable
CREATE TABLE "GasBoilerMaintenanceEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "boilerId" INTEGER NOT NULL,
    "eventDate" DATETIME,
    "periodLabel" TEXT,
    "title" TEXT NOT NULL,
    "provider" TEXT,
    "amount" DECIMAL,
    "currency" TEXT,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "coverageNotes" TEXT,
    "expiresOn" DATETIME,
    CONSTRAINT "GasBoilerMaintenanceEvent_boilerId_fkey" FOREIGN KEY ("boilerId") REFERENCES "GasBoiler" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
