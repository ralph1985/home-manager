-- AlterTable
ALTER TABLE "GasBoiler" ADD COLUMN "applianceTypeCode" TEXT;
ALTER TABLE "GasBoiler" ADD COLUMN "brand" TEXT;
ALTER TABLE "GasBoiler" ADD COLUMN "combustionEfficiencyPercent" DECIMAL;
ALTER TABLE "GasBoiler" ADD COLUMN "fuelType" TEXT;
ALTER TABLE "GasBoiler" ADD COLUMN "nominalPowerKw" DECIMAL;

-- AlterTable
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "analyzerSerialNumber" TEXT;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "co2Percent" DECIMAL;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "coAmbientPpm" DECIMAL;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "coCorrectedPpm" DECIMAL;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "defectsFound" BOOLEAN;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "documentCommercialCompany" TEXT;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "documentCommercialCompanyCif" TEXT;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "documentContractNumber" TEXT;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "documentCups" TEXT;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "documentIssueDate" DATETIME;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "documentIssuePlace" TEXT;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "documentIssuingEntity" TEXT;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "extractionConfidence" DECIMAL;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "holderName" TEXT;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "holderNif" TEXT;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "inspectionResult" TEXT;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "inspectorLicense" TEXT;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "inspectorName" TEXT;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "installationAddress" TEXT;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "sourceDocumentType" TEXT;
ALTER TABLE "GasBoilerMaintenanceEvent" ADD COLUMN "sourceLanguage" TEXT;
