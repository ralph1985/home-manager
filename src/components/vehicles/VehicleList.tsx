import Link from "next/link";

type VehicleListItem = {
  id: number;
  name?: string | null;
  brand: string;
  model: string;
  year?: number | null;
  licensePlate?: string | null;
  maintenanceCount: number;
};

type VehicleListProps = {
  title: string;
  emptyMessage: string;
  vehicles: VehicleListItem[];
};

export default function VehicleList({ title, emptyMessage, vehicles }: VehicleListProps) {
  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <span className="text-sm text-slate-500">
          {vehicles.length} vehiculo{vehicles.length === 1 ? "" : "s"}
        </span>
      </div>

      {vehicles.length === 0 ? (
        <div className="hm-panel mt-6 p-6 text-slate-600">{emptyMessage}</div>
      ) : (
        <ul className="mt-6 grid gap-6 md:grid-cols-2">
          {vehicles.map((vehicle) => {
            const headline = vehicle.name ?? `${vehicle.brand} ${vehicle.model}`;
            const meta = [vehicle.year, vehicle.licensePlate].filter(Boolean).join(" · ");

            return (
              <li key={vehicle.id} className="hm-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Vehiculo
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{headline}</h3>
                    <p className="mt-2 text-sm text-slate-600">{meta || "Sin detalles extra"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      mantenimientos
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {vehicle.maintenanceCount}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <Link
                    className="hm-pill hm-shadow-soft bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    href={`/vehicles/${vehicle.id}`}
                  >
                    Ver detalle
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
