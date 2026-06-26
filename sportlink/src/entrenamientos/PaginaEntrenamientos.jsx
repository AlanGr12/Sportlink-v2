import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import ListaEntrenamientos from './ListaEntrenamientos';
import FormularioEntrenamiento from './FormularioEntrenamiento';
import DetalleEntrenamiento from './DetalleEntrenamiento';
import './entrenamientos.css';
import './PaginaEntrenamientos.css';
import iconFecha from '../assets/fecha.png';
import iconUbicacion from '../assets/ubicacion.png';
import iconModalidad from '../assets/modalidad.png';
import iconBuscador from '../assets/buscador.png';
import Footer from '../footer/footer';



const API_BASE = 'http://localhost:3000/api/entrenamientos';

const deportesDisponibles = [
  { id: 1, nombre: 'Fútbol' },
  { id: 2, nombre: 'Basket' },
  { id: 3, nombre: 'Tenis' },
  { id: 4, nombre: 'Voley' },
  { id: 5, nombre: 'Pádel' },
  { id: 6, nombre: 'Rugby' },
  { id: 7, nombre: 'Hockey' },
  { id: 8, nombre: 'Natación' },
  { id: 9, nombre: 'Atletismo' },
  { id: 10, nombre: 'Ciclismo' },
  { id: 11, nombre: 'Boxeo' },
  { id: 12, nombre: 'Artes Marciales' },
  { id: 13, nombre: 'Handball' },
  { id: 14, nombre: 'Béisbol' },
  { id: 15, nombre: 'Golf' }
];

