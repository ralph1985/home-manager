# Next.js Setup

## Configuración actual

El proyecto usa Next.js con App Router. La configuración base está en `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

## Notas

- Este archivo está listo para añadir opciones cuando sean necesarias (e.g., redirects, images, experimental).
- Mantén los cambios documentados aquí cuando modifiques `next.config.ts`.
