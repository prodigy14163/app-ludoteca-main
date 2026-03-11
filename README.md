# 🎲 Ludoteca — Gestión de catálogo de juegos

Aplicación web fullstack para administrar el inventario de una ludoteca.  
Permite crear, listar, editar, eliminar y filtrar juegos de mesa.

**Stack:** Node.js · Express · TypeScript · PostgreSQL · Prisma · React · Vite

---

## ⚙️ Requisitos previos

Asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) v18 o superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para levantar PostgreSQL)

Verifica con:
```bash
node --version    # debe ser v18+
docker --version
npm --version
```

---

## 🚀 Instalación paso a paso

### Paso 1 — Levantar PostgreSQL con Docker

Desde la **carpeta raíz** del proyecto (`app-ludoteca/`):

```bash
docker compose up -d
```

Verifica que está corriendo:
```bash
docker ps
# Debes ver: ludoteca_db   Up   0.0.0.0:5433->5432/tcp
```

> ℹ️ Se usa el puerto **5433** (no el 5432 estándar) para evitar conflictos con otras instalaciones locales de PostgreSQL.

---

### Paso 2 — Instalar dependencias del backend

```bash
cd backend
npm install
```

---

### Paso 3 — Configurar la base de datos

Ejecuta estos 3 comandos **en orden** desde la carpeta `backend/`:

```bash
npm run db:generate
```
```bash
npm run db:migrate
```
> Cuando te pida un nombre para la migración, escribe: **init** y pulsa Enter.

```bash
npm run db:seed
```

Deberías ver: `✅ 7 juegos insertados correctamente`

---

### Paso 4 — Arrancar el backend

```bash
npm run dev
```

Resultado esperado:
```
✅ Conexión a PostgreSQL establecida
🎲 ================================
   Ludoteca API corriendo
   URL: http://localhost:3000
================================
```

Comprueba que funciona abriendo: http://localhost:3000/health

---

### Paso 5 — Instalar y arrancar el frontend

Abre una **nueva terminal** (deja el backend corriendo en la anterior):

```bash
cd frontend
npm install
npm run dev
```

Resultado esperado:
```
  VITE ready
  ➜  Local: http://localhost:5173/
```

Abre en el navegador: **http://localhost:5173**

---

## 🗺️ Resumen visual

```
Terminal 1 (backend)                Terminal 2 (frontend)
────────────────────────────        ─────────────────────────────
docker compose up -d
cd backend
npm install
npm run db:generate
npm run db:migrate  ← escribe "init"
npm run db:seed
npm run dev                         cd frontend
  ↑ se queda corriendo              npm install
                                    npm run dev
                                      ↑ se queda corriendo

                   Abre → http://localhost:5173
```

---

## 🔑 Variables de entorno

El archivo `backend/.env` ya viene incluido con los valores correctos para desarrollo local.  
**No necesitas crear ni copiar ningún archivo.**

```
DATABASE_URL=postgresql://ludoteca_user:ludoteca_password@localhost:5433/ludoteca_db?schema=public
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

> ⚠️ El `backend/.env` está en `.gitignore` y no se sube al repositorio.  
> Si alguien clona el repo, debe copiarlo manualmente:
> ```bash
> # Windows
> copy backend\.env.example backend\.env
> # Mac / Linux
> cp backend/.env.example backend/.env
> ```

---

## 🖥️ Funcionalidades de la interfaz

| Funcionalidad | Descripción |
|---|---|
| **Listado de juegos** | Grid de tarjetas con toda la información de cada juego |
| **Búsqueda por texto** | Busca en nombre, tipo y tags simultáneamente |
| **Filtro por tipo** | Estrategia, familiar, cooperativo, cartas, etc. |
| **Filtro por edad** | Muestra juegos aptos para una edad determinada |
| **Filtro por disponibilidad** | Disponibles / No disponibles / Todos |
| **Chips de filtros activos** | Indicador visual de qué filtros están aplicados |
| **Crear juego** | Formulario con validación en frontend y backend |
| **Editar juego** | Mismo formulario prellenado con los datos actuales |
| **Eliminar juego** | Con confirmación antes de borrar |
| **Inventario general** | Modal con estadísticas, desglose por tipo y tabla completa |

---

## 🔌 API — Endpoints

Base URL: `http://localhost:3000/api`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Verifica que el servidor está activo |
| GET | `/api/games` | Lista juegos (acepta filtros) |
| GET | `/api/games/:id` | Obtiene un juego por ID |
| POST | `/api/games` | Crea un nuevo juego |
| PUT | `/api/games/:id` | Actualiza un juego (parcial) |
| DELETE | `/api/games/:id` | Elimina un juego |

