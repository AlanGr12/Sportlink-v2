import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../axiosConfig.js';
import Avatar from '../components/Avatar.jsx';
import Footer from '../footer/footer.jsx';
import CrearPost from '../feed/CrearPost.jsx';
import { PostCompleto } from '../feed/PostCard.jsx';
import PerfilSidebar from './PerfilSidebar.jsx';
import PerfilResenas from './PerfilResenas.jsx';
import PerfilBiografia from './PerfilBiografia.jsx';
import ModalConfirmarEliminar from '../components/ModalConfirmarEliminar.jsx';
import BotonSeguir from '../components/BotonSeguir.jsx';
import '../feed/FeedView.css';
import './miperfil.css';

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

// ── Íconos SVG Inline para diseño premium ───────────────────────────────────────────
const IconoCheckVerificado = () => (
  <svg className="sl-badge-verificado" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

const IconoUbicacion = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconoUsuario = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconoCalendario = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconoDeporte = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const IconoEditar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const MiPerfil = (props) => {
  const navigate = useNavigate();
  const { idusuario: paramIdUsuario } = useParams();

  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState(null);

  // Estados para Modal de Edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formEdicion, setFormEdicion] = useState({});
  const [toastMensaje, setToastMensaje] = useState('');
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const inputFotoRef = useRef(null);

  // Estados de Red Social
  const [seguidores, setSeguidores] = useState(0);
  const [seguidos, setSeguidos] = useState(0);
  const [siguiendo, setSiguiendo] = useState(false);
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargandoPublicaciones, setCargandoPublicaciones] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  // Usuario viene del prop (App.jsx es la fuente de verdad de sesión)
  const usuarioEnSesion = props.usuario;
  const idSesion = usuarioEnSesion?.idusuario || usuarioEnSesion?.idUsuario || usuarioEnSesion?.id;

  // idUsuario a visualizar (si viene paramIdUsuario se usa ese, sino el propio)
  const idUsuario = paramIdUsuario || idSesion;
  const esPerfilPropio = Number(idUsuario) === Number(idSesion);

  // ── Seguidores / seguidos reales ──
  useEffect(() => {
    if (!idUsuario) return;
    let vivo = true;
    api.get(`/api/seguidores/${idUsuario}`)
      .then((res) => {
        if (!vivo) return;
        setSeguidores(res.data?.seguidores ?? 0);
        setSeguidos(res.data?.seguidos ?? 0);
        setSiguiendo(res.data?.siguiendo === true);
      })
      .catch(() => {
        if (!vivo) return;
        setSeguidores(0);
        setSeguidos(0);
        setSiguiendo(false);
      });
    return () => { vivo = false; };
  }, [idUsuario]);

  // ── Moderación: un administrador puede eliminar cuentas ajenas ──
  const puedeEliminarCuenta = usuarioEnSesion?.es_admin === true && !esPerfilPropio && perfil?.es_admin !== true;
  const [confirmandoCuenta, setConfirmandoCuenta] = useState(false);
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false);
  const [errorCuenta, setErrorCuenta] = useState(null);

  const eliminarCuenta = async () => {
    setEliminandoCuenta(true);
    setErrorCuenta(null);
    try {
      await api.delete(`/api/usuarios/${idUsuario}`);
      setConfirmandoCuenta(false);
      navigate('/');
    } catch (err) {
      setErrorCuenta(err.response?.data?.error || 'No se pudo eliminar la cuenta.');
    } finally {
      setEliminandoCuenta(false);
    }
  };

  const cargarPublicaciones = useCallback(async () => {
    if (!idUsuario) return;
    setCargandoPublicaciones(true);
    try {
      const res = await api.get('/api/publicaciones', {
        params: { usuarioId: idUsuario, page: 1, limit: 50 }
      });
      setPublicaciones(res.data?.publicaciones || []);
      setTotalItems(res.data?.totalItems || (res.data?.publicaciones || []).length);
    } catch (err) {
      console.error('Error al cargar publicaciones del perfil:', err);
    } finally {
      setCargandoPublicaciones(false);
    }
  }, [idUsuario]);

  useEffect(() => {
    cargarPublicaciones();
  }, [cargarPublicaciones]);

  const handlePostCreado = (nuevoPost) => {
    setPublicaciones(prev => [nuevoPost, ...prev]);
    setTotalItems(prev => prev + 1);
  };

  const handleEliminarPost = (idpublicacion) => {
    setPublicaciones(prev => prev.filter(p => p.idpublicacion !== idpublicacion));
    setTotalItems(prev => Math.max(0, prev - 1));
  };

  const handleBiografiaActualizada = (nuevaBiografia) => {
    setPerfil(prev => ({
      ...prev,
      biografia: nuevaBiografia
    }));
  };

  const handleMostrarToast = (mensaje) => {
    setToastMensaje(mensaje);
    setTimeout(() => setToastMensaje(''), 4000);
  };

  const totalLikes = publicaciones.reduce((acc, p) => acc + (p.totalLikes || 0), 0);

  useEffect(() => {
    let montado = true;

    const obtenerPerfil = async () => {
      if (!idUsuario) {
        setErrorMensaje('No hay usuario autenticado');
        setCargando(false);
        return;
      }

      setCargando(true);
      try {
        const res = await api.get(`/api/login/perfil/${idUsuario}`);
        if (montado) {
          const datos = res.data || {};
          console.log('[SportLink] Respuesta de /api/login/perfil/:id ->', datos);

          // Fallbacks encadenados para capturar la foto de perfil sin importar la anidación del backend
          const fotoDetectada =
            datos.fotoperfil ||
            datos.entrenador?.fotoperfil ||
            datos.club?.fotoperfil ||
            datos.usuario?.fotoperfil ||
            datos.jugador?.fotoperfil ||
            datos.foto_perfil ||
            datos.entrenador?.foto_perfil ||
            datos.club?.foto_perfil ||
            datos.usuario?.foto_perfil ||
            datos.jugador?.foto_perfil ||
            datos.foto ||
            datos.imagen ||
            datos.avatar_url;

          setPerfil({
            ...datos,
            fotoperfil: fotoDetectada || datos.fotoperfil || null,
          });
          setErrorMensaje(null);
        }
      } catch (err) {
        console.error(err);
        if (montado) setErrorMensaje('No se pudo cargar el perfil.');
      } finally {
        if (montado) setCargando(false);
      }
    };

    obtenerPerfil();
    return () => { montado = false };
  }, [idUsuario]);

  // ── Módulo de Reseñas (SOLO para Clubes y Entrenadores) ─────────────────────
  const rolNormalizado = perfil?.tipousuario?.toLowerCase() || '';
  const esClub = rolNormalizado === 'club';
  const esEntrenador = rolNormalizado === 'entrenador';
  const esJugador = rolNormalizado === 'jugador';
  const esClubOEntrenador = esClub || esEntrenador;

  const tipoEntidad = esClub ? 'club' : 'entrenador';
  const idEntidad = esEntrenador
    ? (perfil?.identrenador || perfil?.idEntrenador || perfil?.id_entrenador || perfil?.idusuario || idUsuario)
    : esClub
      ? (perfil?.idclub || perfil?.idClub || perfil?.id_club || perfil?.idusuario || idUsuario)
      : null;

  const rolSesion = usuarioEnSesion?.tipousuario?.toLowerCase() || '';
  const esJugadorEnSesion = rolSesion === 'jugador';
  const esEntrenadorEnSesion = rolSesion === 'entrenador';

  const idJugadorSesion =
    usuarioEnSesion?.idjugador ||
    usuarioEnSesion?.idJugador ||
    usuarioEnSesion?.jugador?.idjugador ||
    (esJugadorEnSesion ? idSesion : null);

  const idEntrenadorSesion =
    usuarioEnSesion?.identrenador ||
    usuarioEnSesion?.idEntrenador ||
    usuarioEnSesion?.entrenador?.identrenador ||
    (esEntrenadorEnSesion ? idSesion : null);

  // Puede participar en reseñas si es jugador (visita entrenador/club) o si es entrenador visitando club
  const puedeParticiparEnResenas =
    esJugadorEnSesion || (esClub && esEntrenadorEnSesion);

  const [reseniasData, setReseniasData] = useState({ promedio: 0, total: 0, opiniones: [] });
  const [cargandoResenias, setCargandoResenias] = useState(false);
  const [verificacionResenas, setVerificacionResenas] = useState({ puedeCalificar: false, yaCalifico: false, eventosPasados: [] });

  const cargarResenias = useCallback(async () => {
    if (!esClubOEntrenador || !idEntidad) return;
    setCargandoResenias(true);
    try {
      const res = await api.get(`/api/resenias/${tipoEntidad}/${idEntidad}`);
      const data = res.data || {};
      const promedio = Number(data.promedio ?? data.rating ?? data.average ?? 0);
      const opiniones = Array.isArray(data.opiniones)
        ? data.opiniones
        : Array.isArray(data.resenias)
          ? data.resenias
          : Array.isArray(data)
            ? data
            : [];
      const total = Number(data.total ?? data.count ?? opiniones.length);
      setReseniasData({ promedio, total, opiniones });
    } catch (err) {
      console.error('Error al cargar reseñas:', err);
      setReseniasData({ promedio: 0, total: 0, opiniones: [] });
    } finally {
      setCargandoResenias(false);
    }
  }, [esClubOEntrenador, tipoEntidad, idEntidad]);

  const verificarCalificacion = useCallback(async () => {
    if (!esClubOEntrenador || !idEntidad || !puedeParticiparEnResenas || !idSesion) {
      setVerificacionResenas({ puedeCalificar: false, yaCalifico: false, eventosPasados: [] });
      return;
    }
    try {
      const res = await api.get(`/api/resenias/verificar/${tipoEntidad}/${idEntidad}`, {
        params: {
          idusuario: idSesion,
          tipousuario: rolSesion,
          idjugador: idJugadorSesion || undefined,
          identrenador: idEntrenadorSesion || undefined,
        }
      });
      const data = res.data || {};
      setVerificacionResenas({
        puedeCalificar: data.puedeCalificar === true,
        yaCalifico: data.yaCalifico === true,
        eventosPasados: data.eventosPasados || data.eventos || [],
        ...data,
      });
    } catch (err) {
      console.error('Error al verificar calificación de reseñas:', err);
    }
  }, [esClubOEntrenador, tipoEntidad, idEntidad, puedeParticiparEnResenas, idSesion, rolSesion, idJugadorSesion, idEntrenadorSesion]);

  useEffect(() => {
    if (esClubOEntrenador && idEntidad) {
      cargarResenias();
      verificarCalificacion();
    }
  }, [esClubOEntrenador, idEntidad, cargarResenias, verificarCalificacion]);

  const handleResenaAgregada = () => {
    handleMostrarToast('¡Tu reseña fue enviada con éxito!');
    cargarResenias();
    verificarCalificacion();
  };

  // Control del scroll del fondo cuando el modal de edición está abierto
  useEffect(() => {
    if (modalAbierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalAbierto]);

  const limpiarFoto = () => {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFotoArchivo(null);
    setFotoPreview(null);
    if (inputFotoRef.current) inputFotoRef.current.value = '';
  };

  const cerrarModal = () => {
    limpiarFoto();
    setModalAbierto(false);
  };

  const handleSeleccionFoto = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
      handleMostrarToast('Formato no válido. Usá JPG, PNG o WEBP.');
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      handleMostrarToast('La imagen no puede superar los 5 MB.');
      return;
    }

    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFotoArchivo(archivo);
    setFotoPreview(URL.createObjectURL(archivo));
  };

  // Manejar apertura de modal de edición cargando datos actuales
  const abrirModalEdicion = () => {
    limpiarFoto();
    setFormEdicion({
      nombre: perfil?.nombre || '',
      apellido: perfil?.apellido || '',
      ubicacion: perfil?.ubicacion || '',
      telefono: perfil?.telefono || '',
      instagram: perfil?.instagram || '',
      descripcion: perfil?.descripcion || '',
      biografia: perfil?.biografia || '',
      // Atributos de ficha técnica
      edad: perfil?.edad || '',
      altura: perfil?.altura || '',
      posicion: perfil?.posicion || '',
      experiencia: perfil?.experiencia || '',
      categoria: perfil?.categoria || '',
    });
    setModalAbierto(true);
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    if (guardando) return;
    setGuardando(true);

    let nuevaFoto = null;

    // 1. Subir foto si el usuario eligió una nueva
    if (fotoArchivo) {
      try {
        const fd = new FormData();
        fd.append('foto', fotoArchivo);
        const res = await api.put('/api/login/perfil/foto', fd);
        nuevaFoto = res.data?.fotoperfil || res.data?.url || null;
      } catch (err) {
        console.error('Error al subir la foto de perfil:', err);
        handleMostrarToast(err.response?.data?.error || 'No se pudo subir la foto. Intentá de nuevo.');
        setGuardando(false);
        return; // no cerramos el modal para que no pierda los cambios
      }
    }

    // 2. Si se modificó la biografía desde el modal general, guardarla en el backend
    if (formEdicion.biografia !== undefined && formEdicion.biografia !== perfil?.biografia) {
      try {
        await api.put('/api/login/perfil/biografia', {
          biografia: formEdicion.biografia
        });
      } catch (err) {
        console.error('Error al actualizar biografía desde modal:', err);
      }
    }

    // 3. Actualizar estado local
    setPerfil(prev => ({
      ...prev,
      ...formEdicion,
      ...(nuevaFoto ? { fotoperfil: nuevaFoto } : {}),
    }));

    // 4. Si cambió la foto del usuario logueado, propagarla a la sesión
    //    (header, feed, etc.) y a sus publicaciones ya cargadas
    if (nuevaFoto && esPerfilPropio) {
      props.onUsuarioActualizado?.({ fotoperfil: nuevaFoto });
      setPublicaciones(prev => prev.map(p =>
        Number(p.autor?.idusuario) === Number(idSesion)
          ? { ...p, autor: { ...p.autor, fotoperfil: nuevaFoto } }
          : p
      ));
    }

    cerrarModal();
    setGuardando(false);
    handleMostrarToast('¡Perfil actualizado con éxito!');
  };

  if (cargando) {
    return (
      <div className="miPerfil-root">
        <div className="miPerfil-container">
          <div className="profile-skeleton-wrapper">
            <div className="skeleton-banner" />
            <div className="skeleton-avatar" />
            <div className="skeleton-line media" style={{ marginTop: '20px', width: '250px' }} />
            <div className="skeleton-line" style={{ width: '400px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (errorMensaje) {
    return (
      <div className="miPerfil-root">
        <div className="miPerfil-container">
          <div className="miPerfil-error">{errorMensaje}</div>
        </div>
      </div>
    );
  }

  // Nombre completo y formato de visualización
  const nombre = perfil?.nombre || perfil?.email || '';
  const apellido = perfil?.apellido || '';
  const nombreCompleto = `${nombre} ${apellido}`.trim();
  const rol = perfil?.tipousuario || 'Usuario';

  return (
    <>
      <div className="miPerfil-root">
        {toastMensaje && (
          <div className="profile-toast-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{toastMensaje}</span>
          </div>
        )}

        <div className="miPerfil-container">
          
          {/* ── CARD HEADER DEL PERFIL (INTACTO) ── */}
          <div className="new-profile-header">
            <div className="profile-cover-image">
              <div className="profile-cover-gradient" />
              <div className="profile-glow-point" />
            </div>

            <div className="profile-header-main">
              <div className="profile-avatar-area">
                <div className="profile-avatar-border-svg">
                  <Avatar 
                    src={
                      perfil?.fotoperfil ||
                      perfil?.entrenador?.fotoperfil ||
                      perfil?.club?.fotoperfil ||
                      perfil?.usuario?.fotoperfil ||
                      perfil?.jugador?.fotoperfil ||
                      perfil?.foto_perfil ||
                      perfil?.foto ||
                      perfil?.imagen
                    } 
                    nombre={nombreCompleto || perfil?.email || nombre} 
                    size="130px" 
                    className="profile-avatar-img" 
                    style={{ border: 'none', background: '#333' }}
                  />
                </div>
                <span className="profile-online-badge" />
              </div>

              <div className="profile-info-area">
                <div className="profile-title-row">
                  <h1 className="profile-name">{nombreCompleto}</h1>
                  <IconoCheckVerificado />
                </div>

                <div className="profile-meta-row">
                  <span className="profile-meta-tag tag-rol">
                    <IconoUsuario />
                    {rol.toUpperCase()}
                  </span>
                  {perfil?.ubicacion && (
                    <span className="profile-meta-tag">
                      <IconoUbicacion />
                      {perfil.ubicacion}
                    </span>
                  )}
                  {perfil?.deporte?.deporte && (
                    <span className="profile-meta-tag">
                      <IconoDeporte />
                      {perfil.deporte.deporte}
                    </span>
                  )}
                </div>

                {perfil?.descripcion ? (
                  <p className="profile-bio-text">"{perfil.descripcion}"</p>
                ) : (
                  <p className="profile-bio-text empty">
                    {esPerfilPropio 
                      ? 'Sin descripción en tu perfil. Hacé clic en "Editar perfil" para agregar una descripción y destacar en SportLink.'
                      : 'Este usuario aún no ha agregado una descripción.'}
                  </p>
                )}

                <div className="profile-social-stats">
                  <div className="social-stat-item">
                    <span className="stat-number">{totalItems}</span>
                    <span className="stat-label-text">publicaciones</span>
                  </div>
                  <div className="social-stat-item">
                    <span className="stat-number">{seguidores}</span>
                    <span className="stat-label-text">seguidores</span>
                  </div>
                  <div className="social-stat-item">
                    <span className="stat-number">{seguidos}</span>
                    <span className="stat-label-text">seguidos</span>
                  </div>
                  <div className="social-stat-item">
                    <span className="stat-number">{totalLikes}</span>
                    <span className="stat-label-text">me gustas</span>
                  </div>
                </div>
              </div>

              <div className="profile-actions-area">
                {esPerfilPropio ? (
                  <button className="profile-btn-edit" onClick={abrirModalEdicion}>
                    <IconoEditar />
                    EDITAR PERFIL
                  </button>
                ) : (
                  <button 
                    className="profile-btn-edit" 
                    onClick={() => navigate('/mensajes')}
                    style={{ background: '#2DEFF2', color: '#090a0c', border: 'none', fontWeight: 700 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    MENSAJE
                  </button>
                )}
                {!esPerfilPropio && (
                  <BotonSeguir
                    idusuario={idUsuario}
                    tipousuario={perfil?.tipousuario}
                    usuario={usuarioEnSesion}
                    variante="perfil"
                    siguiendoInicial={siguiendo}
                    onCambio={(d) => { setSeguidores(d.seguidores); setSiguiendo(d.siguiendo); }}
                  />
                )}
                {puedeEliminarCuenta && (
                  <button
                    className="profile-btn-edit"
                    onClick={() => { setErrorCuenta(null); setConfirmandoCuenta(true); }}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', fontWeight: 700 }}
                  >
                    ELIMINAR CUENTA (ADMIN)
                  </button>
                )}
                <ModalConfirmarEliminar
                  abierto={confirmandoCuenta}
                  titulo="¿Eliminar cuenta?"
                  mensaje={<>Se eliminará la cuenta de <strong style={{ color: '#fff' }}>{perfil?.nombre || perfil?.email || 'este usuario'}</strong> junto con sus publicaciones, inscripciones, mensajes y demás datos. Esta acción no se puede deshacer.</>}
                  textoConfirmar="ELIMINAR CUENTA"
                  eliminando={eliminandoCuenta}
                  error={errorCuenta}
                  onConfirmar={eliminarCuenta}
                  onCerrar={() => setConfirmandoCuenta(false)}
                />
              </div>
            </div>
          </div>

          {/* ── GRID DE CONTENIDO PRINCIPAL ── */}
          <div className="new-profile-grid">
            
            {/* COLUMNA IZQUIERDA/CENTRAL: FLUJO VERTICAL UNIFICADO (BIOGRAFÍA Y PUBLICACIONES) */}
            <div className="new-profile-main-col">
              
              {/* 1. Box de Biografía (Visualización + Edición integrada) */}
              <PerfilBiografia 
                biografia={perfil?.biografia}
                esDuenio={esPerfilPropio}
                onActualizar={handleBiografiaActualizada}
                onToast={handleMostrarToast}
              />

              {/* 2. Feed de Publicaciones con Scrollbar Dedicado */}
              <div className="perfil-feed-section">
                
                <div className="perfil-feed-header">
                  <div className="perfil-feed-title-wrap">
                    <span className="perfil-feed-title-indicator" />
                    <h3 className="perfil-feed-title">Publicaciones</h3>
                  </div>
                  <span className="perfil-feed-counter">
                    {totalItems} {totalItems === 1 ? 'publicación' : 'publicaciones'}
                  </span>
                </div>

                {/* Formulario Crear publicación (si se está viendo el perfil propio) */}
                {esPerfilPropio && usuarioEnSesion && (
                  <CrearPost usuario={usuarioEnSesion} onPostCreado={handlePostCreado} />
                )}

                {/* Contenedor de Publicaciones con Scrollbar Dedicado */}
                <div className="perfil-publicaciones-scroll-container">
                  {cargandoPublicaciones ? (
                    <div className="feed-spinner-wrapper" style={{ padding: '30px 0' }}>
                      <div className="feed-spinner" />
                    </div>
                  ) : publicaciones.length === 0 ? (
                    <div className="empty-feed-graphic">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="empty-feed-svg">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <h4>Sin publicaciones recientes</h4>
                      <p>Aún no se han realizado publicaciones en este perfil.</p>
                    </div>
                  ) : (
                    publicaciones.map(post => (
                      <PostCompleto
                        key={post.idpublicacion || post.id}
                        post={post}
                        usuario={usuarioEnSesion}
                        onEliminar={handleEliminarPost}
                      />
                    ))
                  )}
                </div>

              </div>

            </div>

            {/* COLUMNA DERECHA: TARJETA PERFIL, RESEÑAS Y CONTACTO */}
            <div className="new-profile-side-col">
              
              {/* Tarjeta lateral "PERFIL": muestra datos y métrica dinámica RATING */}
              <PerfilSidebar
                perfil={perfil}
                ratingPromedio={esClubOEntrenador ? reseniasData.promedio : null}
                totalResenas={esClubOEntrenador ? reseniasData.total : null}
                esPerfilPropio={esPerfilPropio}
                onUbicacionActualizada={(nuevaLoc) => {
                  setPerfil(prev => ({
                    ...prev,
                    ...nuevaLoc
                  }));
                  handleMostrarToast('¡Ubicación de mapa actualizada con éxito!');
                }}
              />

              {/* Tarjeta lateral "RESEÑAS": Inmediatamente debajo de la tarjeta "PERFIL" */}
              {/* REGLA ESTRICTA DE NEGOCIO: SOLO para Clubes y Entrenadores, NUNCA para Jugadores */}
              {esClubOEntrenador && (
                <PerfilResenas
                  perfil={perfil}
                  usuarioEnSesion={usuarioEnSesion}
                  reseniasData={reseniasData}
                  cargando={cargandoResenias}
                  verificacion={verificacionResenas}
                  onResenaCreada={handleResenaAgregada}
                  tipoEntidad={tipoEntidad}
                  idEntidad={idEntidad}
                  idJugadorSesion={idJugadorSesion}
                  idEntrenadorSesion={idEntrenadorSesion}
                  esPerfilPropio={esPerfilPropio}
                />
              )}

            </div>

          </div>

        </div>
      </div>
      <Footer />

      {/* ── MODAL EDITAR PERFIL ── */}
      {modalAbierto && createPortal(
        <div className="profile-modal-overlay">
          <div className="profile-modal-card">
            <div className="profile-modal-header">
              <h3>Editar Información de Perfil</h3>
              <button className="profile-modal-btn-close" onClick={cerrarModal}>×</button>
            </div>
            
            <form onSubmit={guardarCambios} className="profile-modal-form">
              <div className="profile-modal-foto-area">
                <button
                  type="button"
                  className="profile-modal-foto-btn"
                  onClick={() => inputFotoRef.current?.click()}
                  aria-label="Cambiar foto de perfil"
                >
                  <Avatar
                    src={fotoPreview || perfil?.fotoperfil}
                    nombre={nombreCompleto || perfil?.email || nombre}
                    size="96px"
                    className="profile-avatar-img"
                    style={{ border: 'none', background: '#333' }}
                  />
                  <span className="profile-modal-foto-overlay">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </span>
                </button>

                <div className="profile-modal-foto-info">
                  <span className="profile-modal-foto-titulo">Foto de perfil</span>
                  <span className="profile-modal-foto-hint">JPG, PNG o WEBP · máx. 5 MB</span>
                  <div className="profile-modal-foto-botones">
                    <button type="button" className="btn-modal-cancelar" onClick={() => inputFotoRef.current?.click()}>
                      Cambiar foto
                    </button>
                    {fotoPreview && (
                      <button type="button" className="btn-modal-cancelar" onClick={limpiarFoto}>
                        Descartar
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={inputFotoRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleSeleccionFoto}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="form-double-col">
                <div className="form-field-group">
                  <label>Nombre</label>
                  <input 
                    type="text" 
                    value={formEdicion.nombre} 
                    onChange={e => setFormEdicion(p => ({ ...p, nombre: e.target.value }))}
                    required 
                  />
                </div>
                <div className="form-field-group">
                  <label>Apellido</label>
                  <input 
                    type="text" 
                    value={formEdicion.apellido} 
                    onChange={e => setFormEdicion(p => ({ ...p, apellido: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-double-col">
                <div className="form-field-group">
                  <label>Ubicación</label>
                  <input 
                    type="text" 
                    value={formEdicion.ubicacion} 
                    onChange={e => setFormEdicion(p => ({ ...p, ubicacion: e.target.value }))}
                    placeholder="Ej. Caballito, CABA"
                  />
                </div>
                <div className="form-field-group">
                  <label>Instagram</label>
                  <input 
                    type="text" 
                    value={formEdicion.instagram} 
                    onChange={e => setFormEdicion(p => ({ ...p, instagram: e.target.value }))}
                    placeholder="@usuario"
                  />
                </div>
              </div>

              <div className="form-double-col">
                <div className="form-field-group">
                  <label>Número Telefónico</label>
                  <input 
                    type="text" 
                    value={formEdicion.telefono} 
                    onChange={e => setFormEdicion(p => ({ ...p, telefono: e.target.value }))}
                    placeholder="+54 11 2345 6789"
                  />
                </div>
                <div className="form-field-group">
                  <label>Edad</label>
                  <input 
                    type="number" 
                    value={formEdicion.edad} 
                    onChange={e => setFormEdicion(p => ({ ...p, edad: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-double-col">
                <div className="form-field-group">
                  <label>Altura</label>
                  <input 
                    type="text" 
                    value={formEdicion.altura} 
                    onChange={e => setFormEdicion(p => ({ ...p, altura: e.target.value }))}
                    placeholder="Ej. 1.82 m"
                  />
                </div>
                <div className="form-field-group">
                  <label>Posición</label>
                  <input 
                    type="text" 
                    value={formEdicion.posicion} 
                    onChange={e => setFormEdicion(p => ({ ...p, posicion: e.target.value }))}
                    placeholder="Ej. Mediocampista"
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label>Descripción / Frase</label>
                <textarea 
                  value={formEdicion.descripcion} 
                  onChange={e => setFormEdicion(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Frase o lema destacado..."
                  maxLength={400}
                />
                <span className="char-count-modal">{formEdicion.descripcion?.length || 0} / 400</span>
              </div>

              <div className="form-field-group">
                <label>Biografía</label>
                <textarea 
                  value={formEdicion.biografia} 
                  onChange={e => setFormEdicion(p => ({ ...p, biografia: e.target.value }))}
                  placeholder="Escribe sobre ti, tu trayectoria deportiva, logros y metas..."
                  maxLength={1000}
                  rows={3}
                />
                <span className="char-count-modal">{formEdicion.biografia?.length || 0} / 1000</span>
              </div>

              <div className="profile-modal-actions">
                <button type="button" className="btn-modal-cancelar" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="btn-modal-guardar" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default MiPerfil;
