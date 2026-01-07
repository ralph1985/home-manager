-- CreateTable
CREATE TABLE "VehicleInsurance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehicleId" INTEGER NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "policySupplement" TEXT,
    "policyType" TEXT,
    "issueDate" DATETIME,
    "effectiveDate" DATETIME NOT NULL,
    "expiryDate" DATETIME NOT NULL,
    "duration" TEXT,
    "revaluation" TEXT,
    "premiumTotal" DECIMAL,
    "paymentMethod" TEXT,
    "paymentFrequency" TEXT,
    "ownDamageDeductible" DECIMAL,
    "signatureStatus" TEXT,
    "details" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VehicleInsurance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleInsurance_vehicleId_key" ON "VehicleInsurance"("vehicleId");
