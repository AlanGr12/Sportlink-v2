import { useEffect, useState } from "react";
import axios from "axios";

import MenuEmpleos from "./MenuEmpleos";
import ListaEmpleos from "./ListaEmpleos";
import DetalleEmpleo from "./DetalleEmpleo";
import Footer from "../footer/footer";

import "../entrenamientos/entrenamientos.css";
import "./empleos.css";

import { IconoBuscador } from "../iconos/IconoBuscador.jsx";

function Empleos({ cambiarVista, usuario }) {
  // ── Estado de datos ────────────────────────────────────────
  const [empleos, setEmpleos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // ── Empleo seleccionado ────────────────────────────────────
  const [empleoSeleccionado, setEmpleoSeleccionado] = useState(null);
  const [postulaciones, setPostulaciones] = useState([]);
  const [idclubResuelto, setIdclubResuelto] = useState(null);

  const esClub = usuario?.tipousuario === "club";

  useEffect(() => {
    const idusuario = usuario?.idusuario || usuario?.idUsuario || usuario?.id;
    if (usuario?.tipousuario !== "club" || !idusuario) return;

    let montado = true;
    axios.get(`http://localhost:3000/api/login/perfil/${idusuario}`)
      .then((res) => {
        if (!montado) return;
        const perfil = res.data;
        const candidatos = [
          perfil?.idclub,
          perfil?.idClub,
          perfil?.id_club,
          perfil?.clubId,
          perfil?.club?.idclub,
          perfil?.club?.idClub,
          perfil?.club?.id,
          perfil?.data?.idclub,
          perfil?.data?.club?.idclub,
        ];
        for (const c of candidatos) {
          const n = Number(c);
          if (!isNaN(n) && n > 0) {
            setIdclubResuelto(n);
            return;
          }
        }
      })
      .catch((err) => {
        console.error("[Empleos] Error al obtener perfil del club:", err);
      });

    return () => { montado = false; };
  }, [usuario]);

  useEffect(() => {
    let montado = true;
    const obtenerPostulaciones = async () => {
      const idEntrenador = usuario?.identrenador || usuario?.idEntrenador;
      if (!idEntrenador) return;
      try {
        const response = await axios.get("http://localhost:3000/api/inscripcionesempleo");
        if (!montado) return;
        const filtradas = Array.isArray(response.data)
          ? response.data.filter(i => Number(i.identrenador) === Number(idEntrenador) && i.estado === true)
          : [];
        setPostulaciones(filtradas);
      } catch (err) {
        console.error("[Empleos] Error al cargar postulaciones del entrenador:", err);
      }
    };
    obtenerPostulaciones();
    return () => {
      montado = false;
    };
  }, [usuario]);

  // ── Filtros ────────────────────────────────────────────────
  const [busqueda, setBusqueda] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [deporte, setDeporte] = useState("");
  const [horasSemanales, setHorasSemanales] = useState("");

  // ── Carga inicial de datos ─────────────────────────────────
  useEffect(() => {
    let cancelado = false;

    const obtenerEmpleos = async () => {
      setCargando(true);
      setError(null);
      try {
        const response = await axios.get("http://localhost:3000/api/empleo");
        if (cancelado) return;

        // Filtrar solo empleos activos (estado === true)
        const data = Array.isArray(response.data)
          ? response.data.filter((e) => e.estado !== false)
          : [];
        setEmpleos(data);
      } catch (err) {
        if (!cancelado) {
          console.error("[Empleos] Error al cargar empleos:", err);
          setError("No se pudieron cargar los empleos. Intentalo nuevamente.");
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    obtenerEmpleos();

    return () => {
      cancelado = true;
    };
  }, []);

  // ── Filtrado local ─────────────────────────────────────────
  const empleosFiltrados = empleos.filter((empleo) => {
    // Si el usuario es un CLUB, solo mostrar ofertas publicadas por su propio idclub
    if (esClub) {
      if (!idclubResuelto || Number(empleo.idclub) !== Number(idclubResuelto)) {
        return false;
      }
    }

    // Búsqueda por texto (nombre del empleo o nombre del club)
    const textoBusqueda = busqueda.toLowerCase();
    const coincideBusqueda =
      !busqueda ||
      empleo.nombre?.toLowerCase().includes(textoBusqueda) ||
      empleo.club?.nombre?.toLowerCase().includes(textoBusqueda) ||
      empleo.acercaempleo?.toLowerCase().includes(textoBusqueda);

    // Ubicación (coincidencia parcial, case-insensitive)
    const coincideUbicacion =
      !ubicacion ||
      empleo.club?.ubicacion?.toLowerCase().includes(ubicacion.toLowerCase());

    // Deporte (coincidencia exacta)
    const coincideDeporte =
      !deporte || empleo.deporte?.deporte === deporte;

    // Horas semanales (rangos)
    let coincideHoras = true;
    if (horasSemanales && empleo.horasreq != null) {
      const horas = Number(empleo.horasreq);
      switch (horasSemanales) {
        case "0-10":  coincideHoras = horas >= 0  && horas <= 10; break;
        case "10-20": coincideHoras = horas > 10  && horas <= 20; break;
        case "20-30": coincideHoras = horas > 20  && horas <= 30; break;
        case "30-40": coincideHoras = horas > 30  && horas <= 40; break;
        case "40+":   coincideHoras = horas > 40;                 break;
        default:      coincideHoras = true;
      }
    }

    return coincideBusqueda && coincideUbicacion && coincideDeporte && coincideHoras;
  });

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      <div className="contenedor-empleos">
        <div className="empleos-layout">

          {/* ── COLUMNA IZQUIERDA ──────────────────────────── */}
          <div className="empleos-col-izquierda">

            {/* Buscador */}
            <div className="empleos-buscador">
              <div className="empleos-buscador-wrapper">
                <div className="empleos-buscador-icono">
                  <IconoBuscador size={16} />
                </div>
                <input
                  type="text"
                  className="empleos-buscador-input"
                  placeholder="Buscar empleo o club..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            {/* Filtros en fila */}
            <MenuEmpleos
              ubicacion={ubicacion}       setUbicacion={setUbicacion}
              deporte={deporte}           setDeporte={setDeporte}
              horasSemanales={horasSemanales} setHorasSemanales={setHorasSemanales}
            />

            {/* Contador de resultados */}
            {!cargando && !error && (
              <div className="empleos-lista-header">
                <span className="empleos-contador">
                  {empleosFiltrados.length} empleo{empleosFiltrados.length !== 1 ? "s" : ""} encontrado{empleosFiltrados.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="empleos-estado">
                <span className="empleos-estado-icono">⚠️</span>
                <h4 className="empleos-estado-titulo">Error de conexión</h4>
                <p className="empleos-estado-texto">{error}</p>
              </div>
            )}

            {/* Lista de empleos */}
            {!error && (
              <ListaEmpleos
                empleos={empleosFiltrados}
                empleoSeleccionado={empleoSeleccionado}
                onSeleccionar={setEmpleoSeleccionado}
                cargando={cargando}
              />
            )}
          </div>

          {/* ── COLUMNA DERECHA ─────────────────────────────── */}
          <div className="empleos-col-derecha">
            <DetalleEmpleo
              empleo={empleoSeleccionado}
              usuario={usuario}
              yaPostulado={postulaciones.some(p => p.idempleo === empleoSeleccionado?.idempleo)}
              onPostulacionExitosa={(nueva) => setPostulaciones([...postulaciones, nueva])}
            />
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}

export default Empleos;
