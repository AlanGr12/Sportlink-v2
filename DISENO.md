# SportLink — Sistema de diseño

Guía del diseño aprobado para SportLink (red tipo LinkedIn para **jugadores, entrenadores y clubes**, Argentina). Cualquier vista nueva o rediseñada tiene que seguir esto **al pie de la letra**. Si algo no está acá, mirá cómo está resuelto en las vistas ya migradas y copiá ese criterio.

Vistas ya migradas (referencia viva): **Landing** (`src/info/`), **Pruebas** (`src/pruebas/`), **Entrenamientos** (`src/entrenamientos/`), **Clubes** (`src/mostrarClubes/`), **Entrenadores** (`src/mostrarEntrenadores/`).
Todo lo demás (feed, perfil, jugadores, calendario, mensajes, empleos, ajustes, registro, admin) **todavía usa el diseño viejo oscuro** y se migra de a una vista, mostrándosela al dueño antes de seguir.

---

## 1. Forma de trabajar (lo que pide el dueño)

- Una vista por vez. Se implementa, se verifica y **se le muestra antes de pasar a la siguiente**.
- **No sacar funcionalidad existente.** Se rediseña la presentación; la lógica (inscripciones, lista de espera, postulantes, permisos, deep links) se conserva.
- Minimalista **pero con identidad**: nada de estética "hecha por IA" (neón con glow, vidrio/blur, degradés, cards con íconos arriba, etiquetas chiquitas en mayúsculas).
- **Todo en modo claro y oscuro.**
- Proporciones: los textos y bloques se alinean en X con el resto de la página (mismo borde izquierdo que `--slk-max` + gutter). Verificar en 1280, 1440, 1920 y 390 px.
- Imágenes siempre nítidas: nunca mostrar una foto más grande que su resolución nativa (en 2x idealmente).
- No inventar datos como si fueran reales (métricas, clientes, reseñas). Los ejemplos se marcan como ejemplo.
- Un solo **header compartido** para todas las vistas. **Nunca** crear un header propio de una vista.
- Idioma de la interfaz: español rioplatense (vos, "postulate", "inscribite").

---

## 2. Tokens — `src/theme/tokens.css`

Prefijo **`--slk-`** (no usar `--sl-`: los CSS de registro ya definen `--sl-*` globales y pisan valores).

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--slk-ground` | `#f1f2ef` | `#0e1011` | fondo de página |
| `--slk-step` | `#e4e6e2` | `#1b1e20` | bloques, inputs, chips inactivos (separación por tono) |
| `--slk-step-hover` | `#d9dcd7` | `#25292c` | hover de bloques / bordes de chips |
| `--slk-surface` | `#ffffff` | `#1b1e20` | tarjetas |
| `--slk-ink` | `#0e1011` | `#16191b` | secciones "tinta" (en oscuro, un pelo más claro que el fondo) |
| `--slk-ink-step` | `#1b1e20` | `#22262a` | bloques dentro de secciones tinta |
| `--slk-text` | `#0e1011` | `#f1f2ef` | texto principal (siempre tinta llena) |
| `--slk-text-2` | `#4a4f52` | `#a6acaf` | texto secundario, labels |
| `--slk-on-ink` / `--slk-on-ink-2` | `#f1f2ef` / `#a6acaf` | igual | texto sobre secciones tinta |
| `--slk-accent` | `#2deff2` | igual | cian del logo: acción principal y pocas cosas más |
| `--slk-on-accent` | `#0e1011` | igual | texto sobre cian |

Layout: `--slk-max: 1300px`, `--slk-gutter: clamp(20px, 3vw, 40px)`, `--slk-header-h: 80px`, `--slk-section: clamp(120px, 16vh, 200px)`, easing `--slk-ease: cubic-bezier(0.2, 0.7, 0.1, 1)`.

Colores de estado (pills): abierto = cian suave `rgba(45,239,242,.22)` texto `#046c6e`; últimos cupos = `#ffe9a8`/`#6b4c00`; completo = tinta; inscripto = `#c8f2cf`/`#1b5e2a`; peligro/eliminar = `#c62828`. En oscuro van versiones translúcidas (ver `PruebasView.css`).

