# 🎲 Contexto del Proyecto — Ludoteca

Este archivo resume el estado actual del proyecto para poder continuar su desarrollo en cualquier momento.

---

## 📌 ¿Qué es este proyecto?

Aplicación web fullstack para gestionar el inventario de una ludoteca (catálogo de juegos de mesa).
Permite crear, listar, editar, eliminar y filtrar juegos.

## ⚙️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL (Docker, puerto 5433) |
| Frontend | React 18 + TypeScript + Vite 5 |
| HTTP client | Fetch API nativa (sin Axios) |
| Proxy dev | Vite proxy (`/api` → `localhost:3000`) |
| Validaciones | express-validator |
| Seguridad HTTP | helmet (cabeceras seguras) |
| Rate limiting | express-rate-limit (100 req/15min) |

---

## 🗂️ Estructura del proyecto

```
app-ludoteca/
├── docker-compose.yml              # PostgreSQL puerto 5433 (hardcodeado)
├── .gitignore
├── README.md
├── IA_NOTES.md
├── CONTEXTO_PROYECTO.md
│
├── backend/
│   ├── .env                        # NO se sube al repo
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json               # rootDir: ".", include: src + prisma
│   ├── prisma/
│   │   ├── schema.prisma           # Modelo Game
│   │   └── seed.ts                 # 7 juegos de ejemplo
│   └── src/
│       ├── types/index.ts          # Game, CreateGameDTO, UpdateGameDTO, GameFilters, ApiResponse, PaginationMeta
│       ├── database/prismaClient.ts # Singleton con logs en dev
│       ├── middlewares/
│       │   ├── errorHandler.ts     # requestLogger, notFound, errorHandler, AppError
│       │   └── validators.ts       # validateCreateGame, validateUpdateGame, validateGameFilters, validate
│       ├── services/gameService.ts  # Lógica de negocio + queries Prisma
│       ├── controllers/gameController.ts # Extrae datos HTTP, llama al servicio
│       ├── routes/gameRoutes.ts     # Define rutas + aplica validaciones
│       ├── app.ts                   # Configuración Express (helmet, rate-limit, CORS, middlewares)
│       └── server.ts               # Punto de entrada (dotenv, connect, listen, graceful shutdown)
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts              # Proxy /api → localhost:3000
    └── src/
        ├── App.tsx                 # Renderiza GameList
        ├── main.tsx                # ReactDOM.createRoot + StrictMode
        ├── types/index.ts          # Game, CreateGameData, UpdateGameData, GameFilters, GamesResponse, ApiResponse
        ├── services/gameService.ts  # Fetch API: getGames, getGameById, createGame, updateGame, deleteGame
        └── components/
            ├── GameList.tsx        # Página principal con filtros, paginación y grid
            ├── GameItem.tsx        # Tarjeta de un juego con barra de stock
            ├── GameForm.tsx        # Modal formulario crear/editar
            └── Inventario.tsx      # Modal de inventario general
```

---

## 🗃️ Modelo de datos

```prisma
model Game {
  id              Int      @id @default(autoincrement())
  nombre          String   @db.VarChar(150)
  tipo            String   @db.VarChar(100)
  numeroJugadores Int
  edadMinima      Int
  disponible      Boolean  @default(true)
  tags            String[] @default([])
  descripcion     String?  @db.Text
  stock           Int      @default(1)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([nombre])
  @@index([tipo])
  @@index([disponible])
  @@map("games")
}
```

### Datos seed (7 juegos)

| Nombre | Tipo | Jugadores | Edad | Stock |
|---|---|---|---|---|
| Catan | Estrategia | 4 | 10+ | 2 |
| Ticket to Ride | Familiar | 5 | 8+ | 1 |
| Pandemic | Cooperativo | 4 | 8+ | 0 |
| Dixit | Creativo | 6 | 6+ | 3 |
| Dominion | Cartas | 4 | 13+ | 1 |
| Uno | Cartas | 10 | 6+ | 4 |
| Azul | Abstracto | 4 | 8+ | 2 |

> **Nota:** El seed usa el tipo "Creativo" para Dixit, pero ese tipo no está en la lista `TIPOS` del frontend (las opciones del `<select>`). El juego se muestra correctamente, pero no puede filtrarse ni crearse nuevos juegos con ese tipo desde la UI.

---

## 🔌 API — Endpoints implementados

