import { useState } from "react";
import { Game, GameFormData } from "../types";
import { createGame, updateGame } from "../services/gameService";

interface Props {
  initialData: Game | null;
  onSave: () => void;
  onCancel: () => void;
}

const TIPOS = [
  "Estrategia","Familiar","Cooperativo","Creativo","Party","Abstracto",
  "Rol","Cartas","Dados","Trivia","Deducción",
];

const EMPTY: GameFormData = {
  nombre: "", tipo: "", numeroJugadores: 2,
  edadMinima: 6, disponible: true, tags: [], descripcion: "", stock: 1,
};

/** Convierte el valor del input a string para mostrarlo (vacío en vez de "0") */
const numToStr = (n: number | undefined) => (n === undefined || n === null ? "" : String(n));

export default function GameForm({ initialData, onSave, onCancel }: Props) {
  const isEdit = !!initialData;

  const [form, setForm]         = useState<GameFormData>(
    initialData
      ? { ...initialData, tags: initialData.tags ?? [] }
      : EMPTY
  );
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") ?? "");
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [saving, setSaving]       = useState(false);

  // Strings separados para los 3 campos numéricos (permite input vacío sin mostrar "0")
  const [jugadoresStr, setJugadoresStr] = useState(numToStr(form.numeroJugadores));
  const [edadStr, setEdadStr]           = useState(numToStr(form.edadMinima));
  const [stockStr, setStockStr]         = useState(numToStr(form.stock));

  /** Setter para campos numéricos: guarda el string y parsea al form */
  const setNum = (field: "numeroJugadores" | "edadMinima" | "stock", raw: string) => {
    // Permitir solo dígitos (no negativos)
    const cleaned = raw.replace(/[^0-9]/g, "");
    if (field === "numeroJugadores") setJugadoresStr(cleaned);
    if (field === "edadMinima")      setEdadStr(cleaned);
    if (field === "stock")           setStockStr(cleaned);

    const num = cleaned === "" ? 0 : Number(cleaned);
    set(field, num);
  };

  const set = (field: keyof GameFormData, value: unknown) => {
    setForm(p => {
      const next = { ...p, [field]: value };
      // Si el stock baja a 0, forzar disponible = false
      if (field === "stock" && Number(value) < 1) {
        next.disponible = false;
      }
      return next;
    });
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim())       e.nombre = "El nombre es obligatorio.";
    if (!form.tipo)                e.tipo   = "Selecciona un tipo.";
    if (form.numeroJugadores < 1)  e.numeroJugadores = "Mínimo 1 jugador.";
    if (form.edadMinima < 3)       e.edadMinima = "La edad mínima es 3 años.";
    if (form.stock < 0)            e.stock = "El stock no puede ser negativo.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: GameFormData = {
        ...form,
        tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
      };
      if (isEdit && initialData) await updateGame(initialData.id, payload);
      else await createGame(payload);
      onSave();
    } catch (err: unknown) {
      const apiErrors = (err as { errors?: { msg: string; path?: string }[] })?.errors;
      if (apiErrors) {
        const mapped: Record<string, string> = {};
        apiErrors.forEach(e => { if (e.path) mapped[e.path] = e.msg; });
        setErrors(mapped);
      } else {
        setErrors({ general: "Error al guardar. Inténtalo de nuevo." });
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal modal-md" role="dialog" aria-modal="true">

        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit
              ? <><em>{initialData.nombre}</em> — Editar</>
              : <>Nuevo <em>Juego</em></>
            }
          </h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {errors.general && <div className="form-general-error">⚠ {errors.general}</div>}

          {/* nombre */}
          <div className="form-field">
            <label className="form-label">Nombre<span className="form-label-req">*</span></label>
            <input className={`form-input${errors.nombre ? " err" : ""}`} type="text"
              placeholder="Nombre del juego…" value={form.nombre}
              onChange={e => set("nombre", e.target.value)} />
            {errors.nombre && <span className="form-error">{errors.nombre}</span>}
          </div>

          {/* tipo + disponible */}
          <div className="form-row-2">
            <div className="form-field">
              <label className="form-label">Tipo<span className="form-label-req">*</span></label>
              <select className={`form-select${errors.tipo ? " err" : ""}`}
                value={form.tipo} onChange={e => set("tipo", e.target.value)}>
                <option value="">Seleccionar…</option>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.tipo && <span className="form-error">{errors.tipo}</span>}
            </div>
            <div className="form-field" style={{ justifyContent: "flex-end" }}>
              <label className="form-label">Estado</label>
              <label className="form-checkbox" style={{ opacity: form.stock < 1 ? 0.6 : 1 }}>
                <input type="checkbox" checked={form.disponible}
                  disabled={form.stock < 1}
                  onChange={e => set("disponible", e.target.checked)} />
                <span className="form-checkbox-label">
                  {form.disponible ? "Disponible" : "No disponible"}
                </span>
              </label>
              {form.stock < 1 && (
                <span className="form-error" style={{ fontWeight: 500 }}>
                  Se necesita al menos 1 de stock para marcar como disponible
                </span>
              )}
            </div>
          </div>

          {/* jugadores + edad */}
          <div className="form-row-2">
            <div className="form-field">
              <label className="form-label">Nº jugadores<span className="form-label-req">*</span></label>
              <input className={`form-input${errors.numeroJugadores ? " err" : ""}`}
                type="text" inputMode="numeric" placeholder="Ej: 2"
                value={jugadoresStr}
                onChange={e => setNum("numeroJugadores", e.target.value)} />
              {errors.numeroJugadores && <span className="form-error">{errors.numeroJugadores}</span>}
            </div>
            <div className="form-field">
              <label className="form-label">Edad mínima<span className="form-label-req">*</span></label>
              <input className={`form-input${errors.edadMinima ? " err" : ""}`}
                type="text" inputMode="numeric" placeholder="Ej: 6"
                value={edadStr}
                onChange={e => setNum("edadMinima", e.target.value)} />
              {errors.edadMinima && <span className="form-error">{errors.edadMinima}</span>}
            </div>
          </div>

          {/* stock */}
          <div className="form-field" style={{ maxWidth: "45%" }}>
            <label className="form-label">Stock</label>
            <input className={`form-input${errors.stock ? " err" : ""}`}
              type="text" inputMode="numeric" placeholder="Ej: 1"
              value={stockStr}
              onChange={e => setNum("stock", e.target.value)} />
            {errors.stock && <span className="form-error">{errors.stock}</span>}
          </div>

          {/* tags */}
          <div className="form-field">
            <label className="form-label">Etiquetas</label>
            <input className="form-input" type="text"
              placeholder="medieval, cooperativo, 2h… separadas por comas"
              value={tagsInput} onChange={e => setTagsInput(e.target.value)} />
          </div>

          {/* descripción */}
          <div className="form-field">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea"
              placeholder="Breve descripción del juego…"
              value={form.descripcion ?? ""}
              onChange={e => set("descripcion", e.target.value)} />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>Cancelar</button>
          <button className="modal-btn modal-btn-save" onClick={handleSubmit} disabled={saving}>
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear juego"}
          </button>
        </div>
      </div>
    </div>
  );
}