### Modo claro / oscuro
- El botón sol/luna está en el header. Guarda `localStorage['slk-tema']` (`claro` | `oscuro`) y setea `<html data-tema="…">`.
- Los overrides oscuros van como `:root[data-tema='oscuro'] …`.
- En oscuro, lo que en claro es "tinta" (botón `--ink`, fila de rol activa, avatar) **se invierte a tiza** (`--slk-on-ink` de fondo, texto `#0e1011`).
- El logo: en claro se muestra negro (`filter: brightness(0)`), en oscuro el original blanco + cian.

---

## 3. Tipografía

- **Una sola familia: Archivo** (Google Fonts con eje de ancho: `family=Archivo:wdth,wght@62..125,400..900`, ya en `index.html`).
- **Display** (títulos de página y de sección): peso 800, `font-variation-settings: 'wdth' 112`, `letter-spacing: -0.035em`, `line-height: .95`, en minúscula normal (nada de MAYÚSCULAS). **Máximo 2 líneas en cualquier ancho.**
  - Título de página: `clamp(52px, 7vw, 104px)`. Hero landing: `clamp(40px, 14.5cqw, 92px)`.
  - Título de sección: `clamp(36px, 4.6vw, 68px)`.
- Títulos de tarjeta/modal: 20–28px, peso 800, `wdth 106`.
- Texto: 16–18px, `line-height 1.5`, color `--slk-text`. Secundario en `--slk-text-2`.
- Prohibido: monoespaciada, "eyebrows" (etiqueta chica arriba de un título), numeración 01/02/03, palabra resaltada con otro color/itálica dentro de un título.

---

## 4. Componentes (clases reales)

Las vistas de listado usan las clases `pr-*` de **`src/pruebas/PruebasView.css`** (Entrenamientos las reutiliza importando ese CSS). La landing usa `lp-*` en `src/info/InfoView.css`.

- **Botón** `.pr-btn` / `.lp-btn`: plano, **esquinas rectas**, cian con texto tinta, 15–18px de padding vertical, peso 700, flecha `→` que se mueve 3px en hover.
  - `--ink` (negro; en oscuro se invierte a tiza), `--ghost` (borde interno 2px tono step), `--danger` (rojo), `--block` (ancho completo).
  - Regla: **cian solo para la acción principal**. En listas de tarjetas el botón de cada tarjeta es `--ink`; el cian queda para "Postularme"/"Inscribirme" dentro del detalle y para "Crear …".
- **Link** `.pr-link`: subrayado de 2px con offset 5px que crece en hover. `--danger` en rojo.
- **Chip** `.pr-chip`: píldora con borde 2px; activo relleno de `--slk-text` con texto `--slk-ground`.
- **Carrusel de chips** `src/components/CarruselChips.jsx`: fila sin barra de scroll, con flechas redondas a izquierda/derecha que avanzan ~80% del ancho; se ocultan si todo entra y se desactivan en los extremos.
- **Campos** `.pr-field` (label arriba en 14px `--slk-text-2` + `select`/`input` de 44px, fondo `--slk-step`, sin borde ni radio).
- **Buscador** `.pr-search`: input de 54px fondo step con lupa a la izquierda.
- **Tarjeta** `.pr-card` (modelo aprobado por el dueño):
  1. Cabecera: avatar cuadrado 52px con **iniciales** (o foto) en tinta · título (club / título del entrenamiento) + subtítulo ("Prueba de fútbol", "Con Lucas Quintana") · **pill de estado** arriba a la derecha.
  2. Etiquetas opcionales `.pr-tags` ("Tu deporte", "Club que seguís", "Respaldado por …").
  3. **Datos en 2 columnas** `.pr-facts` (`dt` 14px gris, `dd` 16px 600): deporte, categoría/precio, fecha larga, lugar, nivel…
  4. **Barra de cupos** `.pr-cupos`: "28 de 40 cupos tomados" ··· "12 libres", barra de 8px (relleno tinta, rojo si se llenó).
  5. Botón a todo el ancho con texto según rol/estado, y acciones del dueño (Editar / Eliminar) como links debajo.
  - Grilla `.pr-grid`: `repeat(auto-fill, minmax(min(100%, 360px), 1fr))`, gap 20px. En móvil la pill baja debajo del nombre.