Base URL: `http://localhost:3000/api`

| Método | Ruta | Validación | Descripción |
|--------|------|------------|-------------|
| GET | `/health` | — | Health check del servidor |
| GET | `/api/games` | `validateGameFilters` | Lista juegos con filtros y paginación |
| GET | `/api/games/:id` | — | Obtiene un juego por ID |
| POST | `/api/games` | `validateCreateGame` | Crea un juego (verifica nombre duplicado) |
| PUT | `/api/games/:id` | `validateUpdateGame` | Actualiza un juego (parcial) |
| DELETE | `/api/games/:id` | — | Elimina un juego |

### Filtros disponibles en GET /api/games

| Parámetro | Tipo | Descripción |
|---|---|---|
| `search` | string | Busca en nombre, tipo y tags (insensitive) |
| `tipo` | string | Filtra por categoría (insensitive, contains) |
| `disponible` | boolean | `true` o `false` |
| `edadMinima` | number | Juegos aptos para esa edad o menos (`lte`) |
| `numeroJugadores` | number | Juegos que admitan al menos ese número (`gte`) |
| `page` | number | Página (default: 1) |
| `limit` | number | Resultados por página (default: 10, max: 100) |

### Formato de respuesta estándar

```json
{
  "success": true,
  "data": { },
  "message": "opcional",
  "meta": { "total": 7, "page": 1, "limit": 10, "totalPages": 1 }
}
```

### Formato de error

```json
{
  "success": false,
  "error": "Mensaje descriptivo",
  "details": [{ "campo": "nombre", "mensaje": "El nombre es obligatorio" }],
  "stack": "solo en development"
}
```

---

## 🖥️ Frontend — Componentes implementados

### App.tsx
- Componente raíz, renderiza `GameList`
- Sin routing (SPA de una sola vista)

### GameList.tsx (506 líneas)
- **Página principal** con diseño dark theme premium
- **Header**: marca "Ludoteca", botones "📦 Inventario" y "+ Nuevo Juego"
- **Barra de filtros** con 5 controles:
  - Búsqueda por texto (input con ícono, **debounce de 280ms**)
  - Tipo (select con 10 categorías)
  - Nº jugadores (select: 1, 2, 3, 4, 5, 6, 8, 10)
  - Edad mínima (select: 3, 6, 8, 10, 12, 14, 18)
  - Disponibilidad (select: Disponible / No disponible)
- **Chips de filtros activos** con botón "×" individual y "Limpiar todo"
- **Paginación completa**: primera, anterior, números con ellipsis, siguiente, última
- **Grid responsivo**: `repeat(auto-fill, minmax(290px, 1fr))`, 1 columna en `≤720px`
- **Estados**: loading (spinner), vacío (emoji + mensaje), error (banner)
- **Footer** con texto de la aplicación
- **Límite**: 12 juegos por página (`LIMIT = 12`)
- **Tipografías**: Nunito (body) + Fredoka One (títulos), importadas de Google Fonts

### GameItem.tsx (298 líneas)
- **Tarjeta individual** de un juego con hover effect (elevación + borde)
- **Franja de color** superior según el tipo del juego (10 colores mapeados)
- **Contenido**: nombre, badge de tipo con colores, stats (jugadores, edad, stock, estado)
- **Barra visual de stock**: llena según `stock / 5`, colores: verde (>1), amarillo (=1), rojo (=0)
- **Tags**: muestra hasta 5 con "+N" si hay más
- **Descripción**: truncada a 2 líneas con `-webkit-line-clamp`
- **Botones**: Editar (teal) y Eliminar (gris → rojo en hover)

### GameForm.tsx (331 líneas)
- **Modal overlay** con blur de fondo y click-outside-to-close
- **Modo creación**: título "Nuevo Juego", campos vacíos con defaults razonables
- **Modo edición**: título "[nombre] — Editar", campos prellenados
- **Campos**:
  - Nombre* (texto, max 150)
  - Tipo* (select con 10 categorías)
  - Disponible (checkbox toggle)
  - Nº jugadores* (number, min 1)
  - Edad mínima* (number, min 0)
  - Stock (number, min 0)
  - Tags (texto, separadas por comas)
  - Descripción (textarea)
- **Validación client-side** antes del envío (nombre, tipo, jugadores, edad, stock)
- **Manejo de errores del API**: muestra errores por campo si la API devuelve `errors[]`
- **Estado "Guardando…"** que deshabilita el botón

