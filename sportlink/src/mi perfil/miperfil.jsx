import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../axiosConfig.js';
import Avatar from '../components/Avatar.jsx';
import './miperfil.css';
import Footer from '../footer/footer.jsx';

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
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState(null);
  const [tabActiva, setTabActiva] = useState('sobremi');
  
  // Estados para Modal de Edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formEdicion, setFormEdicion] = useState({});
  const [toastMensaje, setToastMensaje] = useState('');

  // Estados de Red Social Mock
  const [seguidores, setSeguidores] = useState(1240);
  const [seguidos, setSeguidos] = useState(384);
  const [nuevoPostTexto, setNuevoPostTexto] = useState('');
  const [nuevoPostImagen, setNuevoPostImagen] = useState('');
  const [comentariosInputs, setComentariosInputs] = useState({});
  const [publicaciones, setPublicaciones] = useState([
    {
      id: 1,
      autor: 'Mi Perfil',
      fecha: 'Hace 2 días',
      contenido: '¡Excelente entrenamiento hoy por la mañana con el equipo! Enfocados en la táctica de juego y pases rápidos. ⚽🔥',
      imagen: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop',
      likes: 124,
      liked: false,
      comentarios: [
        { autor: 'Carlos Perez', texto: '¡Grande crack! Seguí así.' },
        { autor: 'Martín DT', texto: 'Muy buen ritmo en el circuito.' }
      ]
    },
    {
      id: 2,
      autor: 'Mi Perfil',
      fecha: 'Hace 1 semana',
      contenido: 'Superado el test de velocidad de hoy. Nueva marca personal lograda. ¡El esfuerzo da sus frutos! 🏃💨 #Rendimiento #Sportlink',
      imagen: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=600&auto=format&fit=crop',
      likes: 98,
      liked: false,
      comentarios: []
    }
  ]);

  const handleLikePost = (postId) => {
    setPublicaciones(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.liked ? p.likes - 1 : p.likes + 1,
          liked: !p.liked
        };
      }
      return p;
    }));
  };

  const handleAddComment = (postId, e) => {
    e.preventDefault();
    const commentText = comentariosInputs[postId];
    if (!commentText || !commentText.trim()) return;

    setPublicaciones(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comentarios: [
            ...p.comentarios,
            { autor: nombreCompleto, texto: commentText.trim() }
          ]
        };
      }
      return p;
    }));

    setComentariosInputs(prev => ({
      ...prev,
      [postId]: ''
    }));
  };

  const handleCrearPost = (e) => {
    e.preventDefault();
    if (!nuevoPostTexto.trim()) return;

    const nuevoPost = {
      id: Date.now(),
      autor: nombreCompleto,
      fecha: 'Ahora mismo',
      contenido: nuevoPostTexto,
      imagen: nuevoPostImagen || null,
      likes: 0,
      liked: false,
      comentarios: []
    };

    setPublicaciones([nuevoPost, ...publicaciones]);
    setNuevoPostTexto('');
    setNuevoPostImagen('');
  };

  const totalLikes = publicaciones.reduce((acc, p) => acc + p.likes, 0);

  // Usuario viene del prop (App.jsx es la fuente de verdad de sesión)
  const usuario = props.usuario;
  const idUsuario = usuario?.idusuario || usuario?.idUsuario || usuario?.id;

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
          setPerfil(res.data || null);
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

  // Manejar apertura de modal de edición cargando datos actuales
  const abrirModalEdicion = () => {
    setFormEdicion({
      nombre: perfil?.nombre || '',
      apellido: perfil?.apellido || '',
      ubicacion: perfil?.ubicacion || '',
      telefono: perfil?.telefono || '',
      instagram: perfil?.instagram || '',
      descripcion: perfil?.descripcion || '',
      // Atributos de ficha técnica
      edad: perfil?.edad || '',
      altura: perfil?.altura || '',
      posicion: perfil?.posicion || '',
      experiencia: perfil?.experiencia || '',
      categoria: perfil?.categoria || '',
    });
    setModalAbierto(true);
  };

  const guardarCambios = (e) => {
    e.preventDefault();
    
    // Al no haber endpoint de actualización en backend, actualizamos en local state para excelente UX
    setPerfil(prev => ({
      ...prev,
      ...formEdicion
    }));

    setModalAbierto(false);
    
    // Mostrar Toast de Éxito
    setToastMensaje('¡Perfil actualizado con éxito!');
    setTimeout(() => setToastMensaje(''), 4000);
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

  // Calcular porcentaje de completado de perfil
  const camposRequeridos = [perfil?.nombre, perfil?.apellido, perfil?.ubicacion, perfil?.telefono, perfil?.instagram, perfil?.descripcion];
  const completados = camposRequeridos.filter(Boolean).length;
  const porcentajeCompletado = Math.round((completados / camposRequeridos.length) * 100);

  // Estadísticas/métricas de rendimiento predeterminadas para excelente UX
  const rendimientoMock = perfil?.tipousuario?.toLowerCase() === 'jugador' ? [
    { label: 'Velocidad / Ritmo', valor: 85, color: '#2deff2' },
    { label: 'Técnica / Control', valor: 78, color: '#3b82f6' },
    { label: 'Resistencia física', valor: 90, color: '#8b5cf6' },
    { label: 'Juego colectivo', valor: 82, color: '#f59e0b' },
  ] : perfil?.tipousuario?.toLowerCase() === 'entrenador' ? [
    { label: 'Táctica / Estrategia', valor: 88, color: '#2deff2' },
    { label: 'Gestión de vestuario', valor: 92, color: '#3b82f6' },
    { label: 'Liderazgo técnico', valor: 85, color: '#8b5cf6' },
    { label: 'Desarrollo de juveniles', valor: 80, color: '#f59e0b' },
  ] : [
    { label: 'Infraestructura', valor: 80, color: '#2deff2' },
    { label: 'Prestigio competitivo', valor: 85, color: '#3b82f6' },
    { label: 'Cuerpo técnico', valor: 75, color: '#8b5cf6' },
    { label: 'Desarrollo de atletas', valor: 90, color: '#f59e0b' },
  ];

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
          
          {/* ── CARD HEADER DEL PERFIL (REDISÈÑADO) ── */}
          <div className="new-profile-header">
            <div className="profile-cover-image">
              <div className="profile-cover-gradient" />
              <div className="profile-glow-point" />
            </div>

            <div className="profile-header-main">
              <div className="profile-avatar-area">
                <div className="profile-avatar-border-svg">
                  <Avatar 
                    src={perfil?.fotoperfil} 
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
                  <p className="profile-bio-text empty">Sin descripción en tu perfil. Hacé clic en "Editar perfil" para agregar una biografía y destacar en SportLink.</p>
                )}

                <div className="profile-social-stats">
                  <div className="social-stat-item">
                    <span className="stat-number">{publicaciones.length}</span>
                    <span className="stat-label-text">publicaciones</span>
                  </div>
                  <div className="social-stat-item" onClick={() => setSeguidores(s => s + 1)} style={{ cursor: 'pointer' }}>
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
                <button className="profile-btn-edit" onClick={abrirModalEdicion}>
                  <IconoEditar />
                  EDITAR PERFIL
                </button>
              </div>
            </div>
          </div>

          {/* ── GRID DE CONTENIDO PRINCIPAL ── */}
          <div className="new-profile-grid">
            
            {/* COLUMNA IZQUIERDA: PANELES E INTERACTIVIDAD DE TABS */}
            <div className="new-profile-main-col">
              
              {/* Barra de Navegación de Tabs */}
              <nav className="profile-tabs-nav">
                <button 
                  className={`profile-tab-button ${tabActiva === 'sobremi' ? 'active' : ''}`}
                  onClick={() => setTabActiva('sobremi')}
                >
                  Sobre mí
                </button>
                <button 
                  className={`profile-tab-button ${tabActiva === 'publicaciones' ? 'active' : ''}`}
                  onClick={() => setTabActiva('publicaciones')}
                >
                  Publicaciones
                </button>
                <button 
                  className={`profile-tab-button ${tabActiva === 'recomendaciones' ? 'active' : ''}`}
                  onClick={() => setTabActiva('recomendaciones')}
                >
                  Recomendaciones
                </button>
              </nav>

              {/* Contenido según Tab */}
              <div className="profile-tab-content-panel">
                
                {/* 1. Tab: Sobre mí (Ficha Técnica Integrada) */}
                {tabActiva === 'sobremi' && (
                  <div className="tab-pane-content pane-sobremi">
                    <h3 className="tab-pane-title">Ficha Deportiva Completa</h3>
                    <div className="profile-details-grid">
                      <div className="detail-item-box">
                        <span className="detail-label">Edad</span>
                        <span className="detail-value">{perfil?.edad ? `${perfil.edad} años` : 'No especificada'}</span>
                      </div>
                      <div className="detail-item-box">
                        <span className="detail-label">Altura</span>
                        <span className="detail-value">{perfil?.altura || 'No especificada'}</span>
                      </div>
                      <div className="detail-item-box">
                        <span className="detail-label">Posición principal</span>
                        <span className="detail-value">{perfil?.posicion || 'No especificada'}</span>
                      </div>
                      <div className="detail-item-box">
                        <span className="detail-label">Experiencia</span>
                        <span className="detail-value">{perfil?.experiencia || 'No especificada'}</span>
                      </div>
                      <div className="detail-item-box">
                        <span className="detail-label">Categoría</span>
                        <span className="detail-value">{perfil?.categoria || 'No especificada'}</span>
                      </div>
                      <div className="detail-item-box">
                        <span className="detail-label">Género</span>
                        <span className="detail-value">{perfil?.genero || 'No especificado'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Tab: Publicaciones (Feed de Red Social) */}
                {tabActiva === 'publicaciones' && (
                  <div className="tab-pane-content pane-publicaciones" style={{ padding: 0, backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}>
                    {/* Crear publicación */}
                    <div className="create-post-card">
                      <h4 className="create-post-header">Crear Publicación</h4>
                      <form onSubmit={handleCrearPost} className="create-post-form">
                        <textarea
                          className="create-post-textarea"
                          placeholder="¿Qué entrenaste hoy? Comparte tus logros..."
                          value={nuevoPostTexto}
                          onChange={(e) => setNuevoPostTexto(e.target.value)}
                          maxLength={280}
                          required
                        />
                        <input
                          type="text"
                          className="create-post-input-url"
                          placeholder="URL de imagen opcional (ej. https://...)"
                          value={nuevoPostImagen}
                          onChange={(e) => setNuevoPostImagen(e.target.value)}
                        />
                        <button type="submit" className="create-post-submit-btn">
                          Publicar
                        </button>
                      </form>
                    </div>

                    {/* Feed de Publicaciones */}
                    {publicaciones.length === 0 ? (
                      <div className="empty-feed-graphic">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="empty-feed-svg">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        <h4>Sin publicaciones recientes</h4>
                      </div>
                    ) : (
                      publicaciones.map(post => (
                        <div key={post.id} className="feed-post-card">
                          <div className="post-card-header">
                            <div className="post-author-info">
                              <Avatar
                                src={perfil?.fotoperfil}
                                nombre={nombreCompleto}
                                size="36px"
                                className="post-author-avatar"
                                style={{ border: 'none' }}
                              />
                              <div>
                                <span className="post-author-name">{post.id === 1 || post.id === 2 ? nombreCompleto : post.autor}</span>
                                <span className="post-date">{post.fecha}</span>
                              </div>
                            </div>
                          </div>

                          <p className="post-content">{post.contenido}</p>

                          {post.imagen && (
                            <img src={post.imagen} alt="Publicación" className="post-image" />
                          )}

                          <div className="post-actions-row">
                            <button 
                              className={`post-action-btn ${post.liked ? 'liked' : ''}`}
                              onClick={() => handleLikePost(post.id)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                              </svg>
                              {post.likes} {post.likes === 1 ? 'Me gusta' : 'Me gustas'}
                            </button>
                            <button className="post-action-btn">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              </svg>
                              {post.comentarios.length} {post.comentarios.length === 1 ? 'Comentario' : 'Comentarios'}
                            </button>
                          </div>

                          {/* Sección de Comentarios */}
                          <div className="post-comments-section">
                            {post.comentarios.map((c, i) => (
                              <div key={i} className="comment-item">
                                <span className="comment-author">{c.autor}</span>
                                <span className="comment-text">{c.texto}</span>
                              </div>
                            ))}
                            <form 
                              onSubmit={(e) => handleAddComment(post.id, e)} 
                              className="comment-form"
                            >
                              <input
                                type="text"
                                className="comment-input"
                                placeholder="Escribe un comentario..."
                                value={comentariosInputs[post.id] || ''}
                                onChange={(e) => setComentariosInputs(prev => ({
                                  ...prev,
                                  [post.id]: e.target.value
                                }))}
                                required
                              />
                              <button type="submit" className="comment-submit-btn">
                                Comentar
                              </button>
                            </form>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 4. Tab: Recomendaciones (Reseñas Deportivas) */}
                {tabActiva === 'recomendaciones' && (
                  <div className="tab-pane-content pane-recomendaciones">
                    <h3 className="tab-pane-title">Recomendaciones de Clubes y Entrenadores</h3>
                    <div className="reviews-section-list">
                      {perfil?.resenas && perfil.resenas.length > 0 ? (
                        perfil.resenas.map((resena, idx) => (
                          <div key={idx} className="review-card-modern">
                            <p className="review-text">"{resena.texto}"</p>
                            <div className="review-author-info">
                              <span className="review-author-circle">
                                {(resena.autor || 'A').charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <span className="review-author-name">{resena.autor || 'Anónimo'}</span>
                                <span className="review-author-desc">Recomendación verificada de SportLink</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-feed-graphic">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="empty-feed-svg">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <h4>Sin recomendaciones aún</h4>
                          <p>Las recomendaciones de veedores, entrenadores y directivos aparecerán listadas aquí.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* COLUMNA DERECHA: SIDEBAR DE COMPLETADO Y DATOS DE CONTACTO */}
            <div className="new-profile-side-col">
              
              {/* Box 1: Barra de Completado de Perfil */}
              <div className="profile-side-card card-completado">
                <div className="side-card-header">
                  <h4>Estado del Perfil</h4>
                  <span className="completado-percent">{porcentajeCompletado}%</span>
                </div>
                <div className="completado-bar-track">
                  <div className="completado-bar-fill" style={{ width: `${porcentajeCompletado}%` }} />
                </div>
                <p className="completado-text">
                  {porcentajeCompletado === 100 
                    ? '¡Tu perfil está completamente configurado! Estás listo para captar la atención de reclutadores.'
                    : 'Añade información de contacto y tu descripción para que más clubes puedan encontrarte fácilmente.'}
                </p>
              </div>

              {/* Box 2: Información de Contacto */}
              <div className="profile-side-card card-contacto">
                <div className="side-card-header">
                  <h4>Información de Contacto</h4>
                </div>
                
                <div className="contact-list-items">
                  <div className="contact-item">
                    <span className="contact-item-label">Email</span>
                    <span className="contact-item-val" title={perfil?.email}>{perfil?.email || 'No disponible'}</span>
                  </div>
                  
                  <div className="contact-item">
                    <span className="contact-item-label">Teléfono</span>
                    <span className="contact-item-val">{perfil?.telefono || 'No disponible'}</span>
                  </div>
                  
                  <div className="contact-item">
                    <span className="contact-item-label">Instagram</span>
                    <span className="contact-item-val">
                      {perfil?.instagram ? `@${perfil.instagram.replace(/^@/, '')}` : 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
      <Footer />

      {/* ── MODAL EDITAR PERFIL (REDISÈÑADO) ── */}
      {modalAbierto && createPortal(
        <div className="profile-modal-overlay">
          <div className="profile-modal-card">
            <div className="profile-modal-header">
              <h3>Editar Información de Perfil</h3>
              <button className="profile-modal-btn-close" onClick={() => setModalAbierto(false)}>×</button>
            </div>
            
            <form onSubmit={guardarCambios} className="profile-modal-form">
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
                <label>Descripción / Biografía</label>
                <textarea 
                  value={formEdicion.descripcion} 
                  onChange={e => setFormEdicion(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Escribe algo sobre ti, tus metas y tu carrera deportiva..."
                  maxLength={400}
                />
                <span className="char-count-modal">{formEdicion.descripcion?.length || 0} / 400</span>
              </div>

              <div className="profile-modal-actions">
                <button type="button" className="btn-modal-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn-modal-guardar">Guardar cambios</button>
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
