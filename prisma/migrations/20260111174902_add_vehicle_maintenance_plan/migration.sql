-- CreateTable
CREATE TABLE "VehicleMaintenancePlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehicleId" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "kmPerYear" INTEGER NOT NULL DEFAULT 25000,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VehicleMaintenancePlan_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehicleMaintenancePlanItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "planId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "intervalKmMin" INTEGER,
    "intervalKmMax" INTEGER,
    "intervalMonths" INTEGER,
    "sortOrder" INTEGER NOT NULL,
    "actions" JSONB,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VehicleMaintenancePlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "VehicleMaintenancePlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleMaintenancePlan_vehicleId_key" ON "VehicleMaintenancePlan"("vehicleId");
