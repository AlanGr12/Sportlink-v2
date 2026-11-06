import { useState, useEffect } from "react";
import api from "../axiosConfig.js";
import CustomSelect from "../components/CustomSelect.jsx";
import InputDireccionOSM from "../components/maps/InputDireccionOSM.jsx";
import { obtenerFechaHoyLocal } from "../utils/dateUtils.js";

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

// "20:00:00" → "20:00" (formato de <input type="time">)
const horaInput = (h) => (h ? String(h).substring(0, 5) : "");
const fechaInput = (f) => (f ? String(f).substring(0, 10) : "");

// ── Componente ────────────────────────────────────────────────────────────────
// Con `prueba` el formulario edita esa prueba (PUT /api/pruebas/:id); sin ella, crea una nueva.
function FormularioPrueba({ idclub, prueba = null, onGuardado, onCancelar }) {
  const idclubResuelto = Number(idclub);
  const esEdicion = !!prueba?.idprueba;
  const p = prueba || {};

  // ── Campos del formulario ─────────────────────────────────────────────────
  const [iddeporte,    setIddeporte]    = useState(p.deporte?.iddeporte ?? "");
  // Solo se pueden crear pruebas de los deportes que el club seleccionó en su perfil
  const [deportesClub, setDeportesClub] = useState([]);
  const [deportesCargados, setDeportesCargados] = useState(false);
  const [cupo,         setCupo]         = useState(p.cupo != null ? String(p.cupo) : "");
  const [horainicio,   setHorainicio]   = useState(horaInput(p.horainicio));
  const [horafin,      setHorafin]      = useState(horaInput(p.horafin));
  const [estado,       setEstado]       = useState(p.estado === false ? "false" : "true");
  const [descripcion,  setDescripcion]  = useState(p.descripcion || "");
  const [categoria,    setCategoria]    = useState(p.categoria || "");
  const [zona,         setZona]         = useState(p.zona || "");
  const [direccion,    setDireccion]    = useState(p.direccion || "");
  const [latitud,      setLatitud]      = useState(p.latitud ?? null);
  const [longitud,     setLongitud]     = useState(p.longitud ?? null);
  const [genero,       setGenero]       = useState(p.genero || "");
  const [fechaprueba,  setFechaprueba]  = useState(fechaInput(p.fechaprueba));
  const [fechacierre,  setFechacierre]  = useState(fechaInput(p.fechacierre));
  // Al editar, las fechas que no se tocan no se validan ni se envían
  // (una prueba con la inscripción ya cerrada tiene que poder editarse igual)
  const cambioFechaPrueba = !esEdicion || fechaprueba !== fechaInput(p.fechaprueba);
  const cambioFechaCierre = !esEdicion || fechacierre !== fechaInput(p.fechacierre);
  const [imagenFile,   setImagenFile]   = useState(null);   // File object

  // ── UI state ──────────────────────────────────────────────────────────────
  const [errores,  setErrores]  = useState({});
  const [loading,  setLoading]  = useState(false);
  const [errorApi, setErrorApi] = useState("");

  const idDeporteOriginal = Number(p.deporte?.iddeporte) || null;

  useEffect(() => {
    if (!idclubResuelto) return;
    let cancelado = false;
    api.get(`/api/clubes/${idclubResuelto}`)
      .then((res) => {
        if (cancelado) return;
        const ids = (res.data?.deportes || []).map((d) => Number(d.iddeporte));
        // Al editar se mantiene el deporte actual en la lista aunque el club lo haya sacado de su perfil
        if (idDeporteOriginal && !ids.includes(idDeporteOriginal)) ids.push(idDeporteOriginal);
        const propios = deportesDisponibles.filter((d) => ids.includes(d.id));
        setDeportesClub(propios);
        if (!idDeporteOriginal && propios.length > 0) setIddeporte(propios[0].id);
        setDeportesCargados(true);
      })
      .catch((err) => console.error("FormularioPrueba: no se pudieron cargar los deportes del club:", err));
    return () => { cancelado = true; };
  }, [idclubResuelto, idDeporteOriginal]);

  // ── Validación ────────────────────────────────────────────────────────────
  const validar = () => {
    const e = {};

    if (deportesCargados && deportesClub.length === 0) {
      e.iddeporte = "Tu club no tiene deportes seleccionados. Agregalos en tu perfil para crear pruebas.";
    }

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
    else if (horainicio && horafin <= horainicio) e.horafin = "La hora de fin debe ser posterior a la de inicio.";
    if (!descripcion.trim())          e.descripcion = "La descripción es obligatoria.";
    if (!categoria.trim())            e.categoria   = "La categoría es obligatoria.";
    if (!zona.trim())                 e.zona        = "La zona es obligatoria.";
    if (!genero.trim())               e.genero      = "El género es obligatorio.";

    const hoyStr = obtenerFechaHoyLocal();
    if (!fechaprueba) {
      e.fechaprueba = "La fecha de prueba es obligatoria.";
    } else if (cambioFechaPrueba && fechaprueba < hoyStr) {
      e.fechaprueba = "La fecha de la prueba no puede ser anterior a la fecha actual.";
    }

    if (!fechacierre) {
      e.fechacierre = "La fecha de cierre es obligatoria.";
    } else if (cambioFechaCierre && fechacierre < hoyStr) {
      e.fechacierre = "La fecha de cierre no puede ser anterior a la fecha actual.";
    } else if (fechaprueba && fechacierre > fechaprueba) {
      e.fechacierre = "La fecha de cierre no puede ser posterior a la fecha de la prueba.";
    }

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
      // Al editar no se manda el club: una prueba no cambia de club
      if (!esEdicion) formData.append("idclub", String(idClubNum));
      formData.append("iddeporte",   String(idDeporteNum));
      formData.append("cupo",        String(cupoNum));
      formData.append("horainicio",  horainicio);
      formData.append("horafin",     horafin);
      formData.append("estado",      estado);            // 'true' o 'false'
      formData.append("descripcion", descripcion.trim());
      formData.append("categoria",   categoria.trim());
      formData.append("zona",        zona.trim());
      formData.append("direccion",   (direccion || zona).trim());
      if (latitud != null && !isNaN(Number(latitud))) {
        formData.append("latitud",   String(latitud));
      }
      if (longitud != null && !isNaN(Number(longitud))) {
        formData.append("longitud",  String(longitud));
      }
      formData.append("genero",      genero.trim());
      if (cambioFechaPrueba) formData.append("fechaprueba", fechaprueba);
      if (cambioFechaCierre) formData.append("fechacierre", fechacierre);

      // Campo imagen: archivo seleccionado; al crear sin archivo, la URL por defecto;
      // al editar sin archivo no se manda y queda la imagen actual
      if (imagenFile) {
        formData.append("imagen", imagenFile);
      } else if (!esEdicion) {
        formData.append("imagen", IMAGEN_DEFAULT);
      }

      // NO establecer Content-Type manualmente; axios lo hace automáticamente
      const res = esEdicion
        ? await api.put(`/api/pruebas/${prueba.idprueba}`, formData)
        : await api.post("/api/pruebas/crearPrueba", formData);

      onGuardado(res.data); // Notifica al padre para cerrar modal y recargar lista
    } catch (err) {
      console.error(`FormularioPrueba: error al ${esEdicion ? "editar" : "crear"} prueba:`, err);
      setErrorApi(err.response?.data?.error || err.message || `Ocurrió un error al ${esEdicion ? "guardar" : "crear"} la prueba.`);
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
          <CustomSelect
            value={iddeporte}
            onChange={(e) => setIddeporte(Number(e.target.value))}
            options={deportesClub.map((d) => ({ value: d.id, label: d.nombre }))}
          />
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
            min={cambioFechaPrueba ? obtenerFechaHoyLocal() : undefined}
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
            min={cambioFechaCierre ? obtenerFechaHoyLocal() : undefined}
            max={fechaprueba || undefined}
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
          <CustomSelect
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            placeholder="Seleccioná..."
            options={[
              { value: "Masculino", label: "Masculino" },
              { value: "Femenino", label: "Femenino" },
              { value: "Mixto", label: "Mixto" }
            ]}
          />
          {errores.genero && <span className="error-feedback">{errores.genero}</span>}
        </div>
      </div>

      {/* ── Zona ───────────────────────────────────────────────────── */}
      <div className="form-grupo">
        <label className="form-label">
          Zona / Lugar<span>*</span>
        </label>
        <InputDireccionOSM
          value={zona}
          onChangeText={(txt) => setZona(txt)}
          onSelectUbicacion={(loc) => {
            setZona(loc.zona || loc.direccion);
            setDireccion(loc.direccion);
            setLatitud(loc.latitud);
            setLongitud(loc.longitud);
            if (errores.zona) {
              setErrores((prev) => ({ ...prev, zona: null }));
            }
          }}
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
          <CustomSelect
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            options={[
              { value: "true", label: "Activa" },
              { value: "false", label: "Inactiva" }
            ]}
          />
        </div>

        <div className="form-grupo">
          <label className="form-label">{esEdicion ? "Cambiar imagen (opcional)" : "Imagen (opcional)"}</label>
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
                : esEdicion ? "Si no subís otra, queda la actual" : "Clic para subir imagen"}
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
          {esEdicion
            ? (loading ? "Guardando cambios..." : "Guardar cambios")
            : (loading ? "Creando prueba..." : idclubResuelto ? "Crear Prueba" : "Esperando club...")}
        </button>
      </div>

    </form>
  );
}

export default FormularioPrueba;
