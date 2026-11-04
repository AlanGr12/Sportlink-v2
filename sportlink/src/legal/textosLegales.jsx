/* eslint-disable react-refresh/only-export-components */
import { Link } from 'react-router-dom'
import { EDAD_MINIMA } from './datosNegocio.js'

// BORRADOR redactado para la normativa argentina (Ley 25.326 de Datos Personales,
// Ley 24.240 de Defensa del Consumidor, Res. 424/2020 botón de arrepentimiento).
// Debe revisarlo un abogado antes de publicarse como definitivo.

const Responsable = ({ negocio: n }) => (
  <>
    <p>
      El responsable de este sitio y de la base de datos es <strong>{n.razonSocial || n.nombreComercial}</strong>
      {n.cuit && <> (CUIT {n.cuit})</>}
      {n.domicilio && <>, con domicilio en {n.domicilio}</>}. Contacto: <a href={`mailto:${n.email}`}>{n.email}</a>.
    </p>
  </>
)

function Privacidad({ negocio }) {
  return (
    <>
      <Responsable negocio={negocio} />

      <h2>Qué datos juntamos y para qué</h2>
      <ul>
        <li><strong>Cuenta:</strong> email y contraseña (guardada cifrada). Sirven para que ingreses.</li>
        <li><strong>Perfil:</strong> nombre, apellido, fecha de nacimiento, género, teléfono, barrio o zona, deporte, foto y descripción. Sirven para que clubes, entrenadores y jugadores te encuentren.</li>
        <li><strong>Actividad:</strong> inscripciones, postulaciones, publicaciones, comentarios, mensajes, reseñas y seguidores. Sirven para que la plataforma funcione.</li>
        <li><strong>Técnicos:</strong> sesión (token) y tu preferencia de tema, guardados en tu navegador.</li>
      </ul>
      <p>Solo pedimos lo necesario para el servicio. No vendemos tus datos ni los usamos para publicidad.</p>

      <h2>Qué es público</h2>
      <p>Tu perfil, publicaciones y reseñas pueden ser vistos por otros usuarios de SportLink. Tu email, teléfono y fecha de nacimiento completa no se muestran públicamente. Cuando te inscribís a una prueba, entrenamiento o empleo, el club o entrenador que lo organiza ve los datos de contacto de tu perfil.</p>

      <h2>Con quién compartimos datos</h2>
      <table className="lg-tabla">
        <thead><tr><th>Proveedor</th><th>Para qué</th></tr></thead>
        <tbody>
          <tr><td>Supabase</td><td>Base de datos y almacenamiento de fotos y archivos.</td></tr>
          <tr><td>Google Fonts</td><td>Cargar la tipografía. Google recibe tu dirección IP al pedir la fuente.</td></tr>
          <tr><td>OpenStreetMap / Nominatim</td><td>Mapas y búsqueda de direcciones. Reciben tu IP y la dirección que buscás.</td></tr>
          <tr><td>Proveedor del asistente de ayuda (IA)</td><td>Responder las consultas que escribís en el chat de ayuda. No ingreses datos sensibles ahí.</td></tr>
        </tbody>
      </table>
      <p>Algunos de estos proveedores están fuera de Argentina; en ese caso los datos se transfieren a países con sus propias normas de protección.</p>

      <h2>Menores de edad</h2>
      <p>Para registrarte tenés que tener al menos {EDAD_MINIMA} años. Si tenés entre {EDAD_MINIMA} y 17, necesitás la autorización de tu madre, padre o tutor, y ellos pueden pedirnos acceso o eliminación de la cuenta. Si detectamos una cuenta de una persona menor de {EDAD_MINIMA} años, la eliminamos.</p>

      <h2>Tus derechos</h2>
      <p>Tenés derecho a acceder, rectificar y suprimir tus datos. Podés editar tu perfil desde la app, y <Link to="/ajustes">eliminar tu cuenta</Link> desde Ajustes: se borran tu perfil, publicaciones e inscripciones. También podés escribirnos a <a href={`mailto:${negocio.email}`}>{negocio.email}</a> para ejercer cualquiera de estos derechos.</p>
      <p>La Agencia de Acceso a la Información Pública (AAIP) es el órgano de control de la Ley 25.326 y atiende denuncias y reclamos por incumplimientos en materia de datos personales.</p>

      <h2>Cuánto tiempo guardamos los datos</h2>
      <p>Mientras tu cuenta esté activa. Al eliminarla, borramos tus datos, salvo lo que debamos conservar por obligación legal.</p>

      <h2>Seguridad</h2>
      <p>Usamos conexión cifrada (HTTPS), contraseñas cifradas y control de acceso por sesión. Ningún sistema es infalible: si hubiera un incidente que te afecte, te lo vamos a informar.</p>

      <h2>Cambios</h2>
      <p>Si cambiamos esta política, actualizamos la fecha de arriba y, si el cambio es importante, te avisamos en la app.</p>
    </>
  )
}

