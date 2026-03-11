/**
 * SERVICIO DE API
 * Centraliza todas las llamadas al backend usando Fetch API nativa.
 */

import { Game, GameFilters, GamesResponse, CreateGameData, UpdateGameData, ApiResponse } from "../types";

const API_BASE = "/api/games";

async function handleResponse<T>(response: Response): Promise<T> {
  const json: ApiResponse<T> = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || `Error ${response.status}`);
  }
  return json.data as T;
}

export async function getGames(filters: Partial<GameFilters> & { limit?: number } = {}): Promise<GamesResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.tipo) params.set("tipo", filters.tipo);
  if (filters.disponible !== undefined) params.set("disponible", String(filters.disponible));
  if (filters.edadMinima) params.set("edadMinima", String(filters.edadMinima));
  if (filters.numeroJugadores) params.set("numeroJugadores", String(filters.numeroJugadores));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const response = await fetch(`${API_BASE}?${params.toString()}`);
  const json: ApiResponse<Game[]> = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error || `Error ${response.status}`);
  }
  return { data: json.data ?? [], meta: json.meta };
}

export async function getGameById(id: number): Promise<Game> {
  const response = await fetch(`${API_BASE}/${id}`);
  return handleResponse<Game>(response);
}

export async function createGame(data: CreateGameData): Promise<Game> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Game>(response);
}

export async function updateGame(id: number, data: UpdateGameData): Promise<Game> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Game>(response);
}

export async function deleteGame(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error || "Error al eliminar el juego");
  }
}
