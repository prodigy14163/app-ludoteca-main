import { useState, useEffect } from "react";
import { Game } from "../types";
import { getGames } from "../services/gameService";

interface InventarioProps {
  onClose: () => void;
}

export default function Inventario({ onClose }: InventarioProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGames({ limit: 100 })
      .then((res) => setGames(res.data))
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  const totalJuegos   = games.length;
  const totalStock    = games.reduce((sum, g) => sum + g.stock, 0);
  const disponibles   = games.filter((g) => g.disponible).length;
  const noDisponibles = games.filter((g) => !g.disponible).length;

  const porTipo = games.reduce<Record<string, { cantidad: number; stock: number }>>(
    (acc, game) => {
      if (!acc[game.tipo]) acc[game.tipo] = { cantidad: 0, stock: 0 };
      acc[game.tipo].cantidad += 1;
      acc[game.tipo].stock += game.stock;
      return acc;
    },
    {}
  );

  const tiposOrdenados = Object.entries(porTipo).sort((a, b) => b[1].cantidad - a[1].cantidad);
  const juegosOrdenados = [...games].sort((a, b) => b.stock - a.stock);

  const TIPO_ACCENT: Record<string, string> = {
    Estrategia: "#4f46e5", Familiar: "#0891b2", Cooperativo: "#0d9488",
    Creativo: "#a855f7", Party: "#e11d48", Abstracto: "#7c3aed", Rol: "#ea580c",
    Cartas: "#0284c7", Dados: "#ca8a04", Trivia: "#16a34a", Deducción: "#be185d",
  };
  const accent = (tipo: string) => TIPO_ACCENT[tipo] ?? "#7c3aed";

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-lg" role="dialog" aria-modal="true">

        <div className="modal-header">
          <h2 className="modal-title">Inventario <em>General</em></h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">

          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner" />
              <p style={{ marginTop: 12, fontSize: 13, color: "#888" }}>Cargando inventario…</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="inv-stats">
                {[
                  { n: totalJuegos,   lbl: "Títulos en catálogo", color: "#4f46e5" },
                  { n: totalStock,    lbl: "Unidades en total",    color: "#0891b2" },
                  { n: disponibles,   lbl: "Títulos disponibles",  color: "#22c55e" },
                  { n: noDisponibles, lbl: "No disponibles",       color: "#ef4444" },
                ].map(({ n, lbl, color }) => (
                  <div key={lbl} className="inv-stat-card" style={{ borderTop: `3px solid ${color}` }}>
                    <span className="inv-stat-number" style={{ color }}>{n}</span>
                    <span className="inv-stat-label">{lbl}</span>
                  </div>
                ))}
              </div>

              {/* Por tipo */}
              <div>
                <p className="inv-section-title">Desglose por tipo</p>
                <div className="inv-types" style={{ marginTop: 14 }}>
                  {tiposOrdenados.map(([tipo, info]) => (
                    <div key={tipo} className="inv-type-badge">
                      <span className="inv-type-dot" style={{ background: accent(tipo), boxShadow: `0 0 6px ${accent(tipo)}50` }} />
                      <span className="inv-type-name">{tipo}</span>
                      <span className="inv-type-meta">
                        {info.cantidad} título{info.cantidad !== 1 ? "s" : ""} · {info.stock} ud{info.stock !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabla */}
              <div>
                <p className="inv-section-title">Detalle completo</p>
                <div className="inv-table-wrap" style={{ marginTop: 14 }}>
                  <table className="inv-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Jugadores</th>
                        <th>Edad mín.</th>
                        <th>Stock</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {juegosOrdenados.map(game => {
                        const c = accent(game.tipo);
                        const stockColor = game.stock === 0 ? "var(--danger)" : game.stock === 1 ? "var(--warning)" : "var(--success)";
                        return (
                          <tr key={game.id}>
                            <td className="inv-td-name">{game.nombre}</td>
                            <td>
                              <span className="inv-type-pill" style={{ color: c, borderColor: `${c}35`, background: `${c}0c` }}>
                                {game.tipo}
                              </span>
                            </td>
                            <td style={{ textAlign: "center" }}>{game.numeroJugadores}+</td>
                            <td style={{ textAlign: "center" }}>{game.edadMinima}+</td>
                            <td style={{ textAlign: "center" }}>
                              <span className="inv-stock-val" style={{ color: stockColor }}>{game.stock}</span>
                            </td>
                            <td>
                              <span style={{
                                fontSize: 11, fontWeight: 700, letterSpacing: ".06em",
                                textTransform: "uppercase",
                                color: game.disponible ? "var(--success)" : "var(--danger)",
                              }}>
                                {game.disponible ? "Disponible" : "No disponible"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>Cerrar</button>
        </div>

      </div>
    </div>
  );
}
