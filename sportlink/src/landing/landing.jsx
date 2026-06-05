import React from 'react';
import './landing.css';
import Header from '../header/header.jsx';
import Footer from '../footer/footer.jsx';
import fotolanding from '../assets/fotolanding.png'
import entrenador1 from '../assets/entrenador1.png'
import entrenador2 from '../assets/entrenador2.png'
import entrenador3 from '../assets/entrenador3.png'
import riber from '../assets/riber.png'
import boca from '../assets/boca.png'
import instalaciones from '../assets/instalaciones.png'
import futbol from '../assets/futbol.png'
import basquet from '../assets/basquet.png'
import tenis from '../assets/tenis.png'
import atlanta from '../assets/atlanta.png'
import riestra from '../assets/riestra.png'
import estudiantes from '../assets/estudiantes.png'
import calendar from '../assets/calendar.png'




const Landing = (props) => {
  return (
    <>
      <Header cambiarVista={props.cambiarVista} />
    <main>
<section
  className="banner"
  style={{
    backgroundImage: `
      linear-gradient(
        rgba(0,0,0,.65),
        rgba(0,0,0,.65)
      ),
      url(${fotolanding})
    `
  }}
>
  <div className="banner-texto">
    <h1>
      ELEVA TU
      <br />
      <span>CAMINO AL DEPORTE</span>
    </h1>
    <p>
      Conecta con clubes, entrenadores, y obtener cursos de entrenamiento
      de la mejor calidad. Convertí tu talento en oportunidades.
    </p>
    <button>UNIRSE A SPORTLINK</button>
  </div>
</section>
      <section className="entrenadoresLanding">
        <div className="tituloLanding">
          <h2>
            DESCUBRÍ A LOS <span>ENTRENADORES</span> AFILIADOS
          </h2>
        </div>
        <div className="cardsEntrenadores">
          <article>
            <img src= {entrenador1} alt="Entrenador" />
            <div>
              <h3>Lucas Quintana</h3>
              <p>Tenis</p>
            </div>
          </article>
          <article>
            <img src= {entrenador2} alt="Entrenador" />
            <div>
              <h3>Sofia Hernández</h3>
              <p>Fútbol</p>
            </div>
          </article>
          <article>
            <img src= {entrenador3} alt="Entrenador" />
            <div>
              <h3>Javier Lopéz</h3>
              <p>HOCKEY</p>
            </div>
          </article>
        </div>
      </section>
      <section className="clubesLanding">
        <div className="izquierdaClubes">
          <h2>
  DESCUBRÍ LOS
  <br />
  MEJORES
  <br />
  <span>CLUBES</span>
</h2>
          <p>
            Instituciones que definen el futuro del deporte.
            Conecta directamente con sus departamentos de reclutamiento.
          </p>
          <div className="listaClubes">
            <article>
              <img src={riber} alt="River" />
              <div>
                <h3>River Plate</h3>
                <p>Club asociado</p>
              </div>
            </article>
            <article>
              <img src={boca} />
              <div>
                <h3>Boca Juniors</h3>
                <p>Club asociado</p>
              </div>
            </article>
          </div>
        </div>
        <div className="derechaClubes">
          <div className="deportesClubes">
            <article>
                <img src={futbol} />
              <p>FÚTBOL</p>
            </article>
            <article>
                <img src={basquet} />
              <p>BÁSQUET</p>
            </article>
            <article>
                <img src={tenis} />
              <p>TENIS</p>
            </article>
          </div>
          <div className="imagenClubes">
            <img src={instalaciones} alt="Club" />
            <div>
              <h3>Instalaciones de Alto Rendimiento</h3>
              <p>Más de 120 clubes asociados en toda Argentina.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="pruebasLanding">
        <div className="tituloPruebas">
          <div>
            <h2>
              PRUEBAS <span>RECOMENDAS</span>
            </h2>
            <p>
              LAS PRUEBAS RECOMENDADAS SE BASAN EN LOS DEPORTES,
              CATEGORÍA Y UBICACIÓN QUE ELEGISTE
            </p>
          </div>
          <a href="">VER TODAS</a>
        </div>
        <div className="cardsPruebas">
          <article>
            <img src={atlanta} alt="River" />
            <div>
              <h3>ATLANTA</h3>
              <p>⚽ Fútbol</p>
              <p>📍 CABA, Humboldt 540</p>
              <p>📅 15 de Octubre, 2026</p>
            </div>
            <button>MÁS INFORMACIÓN</button>
          </article>
          <article>


            <img src={riestra} alt="River" />
            <div>


              <h3>DEPORTIVO RIESTRA</h3>


              <p>⚽ Fútbol</p>


              <p>📍 CABA, Ana María Janer 2101</p>


              <p>📅 22 de Octubre, 2026</p>


            </div>


            <button>MÁS INFORMACIÓN</button>
          </article>


          <article>


           <img src={estudiantes} alt="River" />
            <div>


              <h3>ESTUDIANTES DE LA PLATA</h3>


              <p>⚽ Fútbol</p>
              <p>📍 La Plata, Av. 110</p>


              <p>📅 05 de Noviembre, 2026</p>


            </div>
            <button>MÁS INFORMACIÓN</button>




          </article>


        </div>


      </section>
      <section className="dashboardLanding">


        <div className="textoDashboard">
          <h2>
            Organizáte mejor con
            <br />
            tu <span>CALENDARIO</span>
          </h2>
          <p>
            Gestiona tus eventos, sigue tus progresos y recibe
            invitaciones de scouting en tiempo real. Un panel diseñado
            para la precisión absoluta.
          </p>


          <div className="listaDashboard">


            <p>✔ CALENDARIO PERSONALIZABLE</p>


            <p>✔ TUS ACTIVIDADES SE AGREGAN AUTOMÁTICAMENTE</p>


            <p>✔ NOTIFICACIONES A TU BUZÓN</p>


          </div>


          <button>IR A MI CALENDARIO</button>


        </div>
        <img src= {calendar} alt="Calendario" />


      </section>
    </main>
    <Footer />
    </>
  )
}


export default Landing;
