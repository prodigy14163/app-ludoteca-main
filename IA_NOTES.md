# 🤖 IA_NOTES.md — Uso de IA en este proyecto

## Herramienta usada

Claude (Anthropic) — asistente de IA conversacional.

## ¿Cómo se usó?

La IA fue utilizada para generar la estructura base del proyecto y acelerar el desarrollo inicial. Todas las decisiones de arquitectura fueron revisadas y validadas manualmente durante el proceso.

## Qué generó la IA

- Estructura de carpetas y archivos del proyecto
- Código base de controladores, servicios y rutas
- Configuración de Prisma (schema, seed)
- Configuración de Docker Compose
- Componentes de React (GameList, GameItem, GameForm, Inventario)
- README con instrucciones de ejecución
- Refactoring de seguridad: integración de `helmet` y `express-rate-limit` en `app.ts`
- Clase `AppError` para errores HTTP tipados y middleware `requestLogger`
- Prevención de mass assignment con desestructuración explícita en el servicio
- Graceful shutdown con manejo de señales SIGINT/SIGTERM en `server.ts`
- Fix de `tsconfig.json` para soportar `prisma/seed.ts` (`rootDir`, `types`, `include`)

## Ajustes realizados manualmente durante el proceso

- **Puerto 5433**: se detectó conflicto con PostgreSQL local en el puerto 5432 estándar y se corrigió en `docker-compose.yml` y `backend/.env`
- **Sin comillas en `DATABASE_URL`**: las comillas causaban problemas de parsing en Windows; se eliminaron para garantizar compatibilidad
- **Credenciales hardcodeadas en `docker-compose.yml`**: la interpolación `${DB_USER}` no funciona en Windows sin `.env` en la raíz; se simplificó con valores directos
- **`backend/.env` incluido en el proyecto**: Prisma busca el `.env` donde está el `schema.prisma`; incluirlo evita pasos extra
- **Filtro de edad**: se agregó el selector con rangos predefinidos (3+, 6+, 8+, 10+...) y chips visuales de filtros activos
- **Componente Inventario**: modal con estadísticas globales, desglose por tipo y tabla completa con colores de stock
- **Revisión de configuración de seguridad**: se validó que helmet y rate-limit estén configurados correctamente para el proyecto
- **Validación de tsconfig**: se verificó que el cambio de `rootDir` no rompa la compilación

## Lo que NO hizo la IA

- Detectar el conflicto de puerto durante la instalación real
- Decidir usar valores hardcodeados en Docker para compatibilidad Windows
- Identificar el problema de comillas en `.env` en Windows
- Definir los rangos de edad útiles para el filtro
- Decidir mostrar chips visuales de filtros activos

## Conclusión

La IA funcionó como acelerador para el scaffolding y generación de código. Los problemas reales de compatibilidad en Windows, las decisiones de simplificación y los ajustes de UX fueron detectados y resueltos por el desarrollador durante la instalación y prueba real del proyecto.
