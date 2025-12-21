# Database Schema (SQLite + Prisma)

El esquema vive en `prisma/schema.prisma` y se versiona junto a las migraciones.

## Tablas principales
- `Home` viviendas.
- `Provider` compañías eléctricas.
- `ElectricityBill` facturas (importe, fechas, consumo, PDF).
- `CostCategory` categorías de coste.
- `BillCostLine` desglose por categoría.

## Base local
`data/dev.db` (no se versiona).

## Prisma Studio
Para ver y editar datos en una interfaz web local:

```bash
npm run studio
```
