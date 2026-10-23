import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../axiosConfig.js';
import AvatarCuadrado from '../components/AvatarCuadrado.jsx';
import Footer from '../footer/footer.jsx';
import Compositor from '../feed/Compositor.jsx';
import Publicacion from '../feed/Publicacion.jsx';
import PerfilSidebar from './PerfilSidebar.jsx';
import PerfilResenas from './PerfilResenas.jsx';
import PerfilBiografia from './PerfilBiografia.jsx';
import BotonSeguir from '../components/BotonSeguir.jsx';
import BotonVinculacionClub from '../components/BotonVinculacionClub.jsx';
import PerfilEntrenadoresClub from './PerfilEntrenadoresClub.jsx';
import { ROLES } from '../feed/feedUtils.js';
import '../pruebas/PruebasView.css';
import '../feed/Feed.css';
import './miperfil.css';

const MiPerfil = (props) => {
  const navigate = useNavigate();
  const { idusuario: paramIdUsuario } = useParams();

  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState(null);
  const [perfilNoDisponible, setPerfilNoDisponible] = useState(false);

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
      setPerfilNoDisponible(false);
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
        if (montado) {
          const status = err.response?.status;
          // 404/403: perfil inexistente o club aún no aprobado por moderación
          if (status === 404 || status === 403) setPerfilNoDisponible(true);
          else setErrorMensaje('No se pudo cargar el perfil.');
        }
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
      // Biografía y descripción son lo mismo: se edita un único texto
      biografia: perfil?.biografia || perfil?.descripcion || '',
      // Atributos de ficha técnica
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

    // 2. Guardar datos básicos y biografía en el backend
    const datos = {
      nombre: formEdicion.nombre,
      ubicacion: formEdicion.ubicacion,
      biografia: formEdicion.biografia,
      ...(esClub ? {} : { apellido: formEdicion.apellido, telefono: formEdicion.telefono }),
    };
    try {
      await api.put(`/api/login/perfil/${idSesion}`, datos);
    } catch (err) {
      console.error('Error al guardar el perfil:', err);
      handleMostrarToast(err.response?.data?.error || 'No se pudieron guardar los cambios. Intentá de nuevo.');
      setGuardando(false);
      return; // no cerramos el modal para que no pierda los cambios
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
      <div className="pr pf">
        <div className="pr-wrap pf-head pf-head--skeleton" aria-busy="true" aria-label="Cargando perfil">
          <span className="pf-avatar pf-skel" />
          <div className="pf-skel-lineas"><i /><i /><i /></div>
        </div>
      </div>
    );
  }

  if (perfilNoDisponible || errorMensaje) {
    return (
      <div className="pr pf">
        <div className="pr-wrap pf-estado">
          <div className="pr-empty">
            <h1 className="pr-display pr-empty-title">
              {perfilNoDisponible ? 'Este perfil no está disponible' : 'No pudimos cargar el perfil'}
            </h1>
            <p>{perfilNoDisponible ? 'Puede que no exista o que el club todavía esté en revisión.' : 'Revisá tu conexión y probá de nuevo.'}</p>
            <button type="button" className="pr-btn pr-btn--ink" onClick={() => (perfilNoDisponible ? navigate('/') : window.location.reload())}>
              {perfilNoDisponible ? 'Volver al inicio' : 'Reintentar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Nombre completo y formato de visualización
  const nombre = perfil?.nombre || perfil?.email || '';
  const apellido = perfil?.apellido || '';
  const nombreCompleto = `${nombre} ${apellido}`.trim();
  const rolTexto = ROLES[rolNormalizado] || 'Usuario';
  const deporteTexto = perfil?.deporte?.deporte
    || (Array.isArray(perfil?.deportes) ? perfil.deportes.map(d => d.deporte || d).join(', ') : null);
  const fotoPerfil =
    perfil?.fotoperfil ||
    perfil?.entrenador?.fotoperfil ||
    perfil?.club?.fotoperfil ||
    perfil?.usuario?.fotoperfil ||
    perfil?.jugador?.fotoperfil ||
    perfil?.foto_perfil ||
    perfil?.foto ||
    perfil?.imagen;

  const stats = [
    { n: totalItems, label: totalItems === 1 ? 'publicación' : 'publicaciones' },
    { n: seguidores, label: seguidores === 1 ? 'seguidor' : 'seguidores' },
    { n: seguidos, label: 'siguiendo' },
    { n: totalLikes, label: totalLikes === 1 ? 'me gusta' : 'me gusta' },
  ];

  return (
    <div className="pr pf">
      {toastMensaje && (
        <div className="pr-toast" role="status">
          <p className="pr-toast-titulo">{toastMensaje}</p>
        </div>
      )}

      {/* ── Cabecera ── */}
      <section className="pf-head">
        <div className="pr-wrap pf-head-grid">
          <span className="pf-avatar">
            <AvatarCuadrado src={fotoPerfil} nombre={nombreCompleto || perfil?.email} size={148} />
          </span>

          <div className="pf-id">
            <h1 className="pr-display pf-nombre">{nombreCompleto}</h1>
            <p className="pf-meta">
              <span>{rolTexto}</span>
              {perfil?.ubicacion && <span>{perfil.ubicacion}</span>}
              {deporteTexto && <span>{deporteTexto}</span>}
            </p>
            <ul className="pf-stats">
              {stats.map((s) => (
                <li key={s.label}><strong>{s.n}</strong> {s.label}</li>
              ))}
            </ul>
          </div>

          <div className="pf-acciones">
            {esPerfilPropio ? (
              <button type="button" className="pr-btn pr-btn--ink" onClick={abrirModalEdicion}>Editar perfil</button>
            ) : (
              <button type="button" className="pr-btn" onClick={() => navigate('/mensajes')}>
                Mensaje
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
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
              <button type="button" className="pr-link pr-link--danger" onClick={() => { setErrorCuenta(null); setConfirmandoCuenta(true); }}>
                Eliminar cuenta (admin)
              </button>
            )}
          </div>

          {!esPerfilPropio && esClub && perfil?.idclub && (
            <div className="pf-vinculo">
              <BotonVinculacionClub idclub={perfil.idclub} usuario={usuarioEnSesion} />
            </div>
          )}
        </div>
      </section>

      {/* ── Contenido ── */}
      <div className="pr-wrap pf-grid">
        <main className="pf-main">
          <PerfilBiografia
            biografia={perfil?.biografia || perfil?.descripcion}
            esDuenio={esPerfilPropio}
            onActualizar={handleBiografiaActualizada}
            onToast={handleMostrarToast}
          />

          {/* Gestión de entrenadores vinculados (solo el club dueño del perfil) */}
          {esClub && esPerfilPropio && <PerfilEntrenadoresClub />}

          <section className="fd pf-posts" aria-labelledby="pf-posts-titulo">
            <h2 id="pf-posts-titulo" className="pf-seccion-titulo">Publicaciones</h2>
            {esPerfilPropio && usuarioEnSesion && (
              <Compositor usuario={usuarioEnSesion} onPublicado={handlePostCreado} onAviso={handleMostrarToast} />
            )}
            {cargandoPublicaciones ? (
              <div className="fd-post fd-post--skeleton" aria-label="Cargando publicaciones" />
            ) : publicaciones.length === 0 ? (
              <div className="pr-empty pf-vacio">
                <h3 className="pr-display pr-empty-title">Todavía no publicó nada</h3>
                <p>{esPerfilPropio ? 'Contá en qué andás: entrenamientos, resultados, búsquedas.' : 'Cuando publique, lo vas a ver acá.'}</p>
              </div>
            ) : (
              <div className="fd-lista">
                {publicaciones.map(post => (
                  <Publicacion
                    key={post.idpublicacion || post.id}
                    post={post}
                    usuario={usuarioEnSesion}
                    onEliminar={handleEliminarPost}
                    onAviso={handleMostrarToast}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        <aside className="pf-lado">
          <PerfilSidebar
            perfil={perfil}
            ratingPromedio={esClubOEntrenador ? reseniasData.promedio : null}
            totalResenas={esClubOEntrenador ? reseniasData.total : null}
            esPerfilPropio={esPerfilPropio}
            onUbicacionActualizada={(nuevaLoc) => {
              setPerfil(prev => ({ ...prev, ...nuevaLoc }));
              handleMostrarToast('Ubicación actualizada');
            }}
          />

          {/* Reseñas: solo para clubes y entrenadores */}
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
        </aside>
      </div>

      <Footer />

      {/* ── Confirmar eliminación de cuenta (admin) ── */}
      {confirmandoCuenta && createPortal(
        <div className="pr-overlay" onClick={() => !eliminandoCuenta && setConfirmandoCuenta(false)}>
          <div className="pr-modal pr-modal--sm" role="dialog" aria-modal="true" aria-labelledby="pf-borrar-titulo" onClick={(e) => e.stopPropagation()}>
            <div className="pr-modal-head pf-modal-head">
              <h2 id="pf-borrar-titulo" className="pr-modal-title">¿Eliminar esta cuenta?</h2>
              <button type="button" className="pr-close" onClick={() => setConfirmandoCuenta(false)} disabled={eliminandoCuenta} aria-label="Cerrar">×</button>
            </div>
            <div className="pr-modal-body">
              <p className="pr-muted">
                Se borra la cuenta de <strong>{perfil?.nombre || perfil?.email || 'este usuario'}</strong> con sus publicaciones, inscripciones y mensajes. No se puede deshacer.
              </p>
              {errorCuenta && <p className="pr-error">{errorCuenta}</p>}
            </div>
            <div className="pr-modal-foot">
              <button type="button" className="pr-btn pr-btn--ghost" onClick={() => setConfirmandoCuenta(false)} disabled={eliminandoCuenta}>Cancelar</button>
              <button type="button" className="pr-btn pr-btn--danger" onClick={eliminarCuenta} disabled={eliminandoCuenta}>
                {eliminandoCuenta ? 'Eliminando…' : 'Eliminar cuenta'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Editar perfil ── */}
      {modalAbierto && createPortal(
        <div className="pr-overlay" onClick={cerrarModal}>
          <div className="pr-modal pr-modal--form pf-editar" role="dialog" aria-modal="true" aria-labelledby="pf-editar-titulo" onClick={(e) => e.stopPropagation()}>
            <div className="pr-modal-head pf-modal-head">
              <h2 id="pf-editar-titulo" className="pr-modal-title">Editar perfil</h2>
              <button type="button" className="pr-close" onClick={cerrarModal} aria-label="Cerrar">×</button>
            </div>

            <form onSubmit={guardarCambios} className="pf-form">
              <div className="pr-modal-body">
                <div className="pf-foto">
                  <button type="button" className="pf-foto-btn" onClick={() => inputFotoRef.current?.click()} aria-label="Cambiar foto de perfil">
                    <AvatarCuadrado src={fotoPreview || perfil?.fotoperfil} nombre={nombreCompleto || perfil?.email} size={96} />
                  </button>
                  <div>
                    <strong>Foto de perfil</strong>
                    <span>JPG, PNG o WEBP · hasta 5 MB</span>
                    <div className="pf-foto-links">
                      <button type="button" className="pr-link" onClick={() => inputFotoRef.current?.click()}>Cambiar foto</button>
                      {fotoPreview && <button type="button" className="pr-link" onClick={limpiarFoto}>Descartar</button>}
                    </div>
                  </div>
                  <input ref={inputFotoRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleSeleccionFoto} hidden />
                </div>

                <div className={esClub ? 'pf-campos' : 'pf-campos pf-campos--doble'}>
                  <label className="pf-campo">
                    <span>{esClub ? 'Nombre del club' : 'Nombre'}</span>
                    <input type="text" value={formEdicion.nombre} onChange={e => setFormEdicion(p => ({ ...p, nombre: e.target.value }))} required />
                  </label>
                  {!esClub && (
                    <label className="pf-campo">
                      <span>Apellido</span>
                      <input type="text" value={formEdicion.apellido} onChange={e => setFormEdicion(p => ({ ...p, apellido: e.target.value }))} />
                    </label>
                  )}
                </div>

                <div className={esClub ? 'pf-campos' : 'pf-campos pf-campos--doble'}>
                  <label className="pf-campo">
                    <span>Ubicación</span>
                    <input type="text" value={formEdicion.ubicacion} onChange={e => setFormEdicion(p => ({ ...p, ubicacion: e.target.value }))} placeholder="Ej.: Caballito, CABA" />
                  </label>
                  {!esClub && (
                    <label className="pf-campo">
                      <span>Teléfono</span>
                      <input type="tel" value={formEdicion.telefono} onChange={e => setFormEdicion(p => ({ ...p, telefono: e.target.value }))} placeholder="+54 11 2345 6789" />
                    </label>
                  )}
                </div>

                <label className="pf-campo">
                  <span>Biografía</span>
                  <textarea
                    value={formEdicion.biografia}
                    onChange={e => setFormEdicion(p => ({ ...p, biografia: e.target.value }))}
                    placeholder="Tu trayectoria, logros y lo que estás buscando."
                    maxLength={1000}
                    rows={4}
                  />
                  <small>{formEdicion.biografia?.length || 0}/1000</small>
                </label>
              </div>

              <div className="pr-modal-foot">
                <button type="button" className="pr-btn pr-btn--ghost" onClick={cerrarModal}>Cancelar</button>
                <button type="submit" className="pr-btn" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MiPerfil;
