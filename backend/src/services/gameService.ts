/**
 * CAPA DE SERVICIO
 * Contiene la lógica de negocio y las queries a la base de datos.
 */

import prisma from "../database/prismaClient";
import { CreateGameDTO, UpdateGameDTO, GameFilters, PaginationMeta } from "../types";
import { AppError } from "../middlewares/errorHandler";
import { Prisma, Game } from "@prisma/client";

export async function getAllGames(filters: GameFilters): Promise<{ games: Game[]; meta: PaginationMeta }> {
  const { search, tipo, disponible, edadMinima, numeroJugadores, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.GameWhereInput = {};

  // Búsqueda por texto en nombre, tipo y tags simultáneamente
  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: "insensitive" } },
      { tipo: { contains: search, mode: "insensitive" } },
      { tags: { has: search.toLowerCase() } },
    ];
  }

  if (tipo) where.tipo = { contains: tipo, mode: "insensitive" };
  if (disponible !== undefined) where.disponible = disponible;
  if (edadMinima !== undefined) where.edadMinima = { lte: edadMinima };
  if (numeroJugadores !== undefined) where.numeroJugadores = { gte: numeroJugadores };

  // Dos queries en paralelo: datos + total (para paginación)
  const [games, total] = await Promise.all([
    prisma.game.findMany({ where, skip, take: limit, orderBy: { nombre: "asc" } }),
    prisma.game.count({ where }),
  ]);

  return {
    games,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getGameById(id: number): Promise<Game> {
  const game = await prisma.game.findUnique({ where: { id } });
  if (!game) throw new AppError(`Juego con id ${id} no encontrado`, 404);
  return game;
}

export async function createGame(data: CreateGameDTO): Promise<Game> {
  const existing = await prisma.game.findFirst({
    where: { nombre: { equals: data.nombre, mode: "insensitive" } },
  });
  if (existing) throw new AppError(`Ya existe un juego llamado "${data.nombre}"`, 409);

  // Desestructurar solo los campos permitidos (prevención de mass assignment)
  const { nombre, tipo, numeroJugadores, edadMinima, disponible, stock, tags, descripcion } = data;

  return prisma.game.create({
    data: {
      nombre,
      tipo,
      numeroJugadores,
      edadMinima,
      disponible,
      stock,
      tags: tags?.map((t) => t.toLowerCase().trim()) ?? [],
      descripcion,
    },
  });
}

export async function updateGame(id: number, data: UpdateGameDTO): Promise<Game> {
  await getGameById(id); // Lanza 404 si no existe

  // Desestructurar solo los campos permitidos (prevención de mass assignment)
  const { nombre, tipo, numeroJugadores, edadMinima, disponible, stock, tags, descripcion } = data;

  return prisma.game.update({
    where: { id },
    data: {
      ...(nombre !== undefined && { nombre }),
      ...(tipo !== undefined && { tipo }),
      ...(numeroJugadores !== undefined && { numeroJugadores }),
      ...(edadMinima !== undefined && { edadMinima }),
      ...(disponible !== undefined && { disponible }),
      ...(stock !== undefined && { stock }),
      ...(descripcion !== undefined && { descripcion }),
      ...(tags && { tags: tags.map((t) => t.toLowerCase().trim()) }),
    },
  });
}

export async function deleteGame(id: number): Promise<{ deleted: true; id: number }> {
  await getGameById(id); // Lanza 404 si no existe
  await prisma.game.delete({ where: { id } });
  return { deleted: true, id };
}
