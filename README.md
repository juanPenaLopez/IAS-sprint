# IAS Sprint Board

Aplicación para gestionar tareas de un sprint: listado, filtros, métricas, detalle y formularios de creación/edición. Usa componentes standalone, estado con signals y consumo de datos vía `HttpClient` con mock local incluido en el repositorio.

---

## Entregables

Este repositorio cumple los requisitos del reto:

| Entregable | Cumplimiento |
|------------|--------------|
| Repositorio Git con el proyecto completo | Código fuente en este repositorio; clonar y seguir los pasos de instalación |
| README con instrucciones | Secciones de instalación, ejecución, pruebas y decisiones más abajo |
| Aplicación compilable Angular 20.x | `npm run build` (Angular **20.3.x**, ver `package.json`) |
| Pruebas ejecutables | `npm test` documentado en [Pruebas](#pruebas) |
| Mock de datos / backend local | Interceptor HTTP en memoria, sin servidor externo (ver [Mock de datos](#mock-de-datos)) |

---

## Requisitos previos

- **Node.js** 20 o superior
- **npm** 10 o superior

---

## Instalación

Clona el repositorio e instala dependencias:

```bash
git clone https://github.com/juanPenaLopez/IAS-sprint.git
cd reto-angular-20
npm install
```

---

## Ejecución

Inicia el servidor de desarrollo:

```bash
npm start
```

Abre el navegador en **http://localhost:4200/**. La ruta raíz (`/`) redirige automáticamente a `/tasks`.

### Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/tasks` | Dashboard: listado, filtros y métricas |
| `/tasks/new` | Crear tarea |
| `/tasks/:id` | Detalle de tarea |
| `/tasks/:id/edit` | Editar tarea |
| `**` | Página no encontrada |

---

## Compilación

Verifica que el proyecto compila en modo producción:

```bash
npm run build
```

Los artefactos se generan en `dist/reto-angular-20/`.

---

## Pruebas

Ejecuta la suite de pruebas unitarias (Karma + Jasmine):

```bash
npm test
```

Por defecto corre en modo **watch**. Para una ejecución única (CI o verificación puntual):

```bash
npm test -- --no-watch --browsers=ChromeHeadless
```

**Áreas cubiertas** (más de 8 pruebas relevantes):

- Store: carga exitosa, error, filtros y `summary`
- Servicio HTTP: endpoints, tipado y errores con `HttpTestingController`
- Formulario: validadores, submit inválido y modal de confirmación
- Lista: estados loading, error, empty y success
- Routing: redirect, detalle con parámetro y not found
- Accesibilidad básica: labels asociados y diálogos accesibles

---

## Mock de datos

No se requiere backend externo. La capa de datos usa **`HttpClient`** contra la URL base `/api/tasks`, interceptada en memoria por:

- **Interceptor:** `src/app/data-access/tasks.interceptor.ts`
- **Datos iniciales:** `src/app/data-access/tasks-mock.data.ts` (6 tareas de ejemplo)

Operaciones soportadas:

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/tasks` | Listar todas las tareas |
| `GET` | `/api/tasks/:id` | Obtener una tarea |
| `POST` | `/api/tasks` | Crear tarea |
| `PUT` | `/api/tasks/:id` | Actualizar tarea |

Las mutaciones (crear/editar) actualizan el repositorio en memoria y se reflejan en la UI sin recargar la página.

---

## Estructura del proyecto

```text
src/app/
├── domain/         # Modelos, DTOs y mappers
├── data-access/    # TaskApiService, interceptor y mock
├── state/          # TaskStore (signals + computed)
├── pages/          # Páginas con lazy loading
├── ui/             # Componentes presentacionales y diálogos
└── validators/     # Validaciones del formulario
```

---

## Decisiones técnicas

1. **Arquitectura standalone:** sin `AppModule` ni feature modules; `bootstrapApplication` con `provideRouter` y `provideHttpClient`.
2. **TaskStore con signals:** estado, filtros y métricas derivadas en `computed` (`filteredTasks`, `summary`).
3. **Mock vía interceptor funcional:** simula REST en memoria para cumplir HttpClient sin dependencias extra.
4. **Formularios reactivos tipados:** `NonNullableFormBuilder` en Angular 20 (Signal Forms reservados para v21+).
5. **Change detection zoneless:** `provideZonelessChangeDetection` del scaffold del proyecto.
6. **Lazy loading:** rutas de páginas cargadas con `loadComponent`.
7. **UX con modales:** confirmación previa al guardar, éxito posterior y aviso al descartar cambios (`AppDialogComponent`).
8. **Templates modernos:** `@if`, `@for` (con `track`), `@switch` y `@defer` en métricas.
9. **Inmutabilidad en el store:** actualizaciones con nuevos arreglos, sin mutar el estado original.
10. **Separación por capas:** dominio, data-access, estado, páginas y UI con responsabilidades claras.

---

## Qué mejoraría con más tiempo

- Persistir filtros del dashboard en `sessionStorage` mediante un `effect` justificado.
- Añadir un guard funcional que valide la existencia de la tarea antes de editar.
- Incorporar pruebas e2e para flujos completos de navegación.
- Internacionalización (i18n) de etiquetas, estados y mensajes de error.
- Paginación, ordenamiento y búsqueda avanzada en el listado.
- Modo oscuro y refinamiento responsive en tablas y formularios.