const PaginaEntrenamientos = ({ usuario }) => {
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Paginación
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // Filtros de Sidebar
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('');
  const [filtroIntensidad, setFiltroIntensidad] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Expandir filtros en Sidebar (Estilo acordeón de la imagen)
  const [sidebarExpandido, setSidebarExpandido] = useState({
    zona: true,
    precio: false,
    modalidad: true,
    deporte: true,
    horario: false
  });

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false); // crear / editar
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false); // ver detalle
  const [entrenamientoSeleccionado, setEntrenamientoSeleccionado] = useState(null);

  // Toasts de Notificación
  const [toast, setToast] = useState(null);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, type: tipo });
    setTimeout(() => setToast(null), 4000);
  };

  // Petición con reintento ante 5xx (backoff corto)
  const fetchConReintento = async (url, options = {}, reintentosRestantes = 1) => {
    try {
      // Para mantener consistencia con otros componentes (ej. mostrarJugadores),
      // cuando la petición es GET usamos `axios.get(url, { params, headers })`.
      const method = (options.method || 'GET').toString().toUpperCase();
      if (method === 'GET') {
        return await axios.get(url, { params: options.params, headers: options.headers });
      }
      // Para otros métodos usamos axios.request con el config completo
      const config = { url, ...options };
      return await axios.request(config);
    } catch (err) {
      const status = err.response ? err.response.status : null;
      if (status && status >= 500 && reintentosRestantes > 0) {
        console.warn(`Error 5xx en el servidor. Reintentando en 1 segundo...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await fetchConReintento(url, options, reintentosRestantes - 1);
      }
      throw err;
    }
  };

  const cargarEntrenamientos = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Parámetros de consulta
    const offset = (page - 1) * limit;
    const params = {
      limit,
      offset,
      from: filtroFechaDesde || undefined,
      to: filtroFechaHasta || undefined,
      tipo: filtroTipo || undefined,
      modalidad: filtroModalidad || undefined,
      entrenadorId: usuario?.tipousuario === 'entrenador' ? usuario.id : undefined,
    };

    // Headers de autenticación / contexto para jugadores y entrenadores
    const headers = {};
    if (usuario?.token) headers.Authorization = `Bearer ${usuario.token}`;
    if (usuario?.id) headers['X-User-Id'] = String(usuario.id);
    if (usuario?.tipousuario) headers['X-User-Type'] = usuario.tipousuario;

    // Usaremos fetchConReintento con headers explícitos (axios.get/axios.request internamente)

    // Normalizador para unir variantes de campo de imagen del backend
    const normalize = (item) => ({
      ...item,
      imagen: item.imagen || item.foto || item.avatar || item.entrenadorFoto || (item.entrenador && item.entrenador.foto) || null
    });

    try {
      // Petición directa usando axios.get
      const res = await axios.get(API_BASE, { params, headers });
      if (res.data && res.data.items) {
        const items = res.data.items.map(normalize);
        setEntrenamientos(items);
        setTotal(res.data.total || items.length);
      } else if (Array.isArray(res.data)) {
        const items = res.data.map(normalize);
        setEntrenamientos(items);
        setTotal(items.length);
      } else {
        // Si la API retorna un formato inesperado, marcar error para revisión
        setEntrenamientos([]);
        setTotal(0);
        setError('Respuesta inesperada del servidor al solicitar entrenamientos.');
      }
    } catch (err) {
      console.error('Error cargando entrenamientos desde API:', err);
      setEntrenamientos([]);
      setTotal(0);
      if (err.response && err.response.status >= 500) {
        setError('Error en el servidor (500). Intenta nuevamente más tarde.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido al cargar entrenamientos.');
      }
    } finally {
      setLoading(false);
    }
  }, [page, filtroFechaDesde, filtroFechaHasta, filtroTipo, filtroIntensidad, filtroZona, busqueda, usuario]);

  // Recalc cuando cambia modalidad
  useEffect(() => {
    cargarEntrenamientos();
  }, [filtroModalidad]);

  useEffect(() => {
    cargarEntrenamientos();
  }, [cargarEntrenamientos]);

  // Manejo de Creación / Edición
  const handleGuardarEntrenamiento = async (datos, archivoAdjunto) => {
    // Headers para la petición (autenticación/contexto)
    const headers = {};
    if (usuario?.token) headers.Authorization = `Bearer ${usuario.token}`;
    if (usuario?.id) headers['X-User-Id'] = String(usuario.id);
    if (usuario?.tipousuario) headers['X-User-Type'] = usuario.tipousuario;

    try {
      let res;
      if (entrenamientoSeleccionado && entrenamientoSeleccionado.id && !entrenamientoSeleccionado.id.startsWith('entreno-')) {
        // Actualizar PUT
        res = await fetchConReintento(`${API_BASE}/${entrenamientoSeleccionado.id}`, { method: 'PUT', data: datos, headers });
        mostrarToast('¡Entrenamiento actualizado correctamente!');
      } else {
        // Crear POST
        res = await fetchConReintento(API_BASE, { method: 'POST', data: datos, headers });
        mostrarToast('¡Entrenamiento creado con éxito!', 'success');
      }

      const guardado = res.data;

      // Subir adjunto si existe archivo
      if (archivoAdjunto && guardado && guardado.id) {
        const formData = new FormData();
        formData.append('file', archivoAdjunto);

        try {
          const uploadHeaders = { 'Content-Type': 'multipart/form-data', ...headers };
          const adjuntoRes = await axios.post(`${API_BASE}/${guardado.id}/adjuntos`, formData, {
            headers: uploadHeaders
          });
          mostrarToast('¡Archivo adjunto subido con éxito!');
          guardado.adjunto = adjuntoRes.data.url;
        } catch (uploadErr) {
          console.error('Error al subir adjunto:', uploadErr);
          mostrarToast('Entrenamiento guardado, pero falló la subida del adjunto.', 'warning');
        }
      }

      setModalAbierto(false);
      setEntrenamientoSeleccionado(null);
      cargarEntrenamientos();
    } catch (err) {
      console.error('Error guardando entrenamiento en API:', err);
      setError(err.response?.data?.message || err.message || 'Error guardando entrenamiento');
      mostrarToast('Error al guardar entrenamiento. Revisá la consola.', 'error');
    }
  };

  const toggleSidebarSeccion = (seccion) => {
    setSidebarExpandido(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  const handleBorrarEntrenamiento = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este entrenamiento?')) return;

    try {
      const headers = {};
      if (usuario?.token) headers.Authorization = `Bearer ${usuario.token}`;
      if (usuario?.id) headers['X-User-Id'] = String(usuario.id);
      if (usuario?.tipousuario) headers['X-User-Type'] = usuario.tipousuario;

      if (!String(id).startsWith('entreno-')) {
        await fetchConReintento(`${API_BASE}/${id}`, { method: 'DELETE', headers });
      }
      mostrarToast('Entrenamiento eliminado correctamente.', 'info');
      setEntrenamientos(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error borrando entrenamiento:', err);
      setError(err.response?.data?.message || err.message || 'Error al eliminar entrenamiento');
      mostrarToast('Error al eliminar entrenamiento. Revisá la consola.', 'error');
    }
  };

  const aplicarFiltros = () => {
    setPage(1);
    cargarEntrenamientos();
  };

  // Bloquea el scroll del fondo mientras hay un modal abierto,
  // para que el usuario navegue únicamente dentro del modal.
  useEffect(() => {
    if (modalAbierto || modalDetalleAbierto) {
      const overflowOriginal = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = overflowOriginal;
      };
    }
  }, [modalAbierto, modalDetalleAbierto]);

  return (
    <>
    <div className="pagina-entrenamientos">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`toast-banner ${toast.type}`}>{toast.mensaje}</div>
      )}

      <div className="entrenamientos-layout">
        {/* SIDEBAR FILTROS (Réplica visual exacta de la imagen) */}
        <aside className="filtros-sidebar">
          <div>
            <h2 className="filtros-titulo">Filtros</h2>
            <p className="filtros-subtitulo">Refina tu búsqueda</p>
          </div>

          {/* Filtro Zona */}
          <div className="filtro-grupo">
            <div 
              className={`filtro-header ${sidebarExpandido.zona ? 'abierto' : ''}`}
              onClick={() => toggleSidebarSeccion('zona')}
            >
              <span><img src={iconUbicacion} alt="Zona" className="icon-small" /> Zona</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            {sidebarExpandido.zona && (
              <div className="filtro-contenido">
                <input 
                  type="text" 
                  className="filtro-input" 
                  placeholder="ej. Buenos Aires" 
                  value={filtroZona}
                  onChange={(e) => setFiltroZona(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Filtro Modalidad/Deporte */}
          <div className="filtro-grupo">
            <div 
              className={`filtro-header ${sidebarExpandido.modalidad ? 'abierto' : ''}`}
              onClick={() => toggleSidebarSeccion('modalidad')}
            >
              <span><img src={iconModalidad} alt="Modalidad" className="icon-small" /> Modalidad</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            {sidebarExpandido.modalidad && (
              <div className="filtro-contenido">
                <select 
                  className="filtro-select"
                  value={filtroModalidad}
                  onChange={(e) => setFiltroModalidad(e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="grupal">Grupal</option>
                  <option value="individual">Individual</option>
                </select>
              </div>
            )}
          </div>

          <div className="filtro-grupo">
            <div 
              className={`filtro-header ${sidebarExpandido.deporte ? 'abierto' : ''}`}
              onClick={() => toggleSidebarSeccion('deporte')}
            >
              <span>⚽ Deporte</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            {sidebarExpandido.deporte && (
              <div className="filtro-contenido">
                <select 
                  className="filtro-select"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="">Todos los deportes</option>
                  {deportesDisponibles.map(d => (
                    <option key={d.id} value={d.nombre}>{d.nombre}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Filtro Horario/Fecha */}
          <div className="filtro-grupo">
            <div 
              className={`filtro-header ${sidebarExpandido.horario ? 'abierto' : ''}`}
              onClick={() => toggleSidebarSeccion('horario')}
            >
              <span><img src={iconFecha} alt="Fechas" className="icon-small" /> Fechas</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            {sidebarExpandido.horario && (
              <div className="filtro-contenido">
                <input 
                  type="date" 
                  className="filtro-input" 
                  value={filtroFechaDesde}
                  onChange={(e) => setFiltroFechaDesde(e.target.value)}
                />
                <input 
                  type="date" 
                  className="filtro-input" 
                  value={filtroFechaHasta}
                  onChange={(e) => setFiltroFechaHasta(e.target.value)}
                />
              </div>
            )}
          </div>

          <button className="btn-aplicar-filtros" onClick={aplicarFiltros}>
            Aplicar Filtros
          </button>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="entrenamientos-main">
          <div className="entrenamientos-header">
            <h1 className="entrenamientos-titulo-principal">Entrenamientos</h1>
            <p className="entrenamientos-descripcion">
              Encuentra tus entrenamientos perfectos y mejora tus habilidades con los mejores profesionales
            </p>
          </div>

          {/* Barra de Búsqueda */}
          <div className="buscador-container">
            <img src={iconBuscador} alt="Buscar" className="icon-small buscador-img" />
            <input 
              type="text" 
              className="buscador-input" 
              placeholder="Buscar entrenamientos, rutinas, técnicas..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Botón Crear Entrenamiento (solo para entrenadores) */}
          {usuario?.tipousuario === 'entrenador' && (
            <div className="acciones-entrenador-container">
              <button 
                className="btn-crear-entrenamiento"
                onClick={() => {
                  setEntrenamientoSeleccionado(null);
                  setModalAbierto(true);
                }}
              >
                <span>+</span> Crear Entrenamiento
              </button>
            </div>
          )}

          {/* Lista de Entrenamientos */}
          <ListaEntrenamientos
            entrenamientos={entrenamientos}
            loading={loading}
            error={error}
            usuarioActual={usuario}
            onVerDetalle={(ent) => {
              setEntrenamientoSeleccionado(ent);
              setModalDetalleAbierto(true);
            }}
            onEditar={(ent) => {
              setEntrenamientoSeleccionado(ent);
              setModalAbierto(true);
            }}
            onBorrar={handleBorrarEntrenamiento}
            onReintentar={cargarEntrenamientos}
          />

          {/* Paginación */}
          {total > limit && (
            <div className="paginacion-container">
              <button 
                className="btn-paginacion" 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
              <span className="paginacion-info">
                Página {page} de {Math.ceil(total / limit)}
              </span>
              <button 
                className="btn-paginacion" 
                onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(total / limit)))}
                disabled={page >= Math.ceil(total / limit)}
              >
                Siguiente
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MODAL CREAR / EDITAR */}
      {modalAbierto && createPortal(
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-contenedor" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-titulo">
                {entrenamientoSeleccionado ? 'Editar Entrenamiento' : 'Crear Entrenamiento Especializado'}
              </h3>
              <button className="btn-cerrar-modal" onClick={() => setModalAbierto(false)}>×</button>
            </div>
            <div className="modal-cuerpo">
              <FormularioEntrenamiento
                entrenamiento={entrenamientoSeleccionado}
                usuarioActual={usuario}
                onGuardar={handleGuardarEntrenamiento}
                onCancelar={() => setModalAbierto(false)}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL VER DETALLE */}
      {modalDetalleAbierto && entrenamientoSeleccionado && createPortal(
        <div className="modal-overlay" onClick={() => setModalDetalleAbierto(false)}>
          <div className="modal-contenedor" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-titulo">Detalles del Entrenamiento</h3>
              <button className="btn-cerrar-modal" onClick={() => setModalDetalleAbierto(false)}>×</button>
            </div>
            <div className="modal-cuerpo">
              <DetalleEntrenamiento
                entrenamiento={entrenamientoSeleccionado}
                onCerrar={() => setModalDetalleAbierto(false)}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
    <Footer />  
    </>
  );
};

export default PaginaEntrenamientos
