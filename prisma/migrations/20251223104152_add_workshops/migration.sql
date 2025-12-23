-- CreateTable
CREATE TABLE "Workshop" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "addressLine" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VehicleMaintenance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehicleId" INTEGER NOT NULL,
    "workshopId" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "serviceDate" DATETIME NOT NULL,
    "odometerKm" INTEGER,
    "cost" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VehicleMaintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VehicleMaintenance_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_VehicleMaintenance" ("cost", "createdAt", "description", "id", "odometerKm", "serviceDate", "title", "vehicleId") SELECT "cost", "createdAt", "description", "id", "odometerKm", "serviceDate", "title", "vehicleId" FROM "VehicleMaintenance";
DROP TABLE "VehicleMaintenance";
ALTER TABLE "new_VehicleMaintenance" RENAME TO "VehicleMaintenance";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
