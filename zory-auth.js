const FB = 'https://www.gstatic.com/firebasejs/11.10.0/';
const CONFIG = {
  apiKey: 'AIzaSyCoIVVXK3csLvtg9E7wDCjGt--fam_szzQ',
  authDomain: 'admin-de-zory.firebaseapp.com',
  projectId: 'admin-de-zory',
  storageBucket: 'admin-de-zory.firebasestorage.app',
  messagingSenderId: '199468715480',
  appId: '1:199468715480:web:2a7a188258237c0b5db6ad',
};
const ESTADOS = { pendiente: 'Pendiente', confirmado: 'Confirmado', en_camino: 'En camino', entregado: 'Entregado' };

let SDK = null, auth = null, fs = null;
let user = null;
let perfil = { nombre: '', telefono: '', direcciones: [], pedidos: [] };
let listo = false;       // ya se sabe si hay sesión o no
let overlay = null;
let tab = 'perfil';
let mensaje = '';
let ocupado = false;

/* ---------- utilidades ---------- */
const $ = (tag, attrs = {}, ...hijos) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const h of hijos.flat()) if (h != null && h !== false) e.append(h.nodeType ? h : document.createTextNode(String(h)));
  return e;
};
const gs = (n) => 'Gs. ' + Number(n || 0).toLocaleString('es-PY');
const primerNombre = () => String(perfil.nombre || (user && user.displayName) || '').trim().split(/\s+/)[0] || 'Mi cuenta';
const norm = (s) => String(s || '').toLowerCase().trim();

const ICON_USER = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
const ICON_G = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3A12 12 0 1 1 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7A20 20 0 1 0 44 24c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5C9.5 39.5 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>';

