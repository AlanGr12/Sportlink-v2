import { useState } from "react";

// ── Deportes disponibles (mismo listado que FormularioEntrenamiento) ──────────
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

const IMAGEN_DEFAULT =
  "https://via.placeholder.com/600x300?text=Sin+imagen";

// ── Componente ────────────────────────────────────────────────────────────────
function FormularioPrueba({ idclub, onGuardado, onCancelar }) {
  const idclubResuelto = Number(idclub);

  // ── Campos del formulario ─────────────────────────────────────────────────
  const [iddeporte,    setIddeporte]    = useState(deportesDisponibles[0].id);
  const [cupo,         setCupo]         = useState("");
  const [horainicio,   setHorainicio]   = useState("");
  const [horafin,      setHorafin]      = useState("");
  const [estado,       setEstado]       = useState("true");
  const [descripcion,  setDescripcion]  = useState("");
  const [categoria,    setCategoria]    = useState("");
  const [zona,         setZona]         = useState("");
  const [genero,       setGenero]       = useState("");
  const [fechaprueba,  setFechaprueba]  = useState("");
  const [fechacierre,  setFechacierre]  = useState("");
  const [imagenFile,   setImagenFile]   = useState(null);   // File object

  // ── UI state ──────────────────────────────────────────────────────────────
  const [errores,  setErrores]  = useState({});
  const [loading,  setLoading]  = useState(false);
  const [errorApi, setErrorApi] = useState("");

  // ── Validación ────────────────────────────────────────────────────────────
  const validar = () => {
    const e = {};

    // ── Validar que el id del club sea un entero positivo ─────────────────
    if (!idclubResuelto || idclubResuelto <= 0) {
      e.idclub = "No se pudo identificar tu club. Cerrá sesión e ingresá nuevamente.";
    }

    // ── Validar que el id del deporte sea un entero positivo ─────────────
    const idDeporteNum = Number(iddeporte);
    if (isNaN(idDeporteNum) || idDeporteNum <= 0) {
      e.iddeporte = "Seleccioná un deporte válido.";
    }

    if (!cupo || Number(cupo) <= 0)  e.cupo        = "El cupo debe ser mayor a 0.";
    if (!horainicio)                  e.horainicio  = "Ingresá la hora de inicio.";
    if (!horafin)                     e.horafin     = "Ingresá la hora de fin.";
    if (!descripcion.trim())          e.descripcion = "La descripción es obligatoria.";
    if (!categoria.trim())            e.categoria   = "La categoría es obligatoria.";
    if (!zona.trim())                 e.zona        = "La zona es obligatoria.";
    if (!genero.trim())               e.genero      = "El género es obligatorio.";
    if (!fechaprueba)                 e.fechaprueba = "La fecha de prueba es obligatoria.";
    if (!fechacierre)                 e.fechacierre = "La fecha de cierre es obligatoria.";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit → POST /api/pruebas/crearPrueba ───────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorApi("");
    if (!validar()) return;

    // ── Sanear los IDs num\u00e9ricos antes de tocar el FormData ──────────────
    const idClubNum     = Number(idclubResuelto);
    const idDeporteNum  = Number(iddeporte);
    const cupoNum       = Number(cupo);

    // Doble-check: si alguno es inv\u00e1lido abortar (ya fue capturado en validar,
    // pero esto protege ante race-conditions o manipulaciones del DOM).
    if (isNaN(idClubNum)    || idClubNum    <= 0) { setErrorApi("Error interno: id de club inv\u00e1lido.");   return; }
    if (isNaN(idDeporteNum) || idDeporteNum <= 0) { setErrorApi("Error interno: id de deporte inv\u00e1lido."); return; }
    if (isNaN(cupoNum)      || cupoNum      <= 0) { setErrorApi("Error interno: cupo inv\u00e1lido.");          return; }

    setLoading(true);
    try {
      const formData = new FormData();

      // Campos exactos esperados por la API — solo n\u00fameros v\u00e1lidos llegan aqu\u00ed
      formData.append("idclub",      String(idClubNum));
      formData.append("iddeporte",   String(idDeporteNum));
      formData.append("cupo",        String(cupoNum));
      formData.append("horainicio",  horainicio);
      formData.append("horafin",     horafin);
      formData.append("estado",      estado);            // 'true' o 'false'
      formData.append("descripcion", descripcion.trim());
      formData.append("categoria",   categoria.trim());
      formData.append("zona",        zona.trim());
      formData.append("genero",      genero.trim());
      formData.append("fechaprueba", fechaprueba);
      formData.append("fechacierre", fechacierre);

      // Campo imagen: archivo seleccionado o URL por defecto
      if (imagenFile) {
        formData.append("imagen", imagenFile);
      } else {
        formData.append("imagen", IMAGEN_DEFAULT);
      }

      const res = await fetch("http://localhost:3000/api/pruebas/crearPrueba", {
        method: "POST",
        body: formData,
        // NO establecer Content-Type manualmente; el navegador pone
        // multipart/form-data con el boundary correcto automáticamente.
      });

      if (!res.ok) {
        const texto = await res.text();
        throw new Error(texto || `Error ${res.status}`);
      }

      onGuardado(); // Notifica al padre para cerrar modal y recargar lista
    } catch (err) {
      console.error("FormularioPrueba: error al crear prueba:", err);
      setErrorApi(err.message || "Ocurrió un error al crear la prueba.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <form className="formulario-entrenamiento" onSubmit={handleSubmit}>

      {/* Banner de error de la API */}
      {errorApi && (
        <div className="form-error-banner">{errorApi}</div>
      )}

      {/* Banner de error de idclub (no hay id v\u00e1lido) */}
      {errores.idclub && (
        <div className="form-error-banner">{errores.idclub}</div>
      )}

      {/* ── Fila doble: Deporte + Cupo ─────────────────────────────── */}
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
        </div>

        <div className="form-grupo">
          <label className="form-label">
            Cupo máximo<span>*</span>
          </label>
          <input
            type="number"
            className="form-input"
            min="1"
            value={cupo}
            onChange={(e) => setCupo(e.target.value)}
            placeholder="ej. 20"
          />
          {errores.cupo && <span className="error-feedback">{errores.cupo}</span>}
        </div>
      </div>

      {/* ── Fila doble: Hora inicio + Hora fin ─────────────────────── */}
      <div className="form-fila-doble">
        <div className="form-grupo">
          <label className="form-label">
            Hora de inicio<span>*</span>
          </label>
          <input
            type="time"
            className="form-input"
            value={horainicio}
            onChange={(e) => setHorainicio(e.target.value)}
          />
          {errores.horainicio && <span className="error-feedback">{errores.horainicio}</span>}
        </div>

        <div className="form-grupo">
          <label className="form-label">
            Hora de fin<span>*</span>
          </label>
          <input
            type="time"
            className="form-input"
            value={horafin}
            onChange={(e) => setHorafin(e.target.value)}
          />
          {errores.horafin && <span className="error-feedback">{errores.horafin}</span>}
        </div>
      </div>

      {/* ── Fila doble: Fecha de prueba + Fecha de cierre ──────────── */}
      <div className="form-fila-doble">
        <div className="form-grupo">
          <label className="form-label">
            Fecha de prueba<span>*</span>
          </label>
          <input
            type="date"
            className="form-input"
            value={fechaprueba}
            onChange={(e) => setFechaprueba(e.target.value)}
          />
          {errores.fechaprueba && <span className="error-feedback">{errores.fechaprueba}</span>}
        </div>

        <div className="form-grupo">
          <label className="form-label">
            Fecha de cierre de inscripción<span>*</span>
          </label>
          <input
            type="date"
            className="form-input"
            value={fechacierre}
            onChange={(e) => setFechacierre(e.target.value)}
          />
          {errores.fechacierre && <span className="error-feedback">{errores.fechacierre}</span>}
        </div>
      </div>

      {/* ── Fila doble: Categoría + Género ─────────────────────────── */}
      <div className="form-fila-doble">
        <div className="form-grupo">
          <label className="form-label">
            Categoría<span>*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="ej. Sub-17, Primera, Libre"
          />
          {errores.categoria && <span className="error-feedback">{errores.categoria}</span>}
        </div>

        <div className="form-grupo">
          <label className="form-label">
            Género<span>*</span>
          </label>
          <select
            className="form-select"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
          >
            <option value="">Seleccioná...</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Mixto">Mixto</option>
          </select>
          {errores.genero && <span className="error-feedback">{errores.genero}</span>}
        </div>
      </div>

      {/* ── Zona ───────────────────────────────────────────────────── */}
      <div className="form-grupo">
        <label className="form-label">
          Zona / Lugar<span>*</span>
        </label>
        <input
          type="text"
          className="form-input"
          value={zona}
          onChange={(e) => setZona(e.target.value)}
          placeholder="ej. Buenos Aires, Cancha Central"
        />
        {errores.zona && <span className="error-feedback">{errores.zona}</span>}
      </div>

      {/* ── Descripción ────────────────────────────────────────────── */}
      <div className="form-grupo">
        <label className="form-label">
          Descripción<span>*</span>
        </label>
        <textarea
          className="form-textarea"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe los requisitos, metodología y objetivos de la prueba"
        />
        {errores.descripcion && <span className="error-feedback">{errores.descripcion}</span>}
      </div>

      {/* ── Fila doble: Estado + Imagen ────────────────────────────── */}
      <div className="form-fila-doble">
        <div className="form-grupo">
          <label className="form-label">Estado</label>
          <select
            className="form-select"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="true">Activa</option>
            <option value="false">Inactiva</option>
          </select>
        </div>

        <div className="form-grupo">
          <label className="form-label">Imagen (opcional)</label>
          <label className="file-upload-box" style={{ marginTop: 0 }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImagenFile(e.target.files?.[0] || null)}
            />
            <div className="file-upload-icon">🖼️</div>
            <div className="file-upload-text">
              {imagenFile
                ? `Seleccionada: ${imagenFile.name}`
                : "Clic para subir imagen"}
            </div>
          </label>
        </div>
      </div>

      {/* ── Acciones ───────────────────────────────────────────────── */}
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
          {loading ? "Creando prueba..." : idclubResuelto ? "Crear Prueba" : "Esperando club..."}
        </button>
      </div>

    </form>
  );
}

export default FormularioPrueba;
