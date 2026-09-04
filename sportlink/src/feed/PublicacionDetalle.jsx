import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import { PostCompleto } from './PostCard.jsx'
import Footer from '../footer/footer.jsx'
import './FeedView.css'

export default function PublicacionDetalle({ usuario }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelado = false
    const cargar = async () => {
      setLoading(true)
      setError(null)
      try {
        // Endpoint público — no requiere estar logueado
        const { data } = await api.get(`/api/publicaciones/compartir/${id}`)
        if (!cancelado) setPost(data)
      } catch (err) {
        if (!cancelado) {
          if (err.response?.status === 404) {
            setError('Esta publicación no existe o fue eliminada.')
          } else {
            setError('No se pudo cargar la publicación.')
          }
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [id])

  const handleEliminar = () => {
    // Si el dueño elimina su propia publicación desde este link, lo mandamos al feed
    navigate('/feed')
  }

  return (
    <>
      <div className="feed-pagina">
        <div className="feed-layout" style={{ gridTemplateColumns: '1fr', maxWidth: '600px', margin: '0 auto' }}>
          <main className="feed-columna-principal">

            {!usuario && (
              <div style={{
                background: '#161819', border: '1px solid #2DEFF2', borderRadius: '8px',
                padding: '14px 18px', marginBottom: '16px', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap'
              }}>
                <span style={{ color: '#e6e6e6', fontSize: '14px' }}>
                  Estás viendo esta publicación como invitado.
                </span>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    background: '#2DEFF2', color: '#000', border: 'none', borderRadius: '6px',
                    padding: '8px 18px', fontWeight: 700, fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  Iniciar sesión
                </button>
              </div>
            )}

            {loading ? (
              <div className="feed-spinner-wrapper">
                <div className="feed-spinner" />
              </div>
            ) : error ? (
              <div className="feed-vacio">
                <h3>{error}</h3>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    marginTop: '12px', background: '#2DEFF2', color: '#000', border: 'none',
                    borderRadius: '6px', padding: '10px 22px', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Volver al inicio
                </button>
              </div>
            ) : (
              <PostCompleto post={post} usuario={usuario} onEliminar={handleEliminar} />
            )}

          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}