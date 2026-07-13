// ============================================================================
//  nav.js — injecte l'icône « Compte » dans la barre d'icônes du thème (Plus UI)
//  Cible : <ul class="headIc"> en haut à droite. Déconnecté → lien /p/login.html
//  (icône bonhomme) ; connecté → /p/mon-compte.html (avatar).
// ============================================================================

import { onUser } from "./auth.js";

// Icône « connexion » (porte + flèche) — distincte de l'icône profil native du thème.
const LOGIN_SVG = `<svg class="line" viewBox="0 0 24 24">
  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
  <path d="M10 17l5-5-5-5"></path>
  <path class="c" d="M15 12H3"></path></svg>`;

// Icône « compte » (silhouette) — pour un membre connecté SANS photo de profil,
// pour ne pas afficher l'icône « connexion » qui laisserait croire à un état déconnecté.
const ACCOUNT_SVG = `<svg class="line" viewBox="0 0 24 24">
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
  <circle cx="12" cy="7" r="4"></circle></svg>`;

function injectAuthIcon() {
  if (document.querySelector("li.isAuth")) return true;   // déjà injecté
  const ul = document.querySelector("ul.headIc");
  if (!ul) return false;                                  // pas encore prêt → retry

  const li = document.createElement("li");
  li.className = "isAuth";
  const a = document.createElement("a");
  a.className = "tIc";
  a.href = "/p/login.html";
  a.setAttribute("aria-label", "Se connecter");
  a.innerHTML = LOGIN_SVG;
  li.appendChild(a);

  // On place l'icône juste avant le bouton mode sombre (reste à droite).
  const mode = ul.querySelector("li.isMode");
  ul.insertBefore(li, mode || null);

  onUser((user) => {
    if (user) {
      a.href = "/p/mon-compte.html";
      a.setAttribute("aria-label", "Mon compte");
      if (user.photoURL) {
        a.innerHTML = `<img src="${user.photoURL}" alt="" referrerpolicy="no-referrer"
          style="width:22px;height:22px;border-radius:50%;display:block;object-fit:cover;">`;
      } else {
        a.innerHTML = ACCOUNT_SVG;
      }
    } else {
      a.href = "/p/login.html";
      a.setAttribute("aria-label", "Se connecter");
      a.innerHTML = LOGIN_SVG;
    }
  });
  return true;
}

// Le thème rend la barre côté serveur, mais on retente si le DOM tarde.
if (!injectAuthIcon()) {
  let tries = 0;
  const t = setInterval(() => {
    if (injectAuthIcon() || ++tries > 20) clearInterval(t);
  }, 250);
}