### Inventario.tsx (264 líneas)
- **Modal overlay** con blur, click-outside-to-close
- **4 tarjetas de resumen**: títulos en catálogo, unidades totales, disponibles, no disponibles
- **Desglose por tipo**: pills con color, cantidad de títulos y stock
- **Tabla completa**: nombre, tipo (pill con color), jugadores, edad, stock (coloreado), estado
- **Ordenamiento**: por stock descendente
- **Limitación actual**: solo muestra los juegos de la página actual (recibe `games` del state de `GameList`, que son los filtrados/paginados de la API)

### Categorías de tipo en el frontend

Las 10 categorías definidas en `TIPOS` (usadas en filtros y formulario):

```
Estrategia, Familiar, Cooperativo, Party, Abstracto,
Rol, Cartas, Dados, Trivia, Deducción
```

### Paleta de colores por tipo

| Tipo | Color |
|---|---|
| Estrategia | `#FF6B6B` (coral) |
| Familiar | `#4ECDC4` (teal) |
| Cooperativo | `#45B7D1` (azul cielo) |
| Party | `#F38181` (rosa) |
| Abstracto | `#A29BFE` (lavanda) |
| Rol | `#E17055` (naranja) |
| Cartas | `#00CEC9` (cyan) |
| Dados | `#FDCB6E` (amarillo) |
| Trivia | `#55EFC4` (verde menta) |
| Deducción | `#E84393` (magenta) |

---

## 🔑 Variables de entorno (backend/.env)

```
DATABASE_URL=postgresql://ludoteca_user:ludoteca_password@localhost:5433/ludoteca_db?schema=public
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

## 🚀 Comandos para arrancar

```bash
# 1. Levantar PostgreSQL
docker compose up -d

# 2. Backend (desde /backend)
npm install
npm run db:generate
npm run db:migrate      # nombre de migración: init
npm run db:seed
npm run dev             # http://localhost:3000

