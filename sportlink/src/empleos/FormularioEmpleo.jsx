import { useState } from "react";
import api from "../axiosConfig.js";

// ── Deportes disponibles (mismo listado que el resto de la app) ──────────────
const deportesDisponibles = [
  { id: 1,  nombre: "Fútbol" },
  { id: 2,  nombre: "Basket" },
  { id: 3,  nombre: "Tenis" },
  { id: 4,  nombre: "Voley" },
  { id: 5,  nombre: "Pádel" },
  { id: 6,  nombre: "Rugby" },
  { id: 7,  nombre: "Hockey" },
  { id: 8,  nombre: "Natación" },
  { id: 9,  nombre: "Atletismo" },
  { id: 10, nombre: "Ciclismo" },
  { id: 11, nombre: "Boxeo" },
  { id: 12, nombre: "Artes Marciales" },
  { id: 13, nombre: "Handball" },
  { id: 14, nombre: "Béisbol" },
  { id: 15, nombre: "Golf" },
];

// ── Componente ────────────────────────────────────────────────────────────────
function FormularioEmpleo({ idclub, onGuardado, onCancelar }) {
  const idclubResuelto = Number(idclub);

  // ── Campos del formulario ─────────────────────────────────────────────────
  const [iddeporte,      setIddeporte]      = useState(deportesDisponibles[0].id);
  const [nombre,         setNombre]         = useState("");
  const [horasreq,       setHorasreq]       = useState("");
  const [habilidadesreq, setHabilidadesreq] = useState("");
  const [acercaempleo,   setAcercaempleo]   = useState("");
  const [estado,         setEstado]         = useState("true");

  // ── UI state ──────────────────────────────────────────────────────────────
  const [errores,  setErrores]  = useState({});
  const [loading,  setLoading]  = useState(false);
  const [errorApi, setErrorApi] = useState("");

  // ── Validación ────────────────────────────────────────────────────────────
  const validar = () => {
    const e = {};

    if (!idclubResuelto || idclubResuelto <= 0) {
      e.idclub = "No se pudo identificar tu club. Cerrá sesión e ingresá nuevamente.";
    }

    const idDeporteNum = Number(iddeporte);
    if (isNaN(idDeporteNum) || idDeporteNum <= 0) {
      e.iddeporte = "Seleccioná un deporte válido.";
    }

    if (!nombre.trim()) {
      e.nombre = "El nombre del puesto es obligatorio.";
    }

    if (horasreq !== "" && (isNaN(Number(horasreq)) || Number(horasreq) < 0)) {
      e.horasreq = "Las horas deben ser un número positivo.";
    }

    setErrores(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit → POST /api/empleo/crearEmpleo ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorApi("");
    if (!validar()) return;

    const idClubNum    = Number(idclubResuelto);
    const idDeporteNum = Number(iddeporte);

    if (isNaN(idClubNum) || idClubNum <= 0) {
      setErrorApi("Error interno: id de club inválido.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        idclub:        idClubNum,
        iddeporte:     idDeporteNum,
        nombre:        nombre.trim(),
        horasreq:      horasreq !== "" ? Number(horasreq) : null,
        habilidadesreq: habilidadesreq.trim() || null,
        acercaempleo:  acercaempleo.trim() || null,
        estado:        estado === "true",
      };

      const res = await api.post("/api/empleo/crearEmpleo", payload);

      // Notifica al padre con el empleo recién creado para actualizar la lista
      onGuardado(res.data);
    } catch (err) {
      console.error("FormularioEmpleo: error al crear empleo:", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Ocurrió un error al publicar el empleo.";
      setErrorApi(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <form className="formulario-entrenamiento" onSubmit={handleSubmit}>

      {/* Banner de error API */}
      {errorApi && (
        <div className="form-error-banner">{errorApi}</div>
      )}
      {errores.idclub && (
        <div className="form-error-banner">{errores.idclub}</div>
      )}

      {/* ── Nombre del puesto ──────────────────────────────────── */}
      <div className="form-grupo">
        <label className="form-label">
          Nombre del puesto<span>*</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="ej. Entrenador de Fútbol Sub-17"
        />
        {errores.nombre && <span className="error-feedback">{errores.nombre}</span>}
      </div>

      {/* ── Fila doble: Deporte + Horas semanales ─────────────── */}
      <div className="form-fila-doble">
        <div className="form-grupo">
          <label className="form-label">
            Deporte<span>*</span>
          </label>
          <select
            className="form-select"
            value={iddeporte}
            onChange={(e) => setIddeporte(Number(e.target.value))}
          >
            {deportesDisponibles.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
          {errores.iddeporte && <span className="error-feedback">{errores.iddeporte}</span>}
        </div>

        <div className="form-grupo">
          <label className="form-label">Horas semanales requeridas</label>
          <input
            type="number"
            className="form-input"
            min="0"
            max="168"
            value={horasreq}
            onChange={(e) => setHorasreq(e.target.value)}
            placeholder="ej. 20"
          />
          {errores.horasreq && <span className="error-feedback">{errores.horasreq}</span>}
        </div>
      </div>

      {/* ── Habilidades requeridas ─────────────────────────────── */}
      <div className="form-grupo">
        <label className="form-label">Habilidades requeridas</label>
        <input
          type="text"
          className="form-input"
          value={habilidadesreq}
          onChange={(e) => setHabilidadesreq(e.target.value)}
          placeholder="ej. Liderazgo, Planificación táctica, Comunicación"
        />
      </div>

      {/* ── Acerca del empleo ──────────────────────────────────── */}
      <div className="form-grupo">
        <label className="form-label">Descripción del puesto</label>
        <textarea
          className="form-textarea"
          style={{ minHeight: "120px" }}
          value={acercaempleo}
          onChange={(e) => setAcercaempleo(e.target.value)}
          placeholder="Describí las responsabilidades, requisitos y beneficios del puesto"
        />
      </div>

      {/* ── Estado ────────────────────────────────────────────── */}
      <div className="form-grupo" style={{ maxWidth: "180px" }}>
        <label className="form-label">Estado de la oferta</label>
        <select
          className="form-select"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="true">Activa</option>
          <option value="false">Inactiva</option>
        </select>
      </div>

      {/* ── Acciones ──────────────────────────────────────────── */}
      <div className="form-acciones">
        <button
          type="button"
          className="btn-cancelar"
          onClick={onCancelar}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-guardar"
          disabled={loading || !idclubResuelto}
        >
          {loading
            ? "Publicando..."
            : idclubResuelto
              ? "Publicar Empleo"
              : "Esperando club..."}
        </button>
      </div>

    </form>
  );
}

export default FormularioEmpleo;