- **Modal** `.pr-overlay` + `.pr-modal`: velo `rgba(14,16,17,.62)`, panel fondo ground, cabecera y pie en tono step, cuerpo con scroll. Variantes `--sm`, `--form`, `--detalle`. Se cierra con Escape y clic afuera. En móvil sube desde abajo.
- **Aviso** `.pr-notice` (bloque step con texto + link) y **toast** `.pr-toast` (tinta, arriba centrado).
- **Vacío** `.pr-empty` (bloque step con título display, texto y una acción) y **carga** con tarjetas esqueleto `.pr-card--skeleton`.
- **Formatos** `src/utils/formato.js`: `iniciales("Club Atlético Villa Celeste") → "VC"`, `fechaLarga(fecha, ini, fin) → "Sábado 14 de noviembre, 9 a 12 h"`, `precio(8000) → "$ 8.000"`.

Reglas generales: separar superficies por **tono**, no por líneas finas (las tablas reales sí pueden tener líneas). Sin sombras en reposo (solo en lo que flota: modales, menús). Sin degradés (única excepción: velo oscuro debajo de texto sobre una foto). Sin blur/vidrio.

---

## 5. Estructura de una página de listado (Pruebas / Entrenamientos)

1. `.pr-head`: título display grande a la izquierda + una línea que dice qué es; a la derecha buscador y, si el rol puede crear, botón cian "Crear …".
2. `.pr-filters`: aviso si la lista está filtrada por el deporte del jugador ("Te mostramos … de tu deporte · Ver todos los deportes"), carrusel de chips de deporte, y fila de campos (zona, categoría/modalidad, desde, hasta) + "Limpiar filtros". **Los filtros se aplican al instante** (sin botón "Aplicar").
3. `.pr-results`: contador ("6 pruebas · las de clubes que seguís aparecen primero"), grilla de tarjetas, vacío/carga/error, paginación `.pr-pager` si hace falta.
4. Footer compartido.
5. Modales por portal: detalle, crear/editar, confirmaciones.

### Variante: listado de perfiles (Clubes)
Misma estructura, pero la tarjeta muestra **identidad** en vez de un evento: avatar + nombre + ubicación, etiquetas (`N pruebas abiertas` en cian suave, `Lo seguís`), deportes como etiquetas tono step (no interactivas), descripción recortada a 3 líneas, y pie con `Ver club` (tinta) + `Seguir`/`Siguiendo` (ghost; activo en tono step). Orden: los seguidos primero, después los que tienen pruebas abiertas. El detalle muestra deportes, "Acerca del club", historia/premios **solo si hay datos**, sus pruebas abiertas como filas que llevan a `/pruebas/:id`, mapa de la sede si hay coordenadas, y acciones Ver perfil · Seguir · Contactar (cian). Contactar abre un modal chico con textarea (500 caracteres, Ctrl+Enter) y al enviar muestra un toast con "Ir al chat". Estilos en `src/mostrarClubes/ClubesView.css` (prefijo `cl-`), que **Entrenadores** importa tal cual. En Entrenadores la tarjeta suma la nota real (`★ 4,8 · 12 reseñas`, etiqueta tinta, de `GET /api/resenias/entrenador/:identrenador`), la cantidad de entrenamientos publicados (de `GET /api/entrenamientos`), "Trabaja con un club" (`tieneclub`) y datos Zona/Experiencia; el detalle lista sus entrenamientos (llevan a `/entrenamientos/:id`) y el CV si tiene. **Jugadores** debería usar esta misma variante.

## 6. Landing (`src/info/InfoView.jsx`, rutas `/` sin sesión, `/info`, `/landing`)

- **Hero a pantalla completa**: a la izquierda (alineado al borde de la página) "Bienvenidos / a la cancha.", la bajada "SportLink es la red profesional del deporte. Hay un lugar para cada uno:", tres filas de rol (Jugador / Entrenador / Club) de ~56px y los botones "Registrarse" + "Ya tengo cuenta".
- A la derecha, **cuadro de imagen desde el 50% del ancho hasta el borde derecho, todo el alto de la primera pantalla**. Rota cada 6 s y cambia **solo con clic** en un rol (no con hover). Transición: cortina con `clip-path`, sin escalar la foto. Barra cian de 3px en la fila activa marca el tiempo.
- Sobre la foto: arriba la descripción del rol (con velo), abajo 4 cuadros con funciones del rol y botón "Registrarse como {rol}" abajo a la derecha (corrido 72px por el botón flotante del chatbot). Sin degradé de borde entre fondo e imagen.
- Luego: tablero de pruebas abiertas (sección tinta, `GET /api/pruebas` en vivo con ejemplos marcados si la API no responde), entrenadores destacados (claro, 4 columnas para no agrandar retratos de 288px + tarjeta "¿Sos entrenador?"), calendario (tinta, captura real de la app) y cierre con foto de la sede de Atlanta + "Armá tu perfil.".

