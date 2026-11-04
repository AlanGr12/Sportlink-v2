import { Link, useParams, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Footer from '../footer/footer.jsx'
import { NEGOCIO, ULTIMA_ACTUALIZACION } from './datosNegocio.js'
import { DOCUMENTOS } from './textosLegales.jsx'
import '../pruebas/PruebasView.css'
import './legal.css'

// Una sola página para las cuatro políticas: /legal/:doc
export default function PaginaLegal() {
  const { doc } = useParams()
  const actual = DOCUMENTOS[doc]

  useEffect(() => {
    if (actual) document.title = `${actual.titulo} | SportLink`
    return () => { document.title = 'SportLink | Plataforma de Conexión Deportiva y Scouting' }
  }, [actual])

  if (!actual) return <Navigate to="/legal/privacidad" replace />
  const Cuerpo = actual.Cuerpo

  return (
    <>
      <div className="pr lg">
        <div className="pr-wrap lg-layout">
          <aside className="lg-lado">
            <nav aria-label="Documentos legales">
              <ul>
                {Object.entries(DOCUMENTOS).map(([id, d]) => (
                  <li key={id}>
                    <Link to={`/legal/${id}`} aria-current={id === doc ? 'page' : undefined}>{d.titulo}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="lg-doc">
            <h1 className="pr-display lg-titulo">{actual.titulo}</h1>
            <p className="lg-fecha">Última actualización: {ULTIMA_ACTUALIZACION}</p>
            <Cuerpo negocio={NEGOCIO} />
          </article>
        </div>
      </div>
      <Footer />
    </>
  )
}