function Terminos({ negocio }) {
  return (
    <>
      <Responsable negocio={negocio} />

      <h2>Qué es SportLink</h2>
      <p>SportLink es una red para jugadores, entrenadores y clubes: permite publicar y encontrar pruebas, entrenamientos y empleos, y contactarse entre usuarios. SportLink conecta personas; no organiza los eventos ni contrata a nadie.</p>

      <h2>Tu cuenta</h2>
      <ul>
        <li>Tenés que tener al menos {EDAD_MINIMA} años (y autorización de un adulto responsable si sos menor de 18).</li>
        <li>Los datos que cargues tienen que ser verdaderos y actualizados.</li>
        <li>Sos responsable de tu contraseña y de lo que se haga con tu cuenta.</li>
        <li>Las cuentas de club pasan por una revisión antes de activarse.</li>
      </ul>

      <h2>Uso permitido</h2>
      <p>No se puede: hacerse pasar por otra persona o club, publicar contenido ilegal, ofensivo o discriminatorio, acosar a otros usuarios, publicar ofertas falsas o engañosas, ni usar la plataforma para spam o para extraer datos de forma automática. Podemos ocultar contenido y suspender o eliminar cuentas que incumplan estas reglas.</p>

      <h2>Tu contenido</h2>
      <p>Seguís siendo dueño de lo que publicás (fotos, textos, videos). Nos das permiso para mostrarlo dentro de SportLink con el único fin de prestar el servicio. Declarás que tenés derecho a publicarlo, incluidas las imágenes de otras personas.</p>

      <h2>Pruebas, entrenamientos y empleos</h2>
      <p>Los clubes y entrenadores son responsables de la información que publican y de lo que ofrecen. SportLink no garantiza resultados, selecciones ni contrataciones, y no es parte de los acuerdos que hagas con otros usuarios.</p>

      <h2>Responsabilidad</h2>
      <p>Hacemos lo posible para que el servicio funcione sin interrupciones, pero puede haber fallas o mantenimientos. En lo que permite la ley, no respondemos por daños derivados de acuerdos entre usuarios o de información falsa publicada por terceros.</p>

      <h2>Baja</h2>
      <p>Podés eliminar tu cuenta cuando quieras desde <Link to="/ajustes">Ajustes</Link>.</p>

      <h2>Ley aplicable</h2>
      <p>Rigen las leyes de la República Argentina. Para consultas o reclamos escribinos a <a href={`mailto:${negocio.email}`}>{negocio.email}</a>.</p>
    </>
  )
}

function Cookies({ negocio }) {
  return (
    <>
      <p>Esta página explica qué guardamos en tu navegador cuando usás SportLink.</p>

      <h2>Qué usamos</h2>
      <table className="lg-tabla">
        <thead><tr><th>Nombre</th><th>Para qué</th><th>Tipo</th></tr></thead>
        <tbody>
          <tr><td><code>token</code>, <code>usuario</code></td><td>Mantener tu sesión iniciada.</td><td>Esencial</td></tr>
          <tr><td><code>slk-tema</code></td><td>Recordar si elegiste modo claro u oscuro.</td><td>Preferencia</td></tr>
          <tr><td><code>slk-cookies</code></td><td>Recordar que viste este aviso.</td><td>Esencial</td></tr>
        </tbody>
      </table>
      <p>Se guardan en el almacenamiento local del navegador (<em>localStorage</em>), no en cookies de seguimiento.</p>

      <h2>Qué no usamos</h2>
      <p>No usamos cookies de publicidad, analítica ni de redes sociales. Si algún día las sumamos, vamos a pedirte permiso antes de activarlas.</p>

      <h2>Servicios externos</h2>
      <p>Para mostrar la tipografía (Google Fonts) y los mapas (OpenStreetMap), tu navegador se conecta a esos servicios y ellos pueden ver tu IP. Más detalles en la <Link to="/legal/privacidad">política de privacidad</Link>.</p>

      <h2>Cómo borrarlas</h2>
      <p>Cerrando sesión se borran <code>token</code> y <code>usuario</code>. Podés borrar todo desde la configuración de tu navegador. Dudas: <a href={`mailto:${negocio.email}`}>{negocio.email}</a>.</p>
    </>
  )
}

function Reembolsos({ negocio }) {
  return (
    <>
      <p>Hoy SportLink es gratuito para jugadores, entrenadores y clubes: no cobramos suscripciones ni comisiones, por lo que no hay nada que reembolsar a SportLink.</p>

      <h2>Pagos entre usuarios</h2>
      <p>Algunos entrenamientos o pruebas pueden tener un precio. Ese pago lo acordás y lo hacés directamente con el club o entrenador, fuera de SportLink. Las condiciones de devolución las define quien ofrece el servicio y tenés que consultarlas con él antes de pagar. SportLink no recibe ni retiene ese dinero.</p>
      <p>Tus derechos como consumidor (Ley 24.240) siguen vigentes frente a quien te vende el servicio.</p>

      <h2>Si empezamos a cobrar</h2>
      <p>Antes de cobrar cualquier plan te vamos a mostrar el precio final con impuestos incluidos, sin cargos ocultos, y vamos a actualizar esta política con las condiciones de cancelación y devolución, incluido el derecho de revocar la compra dentro de los 10 días (botón de arrepentimiento).</p>

      <h2>Consultas</h2>
      <p>Escribinos a <a href={`mailto:${negocio.email}`}>{negocio.email}</a>.</p>
    </>
  )
}

export const DOCUMENTOS = {
  privacidad: { titulo: 'Política de privacidad', Cuerpo: Privacidad },
  terminos: { titulo: 'Términos y condiciones', Cuerpo: Terminos },
  cookies: { titulo: 'Política de cookies', Cuerpo: Cookies },
  reembolsos: { titulo: 'Pagos y reembolsos', Cuerpo: Reembolsos },
}
