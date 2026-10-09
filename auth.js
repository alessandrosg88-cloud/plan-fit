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
  logout:["Cerrar sesión","Sign out","Uitloggen","Esci"],
  synced:["Sincronizado","Synced","Gesynchroniseerd","Sincronizzato"],
  syncing:["Sincronizando…","Syncing…","Synchroniseren…","Sincronizzazione…"],
  account:["Tu cuenta","Your account","Je account","Il tuo account"],
  why:["Inicia sesión para guardar tus preferencias, calorías y días cumplidos en la nube y verlos en todos tus dispositivos.","Sign in to save your preferences, calories and completed days in the cloud and see them on all your devices.","Log in om je voorkeuren, calorieën en voltooide dagen in de cloud op te slaan en op al je apparaten te zien.","Accedi per salvare preferenze, calorie e giorni completati nel cloud e vederli su tutti i tuoi dispositivi."],
  google:["Continuar con Google","Continue with Google","Doorgaan met Google","Continua con Google"],
  or:["o con tu email","or with your email","of met je e-mail","o con la tua email"],
  email:["Email","Email","E-mail","Email"],
  pass:["Contraseña (mín. 6 caracteres)","Password (min. 6 characters)","Wachtwoord (min. 6 tekens)","Password (min. 6 caratteri)"],
  enter:["Entrar","Sign in","Inloggen","Entra"],
  create:["Crear cuenta","Create account","Account aanmaken","Crea account"],
  forgot:["¿Olvidaste la contraseña?","Forgot password?","Wachtwoord vergeten?","Password dimenticata?"],
  resetSent:["Te hemos enviado un email para cambiar la contraseña.","We sent you an email to reset your password.","We hebben je een e-mail gestuurd om je wachtwoord te wijzigen.","Ti abbiamo inviato un'email per reimpostare la password."],
  agree:["Al continuar aceptas los <a href='terminos.html'>Términos</a> y la <a href='privacidad.html'>Política de privacidad</a>.","By continuing you accept the <a href='terminos.html'>Terms</a> and the <a href='privacidad.html'>Privacy policy</a>.","Door verder te gaan accepteer je de <a href='terminos.html'>Voorwaarden</a> en het <a href='privacidad.html'>Privacybeleid</a>.","Continuando accetti i <a href='terminos.html'>Termini</a> e l'<a href='privacidad.html'>Informativa privacy</a>."],
  signedAs:["Has iniciado sesión como","Signed in as","Ingelogd als","Accesso effettuato come"],
  del:["Eliminar mi cuenta y mis datos","Delete my account and data","Mijn account en gegevens verwijderen","Elimina account e dati"],
  delConfirm:["¿Seguro? Se borrarán tu cuenta y los datos guardados en la nube. Los datos de este navegador se mantienen.","Are you sure? Your account and cloud data will be deleted. Data in this browser is kept.","Weet je het zeker? Je account en cloudgegevens worden verwijderd. Gegevens in deze browser blijven.","Sei sicuro? Account e dati nel cloud verranno eliminati. I dati in questo browser restano."],
  deleted:["Cuenta eliminada.","Account deleted.","Account verwijderd.","Account eliminato."],
  relogin:["Por seguridad, vuelve a iniciar sesión y repite la acción.","For security, sign in again and repeat the action.","Log om veiligheidsredenen opnieuw in en herhaal de actie.","Per sicurezza, accedi di nuovo e ripeti l'azione."],
  error:["No se ha podido completar:","Could not complete:","Kon niet voltooien:","Impossibile completare:"],
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
.authbar button{padding:5px 12px;font-size:13px}
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
const dlg = el("dialog", {id:"authDlg"});
dlg.innerHTML = `<div class="dlg-head"><h3 id="authTitle"></h3><button class="ghost" id="authClose" aria-label="✕">✕</button></div><div class="dlg-body" id="authBody"></div>`;
document.body.appendChild(dlg);
dlg.querySelector("#authClose").onclick = () => dlg.close();
dlg.addEventListener("click", e => { if(e.target === dlg) dlg.close(); });

