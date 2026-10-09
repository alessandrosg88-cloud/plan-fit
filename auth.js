/* Plan Fit · inicio de sesión (Firebase), sincronización y aviso de cookies */
(function(){
/* ▼ Pega aquí la configuración de tu proyecto de Firebase (no es secreta) */
const firebaseConfig = {
  apiKey: "AIzaSyCZq1R4mB1VqxcbktBjWWPDDR_13fmcu9E",
  authDomain: "plan-fit-561f5.firebaseapp.com",
  projectId: "plan-fit-561f5",
  storageBucket: "plan-fit-561f5.firebasestorage.app",
  messagingSenderId: "41807598210",
  appId: "1:41807598210:web:c0dd19ef4163629eb5da9b"
};
/* ▲ */

const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const TX = {
  login:["Iniciar sesión","Sign in","Inloggen","Accedi"],
  synced:["Sincronizado","Synced","Gesynchroniseerd","Sincronizzato"],
  syncing:["Sincronizando…","Syncing…","Synchroniseren…","Sincronizzazione…"],
  account:["Tu cuenta","Your account","Je account","Il tuo account"],
  cookieText:["Usamos solo almacenamiento necesario en tu navegador (para guardar tu plan y, si inicias sesión, mantener tu sesión). No usamos cookies de publicidad ni de analítica.","We only use necessary storage in your browser (to save your plan and, if you sign in, keep you signed in). No advertising or analytics cookies.","We gebruiken alleen noodzakelijke opslag in je browser (om je plan te bewaren en, als je inlogt, je sessie). Geen advertentie- of analysecookies.","Usiamo solo archiviazione necessaria nel browser (per salvare il piano e, se accedi, mantenere la sessione). Nessun cookie pubblicitario o di analisi."],
  cookieOk:["Entendido","Got it","Begrepen","Ho capito"],
  more:["Más información","Learn more","Meer info","Maggiori info"],
  privacy:["Privacidad","Privacy","Privacy","Privacy"],
  cookies:["Cookies","Cookies","Cookies","Cookie"],
  terms:["Términos","Terms","Voorwaarden","Termini"]
};
const li = () => Math.max(0, ["es","en","nl","it"].indexOf(state.lang));
const tx = k => TX[k][li()];
const el = (tag, attrs={}, html="") => { const e = document.createElement(tag); Object.assign(e, attrs); if(html) e.innerHTML = html; return e; };

/* ---------- estilos ---------- */
document.head.appendChild(el("style", {}, `
.authbar{display:flex;gap:8px;align-items:center;justify-content:flex-end;flex-wrap:wrap;margin-bottom:8px;font-size:13px;color:var(--muted)}
.authbar .authlink{padding:5px 12px;font-size:13px;border-radius:10px;font-weight:600;text-decoration:none;display:inline-block}
.auth-form{display:grid;gap:10px;margin-top:6px}
.auth-form input{width:100%;box-sizing:border-box}
.auth-form .two{display:flex;gap:8px;flex-wrap:wrap}.auth-form .two button{flex:1}
.auth-sep{text-align:center;color:var(--muted);font-size:13px;margin:6px 0}
.auth-msg{font-size:13px;color:var(--warn);min-height:1em;margin:0}
.linkbtn{background:none;border:none;padding:0;color:var(--accent);font-weight:500;text-decoration:underline;cursor:pointer;font-size:13px}
.cookiebar{position:fixed;left:16px;right:16px;bottom:16px;max-width:640px;margin:0 auto;background:var(--surface);color:var(--text);border:1px solid var(--line);border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.18);padding:14px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;z-index:50;font-size:13.5px}
.cookiebar p{margin:0;flex:1 1 260px}
.cookiebar a,.legal a,.auth-agree a{color:var(--accent)}
.legal{margin-top:10px;display:flex;gap:14px;justify-content:center;flex-wrap:wrap;font-size:12.5px}
.auth-agree{font-size:12px;color:var(--muted);margin:4px 0 0}
@media print{.authbar,.cookiebar,.legal{display:none}}
`));

/* ---------- pie: enlaces legales ---------- */
const legal = el("div", {className:"legal"});
document.querySelector("footer").after(legal);

/* ---------- aviso de cookies ---------- */
let cookieBar = null;
function showCookies(){
  if(cookieBar) cookieBar.remove();
  cookieBar = el("div", {className:"cookiebar", role:"region"});
  cookieBar.setAttribute("aria-label", tx("cookies"));
  cookieBar.innerHTML = `<p>${tx("cookieText")} <a href="privacidad.html#cookies">${tx("more")}</a></p><button class="primary small">${tx("cookieOk")}</button>`;
  cookieBar.querySelector("button").onclick = () => { try{ localStorage.setItem("planfit_cookies", "ok"); }catch(e){} cookieBar.remove(); cookieBar = null; };
  document.body.appendChild(cookieBar);
}
let seen = false; try{ seen = localStorage.getItem("planfit_cookies") === "ok"; }catch(e){}
if(!seen) showCookies();

/* ---------- barra de cuenta + diálogo ---------- */
const bar = el("div", {className:"authbar", id:"authbar"});
document.getElementById("langs").after(bar);
let auth = null, db = null, user = null, syncing = false, pushTimer = null, applying = false;

function render(){
  legal.innerHTML = `<a href="privacidad.html">${tx("privacy")}</a><a href="privacidad.html#cookies">${tx("cookies")}</a><a href="terminos.html">${tx("terms")}</a><button class="linkbtn" id="cookieSet">⚙ ${tx("cookies")}</button>`;
  legal.querySelector("#cookieSet").onclick = showCookies;
  if(cookieBar) showCookies();
  if(!auth){ bar.innerHTML = ""; return; }
  bar.innerHTML = user
    ? `<span>☁ ${syncing ? tx("syncing") : tx("synced")} · ${esc(user.email || user.displayName || "")}</span><a class="ghost authlink" href="login.html">${tx("account")}</a>`
    : `<a class="primary authlink" href="login.html">${tx("login")}</a>`;
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- sincronización ---------- */
const SYNC_KEYS = ["diet","goal","protein","kcal","meals","dislikes","favs","custom","customFav","start","seed","closed","done","budget","country"];
const pick = () => { const o = {}; SYNC_KEYS.forEach(k => { if(state[k] !== undefined) o[k] = state[k]; }); return o; };

function applyCloud(data){
  applying = true;
  SYNC_KEYS.forEach(k => { if(data[k] !== undefined) state[k] = data[k]; });
  try { localStorage.setItem("planfit", JSON.stringify(state)); } catch(e){}
  buildForm();
  [["custom","custom"],["customFav","customFav"],["start","start"],["budget","budget"],["kcalTarget","kcal"]]
    .forEach(([id,k]) => { const i = document.getElementById(id); if(i) i.value = state[k] || ""; });
  run();
  applying = false;
}
function push(){
  if(!user || applying) return;
  clearTimeout(pushTimer);
  syncing = true; render();
  pushTimer = setTimeout(() => {
    db.collection("users").doc(user.uid).set({plan: JSON.stringify(pick()), updated: firebase.firestore.FieldValue.serverTimestamp()})
      .then(() => { syncing = false; render(); }).catch(() => { syncing = false; render(); });
  }, 800);
}

/* engancharse a funciones del script principal */
const _save = save;
save = function(){ _save(); push(); };
const _build = buildForm;
buildForm = function(){ _build(); render(); };

function loadScript(src){ return new Promise((ok, ko) => { const s = el("script", {src}); s.onload = ok; s.onerror = ko; document.head.appendChild(s); }); }

async function init(){
  render();
  if(!firebaseConfig) return;
  try {
    await loadScript(SDK + "firebase-app-compat.js");
    await Promise.all([loadScript(SDK + "firebase-auth-compat.js"), loadScript(SDK + "firebase-firestore-compat.js")]);
  } catch(e){ return; }
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth(); db = firebase.firestore();
  auth.useDeviceLanguage();
  auth.onAuthStateChanged(async u => {
    user = u; render();
    if(!u) return;
    try {
      const snap = await db.collection("users").doc(u.uid).get();
      if(snap.exists && snap.data().plan) applyCloud(JSON.parse(snap.data().plan));
      else push();
    } catch(e){}
    render();
  });
}
init();
})();