# 3. Frontend (desde /frontend, nueva terminal)
npm install
npm run dev             # http://localhost:5173
```

### Scripts disponibles

**Backend (`backend/package.json`):**
| Script | Comando |
|---|---|
| `dev` | `ts-node-dev --respawn --transpile-only src/server.ts` |
| `build` | `tsc` |
| `start` | `node dist/server.js` |
| `db:migrate` | `prisma migrate dev` |
| `db:generate` | `prisma generate` |
| `db:seed` | `ts-node prisma/seed.ts` |
| `db:studio` | `prisma studio` |

**Frontend (`frontend/package.json`):**
| Script | Comando |
|---|---|
| `dev` | `vite` |
| `build` | `tsc && vite build` |
| `preview` | `vite preview` |

---

## 🔒 Seguridad implementada

| Protección | Cómo |
|---|---|
| SQL Injection | Prisma usa queries parametrizadas automáticamente |
| Validación de entradas | express-validator en todos los endpoints de escritura + filtros |
| Validación client-side | Formulario valida campos requeridos antes de enviar |
| Secretos | `.env` en `.gitignore`, nunca en el código |
| CORS | Restringido al origen del frontend (`CORS_ORIGIN`) |
| Errores internos | Stack trace solo en development, nunca en producción |
| Tipos estrictos | TypeScript strict mode |
| Cabeceras HTTP seguras | `helmet` — configura cabeceras de seguridad automáticamente |
| Rate limiting | `express-rate-limit` — 100 peticiones por IP cada 15 minutos |
| Límite de body | `express.json({ limit: "10kb" })` — previene payloads excesivos |
| Errores tipados | `AppError` — errores personalizados con código HTTP |
| Duplicados | Verificación de nombre duplicado al crear (409 Conflict) |
| Log de peticiones | `requestLogger` — registra método y ruta con timestamp |
| Graceful shutdown | Señales SIGINT/SIGTERM cierran la conexión a BD limpiamente |
| Mass assignment | Desestructuración explícita de campos en servicio |
| Tags sanitizados | Tags se normalizan a lowercase y trim al guardar |
| Validación de tags | Max 20 tags, max 50 chars cada uno, sin caracteres `<>` |

## 🔒 Seguridad pendiente (próximas mejoras)

| Mejora | Paquete | Prioridad |
|---|---|---|
| Sanitización XSS | `xss` | Media |
| Autenticación | `jsonwebtoken` + `bcryptjs` | Alta |
| Logs persistentes | `winston` | Media |
| Validar .env al arrancar | nativo | Baja |

---

## 🐛 Problemas resueltos durante el desarrollo

| Problema | Causa | Solución aplicada |
|---|---|---|
| `Authentication failed` al conectar Prisma | Puerto 5432 ocupado por otro PostgreSQL local | Se cambió a puerto **5433** en `docker-compose.yml` y `backend/.env` |
| `Environment variable not found: DATABASE_URL` | Prisma busca `.env` en la carpeta del `schema.prisma` | Se incluyó `backend/.env` directamente en el proyecto |
| Variables `${DB_USER}` sin resolver | Interpolación bash no funciona en Windows | Se pusieron valores hardcodeados en `docker-compose.yml` y URL directa en `.env` |
| Comillas en `DATABASE_URL` causaban error | Windows parsea diferente las comillas en `.env` | Se eliminaron las comillas alrededor del valor |
| `prisma: command not found` | Dependencias no instaladas | Ejecutar `npm install` antes de cualquier comando |
| `Cannot find name 'process'` en seed.ts | `tsconfig.json` excluía `prisma/` del contexto de tipos | Se cambió `rootDir` a `.`, se agregó `prisma/**/*` a `include` y `"types": ["node"]` |

---

## ⚠️ Issues conocidos

| Issue | Impacto | Nota |
|---|---|---|
| Tipo "Creativo" en seed pero no en `TIPOS` del frontend | Dixit se muestra pero su tipo no aparece en el filtro por tipo ni se puede asignar a nuevos juegos | Agregar "Creativo" a la constante `TIPOS` o cambiar el seed |
| Inventario muestra solo página actual | El modal recibe `games` del state de `GameList` (paginado) en vez de todos los juegos | Hacer un fetch sin paginación (`limit: 999`) para el inventario |

---

## 📋 Posibles mejoras futuras

- [ ] Autenticación con JWT (login/registro)
- [ ] Imagen/foto de cada juego
- [ ] Sistema de préstamos (registrar quién tiene cada juego)
- [ ] Historial de movimientos de stock
- [ ] Tests unitarios (Jest + Supertest)
- [ ] Exportar inventario a CSV o PDF
- [ ] Deploy (Railway para backend, Vercel para frontend)
- [ ] Inventario: cargar todos los juegos (no solo la página actual)
- [ ] Agregar "Creativo" a la lista `TIPOS` del frontend
- [ ] Ordenamiento configurable (por nombre, fecha, stock)
- [ ] Dark/light mode toggle

---

## 💬 Frases clave para la entrevista técnica

**Sobre la arquitectura:**
> "Separé el controlador del servicio: el controlador solo maneja HTTP (leer request, escribir response), la lógica de negocio vive en el servicio. Esto facilita pruebas unitarias y reutilización."

**Sobre seguridad:**
> "Implementé seguridad en capas: helmet para cabeceras HTTP, express-rate-limit para prevenir abuso, express-validator para validar entradas, Prisma para prevenir SQL injection, y CORS restringido. Además, limito el tamaño del body a 10kb y uso errores tipados con AppError."

**Sobre el modelo de datos:**
> "Agregué índices en nombre, tipo y disponible porque son los campos más usados en filtros. Sin índices, cada búsqueda haría un full table scan."

**Sobre la respuesta estándar:**
> "Todas las respuestas siguen el mismo formato { success, data, meta, error }. El frontend siempre sabe cómo leer la respuesta sin código condicional por endpoint."

**Sobre manejo de errores:**
> "Tengo un AppError personalizado que incluye código HTTP. El middleware global de errores captura todo, y en desarrollo muestra el stack trace pero en producción solo un mensaje genérico."

**Sobre el frontend:**
> "Uso Fetch API nativa en vez de Axios porque es suficiente para mi caso y evito una dependencia extra. El Vite proxy redirige /api al backend, así evito problemas de CORS en desarrollo."

**Sobre la UX:**
> "Implementé debounce de 280ms en la búsqueda para no saturar el backend con peticiones en cada tecla. Los filtros activos se muestran como chips removibles para que el usuario siempre sepa qué está filtrando."

**Sobre la paginación:**
> "La paginación se hace server-side con dos queries en paralelo (Promise.all): una para los datos y otra para el count total. Esto permite calcular las páginas sin traer todos los registros."
