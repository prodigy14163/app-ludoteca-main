/**
 * SEED DE DATOS
 * Inserta juegos de ejemplo en la base de datos.
 * Ejecutar con: npm run db:seed
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const juegosEjemplo = [
  {
    nombre: "Catan",
    tipo: "Estrategia",
    numeroJugadores: 4,
    edadMinima: 10,
    disponible: true,
    stock: 2,
    tags: ["recursos", "intercambio", "dados"],
    descripcion: "Coloniza la isla de Catan comerciando recursos con otros jugadores.",
  },
  {
    nombre: "Ticket to Ride",
    tipo: "Familiar",
    numeroJugadores: 5,
    edadMinima: 8,
    disponible: true,
    stock: 1,
    tags: ["trenes", "rutas", "cartas"],
    descripcion: "Construye rutas de tren por Europa y conecta ciudades.",
  },
  {
    nombre: "Pandemic",
    tipo: "Cooperativo",
    numeroJugadores: 4,
    edadMinima: 8,
    disponible: false,
    stock: 0,
    tags: ["cooperativo", "enfermedades", "trabajo-en-equipo"],
    descripcion: "Trabaja en equipo para detener pandemias que amenazan el mundo.",
  },
  {
    nombre: "Dixit",
    tipo: "Creativo",
    numeroJugadores: 6,
    edadMinima: 6,
    disponible: true,
    stock: 3,
    tags: ["cartas", "imaginacion", "narracion"],
    descripcion: "Describe cartas ilustradas con pistas creativas y ambiguas.",
  },
  {
    nombre: "Dominion",
    tipo: "Cartas",
    numeroJugadores: 4,
    edadMinima: 13,
    disponible: true,
    stock: 1,
    tags: ["deck-building", "cartas", "turnos"],
    descripcion: "Construye tu mazo de cartas para dominar el reino.",
  },
  {
    nombre: "Uno",
    tipo: "Cartas",
    numeroJugadores: 10,
    edadMinima: 6,
    disponible: true,
    stock: 4,
    tags: ["cartas", "rapido", "familia"],
    descripcion: "El clásico juego de cartas para toda la familia.",
  },
  {
    nombre: "Azul",
    tipo: "Abstracto",
    numeroJugadores: 4,
    edadMinima: 8,
    disponible: true,
    stock: 2,
    tags: ["azulejos", "patron", "abstracto"],
    descripcion: "Decora el palacio del rey con bellos azulejos portugueses.",
  },
];

async function main() {
  console.log("🌱 Iniciando seed de datos...");
  await prisma.game.deleteMany();
  console.log("🗑️  Tabla limpiada");

  const resultado = await prisma.game.createMany({ data: juegosEjemplo });
  console.log(`✅ ${resultado.count} juegos insertados correctamente`);
}

main()
  .catch((error) => {
    console.error("❌ Error en el seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
