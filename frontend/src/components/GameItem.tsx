import { Game } from "../types";

interface Props {
  game: Game;
  onEdit: () => void;
  onDelete: () => void;
}

const TIPO_ACCENT: Record<string, string> = {
  Estrategia:  "#4f46e5",
  Familiar:    "#0891b2",
  Cooperativo: "#0d9488",
  Party:       "#e11d48",
  Abstracto:   "#7c3aed",
  Rol:         "#ea580c",
  Cartas:      "#0284c7",
  Dados:       "#ca8a04",
  Trivia:      "#16a34a",
  Deducción:   "#be185d",
};

function accent(tipo: string) {
  return TIPO_ACCENT[tipo] ?? "#7c3aed";
}

export default function GameItem({ game, onEdit, onDelete }: Props) {
  const color = accent(game.tipo);

  const stockColor = game.stock > 1 ? "var(--success)" : game.stock === 1 ? "var(--warning)" : "var(--danger)";

  return (
    <article className="game-card">
      {/* Franja de color por tipo */}
      <div className="game-card-stripe" style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }} />

      <div className="game-card-body">
        {/* Nombre + badge tipo */}
        <div className="game-card-top">
          <h2 className="game-card-name">{game.nombre}</h2>
          <span className="game-card-type" style={{ color, borderColor: `${color}35`, background: `${color}0c` }}>
            {game.tipo}
          </span>
        </div>

        {/* Stats con emojis */}
        <div className="game-card-stats">
          <div className="game-card-stat">
            <span className="game-card-stat-label">👥 Jugadores</span>
            <span className="game-card-stat-value">{game.numeroJugadores}+</span>
          </div>
          <div className="game-card-stat">
            <span className="game-card-stat-label">🎂 Edad mín.</span>
            <span className="game-card-stat-value">{game.edadMinima}+</span>
          </div>
          <div className="game-card-stat">
            <span className="game-card-stat-label">📦 Stock</span>
            <span className="game-card-stat-value" style={{ color: stockColor }}>
              {game.stock} ud{game.stock !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="game-card-stat">
            <span className="game-card-stat-label">Estado</span>
            <span className="game-card-availability">
              <span className="game-card-avail-dot" style={{
                background: game.disponible ? "var(--success)" : "var(--danger)",
                boxShadow: game.disponible ? "0 0 6px rgba(34,197,94,.35)" : "0 0 6px rgba(239,68,68,.35)"
              }} />
              <span style={{ color: game.disponible ? "var(--success)" : "var(--danger)" }}>
                {game.disponible ? "Disponible" : "Agotado"}
              </span>
            </span>
          </div>
        </div>

        {/* Barra de stock */}
        <div className="game-card-stock-bar">
          <div className="game-card-stock-fill" style={{
            width: `${Math.min(100, (game.stock / 5) * 100)}%`,
            background: stockColor,
          }} />
        </div>

        {/* Tags */}
        {game.tags?.length > 0 && (
          <div className="game-card-tags">
            {game.tags.slice(0, 5).map(t => (
              <span key={t} className="game-card-tag">{t}</span>
            ))}
            {game.tags.length > 5 && (
              <span className="game-card-tag">+{game.tags.length - 5}</span>
            )}
          </div>
        )}

        {/* Descripción */}
        {game.descripcion && (
          <p className="game-card-desc">{game.descripcion}</p>
        )}
      </div>

      <div className="game-card-divider" />

      <div className="game-card-actions">
        <button className="game-card-btn game-card-btn-edit" onClick={onEdit}>✏️ Editar</button>
        <button className="game-card-btn game-card-btn-delete" onClick={onDelete}>🗑️ Eliminar</button>
      </div>
    </article>
  );
}