/* ---------- estilos ---------- */
const css = `
.zy-btn{display:inline-flex;align-items:center;gap:6px;background:#fff;color:#F85800;border:0;border-radius:12px;padding:9px 11px;font:800 12px/1 'Plus Jakarta Sans',system-ui,sans-serif;cursor:pointer;max-width:130px;box-shadow:0 4px 10px rgba(124,45,18,.22);transition:background .15s,transform .15s}
.zy-btn:hover{background:#FFF4EC}.zy-btn:active{transform:scale(.96)}
/* El carrito de arriba se oculta: queda el botón de carrito de la barra inferior */
header .zh-cart{display:none!important}
.zy-btn img{width:22px;height:22px;border-radius:9999px;object-fit:cover;flex:none}
.zy-btn span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.zy-btn .zy-txt{display:none}
@media (min-width:430px){.zy-btn .zy-txt{display:inline}}
.zy-ov{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.6);backdrop-filter:blur(3px);display:flex;align-items:flex-end;justify-content:center;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
@media (min-width:560px){.zy-ov{align-items:center}}
.zy-card{background:#fff;width:100%;max-width:440px;max-height:92vh;overflow-y:auto;border-radius:28px 28px 0 0;padding:22px 20px 26px;color:#111827;box-shadow:0 20px 60px rgba(0,0,0,.35)}
@media (min-width:560px){.zy-card{border-radius:28px}}
.zy-x{float:right;border:0;background:#f3f4f6;width:32px;height:32px;border-radius:9999px;font-size:16px;cursor:pointer}
.zy-logo{width:56px;height:56px;border-radius:18px;background:#F85800;color:#fff;font:800 30px/56px 'Poppins',sans-serif;text-align:center;margin:4px auto 10px}
.zy-h{font:800 21px 'Poppins',sans-serif;text-align:center;margin:0}
.zy-p{font-size:13px;color:#6b7280;text-align:center;margin:6px 0 18px}
.zy-g{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;background:#fff;border:1.5px solid #e5e7eb;border-radius:16px;padding:13px;font:700 14px 'Plus Jakarta Sans',sans-serif;cursor:pointer;color:#111827}
.zy-g:hover{border-color:#F85800;background:#FFF4EC}
.zy-g[disabled]{opacity:.6;cursor:wait}
.zy-msg{background:#FFF4EC;color:#B23F00;border-radius:12px;padding:9px 12px;font-size:12px;margin:12px 0 0;font-weight:600}
.zy-user{display:flex;align-items:center;gap:12px;margin:2px 0 14px}
.zy-user img,.zy-user .zy-ini{width:52px;height:52px;border-radius:9999px;object-fit:cover;background:#F85800;color:#fff;font:800 22px/52px 'Poppins',sans-serif;text-align:center;flex:none}
.zy-user b{display:block;font-size:15px}.zy-user small{color:#6b7280;font-size:12px;word-break:break-all}
.zy-tabs{display:flex;gap:6px;background:#FFF4EC;border-radius:14px;padding:4px;margin-bottom:14px}
.zy-tabs button{flex:1;border:0;background:transparent;border-radius:11px;padding:9px;font:700 13px 'Plus Jakarta Sans',sans-serif;color:#B23F00;cursor:pointer}
.zy-tabs button.on{background:#F85800;color:#fff}
.zy-l{display:block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#6b7280;margin:12px 0 5px}
.zy-i{width:100%;box-sizing:border-box;border:1.5px solid #e5e7eb;border-radius:12px;padding:11px 12px;font:500 14px 'Plus Jakarta Sans',sans-serif;outline:none;background:#fafafa}
.zy-i:focus{border-color:#F85800;background:#fff}
.zy-dir{display:flex;align-items:center;gap:8px;background:#fafafa;border:1px solid #f0e4da;border-radius:12px;padding:9px 10px;margin-bottom:6px;font-size:13px}
.zy-dir em{font-style:normal;font-weight:800;color:#F85800;font-size:11px;text-transform:uppercase;flex:none}
.zy-dir span{flex:1;word-break:break-word}
.zy-dir button{border:0;background:transparent;color:#9ca3af;font-size:16px;cursor:pointer}
.zy-row{display:flex;gap:6px}.zy-row .zy-i:first-child{flex:0 0 32%}
.zy-add{border:0;background:#FFE6D5;color:#B23F00;border-radius:12px;padding:0 14px;font:800 13px 'Plus Jakarta Sans',sans-serif;cursor:pointer}
.zy-save{width:100%;margin-top:16px;border:0;background:#F85800;color:#fff;border-radius:16px;padding:14px;font:800 14px 'Plus Jakarta Sans',sans-serif;cursor:pointer;box-shadow:0 6px 16px rgba(248,88,0,.3)}
.zy-save:hover{background:#D94E00}
.zy-out{display:block;margin:14px auto 0;border:0;background:transparent;color:#6b7280;font:600 12px 'Plus Jakarta Sans',sans-serif;text-decoration:underline;cursor:pointer}
.zy-ped{border:1px solid #f0e4da;border-radius:14px;padding:11px 12px;margin-bottom:8px;font-size:13px}
.zy-ped header{display:flex;justify-content:space-between;gap:8px;font-weight:800}
.zy-ped small{color:#6b7280;display:block;margin-top:3px}
.zy-est{background:#FFE6D5;color:#B23F00;border-radius:9999px;padding:2px 8px;font-size:10px;font-weight:800;text-transform:uppercase;align-self:flex-start}
.zy-vacio{text-align:center;color:#6b7280;font-size:13px;padding:22px 0}
.zy-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 2px}
.zy-chips button{border:1px solid #FFCDAA;background:#FFF4EC;color:#B23F00;border-radius:9999px;padding:5px 10px;font:700 11px 'Plus Jakarta Sans',sans-serif;cursor:pointer}
.zy-chips button:hover{background:#F85800;color:#fff}
`;
document.head.append($('style', {}, css));

