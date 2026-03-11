export interface Game {
  id: number;
  nombre: string;
  tipo: string;
  numeroJugadores: number;
  edadMinima: number;
  disponible: boolean;
  tags: string[];
  descripcion: string | null;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateGameData = Omit<Game, "id" | "createdAt" | "updatedAt">;
export type GameFormData = CreateGameData;
export type UpdateGameData = Partial<CreateGameData>;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

export interface GameFilters {
  search: string;
  tipo: string;
  disponible?: boolean;
  edadMinima?: number;
  numeroJugadores?: number;
  page: number;
}

export interface GamesResponse {
  data: Game[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
}
