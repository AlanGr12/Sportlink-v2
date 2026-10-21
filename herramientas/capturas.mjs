// Capturas reales de la app para verificar diseño (ver DISENO.md §9).
// Uso: node herramientas/capturas.mjs <url> <ancho> <alto> <salida-prefijo> <ms1,ms2,...> [js-después-de-cargar]
//   MOCK=archivo.json  → responde la API local (localhost:3000) con datos de ejemplo
//                       (claves: pruebas, inscritos, entrenamientos, inscritosEntr, perfil, rutas{'/api/x': respuesta})
//   SETUP="js"         → corre antes de cada carga (tema, sesión simulada en localStorage)
//   BROWSER=ruta       → ejecutable de Edge/Chrome (por defecto Edge en Windows)
// Abre el navegador headless por CDP y captura el viewport en tiempo real en cada instante pedido.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, w, h, out, times, pre] = process.argv.slice(2);
const EDGE = process.env.BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9333 + Math.floor(Math.random() * 500);
const prof = mkdtempSync(join(tmpdir(), 'edgecdp-'));
const proc = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--hide-scrollbars', `--window-size=${w},${h}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let tabs;
for (let i = 0; i < 40; i++) {
  try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (tabs.length) break; } catch {}
  await sleep(250);
}
const page = tabs.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

// Opcional: MOCK=archivo.json responde la API local; SETUP=js corre antes de cada carga
if (process.env.MOCK) {
  const { readFileSync } = await import('node:fs');
  const mock = JSON.parse(readFileSync(process.env.MOCK, 'utf8'));
  await send('Fetch.enable', { patterns: [{ urlPattern: '*localhost:3000/*' }] });
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data);
    if (d.method !== 'Fetch.requestPaused') return;
    const u = new URL(d.params.request.url);
    let body = [];
    if (mock.rutas && u.pathname in mock.rutas) body = mock.rutas[u.pathname];
    else if (u.pathname === '/api/pruebas' || u.pathname === '/api/pruebas/deporte') body = mock.pruebas;
    else if (u.pathname.startsWith('/api/login/perfil')) body = mock.perfil || {};
    else if (['/api/entrenamientos', '/api/entrenamientos/deporte', '/api/entrenamientos/mios'].includes(u.pathname)) body = mock.entrenamientos || [];
    else if (u.pathname === '/api/inscripcionesentrenamientos') {
      const n = mock.inscritosEntr?.[u.searchParams.get('identrenamiento')] ?? 0;
      body = Array.from({ length: n }, (_, i) => ({ idjugador: 900 + i, nombre: 'Jugador', apellido: String(i + 1) }));
    }
    else if (u.pathname === '/api/inscripcionesprueba') {
      const n = mock.inscritos?.[u.searchParams.get('idprueba')] ?? 0;
      body = Array.from({ length: n }, (_, i) => ({ idjugador: 900 + i, idprueba: Number(u.searchParams.get('idprueba')) }));
    }
    const headers = [{ name: 'Content-Type', value: 'application/json' }, { name: 'Access-Control-Allow-Origin', value: '*' }, { name: 'Access-Control-Allow-Headers', value: '*' }];
    send('Fetch.fulfillRequest', { requestId: d.params.requestId, responseCode: 200, responseHeaders: headers, body: Buffer.from(JSON.stringify(body)).toString('base64') });
  });
}
if (process.env.SETUP) await send('Page.addScriptToEvaluateOnNewDocument', { source: process.env.SETUP });
await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 1, mobile: +w < 768 });
await send('Page.enable');
await send('Page.navigate', { url });
await sleep(2500);
if (pre) await send('Runtime.evaluate', { expression: pre, awaitPromise: true });
let t0 = Date.now();
for (const t of times.split(',').map(Number)) {
  await sleep(Math.max(0, t - (Date.now() - t0)));
  const r = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${out}-${t}.png`, Buffer.from(r.data, 'base64'));
}
ws.close(); proc.kill();
console.log('ok');
