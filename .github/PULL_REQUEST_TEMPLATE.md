## ¿Qué cambia este PR?

- Implementación completa del reto: API REST + frontend React para gestionar el inventario de una ludoteca
- **Backend** (Node.js + Express + TypeScript + Prisma + PostgreSQL):
  - CRUD completo de juegos (`GET`, `POST`, `PUT`, `DELETE`) en `/api/games`
  - Búsqueda por texto en nombre, tipo y tags (case-insensitive)
  - Filtros por tipo, disponibilidad, edad mínima y número de jugadores
  - Paginación server-side con metadata (`total`, `page`, `totalPages`)
  - Validación de entradas con `express-validator` (create, update y query filters)
  - Seguridad: `helmet`, `express-rate-limit` (100 req/15min), CORS restringido, body limit 10kb, `AppError` tipado, prevención de mass assignment
  - Arquitectura en capas: routes → validators → controllers → services → Prisma
- **Frontend** (React 18 + TypeScript + Vite):
  - Interfaz dark theme con grid responsivo de tarjetas
  - 5 filtros combinables con chips visuales y debounce (280ms)
  - Formulario modal para crear/editar con validación client-side
  - Modal de inventario general con resumen estadístico y tabla
  - Paginación completa con navegación
- **Infraestructura**: Docker Compose para PostgreSQL, seed con 7 juegos de ejemplo, `env.example` documentado

## ¿Cómo probar?

1. **Clonar el repo** y asegurarse de tener Docker, Node.js 18+ instalados

2. **Levantar la base de datos:**
   ```bash
   docker compose up -d
   ```

3. **Arrancar el backend** (desde `/backend`):
   ```bash
   npm install
   npm run db:generate
   npm run db:migrate    # nombre: init
   npm run db:seed
   npm run dev           # → http://localhost:3000
   ```

4. **Arrancar el frontend** (desde `/frontend`, otra terminal):
   ```bash
   npm install
   npm run dev           # → http://localhost:5173
   ```

5. **Probar la API con Postman:**

   Base URL: `http://localhost:3000`

   | Método | URL | Body (JSON) | Descripción |
   |--------|-----|-------------|-------------|
   | `GET` | `/api/games` | — | Listar todos los juegos |
   | `GET` | `/api/games?search=catan` | — | Buscar por texto |
   | `GET` | `/api/games?tipo=Estrategia` | — | Filtrar por tipo |
   | `GET` | `/api/games?disponible=true` | — | Filtrar por disponibilidad |
   | `GET` | `/api/games?edadMinima=8` | — | Filtrar por edad mínima |
   | `GET` | `/api/games?numeroJugadores=4` | — | Filtrar por nº jugadores |
   | `GET` | `/api/games/:id` | — | Obtener un juego por ID |
   | `POST` | `/api/games` | `{"nombre":"Monopoly","tipo":"Familiar","numeroJugadores":6,"edadMinima":8,"stock":2}` | Crear un juego |
   | `PUT` | `/api/games/:id` | `{"stock":5}` | Actualizar (parcial) |
   | `DELETE` | `/api/games/:id` | — | Eliminar un juego |

   > Para `POST` y `PUT`: en Postman seleccionar **Body → raw → JSON** y pegar el JSON correspondiente.

6. **Probar desde el frontend:**
   - Abrir http://localhost:5173
   - Usar los filtros (búsqueda, tipo, jugadores, edad, disponibilidad)
   - Crear un juego con "+ Nuevo Juego"
   - Editar/eliminar desde las tarjetas
   - Ver resumen con "📦 Inventario"

## Notas

- Usé IA durante el desarrollo (ver `IA_NOTES.md` para detalle)
- La base de datos usa el puerto **5433** (no el 5432 estándar) para evitar conflictos con otras instancias de PostgreSQL
- Las credenciales de la BD están hardcodeadas en `docker-compose.yml` intencionalmente (entorno local de desarrollo)
- El frontend usa Fetch API nativa (sin Axios) y un Vite proxy para `/api` en desarrollo
- Decisiones arquitectónicas documentadas en el `README.md` (sección "Decisiones técnicas")