/* ---------- botón en el encabezado ---------- */
const btn = $('button', { class: 'zy-btn', type: 'button', 'aria-label': 'Mi cuenta', onclick: () => abrir() });
function pintarBoton() {
  btn.replaceChildren();
  if (user) {
    if (user.photoURL) {
      const im = $('img', { src: user.photoURL, alt: '', referrerpolicy: 'no-referrer' });
      im.onerror = () => { im.remove(); btn.prepend(Object.assign($('span', {}), { innerHTML: ICON_USER })); };
      btn.append(im);
    } else btn.insertAdjacentHTML('afterbegin', ICON_USER);
    btn.append($('span', {}, primerNombre()));
  } else {
    btn.insertAdjacentHTML('afterbegin', ICON_USER);
    btn.append($('span', { class: 'zy-txt' }, 'Ingresar'));
  }
}
let montando = false;
function montar() {
  if (montando) return;
  montando = true;
  requestAnimationFrame(() => {
    montando = false;
    const cart = document.querySelector('header .zh-cart');
    const host = cart && cart.parentElement;
    if (host && btn.parentElement !== host) host.append(btn);
  });
}
new MutationObserver(() => { montar(); prellenar(); }).observe(document.body, { childList: true, subtree: true });
pintarBoton();

/* ---------- modal ---------- */
function cerrar() { if (overlay) { overlay.remove(); overlay = null; } }
function abrir() { mensaje = ''; if (!listo && !user) mensaje = ''; pintarModal(); }
function pintarModal() {
  cerrar();
  overlay = $('div', { class: 'zy-ov', onclick: (e) => { if (e.target === overlay) cerrar(); } });
  const card = $('div', { class: 'zy-card', role: 'dialog', 'aria-modal': 'true' });
  card.append($('button', { class: 'zy-x', type: 'button', 'aria-label': 'Cerrar', onclick: cerrar }, '✕'));
  card.append(user ? vistaPerfil() : vistaLogin());
  overlay.append(card);
  document.body.append(overlay);
}

function vistaLogin() {
  const g = $('button', { class: 'zy-g', type: 'button', onclick: loginGoogle });
  g.insertAdjacentHTML('afterbegin', ICON_G);
  g.append(document.createTextNode(ocupado ? 'Conectando…' : 'Continuar con Google'));
  if (ocupado) g.setAttribute('disabled', '');
  return $('div', {},
    $('div', { class: 'zy-logo' }, 'Z'),
    $('h3', { class: 'zy-h' }, 'Ingresá a Zory'),
    $('p', { class: 'zy-p' }, 'Guardá tus datos, tus direcciones y el historial de tus pedidos. Pedir sin cuenta sigue siendo posible.'),
    g,
    mensaje ? $('div', { class: 'zy-msg' }, mensaje) : null);
}

function vistaPerfil() {
  const ini = primerNombre().charAt(0).toUpperCase();
  const cab = $('div', { class: 'zy-user' },
    user.photoURL ? $('img', { src: user.photoURL, alt: '', referrerpolicy: 'no-referrer' }) : $('div', { class: 'zy-ini' }, ini),
    $('div', {}, $('b', {}, perfil.nombre || user.displayName || 'Mi cuenta'), $('small', {}, user.email || '')));
  const tabs = $('div', { class: 'zy-tabs' },
    $('button', { type: 'button', class: tab === 'perfil' ? 'on' : '', onclick: () => { tab = 'perfil'; mensaje = ''; pintarModal(); } }, 'Mi perfil'),
    $('button', { type: 'button', class: tab === 'pedidos' ? 'on' : '', onclick: () => { tab = 'pedidos'; mensaje = ''; pintarModal(); } }, 'Mis pedidos'));
  return $('div', {}, cab, tabs, tab === 'perfil' ? formPerfil() : listaPedidos(),
    $('button', { class: 'zy-out', type: 'button', onclick: salir }, 'Cerrar sesión'));
}

