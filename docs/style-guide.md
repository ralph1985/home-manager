# Guia de estilos (UI)

## Archivos clave

- `app/tailwind.css`: entrada de Tailwind.
- `app/globals.scss`: punto de carga de SCSS global.
- `styles/_tokens.scss`: tokens (espacios, radios, sombras, colores, fuentes).
- `styles/_base.scss`: mapea tokens a Tailwind (`@theme inline`) y define el `body`.
- `styles/_components.scss`: utilidades globales con prefijo `hm-`.

## Pildoras y botones (consolidado)

- Estilos base en `src/components/pillStyles.ts`.
- Componentes:
  - `src/components/Pill.tsx`: etiquetas no interactivas.
  - `src/components/PillLink.tsx`: enlaces con foco accesible.
  - `src/components/PillButton.tsx`: botones con foco accesible.
- Variantes disponibles: `solid`, `solidElevated`, `outline`, `outlineMuted`, `outlineMutedFaint`, `outlineSoft`, `ghost`, `danger`.
- Tamaños disponibles: `xs`, `xsWide`, `sm`, `md`.

## Plan de limpieza/uso de tokens

Estado actual (uso real):

- Usados: `--background`, `--foreground`, `--font-body`, `--font-display`, `--radius-lg`, `--radius-pill`, `--shadow-soft`, `--shadow-card`.
- No usados: el resto de espaciales y paleta (`--space-*`, `--color-*`).

Opciones:

1. Adoptar tokens en Tailwind y en utilidades:
   - Ampliar `@theme inline` en `styles/_base.scss` para exponer colores/radios/espaciados.
   - Migrar gradualmente clases `slate-*` a tokens (por ejemplo, usar `var(--color-ink-900)` en fondos y textos clave).
2. Reducir tokens:
   - Eliminar variables sin uso en `styles/_tokens.scss` tras una revision por `rg`.
   - Mantener solo lo que la UI consume hoy (fondos, tipografia, radios, sombras).

Sugerencia incremental:

- Empezar por `hm-panel` y `hm-pill` (infraestructura UI) y sustituir colores duros por tokens.
- Medir impacto visual antes de retirar tokens no usados.

## Notas de arquitectura

- Estos estilos viven en la capa de infraestructura/UI; el dominio y los casos de uso no dependen de ellos.
