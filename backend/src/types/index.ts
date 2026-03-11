/**
 * TIPOS E INTERFACES
 * Contratos de datos usados en toda la aplicación.
 */

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
  createdAt: Date;
  updatedAt: Date;
}

// Para crear: excluimos id y fechas (los genera la BD)
export type CreateGameDTO = Omit<Game, "id" | "createdAt" | "updatedAt">;

// Para actualizar: todos los campos son opcionales
export type UpdateGameDTO = Partial<CreateGameDTO>;

// Parámetros de búsqueda y filtrado
export interface GameFilters {
  search?: string;
  tipo?: string;
  disponible?: boolean;
  edadMinima?: number;
  numeroJugadores?: number;
  page?: number;
  limit?: number;
}

// Respuesta estándar de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