function formPerfil() {
  const nombre = $('input', { class: 'zy-i', id: 'zy-nombre', value: perfil.nombre || user.displayName || '', placeholder: 'Tu nombre', autocomplete: 'name' });
  const tel = $('input', { class: 'zy-i', id: 'zy-tel', value: perfil.telefono || '', placeholder: 'Ej: 0982 123 456', inputmode: 'tel', autocomplete: 'tel' });
  const dirs = $('div', {});
  const pintarDirs = () => {
    dirs.replaceChildren();
    if (!perfil.direcciones.length) dirs.append($('div', { class: 'zy-vacio', style: 'padding:6px 0' }, 'Todavía no guardaste direcciones.'));
    perfil.direcciones.forEach((d, i) => dirs.append($('div', { class: 'zy-dir' },
      $('em', {}, d.etiqueta || 'Dirección'), $('span', {}, d.texto),
      $('button', { type: 'button', 'aria-label': 'Quitar dirección', onclick: () => { perfil.direcciones.splice(i, 1); pintarDirs(); } }, '✕'))));
  };
  pintarDirs();
  const et = $('input', { class: 'zy-i', placeholder: 'Casa', maxlength: '20' });
  const tx = $('input', { class: 'zy-i', placeholder: 'Barrio, calle, referencia…', maxlength: '160' });
  const agregar = () => {
    const texto = tx.value.trim();
    if (!texto) return;
    if (perfil.direcciones.length >= 8) { mensaje = 'Máximo 8 direcciones.'; return pintarModal(); }
    perfil.direcciones.push({ id: String(Date.now()), etiqueta: et.value.trim() || 'Casa', texto });
    et.value = ''; tx.value = ''; pintarDirs();
  };
  const guardar = $('button', { class: 'zy-save', type: 'button', onclick: async () => {
    perfil.nombre = nombre.value.trim();
    perfil.telefono = tel.value.trim();
    if (tx.value.trim()) agregar();
    const ok = await guardarPerfil();
    mensaje = ok ? '¡Listo! Tus datos quedaron guardados.' : 'No se pudo guardar. Probá de nuevo.';
    pintarModal();
  } }, 'Guardar mis datos');
  return $('div', {},
    $('label', { class: 'zy-l', for: 'zy-nombre' }, 'Nombre'), nombre,
    $('label', { class: 'zy-l', for: 'zy-tel' }, 'Teléfono / WhatsApp'), tel,
    $('label', { class: 'zy-l' }, 'Direcciones de entrega'), dirs,
    $('div', { class: 'zy-row' }, et, tx, $('button', { class: 'zy-add', type: 'button', onclick: agregar }, '+')),
    guardar, mensaje ? $('div', { class: 'zy-msg' }, mensaje) : null);
}

