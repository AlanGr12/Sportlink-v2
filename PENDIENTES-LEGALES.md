# SportLink — Pendientes legales

Contexto: el 4/11/2026 se implementó la base legal (páginas `/legal/*`, banner de cookies, consentimientos en el registro, eliminación de cuenta con `DELETE /api/login/cuenta`). Código en `sportlink/src/legal/`.

## Falta hacer

1. **Completar datos del negocio (obligatorio antes de publicar)**
   - Archivo: `sportlink/src/legal/datosNegocio.js`
   - Campos en `null`: `razonSocial`, `cuit`, `domicilio`. No se muestran hasta que se completen.
   - Hace falta: razón social (o nombre completo si es monotributista), CUIT y domicilio legal.

2. **Revisión de un abogado**
   - Los textos de `sportlink/src/legal/textosLegales.jsx` son un borrador (Ley 25.326, Ley 24.240).
   - Validar sobre todo: edad mínima (13 años + autorización de adulto hasta los 18), política de reembolsos ("hoy SportLink es gratis, los pagos son entre usuarios") y transferencia de datos a proveedores en el exterior.
   - Si cambian los textos, actualizar `ULTIMA_ACTUALIZACION` y `VERSION_LEGAL` en `datosNegocio.js`.

3. **Guardar el consentimiento en el backend**
   - Hoy la aceptación de términos y la declaración de edad se validan solo en el front (`registrar.jsx`).
   - Agregar columnas (fecha y versión aceptada) en la base y mandarlas en el registro de jugador, entrenador y club.

4. **Verificación de edad más fuerte (opcional)**
   - Hoy es una casilla. Se podría validar contra la fecha de nacimiento ya pedida en el paso 3 (rechazar menores de 13).

5. **Probar de punta a punta con el backend**
   - Registro con las casillas de consentimiento.
   - Eliminar cuenta desde Ajustes → Cuenta (verificar que se borren perfil, publicaciones e inscripciones).

6. **Auditoría de contraste de color**
   - No se hizo. Revisar claro y oscuro con una herramienta (WCAG AA).

7. **Si se suma analítica, pagos o mails**
   - Analítica: agregar Aceptar/Rechazar en `BannerCookies.jsx` y cargar el script solo después de aceptar. Actualizar la política de cookies.
   - Pagos: actualizar `/legal/reembolsos` (precio final con impuestos, cancelación, botón de arrepentimiento de 10 días).
   - Mails de marketing: agregar link de baja en cada mail.
