/**
 * CAPA DE CONTROLADOR
 * Extrae datos de la request, llama al servicio y envía la respuesta HTTP.
 */

import { Request, Response, NextFunction } from "express";
import * as gameService from "../services/gameService";
import { GameFilters } from "../types";

/** Parsea y valida el parámetro :id. Responde 400 si no es un número. */
function parseId(req: Request, res: Response): number | null {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ success: false, error: "El id debe ser un número válido" });
    return null;
  }
  return id;
}

export async function getGames(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters: GameFilters = {
      search: req.query.search as string | undefined,
      tipo: req.query.tipo as string | undefined,
      disponible: req.query.disponible !== undefined ? req.query.disponible === "true" : undefined,
      edadMinima: req.query.edadMinima ? parseInt(req.query.edadMinima as string) : undefined,
      numeroJugadores: req.query.numeroJugadores ? parseInt(req.query.numeroJugadores as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };

    const result = await gameService.getAllGames(filters);
    res.status(200).json({ success: true, data: result.games, meta: result.meta });
  } catch (error) {
    next(error);
  }
}

export async function getGameById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(req, res);
    if (id === null) return;

    const game = await gameService.getGameById(id);
    res.status(200).json({ success: true, data: game });
  } catch (error) {
    next(error);
  }
}

export async function createGame(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const game = await gameService.createGame(req.body);
    res.status(201).json({ success: true, data: game, message: `Juego "${game.nombre}" creado correctamente` });
  } catch (error) {
    next(error);
  }
}

export async function updateGame(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(req, res);
    if (id === null) return;

    const game = await gameService.updateGame(id, req.body);
    res.status(200).json({ success: true, data: game, message: `Juego "${game.nombre}" actualizado correctamente` });
  } catch (error) {
    next(error);
  }
}

export async function deleteGame(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseId(req, res);
    if (id === null) return;

    await gameService.deleteGame(id);
    res.status(200).json({ success: true, message: `Juego con id ${id} eliminado correctamente` });
  } catch (error) {
    next(error);
  }
}
