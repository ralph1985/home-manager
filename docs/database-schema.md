# Database Schema (PostgreSQL + Prisma)

El esquema vive en `prisma/schema.prisma` y se versiona junto a las migraciones.

## Tablas principales

- `Home` viviendas.
- `Provider` compañías eléctricas.
- `ElectricityBill` facturas (importe, fechas, consumo, PDF).
- `CostCategory` categorías de coste.
- `BillCostLine` desglose por categoría.
- `GasProvider` compañías de gas.
- `GasSupplyPoint` puntos de suministro de gas.
- `GasBoiler` ficha de caldera por vivienda (equipo, mantenimiento e inspección obligatoria).
- `GasBoilerMaintenanceEvent` eventos del historial de mantenimiento/inspección de la caldera (incluye metadatos de certificado y medidas técnicas).
- `GasBill` facturas de gas (importe, fechas, consumo, lecturas, peajes, PDF).
- `GasCostCategory` categorías de coste de gas.
- `GasBillCostLine` desglose de costes de gas.
- `WaterBill` facturas de agua.
- `HomeInsurancePolicy` pólizas de seguro del hogar (histórico por vivienda).
- `Vehicle` vehículos (incluye `ticktickProjectId` opcional para recordatorios).
- `VehicleSpecs` ficha técnica del vehículo (tipo, motor, masas y homologación).
- `VehicleRegistrationDocument` documento de circulación/registro (datos administrativos y validez).
- `VehiclePurchase` compra final asociada a un vehículo (datos de oferta, detalles económicos y resumen).
- `VehiclePurchaseOption` opciones/equipamiento incluidos en la compra del vehículo.

## Conexión

La app usa `DATABASE_URL` para conectar a PostgreSQL (por defecto `schema=public`).
El arranque en Docker aplica esquema con `prisma db push` (no `migrate deploy`) porque el histórico de migraciones existente viene del ciclo previo con SQLite.

## Prisma Studio

Para ver y editar datos en una interfaz web local:

```bash
npm run studio
```

## Copia de seguridad

Script de backup con `pg_dump`:

```bash
npm run backup:db
```

Las copias se guardan en `data/backups/` en formato `.dump`.

## Snapshot (antes/después de cambios)

Para comparar el estado completo de la BD antes y después de cambios, genera dos dumps SQL con `pg_dump`:

```bash
npm run snapshot:db -- before-change
# ...aplica cambios en la BD...
npm run snapshot:db -- after-change
```

Los snapshots se guardan en `data/snapshots/` con timestamp y etiqueta opcional.
Para ver diferencias:

```bash
diff -u data/snapshots/ARCHIVO1.sql data/snapshots/ARCHIVO2.sql
```
