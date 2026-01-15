-- CreateTable
CREATE TABLE "HomeInsurancePolicy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "homeId" INTEGER NOT NULL,
    "insurer" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "documentStatus" TEXT NOT NULL,
    "issueDate" DATETIME,
    "effectiveDate" DATETIME NOT NULL,
    "expiryDate" DATETIME NOT NULL,
    "receiptStart" DATETIME,
    "receiptEnd" DATETIME,
    "revaluationPct" DECIMAL,
    "premiumTotal" DECIMAL,
    "paymentMethod" TEXT,
    "paymentFrequency" TEXT,
    "documentUrl" TEXT,
    "riskAddressLine" TEXT,
    "riskPostalCode" TEXT,
    "riskCity" TEXT,
    "details" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HomeInsurancePolicy_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "HomeInsurancePolicy_homeId_idx" ON "HomeInsurancePolicy"("homeId");

-- CreateIndex
CREATE INDEX "HomeInsurancePolicy_expiryDate_idx" ON "HomeInsurancePolicy"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "HomeInsurancePolicy_homeId_policyNumber_effectiveDate_key" ON "HomeInsurancePolicy"("homeId", "policyNumber", "effectiveDate");
