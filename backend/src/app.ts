/**
 * APP.TS — Configuración de Express
 * Middlewares globales y rutas de la API.
 */
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import express from "express";
import cors from "cors";
import { requestLogger, errorHandler, notFound } from "./middlewares/errorHandler";
import gameRoutes from "./routes/gameRoutes";

const app = express();

// Seguridad: cabeceras HTTP
app.use(helmet());

// Rate limiting: 100 requests por IP cada 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,   // devuelve info en headers RateLimit-*
  legacyHeaders: false,     // desactiva headers X-RateLimit-* antiguos
  message: {
    success: false,
    error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.'
  }
});

app.use('/api', limiter);


// Middlewares globales (en orden de ejecución)
app.use(requestLogger);
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), service: "ludoteca-api" });
});

// Rutas de la API
app.use("/api/games", gameRoutes);

// Manejo de errores (siempre al final)
app.use(notFound);
app.use(errorHandler);

export default app;
