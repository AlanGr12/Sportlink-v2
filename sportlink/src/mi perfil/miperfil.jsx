import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './miperfil.css';
import Footer from '../footer/footer.jsx';
import PerfilHeader from './PerfilHeader.jsx';
import PerfilSidebar from './PerfilSidebar.jsx';
import PerfilContacto from './PerfilContacto.jsx';
import PerfilResenas from './PerfilResenas.jsx';
import PerfilPublicaciones from './PerfilPublicaciones.jsx';

const MiPerfil = (props) => {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState(null);

  // Fuente de verdad de App.jsx, con localStorage como fallback
  const usuario = props.usuario || JSON.parse(localStorage.getItem('usuario') || 'null');
  const idUsuario = usuario?.idusuario;

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
        const res = await axios.get(`http://localhost:3000/api/login/perfil/${idUsuario}`);
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

  if (cargando) {
    return (
      <div className="miPerfil-root">
        <div className="miPerfil-container">
          <div className="miPerfil-loading">Cargando perfil...</div>
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

  return (
    <>
      <div className="miPerfil-root">
        <div className="miPerfil-container">
          <div className="miPerfil-grid">
            <main className="miPerfil-main">
              {/* Header que incluye Nombre, Badges y Bio integrada */}
              <PerfilHeader perfil={perfil} />
              
              {/* Sección de futuras publicaciones del usuario */}
              <PerfilPublicaciones />
            </main>

            <aside className="miPerfil-aside">
              {/* Ficha técnica de estadísticas */}
              <PerfilSidebar perfil={perfil} />
              
              {/* Datos de contacto */}
              <PerfilContacto perfil={perfil} />
              
              {/* Reseñas movidas al lateral derecho con formato vertical */}
              <PerfilResenas perfil={perfil} />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MiPerfil;
