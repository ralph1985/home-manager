# Database Schema (SQLite + Prisma)

El esquema vive en `prisma/schema.prisma` y se versiona junto a las migraciones.

## Tablas principales

- `Home` viviendas.
- `Provider` compañías eléctricas.
- `ElectricityBill` facturas (importe, fechas, consumo, PDF).
- `CostCategory` categorías de coste.
- `BillCostLine` desglose por categoría.
- `GasProvider` compañías de gas.
- `GasSupplyPoint` puntos de suministro de gas.
- `GasBill` facturas de gas (importe, fechas, consumo, lecturas, peajes, PDF).
- `GasCostCategory` categorías de coste de gas.
- `GasBillCostLine` desglose de costes de gas.
- `WaterBill` facturas de agua.
- `Vehicle` vehículos (incluye `ticktickProjectId` opcional para recordatorios).

## Base local

`data/dev.db` (no se versiona).

## Prisma Studio

Para ver y editar datos en una interfaz web local:

```bash
npm run studio
```

## Copia de seguridad

Script seguro con SQLite (compatible con la DB en uso):

```bash
npm run backup:db
```

Las copias se guardan en `data/backups/`.

## Snapshot (antes/después de cambios)

Para comparar el estado completo de la BD antes y después de cambios, genera dos dumps SQL:

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
