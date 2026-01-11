-- CreateTable
CREATE TABLE "VehicleSpecs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehicleId" INTEGER NOT NULL,
    "type" TEXT,
    "color" TEXT,
    "seats" INTEGER,
    "service" TEXT,
    "fuelType" TEXT,
    "engineDisplacementCc" INTEGER,
    "powerNetKw" INTEGER,
    "emissionsCo2Gkm" INTEGER,
    "emissionsStandard" TEXT,
    "baseBrand" TEXT,
    "baseType" TEXT,
    "variant" TEXT,
    "version" TEXT,
    "homologationCode" TEXT,
    "homologationCodeBase" TEXT,
    "maxMassKg" INTEGER,
    "maxLoadKg" INTEGER,
    "massInServiceKg" INTEGER,
    "powerWeightRatio" DECIMAL,
    CONSTRAINT "VehicleSpecs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehicleRegistrationDocument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehicleId" INTEGER NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentReference" TEXT,
    "caseFileNumber" TEXT,
    "issueDate" DATETIME,
    "documentDate" DATETIME,
    "validUntil" DATETIME,
    "verificationCode" TEXT,
    "verificationUrl" TEXT,
    "issuingAuthority" TEXT,
    "issuingMinistry" TEXT,
    "documentModel" TEXT,
    "registrationOffice" TEXT,
    "originCode" TEXT,
    "additionalCode" TEXT,
    "documentHash" TEXT,
    "holderName" TEXT,
    "holderIsRenting" BOOLEAN,
    "validityDays" INTEGER,
    "requiresValidInspection" BOOLEAN,
    "invalidForAdministrativeProcedures" BOOLEAN,
    CONSTRAINT "VehicleRegistrationDocument_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleSpecs_vehicleId_key" ON "VehicleSpecs"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleRegistrationDocument_vehicleId_key" ON "VehicleRegistrationDocument"("vehicleId");
