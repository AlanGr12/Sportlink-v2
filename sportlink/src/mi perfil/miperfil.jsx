import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './miperfil.css';
import Header from '../header/header.jsx';
import Footer from '../footer/footer.jsx';
import PerfilHeader from './PerfilHeader.jsx';
import PerfilBio from './PerfilBio.jsx';
import PerfilExperiencia from './PerfilExperiencia.jsx';
import PerfilSidebar from './PerfilSidebar.jsx';
import PerfilContacto from './PerfilContacto.jsx';
import PerfilResenas from './PerfilResenas.jsx';

/*
  Vista principal "Mi Perfil"
  - Sólo este componente realiza la petición al backend para obtener
    el perfil completo del usuario (axios GET).
  - Usa el id de usuario guardado en localStorage (no depende de props)
  - Pasea el objeto `perfil` a todos los subcomponentes como prop.
  - Muestra estados: cargando, error y la UI final.
  - Reutiliza el `Header` y `Footer` de la app para mantener navegación.
*/

const MiPerfil = (props) => {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState(null);

  // obtener idusuario directamente desde localStorage (no depender de props)
  const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || 'null');
  const idUsuario = usuarioLocal?.idusuario;

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
      <Header cambiarVista={props.cambiarVista} usuario={props.usuario} />
      <div className="miPerfil-root">
        <div className="miPerfil-container">
          <div className="miPerfil-grid">
            <main className="miPerfil-main">
              <PerfilHeader perfil={perfil} />
              <PerfilBio perfil={perfil} />
              <PerfilExperiencia perfil={perfil} />
              <PerfilResenas perfil={perfil} />
            </main>

            <aside className="miPerfil-aside">
              <PerfilSidebar perfil={perfil} />
              <PerfilContacto perfil={perfil} />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MiPerfil;
