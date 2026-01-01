-- CreateTable
CREATE TABLE "GasBoiler" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "homeId" INTEGER NOT NULL,
    "equipmentType" TEXT,
    "modelName" TEXT,
    "officialServiceCompany" TEXT,
    "commissioningDate" DATETIME,
    "lastAnnualReviewDate" DATETIME,
    "maintenancePlan" TEXT,
    "maintenanceContractNumber" TEXT,
    "maintenanceContractStart" DATETIME,
    "maintenanceContractEnd" DATETIME,
    CONSTRAINT "GasBoiler_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GasBoiler_homeId_key" ON "GasBoiler"("homeId");