/* ---------- historial ---------- */
let pedidos = null;
function listaPedidos() {
  const cont = $('div', {}, $('div', { class: 'zy-vacio' }, 'Cargando tus pedidos…'));
  cargarPedidos().then((lista) => {
    cont.replaceChildren();
    if (!lista.length) { cont.append($('div', { class: 'zy-vacio' }, 'Todavía no hiciste pedidos con esta cuenta.')); return; }
    for (const p of lista) {
      const n = (p.productos || []).reduce((a, x) => a + (Number(x.cantidad) || 0), 0);
      cont.append($('div', { class: 'zy-ped' },
        $('header', {}, $('span', {}, p.tienda || 'Pedido'), $('span', {}, gs(p.total))),
        $('small', {}, `${fecha(p)} · ${n} producto${n === 1 ? '' : 's'}`),
        $('small', {}, (p.productos || []).map((x) => `${x.cantidad}× ${x.nombre}`).join(', ')),
        $('div', { style: 'margin-top:6px;display:flex' }, $('span', { class: 'zy-est' }, ESTADOS[p.estado] || 'Enviado'))));
    }
  });
  return cont;
}
function fecha(p) {
  try {
    const c = p.creado;
    const d = c && c.toDate ? c.toDate() : c ? new Date(c) : null;
    if (d && !isNaN(d)) return d.toLocaleString('es-PY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch (e) { /* sigue */ }
  return p.hora || '';
}
function enMillis(p) { const c = p.creado; try { return c && c.toMillis ? c.toMillis() : c ? new Date(c).getTime() : 0; } catch (e) { return 0; } }
async function cargarPedidos() {
  let lista = [];
  try {
    const { f } = SDK;
    const snap = await f.getDocs(f.query(f.collection(fs, 'pedidos'), f.where('uid', '==', user.uid)));
    snap.forEach((d) => lista.push({ ...d.data(), _id: d.id }));
  } catch (e) {
    console.warn('No se pudo leer el historial de Firestore, se muestra el de este dispositivo:', e);
    lista = [];
  }
  // Pedidos guardados dentro del perfil del cliente (funcionan aunque las reglas de 'pedidos' no permitan leer)
  const propios = Array.isArray(perfil.pedidos) ? perfil.pedidos.slice() : [];
  const iguales = (a, b) => norm(a.tienda) === norm(b.tienda) && Number(a.total) === Number(b.total) && Math.abs(enMillis(a) - enMillis(b)) < 180000;
  const todos = lista.slice();
  for (const m of propios) if (!todos.some((x) => iguales(x, m))) todos.push(m);
  return todos.sort((a, b) => enMillis(b) - enMillis(a)).slice(0, 30);
}

/* ---------- perfil en Firestore ---------- */
async function leerPerfil() {
  perfil = { nombre: '', telefono: '', direcciones: [], pedidos: [] };
  try {
    const { f } = SDK;
    const s = await f.getDoc(f.doc(fs, 'clientes', user.uid));
    if (s.exists()) {
      const d = s.data();
      perfil = { nombre: d.nombre || '', telefono: d.telefono || '', direcciones: Array.isArray(d.direcciones) ? d.direcciones : [], pedidos: Array.isArray(d.pedidos) ? d.pedidos : [] };
    }
  } catch (e) { console.warn('No se pudo leer el perfil:', e); }
  if (!perfil.nombre && user.displayName) perfil.nombre = user.displayName;
}
async function guardarPerfil() {
  if (!user) return false;
  try {
    const { f } = SDK;
    await f.setDoc(f.doc(fs, 'clientes', user.uid), {
      nombre: perfil.nombre || '', telefono: perfil.telefono || '', direcciones: perfil.direcciones || [], pedidos: perfil.pedidos || [],
      email: user.email || '', foto: user.photoURL || '', actualizado: new Date().toISOString(),
    }, { merge: true });
    pintarBoton();
    return true;
  } catch (e) { console.error('No se pudo guardar el perfil:', e); return false; }
}

/* ---------- sesión ---------- */
async function cargarSDK() {
  if (SDK) return SDK;
  const [app, a, f] = await Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js'), import(FB + 'firebase-firestore.js')]);
  const inst = app.initializeApp(CONFIG, 'zory-clientes');
  auth = a.getAuth(inst);
  fs = f.getFirestore(inst);
  SDK = { app, a, f };
  return SDK;
}
async function loginGoogle() {
  if (ocupado) return;
  ocupado = true; mensaje = ''; pintarModal();
  try {
    await cargarSDK();
    const { a } = SDK;
    const prov = new a.GoogleAuthProvider();
    prov.setCustomParameters({ prompt: 'select_account' });
    try {
      await a.signInWithPopup(auth, prov);
    } catch (e) {
      if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) {
        await a.signInWithRedirect(auth, prov); return;
      }
      throw e;
    }
  } catch (e) {
    console.error('Error de login:', e);
    const c = e && e.code;
    mensaje = c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request' ? 'Cerraste la ventana de Google. Probá de nuevo.'
      : c === 'auth/unauthorized-domain' ? 'Este sitio todavía no está autorizado en Firebase (Authentication → Configuración → Dominios autorizados).'
      : c === 'auth/operation-not-allowed' ? 'El ingreso con Google no está activado en Firebase (Authentication → Método de acceso).'
      : 'No se pudo iniciar sesión. Probá de nuevo.';
  }
  ocupado = false;
  if (overlay && !user) pintarModal();
}
async function salir() {
  try { await SDK.a.signOut(auth); } catch (e) { console.error(e); }
  cerrar();
}
function exponer() {
  window.zoryUser = user ? { uid: user.uid, email: user.email || '', nombre: perfil.nombre || user.displayName || '', foto: user.photoURL || '' } : null;
  window.dispatchEvent(new CustomEvent('zory-auth', { detail: window.zoryUser }));
}
async function iniciar() {
  try {
    await cargarSDK();
  } catch (e) { console.warn('Firebase Auth no se pudo cargar:', e); listo = true; return; }
  SDK.a.onAuthStateChanged(auth, async (u) => {
    user = u || null;
    if (user) await leerPerfil(); else perfil = { nombre: '', telefono: '', direcciones: [], pedidos: [] };
    listo = true;
    exponer(); pintarBoton();
    if (overlay) { if (user) { tab = 'perfil'; mensaje = ''; } pintarModal(); }
    prellenar();
  });
}
// Se carga con un pequeño retraso para no frenar la primera pantalla
if (document.readyState === 'complete') setTimeout(iniciar, 400); else window.addEventListener('load', () => setTimeout(iniciar, 400));

/* ---------- autocompletar el formulario del carrito ---------- */
function setValor(input, v) {
  const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value').set;
  set.call(input, v);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
function prellenar() {
  if (!user) return;
  document.querySelectorAll('input,textarea').forEach((i) => {
    if (i.dataset.zy) return;
    const ph = i.getAttribute('placeholder') || '';
    if (ph === 'Ej: Juan Pérez') {
      i.dataset.zy = '1'; if (!i.value && perfil.nombre) setValor(i, perfil.nombre);
    } else if (ph === 'Ej: 0982 123 456') {
      i.dataset.zy = '1'; if (!i.value && perfil.telefono) setValor(i, perfil.telefono);
    } else if (ph.startsWith('Ej: Barrio San José')) {
      i.dataset.zy = '1';
      const dirs = perfil.direcciones || [];
      if (!i.value && dirs[0]) setValor(i, dirs[0].texto);
      if (dirs.length > 1 || (dirs.length === 1 && i.value !== dirs[0].texto)) {
        const chips = $('div', { class: 'zy-chips' }, dirs.map((d) => $('button', { type: 'button', onclick: () => setValor(i, d.texto) }, d.etiqueta || 'Dirección')));
        i.insertAdjacentElement('afterend', chips);
      }
    }
  });
}

/* ---------- guardar datos del último pedido en el perfil ---------- */
const setItemOriginal = Storage.prototype.setItem;
Storage.prototype.setItem = function (k, v) {
  setItemOriginal.apply(this, arguments);
  if (k === 'zori_orders_history' && this === window.localStorage) {
    try { alPedir(JSON.parse(v)[0]); } catch (e) { /* ignorar */ }
  }
};
async function alPedir(o) {
  if (!user || !o) return;
  let cambio = false;
  // guardar un resumen del pedido en el perfil (historial del cliente, en cualquier dispositivo)
  perfil.pedidos = Array.isArray(perfil.pedidos) ? perfil.pedidos : [];
  const idp = o.id || ('p' + Date.now());
  if (!perfil.pedidos.some((x) => x.id === idp)) {
    perfil.pedidos.unshift({
      id: idp, tienda: o.tienda || '', total: Number(o.total) || 0, estado: o.estado || 'pendiente', hora: o.hora || '',
      creado: o.creado || new Date().toISOString(),
      productos: (o.productos || []).map((x) => ({ cantidad: x.cantidad, nombre: x.nombre })),
    });
    perfil.pedidos = perfil.pedidos.slice(0, 30); cambio = true;
  }
  if (!perfil.nombre && o.cliente) { perfil.nombre = o.cliente; cambio = true; }
  if (!perfil.telefono && o.telefono) { perfil.telefono = o.telefono; cambio = true; }
  const dir = String(o.direccion || '').trim();
  if (dir && !perfil.direcciones.some((d) => norm(d.texto) === norm(dir)) && perfil.direcciones.length < 8) {
    perfil.direcciones.push({ id: String(Date.now()), etiqueta: perfil.direcciones.length ? 'Reciente' : 'Casa', texto: dir }); cambio = true;
  }
  if (cambio) await guardarPerfil();
}
