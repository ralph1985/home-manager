# Repository Guidelines

## Project Structure & Module Organization

Proyecto Next.js (App Router) con enfoque de _Arquitectura Limpia_. Mantén las dependencias “hacia dentro” y separa capas:

- `app/` rutas UI y API (`app/api/...`).
- `src/` código compartido (alias `@/*` apunta a `src/`).
- `src/domain/` entidades y reglas de negocio puras (sin frameworks).
- `src/usecases/` casos de uso orquestando el dominio.
- `src/interfaces/` adaptadores: controllers, presenters, mappers.
- `src/infrastructure/` detalles: DB, HTTP, UI, frameworks.
- `public/` assets estáticos servidos por Next.
- `docs/` decisiones, ADRs y guías extendidas.

Si eliges otra estructura, documenta el porqué y mantén rutas estables.

## Rendering Strategy (SSR por defecto)

La app usa Server Components/SSR por defecto en App Router. Se eligió esta vía porque es una app de gestión de hogar para un único usuario (1 cliente), lo que simplifica el acceso a datos y el despliegue local. En este contexto, el coste de render en servidor es asumible y mejora la simplicidad.

Si la app creciera a miles/millones de usuarios, habría que reducir carga en servidor con rutas estáticas/ISR, caché de datos, CDN y separación de componentes client cuando proceda.

## Build, Test, and Development Commands

Comandos actuales:

- `npm run dev` — servidor de desarrollo de Next.
- `npm run build` — build de producción.
- `npm run start` — servir el build de producción.
- `npm run lint` — ejecutar ESLint.
- `npm run studio` — abrir Prisma Studio (DB local).
- `npm run typecheck` — TypeScript sin emitir.
- `npm run format` — formatea con Prettier.

Consejo Clean Architecture: evita que los casos de uso dependan de estos comandos; los comandos deben “envolver” a las capas internas.

## Coding Style & Naming Conventions

Stack: TypeScript, Next.js, Tailwind. ESLint está habilitado via `npm run lint`.

- Indentación: 2 espacios (convención en TS/Next).
- Archivos: `kebab-case` en rutas `app/`, `camelCase` o `PascalCase` en `src/` según el lenguaje.
- Tipos/clases en `PascalCase`, funciones en `camelCase`.
- Al instalar dependencias, usa versiones fijas sin el prefijo `^` en `package.json`.

Idea clave del libro: el código de dominio debe ser legible y aislado; evita anotaciones de framework en `src/domain/`.

## Testing Guidelines

No hay framework de pruebas aún. Cuando lo definas:

- Nombra archivos de tests de forma uniforme (e.g., `.spec`).
- Refleja la estructura de `src/` en `tests/`.
- Prioriza pruebas de casos de uso; son el “contrato” del sistema.

## Commit & Pull Request Guidelines

No hay historial de commits. Establece convenciones pronto:

- Asuntos breves, imperativos y con Conventional Commits (e.g., "chore: configure turbopack root").
- Los mensajes de commit deben estar en inglés.
- Cuerpo corto si el cambio es relevante.
- En PRs: descripción clara, issues enlazados y pasos de validación.
- Hooks: Husky con `pre-commit` (lint, typecheck, format) y `commit-msg` (Conventional Commits).

Desde Clean Architecture: en la descripción, explica el impacto por capas (dominio, casos de uso, interfaces, infraestructura).

## Working Style (Agent Instructions)

Avanza paso a paso y explica siempre qué se ha hecho y por qué, para facilitar el aprendizaje. Antes de cambios grandes, confirma el alcance y espera validación.
Revisa de vez en cuando `docs/todo.md` y recuérdame las tareas pendientes cuando corresponda.
Como quiero aprender TypeScript, acompaña cada cambio con una explicación breve (1-2 frases) del porqué, señala tipos clave (interfaces, unions, nullables) cuando aparezcan, y sugiere un mini-ejercicio opcional al introducir un concepto nuevo.
Como quiero aprender Clean Architecture, explica siempre las decisiones indicando la capa afectada (dominio, casos de uso, interfaces, infraestructura) y el motivo.

## Security & Configuration Tips

Si manejas secretos, usa variables de entorno o archivos locales fuera de git (e.g., `.env`, `.secrets/`). Documenta las variables requeridas en `docs/` cuando aparezcan.

## Data & Persistence

Base de datos local: SQLite. Trata la DB como un detalle de infraestructura:

- Mantén los repositorios en `src/infrastructure/` y las interfaces en `src/interfaces/`.
- Evita acoplar el dominio a SQLite; expón puertos (interfaces) desde `src/usecases/`.
- Documenta el fichero de base de datos (e.g., `data/home-manager.sqlite`) y cómo crear migraciones cuando se definan.
- Prisma 7 con SQLite requiere adapter (`@prisma/adapter-better-sqlite3`).
- Modelos separados por servicio: electricidad (`ElectricityBill`) y agua (`WaterBill`) con desglose por líneas (`*BillCostLine`).
- Copia de seguridad: ejecutar `npm run backup:db` de forma periódica (genera archivos en `data/backups/`).
- Antes de cualquier cambio en la base de datos o en el schema, ejecutar `npm run backup:db`.
- Para auditar cambios, generar snapshots antes y después con `npm run snapshot:db -- etiqueta` (guarda dumps en `data/snapshots/`).
- Para revisar/importar PDFs de facturas (electricidad) hay un script base en `scripts/update-electricity-from-pdfs.mjs`:
  - Inspección sin tocar DB: `npm run pdf:electricity:dry -- "<ruta|carpeta>"`
  - Con OCR (tesseract/ocrmypdf): `npm run pdf:electricity:ocr -- "<ruta|carpeta>"`
  - Con firmas digitales (invalidarlas): `npm run pdf:electricity:ocr:force -- "<ruta|carpeta>"`
  - Flags útiles: `--debug` (líneas clave), `--grep=<texto>`, `--ocr-max-mpixels=<n>`
  - Flujo obligatorio: backup + snapshots antes/después de tocar la DB.

## Styling & UI

- Tailwind se carga en `app/tailwind.css`.
- SCSS global en `app/globals.scss` y parciales en `styles/` (`_tokens.scss`, `_base.scss`, `_components.scss`).
- Componentes reutilizables en `src/components` (layout y billing).
- El copy UI y textos visibles deben vivir en `src/infrastructure/ui/labels/` (por idioma); evita literales en componentes.

## Gestión de tareas y horas

- Al empezar, identifica el `projectId` en `../../dashboard/data/projects.json`.
- Busca si ya existe una tarea "En curso" en `../../dashboard/data/projects-tasks.json` para ese `projectId`.
- Si existe, registra el tiempo en `../../dashboard/data/task-entries.json` con `taskId`, `date` (`dd/mm/aaaa`), `hours` y `note`; añade siempre una nota en `../../dashboard/data/task-notes.json`.
- Si no existe, crea una nueva tarea (recomendado: `node ../../dashboard/scripts/add-task.js` desde el monorepo) o edita a mano en `projects-tasks.json` con `id` incremental, `title`, `projectId`, `phase`, `status`, `ownerId`, `startDate`, `endDate`, y luego añade la entrada de horas en `task-entries.json`.
- El `ownerId` debe existir en `../../dashboard/data/people.json`.
- Proyecto de referencia para este repo: `home-manager`.
