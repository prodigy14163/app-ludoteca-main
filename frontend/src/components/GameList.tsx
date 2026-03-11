import { useState, useEffect, useCallback, useRef } from "react";
import { Game, GamesResponse, GameFilters } from "../types";
import { getGames, deleteGame } from "../services/gameService";
import GameItem from "./GameItem";
import GameForm from "./GameForm";
import Inventario from "./Inventario";

const TIPOS = [
  "Estrategia","Familiar","Cooperativo","Party","Abstracto",
  "Rol","Cartas","Dados","Trivia","Deducción",
];
const EDADES    = [3, 6, 8, 10, 12, 14, 18];
const JUGADORES = [1, 2, 3, 4, 5, 6, 8, 10];
const LIMIT     = 12;

export default function GameList() {
  const [games, setGames]           = useState<Game[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch]                   = useState("");
  const [tipo, setTipo]                       = useState("");
  const [disponible, setDisponible]           = useState("");
  const [edadMinima, setEdadMinima]           = useState("");
  const [numeroJugadores, setNumeroJugadores] = useState("");
  const [page, setPage]                       = useState(1);

  const [showForm, setShowForm]           = useState(false);
  const [editGame, setEditGame]           = useState<Game | null>(null);
  const [showInventario, setShowInventario] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGames = useCallback(async (f: GameFilters & { page: number }) => {
    setLoading(true); setError(null);
    try {
      const res: GamesResponse = await getGames({ ...f, limit: LIMIT });
      setGames(res.data);
      setTotal(res.meta?.total ?? 0);
      setTotalPages(res.meta?.totalPages ?? 1);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally { setLoading(false); }
  }, []);

  const currentFilters = {
    search, tipo,
    disponible: disponible === "" ? undefined : disponible === "true",
    edadMinima: edadMinima ? Number(edadMinima) : undefined,
    numeroJugadores: numeroJugadores ? Number(numeroJugadores) : undefined,
    page,
  };

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchGames(currentFilters), 280);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, tipo, disponible, edadMinima, numeroJugadores, page]);

  const refresh = () => fetchGames(currentFilters);

  const resetFilters = () => {
    setSearch(""); setTipo(""); setDisponible("");
    setEdadMinima(""); setNumeroJugadores(""); setPage(1);
  };

  const chips = [
    search          && { label: `"${search}"`,                       key: "search" },
    tipo            && { label: tipo,                                 key: "tipo" },
    disponible      && { label: disponible === "true" ? "Disponible" : "No disponible", key: "disponible" },
    edadMinima      && { label: `${edadMinima}+ años`,               key: "edad" },
    numeroJugadores && { label: `${numeroJugadores}+ jugadores`,     key: "jugadores" },
  ].filter(Boolean) as { label: string; key: string }[];

  const removeChip = (key: string) => {
    ({ search: () => setSearch(""), tipo: () => setTipo(""), disponible: () => setDisponible(""),
       edad: () => setEdadMinima(""), jugadores: () => setNumeroJugadores("") } as Record<string, ()=>void>)[key]?.();
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este juego?")) return;
    try { await deleteGame(id); refresh(); }
    catch { alert("Error al eliminar."); }
  };

  const handleSave = () => { setShowForm(false); setEditGame(null); refresh(); };

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNums = (): (number | "…")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const arr: (number | "…")[] = [1];
    if (page > 3) arr.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) arr.push(i);
    if (page < totalPages - 2) arr.push("…");
    arr.push(totalPages);
    return arr;
  };

  return (
    <>
      <div className="app">

        {/* ── Header ── */}
        <header className="app-header">
          <div className="header-inner">
            <div className="header-brand">
              <span className="header-eyebrow">Colección &amp; Catálogo</span>
              <h1 className="header-title">Ludo<em>teca</em></h1>
              <p className="header-subtitle">Inventario de juegos de mesa</p>
            </div>
            <div className="header-actions">
              <button className="btn btn-secondary" onClick={() => setShowInventario(true)}>
                📦 Inventario
              </button>
              <button className="btn btn-primary" onClick={() => { setEditGame(null); setShowForm(true); }}>
                + Nuevo Juego
              </button>
            </div>
          </div>
        </header>

        {/* ── Filtros ── */}
        <div className="filter-bar">
          <div className="filter-bar-inner">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input className="search-input" type="text"
                placeholder="Buscar por nombre, tipo o etiquetas…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>

            <select className="filter-select" value={tipo}
              onChange={e => { setTipo(e.target.value); setPage(1); }}>
              <option value="">Todos los tipos</option>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select className="filter-select" value={numeroJugadores}
              onChange={e => { setNumeroJugadores(e.target.value); setPage(1); }}>
              <option value="">Nº jugadores</option>
              {JUGADORES.map(j => <option key={j} value={j}>{j === 1 ? "1 jugador" : `${j}+ jugadores`}</option>)}
            </select>

            <select className="filter-select" value={edadMinima}
              onChange={e => { setEdadMinima(e.target.value); setPage(1); }}>
              <option value="">Cualquier edad</option>
              {EDADES.map(e => <option key={e} value={e}>{e}+ años</option>)}
            </select>

            <select className="filter-select" value={disponible}
              onChange={e => { setDisponible(e.target.value); setPage(1); }}
              style={{ minWidth: 136 }}>
              <option value="">Disponibilidad</option>
              <option value="true">Disponible</option>
              <option value="false">No disponible</option>
            </select>
          </div>

          {chips.length > 0 && (
            <div className="chips-bar">
              {chips.map(c => (
                <span key={c.key} className="chip">
                  {c.label}
                  <button className="chip-remove" onClick={() => removeChip(c.key)}>×</button>
                </span>
              ))}
              <button className="chips-clear" onClick={resetFilters}>Limpiar todo</button>
            </div>
          )}
        </div>

        {/* ── Contenido ── */}
        <main className="app-content">
          {error && <div className="state-error">⚠ {error}</div>}

          <div className="results-meta">
            <p className="results-count">
              {loading ? "Cargando…" : total === 0
                ? "Sin resultados"
                : <><strong>{total}</strong> {total === 1 ? "título encontrado" : "títulos encontrados"}</>
              }
            </p>
            {!loading && totalPages > 1 && (
              <span className="results-page-label">Página {page} de {totalPages}</span>
            )}
          </div>

          <div className="games-grid">
            {loading ? (
              <div className="state-loading">
                <div className="spinner" />
                <span style={{ letterSpacing: ".04em", textTransform: "uppercase", fontSize: "12px", fontWeight: 600 }}>
                  Cargando catálogo
                </span>
              </div>
            ) : games.length === 0 ? (
              <div className="state-empty">
                <span className="state-empty-icon">🎲</span>
                <p className="state-empty-title">No hay juegos que mostrar</p>
                <p className="state-empty-text">Cambia los filtros o añade un nuevo título al catálogo.</p>
              </div>
            ) : games.map(g => (
              <GameItem key={g.id} game={g}
                onEdit={() => { setEditGame(g); setShowForm(true); }}
                onDelete={() => handleDelete(g.id)} />
            ))}
          </div>

          {/* Paginación */}
          {!loading && totalPages > 1 && (
            <nav className="pagination" aria-label="Paginación">
              <button className="page-btn" onClick={() => goTo(1)} disabled={page === 1} title="Primera">«</button>
              <button className="page-btn" onClick={() => goTo(page - 1)} disabled={page === 1} title="Anterior">‹</button>

              {pageNums().map((p, i) =>
                p === "…"
                  ? <span key={`d${i}`} className="page-dots">…</span>
                  : <button key={p} className={`page-btn${page === p ? " active" : ""}`} onClick={() => goTo(p as number)}>{p}</button>
              )}

              <button className="page-btn" onClick={() => goTo(page + 1)} disabled={page === totalPages} title="Siguiente">›</button>
              <button className="page-btn" onClick={() => goTo(totalPages)} disabled={page === totalPages} title="Última">»</button>
              <span className="page-info">{page} / {totalPages}</span>
            </nav>
          )}
        </main>

        <footer className="app-footer">
          Ludoteca — Gestión de inventario de juegos de mesa
        </footer>
      </div>

      {showForm && (
        <GameForm initialData={editGame} onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditGame(null); }} />
      )}
      {showInventario && (
        <Inventario games={games} onClose={() => setShowInventario(false)} />
      )}
    </>
  );
}
