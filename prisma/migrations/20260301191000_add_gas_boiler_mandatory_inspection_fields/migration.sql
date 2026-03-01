ALTER TABLE "GasBoiler"
ADD COLUMN "lastMandatoryInspectionDate" DATETIME;

ALTER TABLE "GasBoiler"
ADD COLUMN "mandatoryInspectionIntervalYears" INTEGER NOT NULL DEFAULT 5;
