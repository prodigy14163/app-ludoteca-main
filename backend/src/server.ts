/**
 * SERVER.TS — Punto de entrada
 * Carga variables de entorno, verifica la BD y arranca el servidor.
 */

import "dotenv/config";
import app from "./app";
import prisma from "./database/prismaClient";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Conexión a PostgreSQL establecida");

    app.listen(PORT, () => {
      console.log(`
🎲 ================================
   Ludoteca API corriendo
   URL: http://localhost:${PORT}
   Entorno: ${process.env.NODE_ENV || "development"}
================================
      `);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => { await prisma.$disconnect(); process.exit(0); });
process.on("SIGTERM", async () => { await prisma.$disconnect(); process.exit(0); });

startServer();
