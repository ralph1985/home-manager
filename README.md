# home-manager

Gestión del hogar: tareas, gastos y mantenimiento.

## Rendering

Esta app usa Server Components/SSR por defecto en App Router. Se optó por esta solución porque es una app de uso personal (un único cliente), lo que permite priorizar simplicidad y acceso directo a datos sin preocuparse por el coste de render en servidor. Si el público creciera, habría que añadir caché/ISR y más contenido estático para reducir carga.

## Docs

- `docs/nextjs-setup.md` — configuración actual de Next.js.
- `docs/database-schema.md` — esquema y tablas principales.
- `docs/routes.md` — rutas principales de la app.
- `docs/components.md` — componentes reutilizables.

## Desarrollo

```bash
npm run dev
```

## Scripts útiles

```bash
npm run lint
npm run typecheck
npm run format
```
