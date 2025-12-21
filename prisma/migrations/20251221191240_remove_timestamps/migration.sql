/*
  Warnings:

  - You are about to drop the column `createdAt` on the `BillCostLine` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `BillCostLine` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `CostCategory` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `CostCategory` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ElectricityBill` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ElectricityBill` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Provider` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BillCostLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "billId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    CONSTRAINT "BillCostLine_billId_fkey" FOREIGN KEY ("billId") REFERENCES "ElectricityBill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BillCostLine_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CostCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BillCostLine" ("amount", "billId", "categoryId", "id") SELECT "amount", "billId", "categoryId", "id" FROM "BillCostLine";
DROP TABLE "BillCostLine";
ALTER TABLE "new_BillCostLine" RENAME TO "BillCostLine";
CREATE UNIQUE INDEX "BillCostLine_billId_categoryId_key" ON "BillCostLine"("billId", "categoryId");
CREATE TABLE "new_CostCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_CostCategory" ("id", "name") SELECT "id", "name" FROM "CostCategory";
DROP TABLE "CostCategory";
ALTER TABLE "new_CostCategory" RENAME TO "CostCategory";
CREATE TABLE "new_ElectricityBill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "totalAmount" DECIMAL NOT NULL,
    "issueDate" DATETIME NOT NULL,
    "paymentDate" DATETIME,
    "consumptionKwh" DECIMAL NOT NULL,
    "pdfUrl" TEXT,
    "homeId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    CONSTRAINT "ElectricityBill_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ElectricityBill_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ElectricityBill" ("consumptionKwh", "homeId", "id", "issueDate", "paymentDate", "pdfUrl", "providerId", "totalAmount") SELECT "consumptionKwh", "homeId", "id", "issueDate", "paymentDate", "pdfUrl", "providerId", "totalAmount" FROM "ElectricityBill";
DROP TABLE "ElectricityBill";
ALTER TABLE "new_ElectricityBill" RENAME TO "ElectricityBill";
CREATE TABLE "new_Provider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Provider" ("id", "name") SELECT "id", "name" FROM "Provider";
DROP TABLE "Provider";
ALTER TABLE "new_Provider" RENAME TO "Provider";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
