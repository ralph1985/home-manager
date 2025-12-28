-- CreateTable
CREATE TABLE "VehiclePurchase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vehicleId" INTEGER NOT NULL,
    "offerIssueDate" DATETIME NOT NULL,
    "offerValidUntil" DATETIME,
    "offerNumber" TEXT,
    "customerNumber" TEXT,
    "dealerName" TEXT NOT NULL,
    "dealerAddress" TEXT,
    "dealerPhone" TEXT,
    "dealerEmail" TEXT,
    "advisorName" TEXT,
    "advisorPhone" TEXT,
    "advisorEmail" TEXT,
    "customerFirstName" TEXT,
    "customerLastName" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "vehicleModel" TEXT NOT NULL,
    "vehicleTransmission" TEXT,
    "vehicleTrim" TEXT,
    "vehicleFuel" TEXT,
    "vehiclePowerKw" INTEGER,
    "vehiclePowerCv" INTEGER,
    "vehicleEmissionsCo2WltpGkm" INTEGER,
    "optionsTotalBase" DECIMAL,
    "optionsTotalPvp" DECIMAL,
    "servicesTotal" DECIMAL,
    "accessoriesTotal" DECIMAL,
    "vehicleBasePrice" DECIMAL,
    "vehiclePvpPrice" DECIMAL,
    "campaignBase" DECIMAL,
    "campaignPvp" DECIMAL,
    "vatAmount" DECIMAL,
    "registrationTaxAmount" DECIMAL,
    "taxDeduction" DECIMAL,
    "vehicleSubtotalBase" DECIMAL,
    "vehicleSubtotalPvp" DECIMAL,
    "summaryServices" DECIMAL,
    "summaryAccessories" DECIMAL,
    "summarySupplies" DECIMAL,
    "totalWithoutTradeIn" DECIMAL,
    "tradeInValue" DECIMAL,
    "totalToPay" DECIMAL,
    CONSTRAINT "VehiclePurchase_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehiclePurchaseOption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "purchaseId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "basePrice" DECIMAL NOT NULL,
    "pvpPrice" DECIMAL NOT NULL,
    CONSTRAINT "VehiclePurchaseOption_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "VehiclePurchase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VehiclePurchase_vehicleId_key" ON "VehiclePurchase"("vehicleId");
