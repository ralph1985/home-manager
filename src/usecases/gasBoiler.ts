import { calculateMandatoryGasInspection } from "@/domain/GasBoilerInspection";
import { getGasBoilerByHome } from "@/infrastructure/gasBoilerRepository";

export async function getGasBoilerUseCase(homeId: number) {
  const boiler = await getGasBoilerByHome(homeId);

  if (!boiler) {
    return null;
  }

  const inferredInspectionEvent = boiler.maintenanceEvents.find(
    (event) =>
      Boolean(event.eventDate) &&
      /inspecci|inspection|quinquenal|obligatoria/i.test(event.title ?? "")
  );

  const inspectionReferenceDate =
    boiler.lastMandatoryInspectionDate ?? inferredInspectionEvent?.eventDate;

  const mandatoryInspection = calculateMandatoryGasInspection(
    inspectionReferenceDate,
    boiler.mandatoryInspectionIntervalYears
  );

  return {
    ...boiler,
    mandatoryInspection,
  };
}