## 7. Header compartido (`src/header/header.jsx` + `header.css`)

- `vistaMigrada` decide qué rutas usan la piel nueva y muestran el botón de tema. **Al migrar una vista, agregar su ruta ahí** (y `startsWith('/ruta/')` si tiene subrutas).
- Variantes: `.header--light` (fondo ground plano, sin blur ni borde, logo negro, "Registrarse" cian recto) y `.header--dark` (fondo `#0e1011`, logo original). Las vistas no migradas siguen con el header oscuro viejo.

---

## 8. Trampas conocidas (leer antes de tocar CSS)

- **`src/landing/landing.css`** (landing vieja, se carga globalmente por la ruta `/landing-old`) filtra reglas a TODO el sitio: `font-family … !important` en h1-h3/p/span/li/button, `p { color: #b0b0b0 }`, `section { padding: 100px 6% }`, `button { text-transform: uppercase; overflow: hidden }` + overlay `button::after`, `main { animation: blur }`. Cada vista migrada lo neutraliza al principio de su CSS (copiar el bloque de `PruebasView.css`: `:is(.pr, .pr-overlay) :where(…)`, `main:has(> .pr) { animation: none }`) y **las secciones deben declarar `padding` completo** (no solo `padding-top`).
- `index.css` estiliza todos los `select` en oscuro con `!important`: dentro de las vistas nuevas hay que pisarlo con mayor especificidad.
- Componentes compartidos con vistas viejas (`CustomSelect`, `InputDireccionOSM`, `DetalleEntrenamiento`, `ModalConfirmacionInscripcion`, `ModalConfirmarEliminar`, `ModalContactoEntrenador`): **no reescribirlos para una sola vista**; adaptarlos solo dentro del modal nuevo (`.pr-modal--form …`, `.pr-modal--detalle …`, con `!important` si traen estilos en línea). Los tres modales de confirmación/contacto siguen con estilo viejo: pendiente.
- La API devuelve `prueba.club` / `prueba.deporte` (no `clubes`/`deportes`). Entrenamientos sí trae `deportes`, `entrenadores`, `clubes`.
- El backend necesita `.env` (Supabase) para correr; si no está, verificar con datos simulados (ver §9).
- Vite a veces sirve módulos viejos por diferencia de mayúsculas en la ruta (`Sportlink-v2` vs `sportlink-v2`): si un cambio de JSX no aparece, reiniciar el servidor de desarrollo.

## 9. Cómo verificar

- `npm run build` y `npx eslint <archivos tocados>` (comparar contra los avisos que ya tenía el archivo; no agregar nuevos).
- Capturas reales en 1440×900, 1280×720, 1920×1080 y 390×844, **en claro y en oscuro**, revisando: título ≤ 2 líneas, alineación con el borde de la página, que nada desborde, estados (vacío, carga, completo, inscripto, dueño).
- Herramienta incluida: `herramientas/capturas.mjs` (Edge/Chrome headless por CDP, captura en tiempo real y **simula la API** con un JSON). Uso:
  ```
  MOCK=herramientas/mock-ejemplo.json SETUP="localStorage.setItem('slk-tema','oscuro')" node herramientas/capturas.mjs http://localhost:5173/pruebas 1440 900 salida/captura 3000
  ```
  `SETUP` corre antes de cargar (sirve para simular sesión: `localStorage.setItem('usuario', JSON.stringify({...}))` + `token`).

## 10. Checklist para migrar una vista

1. Leer la vista vieja entera y anotar **todas** sus funciones (no se pierde ninguna).
2. Mantener la lógica; reescribir el render con las clases `pr-*` (o crear `XxxView.css` propio que importe/reutilice `PruebasView.css`).
3. Neutralizar las reglas globales filtradas (§8) y declarar `padding` completo en secciones.
4. Agregar la ruta a `vistaMigrada` del header.
5. Probar claro/oscuro, los 4 anchos y los roles (visitante, jugador, entrenador, club, admin).
6. Borrar componentes/CSS que hayan quedado sin uso (solo si nadie más los importa).
7. Mostrarle la vista al dueño y esperar su OK antes de la siguiente.