### Parámetros de filtrado (GET /api/games)

```
?search=catan           → busca en nombre, tipo y tags
?tipo=estrategia        → filtra por categoría
?disponible=true        → filtra por disponibilidad (true/false)
?edadMinima=8           → juegos aptos para esa edad o menos
?numeroJugadores=4      → juegos que admitan al menos ese número
?page=1&limit=10        → paginación
```

### Probar con Postman

Descarga [Postman](https://www.postman.com/downloads/) si no lo tienes instalado.

#### Health check
- **Método:** `GET`
- **URL:** `http://localhost:3000/health`

#### Listar todos los juegos
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/games`

#### Buscar con filtros
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/games?search=catan`
- Agrega parámetros en la pestaña **Params**:

| Key | Value | Descripción |
|-----|-------|-------------|
| `search` | `catan` | Busca en nombre, tipo y tags |
| `tipo` | `estrategia` | Filtra por categoría |
| `disponible` | `true` | Filtra por disponibilidad |
| `edadMinima` | `8` | Juegos aptos para esa edad |
| `page` | `1` | Página de resultados |

#### Obtener un juego por ID
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/games/1`

#### Crear un juego
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/games`
- **Pestaña Headers:** `Content-Type` → `application/json`
- **Pestaña Body** → selecciona **raw** → **JSON**, y pega:

```json
{
  "nombre": "Wingspan",
  "tipo": "Estrategia",
  "numeroJugadores": 5,
  "edadMinima": 10,
  "disponible": true,
  "stock": 2,
  "tags": ["aves", "naturaleza"],
  "descripcion": "Juego de construcción de santuario de aves."
}
```

#### Actualizar un juego
- **Método:** `PUT`
- **URL:** `http://localhost:3000/api/games/1`
- **Pestaña Headers:** `Content-Type` → `application/json`
- **Pestaña Body** → selecciona **raw** → **JSON**, y pega:

```json
{
  "disponible": false,
  "stock": 0
}
```

> Solo envía los campos que quieras cambiar; los demás se mantienen.

#### Eliminar un juego
- **Método:** `DELETE`
- **URL:** `http://localhost:3000/api/games/1`

### Formato de respuesta

Todas las respuestas siguen este formato:
```json
{
  "success": true,
  "data": { "id": 1, "nombre": "Catan" },
  "message": "Mensaje opcional",
  "meta": { "total": 7, "page": 1, "limit": 10, "totalPages": 1 }
}
```

Error:
```json
{
  "success": false,
  "error": "Descripción del error",
  "details": [{ "campo": "nombre", "mensaje": "El nombre es obligatorio" }]
}
```

---

## 🏗️ Arquitectura

```
Request
   ↓
gameRoutes.ts       → define la URL y aplica validaciones
   ↓
validators.ts       → valida los datos de entrada (express-validator)
   ↓
gameController.ts   → extrae datos del request
   ↓
gameService.ts      → lógica de negocio + query Prisma
   ↓
prismaClient.ts     → ejecuta SQL parametrizado
   ↓
PostgreSQL (Docker, puerto 5433)
```

### Estructura de carpetas

```
app-ludoteca/
├── docker-compose.yml              # PostgreSQL en Docker (puerto 5433)
├── .gitignore
├── README.md
├── IA_NOTES.md
├── CONTEXTO_PROYECTO.md            # Resumen para continuar el proyecto
│
├── backend/
│   ├── .env                        # Variables locales (NO se sube al repo)
│   ├── .env.example                # Plantilla para quien clone el repo
│   ├── package.json
│   ├── tsconfig.json               # rootDir: ".", include: src + prisma
│   ├── prisma/
│   │   ├── schema.prisma           # Modelo Game con índices
│   │   └── seed.ts                 # 7 juegos de ejemplo
│   └── src/
│       ├── types/index.ts          # Interfaces TypeScript
│       ├── database/               # Cliente Prisma singleton
│       ├── middlewares/
│       │   ├── errorHandler.ts     # requestLogger, notFound, errorHandler, AppError
│       │   └── validators.ts       # Validaciones con express-validator
│       ├── services/gameService.ts # Lógica de negocio + queries
│       ├── controllers/            # Request → Service → Response
│       ├── routes/gameRoutes.ts    # Mapeo URL → Controlador
│       ├── app.ts                  # Express + helmet + rate-limit + middlewares
│       └── server.ts               # Arranque + conexión a BD + graceful shutdown
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts              # Puerto 5173 + proxy → backend:3000
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── types/index.ts          # Interfaces compartidas
        ├── services/gameService.ts # Llamadas a la API con Fetch
        └── components/
            ├── GameList.tsx        # Página principal
            ├── GameItem.tsx        # Tarjeta individual de un juego
            ├── GameForm.tsx        # Formulario crear / editar
            └── Inventario.tsx      # Modal de inventario general
```

---

## 🔒 Seguridad implementada

| Riesgo | Protección |
|---|---|
| SQL Injection | Prisma genera queries parametrizadas automáticamente |
| Datos malformados | express-validator valida tipo, tamaño y formato |
| Secretos expuestos | `.env` en `.gitignore`, nunca valores en el código |
| Acceso cross-origin | CORS restringido al origen del frontend |
| Errores internos expuestos | Stack trace solo en `development`, nunca en producción |
| Errores de tipo | TypeScript strict mode detecta errores en compilación |
| Ataques via cabeceras | `helmet` configura cabeceras HTTP seguras automáticamente |
| Abuso / DDoS | `express-rate-limit` — 100 peticiones por IP cada 15 minutos |
| Payloads excesivos | `express.json({ limit: "10kb" })` limita el tamaño del body |
| Mass assignment | Desestructuración explícita de campos en el servicio |
| Cierre abrupto | Graceful shutdown: SIGINT/SIGTERM cierran la BD limpiamente |

---

## 💡 Decisiones técnicas

- **Puerto 5433**: evita conflictos con instalaciones locales de PostgreSQL que usan el 5432.
- **`backend/.env` sin comillas**: en Windows las comillas en `.env` pueden causar errores de parsing.
- **Credenciales hardcodeadas en `docker-compose.yml`**: evita problemas de interpolación de variables en Windows.
- **Separación Controller/Service**: el controlador solo maneja HTTP, la lógica va en el servicio.
- **Respuesta estándar `{ success, data, meta, error }`**: el frontend siempre sabe cómo leer la respuesta.
- **Índices en BD**: `@@index` en `nombre`, `tipo` y `disponible` para búsquedas eficientes.
- **Proxy de Vite**: el frontend llama a `/api/...` y Vite lo redirige al backend. Sin `.env` en el frontend.
- **`helmet` + `express-rate-limit`**: seguridad de cabeceras HTTP y protección contra abuso.
- **`AppError` personalizado**: errores con código HTTP explícito para respuestas consistentes.
- **`rootDir: "."` en tsconfig**: permite compilar tanto `src/` como `prisma/seed.ts` sin conflictos.
- **`requestLogger` middleware**: registra cada petición para facilitar el debugging.

---

## 🛑 Detener el proyecto

```bash
# Ctrl+C en cada terminal (backend y frontend)

# Apagar PostgreSQL
docker compose down

# Apagar y borrar todos los datos
docker compose down -v
```

---

## ⚠️ Solución de problemas

| Error | Causa probable | Solución |
|---|---|---|
| `Authentication failed` al migrar | Contenedor Docker creado sin credenciales correctas | `docker compose down -v` y `docker compose up -d` |
| `Environment variable not found` | Falta `backend/.env` | `copy backend\.env.example backend\.env` (Windows) |
| `prisma: command not found` | Dependencias no instaladas | `cd backend` y `npm install` |
| Puerto 5432 en uso | Otro PostgreSQL local activo | El proyecto usa el 5433, no hay conflicto |
| Puerto 3000 en uso | Otra aplicación usa ese puerto | Cambia `PORT=3001` en `backend/.env` |
| Puerto 5173 en uso | Otro servidor de desarrollo activo | Vite preguntará si usar el siguiente, acepta |
| El frontend no muestra juegos | Backend no está corriendo | Verifica que `npm run dev` en backend está activo |
| `Cannot find name 'process'` | `tsconfig.json` no incluye `prisma/` | Verifica que `rootDir` es `.` y `include` tiene `prisma/**/*` |
