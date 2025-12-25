# Componentes reutilizables

## Layout

- `src/components/layout/PageShell.tsx` — fondo + layout general.
- `src/components/layout/Header.tsx` — cabecera global con marca y selector de idioma.
- `src/components/layout/SectionHeader.tsx` — encabezado con titulo, descripcion y accion.
- `src/components/layout/InfoPanel.tsx` — panel pequeño con etiqueta y valor.

## Facturas

- `src/components/billing/BillsList.tsx` — listado de facturas con estado vacio.
- `src/components/billing/BillSummary.tsx` — resumen de factura.
- `src/components/billing/ContractPanel.tsx` — datos de contrato/suministro.
- `src/components/billing/CostBreakdown.tsx` — desglose por lineas.
- `src/components/billing/billingFormatters.ts` — formateadores (moneda y fecha).

## UI

- `src/components/Button.tsx` — boton reutilizable (variantes, tamanos, loading).
- `src/components/EntityCard.tsx` — tarjeta generica para entidades (viviendas, vehiculos).
