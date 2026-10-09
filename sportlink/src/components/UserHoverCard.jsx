import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import BotonSeguir from './BotonSeguir.jsx';
import api from '../axiosConfig.js';
import './UserHoverCard.css';

export default function UserHoverCard({ autor, usuario, children }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [datosPerfil, setDatosPerfil] = useState(autor || null);
  const [stats, setStats] = useState({ seguidores: 0, seguidos: 0, siguiendo: false });
  const [cargado, setCargado] = useState(false);

  const timeoutRef = useRef(null);
  const idUsuario = autor?.idusuario || autor?.id || autor?.id_usuario;

  const handleMouseEnter = () => {
    if (!idUsuario) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
      if (!cargado) {
        cargarDatos();
      }
    }, 280);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, 200);
  };

  const cargarDatos = async () => {
    try {
      const [resUser, resSeg] = await Promise.allSettled([
        api.get(`/api/usuarios/${idUsuario}`),
        api.get(`/api/seguidores/${idUsuario}`)
      ]);

      if (resUser.status === 'fulfilled' && resUser.value?.data) {
        setDatosPerfil(prev => ({ ...prev, ...resUser.value.data }));
      }
      if (resSeg.status === 'fulfilled' && resSeg.value?.data) {
        setStats({
          seguidores: resSeg.value.data.seguidores || 0,
          seguidos: resSeg.value.data.seguidos || 0,
          siguiendo: resSeg.value.data.siguiendo === true
        });
      }
      setCargado(true);
    } catch {
      setCargado(true);
    }
  };

  const tipousuario = datosPerfil?.tipousuario || autor?.tipousuario;

  const rolTraducido = tipousuario === 'jugador'
    ? 'Atleta Profesional'
    : tipousuario === 'entrenador'
      ? 'Entrenador Elite'
      : tipousuario === 'club'
        ? 'Club Deportivo'
        : tipousuario;

  const bio = datosPerfil?.biografia || datosPerfil?.bio || (datosPerfil?.deporte ? `${datosPerfil.deporte}${datosPerfil.ubicacion ? ` · ${datosPerfil.ubicacion}` : ''}` : '');

  return (
    <span
      className="user-hover-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {visible && idUsuario && (
        <div
          className="user-hover-card"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/perfil/${idUsuario}`);
          }}
        >
          {/* Fila superior: Avatar + BotonSeguir */}
          <div className="user-hover-top">
            <Avatar
              src={datosPerfil?.fotoperfil || autor?.fotoperfil}
              nombre={datosPerfil?.nombre || autor?.nombre || 'Usuario'}
              size={54}
            />
            {usuario && Number(usuario.idusuario || usuario.id) !== Number(idUsuario) && (
              <div onClick={(e) => e.stopPropagation()}>
                <BotonSeguir
                  idusuario={idUsuario}
                  tipousuario={tipousuario}
                  usuario={usuario}
                  siguiendoInicial={stats.siguiendo}
                />
              </div>
            )}
          </div>

          {/* Nombre y Rol Badge */}
          <div className="user-hover-info">
            <h4 className="user-hover-name">{datosPerfil?.nombre || autor?.nombre || 'Usuario'}</h4>
            <div className="user-hover-role-badge">
              {tipousuario && (
                <span className={`post-rol-badge ${String(tipousuario).toLowerCase()}`}>
                  {tipousuario}
                </span>
              )}
              {rolTraducido && <span className="user-hover-subrole">• {rolTraducido}</span>}
            </div>
          </div>

          {/* Mini Bio / Info */}
          {bio && (
            <p className="user-hover-bio">{bio}</p>
          )}

          {/* Estadísticas: Seguidos y Seguidores */}
          <div className="user-hover-stats">
            <span className="user-hover-stat">
              <strong>{stats.seguidos}</strong> <span className="user-hover-stat-lbl">Siguiendo</span>
            </span>
            <span className="user-hover-stat">
              <strong>{stats.seguidores}</strong> <span className="user-hover-stat-lbl">Seguidores</span>
            </span>
          </div>
        </div>
      )}
    </span>
  );
}