let auth = null, db = null, user = null, syncing = false, pushTimer = null, applying = false;

function render(){
  legal.innerHTML = `<a href="privacidad.html">${tx("privacy")}</a><a href="privacidad.html#cookies">${tx("cookies")}</a><a href="terminos.html">${tx("terms")}</a><button class="linkbtn" id="cookieSet">⚙ ${tx("cookies")}</button>`;
  legal.querySelector("#cookieSet").onclick = showCookies;
  if(cookieBar) showCookies();
  if(!auth){ bar.innerHTML = ""; return; }
  bar.innerHTML = user
    ? `<span>☁ ${syncing ? tx("syncing") : tx("synced")} · ${esc(user.email || user.displayName || "")}</span><button class="ghost" id="authOpen">${tx("account")}</button>`
    : `<button class="primary" id="authOpen">${tx("login")}</button>`;
  bar.querySelector("#authOpen").onclick = openDlg;
  if(dlg.open) openDlg();
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function openDlg(){
  const body = dlg.querySelector("#authBody");
  dlg.querySelector("#authTitle").textContent = user ? tx("account") : tx("login");
  if(user){
    body.innerHTML = `<p>${tx("signedAs")} <b>${esc(user.email || user.displayName || "")}</b></p>
      <div class="auth-form"><button class="ghost" id="aOut">${tx("logout")}</button>
      <button class="ghost" id="aDel" style="color:var(--warn)">${tx("del")}</button><p class="auth-msg" id="aMsg"></p></div>`;
    body.querySelector("#aOut").onclick = () => auth.signOut().then(() => dlg.close());
    body.querySelector("#aDel").onclick = deleteAccount;
  } else {
    body.innerHTML = `<p class="hint">${tx("why")}</p>
      <div class="auth-form">
        <button class="primary" id="aGoogle">${tx("google")}</button>
        <div class="auth-sep">${tx("or")}</div>
        <input type="email" id="aEmail" autocomplete="email" placeholder="${tx("email")}">
        <input type="password" id="aPass" autocomplete="current-password" placeholder="${tx("pass")}">
        <div class="two"><button class="primary" id="aIn">${tx("enter")}</button><button class="ghost" id="aNew">${tx("create")}</button></div>
        <button class="linkbtn" id="aForgot" style="justify-self:start">${tx("forgot")}</button>
        <p class="auth-msg" id="aMsg"></p>
        <p class="auth-agree">${tx("agree")}</p>
      </div>`;
    const em = () => body.querySelector("#aEmail").value.trim(), pw = () => body.querySelector("#aPass").value;
    body.querySelector("#aGoogle").onclick = () => { const pr = new firebase.auth.GoogleAuthProvider(); auth.signInWithPopup(pr).then(() => dlg.close()).catch(e => (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) ? auth.signInWithRedirect(pr) : fail(e)); };
    body.querySelector("#aIn").onclick = () => auth.signInWithEmailAndPassword(em(), pw()).then(() => dlg.close()).catch(fail);
    body.querySelector("#aNew").onclick = () => auth.createUserWithEmailAndPassword(em(), pw()).then(() => dlg.close()).catch(fail);
    body.querySelector("#aForgot").onclick = () => auth.sendPasswordResetEmail(em()).then(() => msg(tx("resetSent"), true)).catch(fail);
  }
  if(!dlg.open) dlg.showModal();
}
function msg(s, ok){ const m = dlg.querySelector("#aMsg"); if(m){ m.textContent = s; m.style.color = ok ? "var(--accent)" : "var(--warn)"; } }
function fail(e){ if(e && e.code === "auth/popup-closed-by-user") return; msg(tx("error") + " " + ((e && e.code) || e).toString().replace("auth/","")); }

async function deleteAccount(){
  if(!confirm(tx("delConfirm"))) return;
  try {
    await db.collection("users").doc(user.uid).delete();
    await user.delete();
    alert(tx("deleted")); dlg.close();
  } catch(e){
    if(e && e.code === "auth/requires-recent-login"){ msg(tx("relogin")); await auth.signOut(); }
    else fail(e);
  }
}

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
