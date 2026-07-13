// ============================================================================
//  nav.js — injecte l'icône « Compte » dans la barre d'icônes du thème (Plus UI)
//  Cible : <ul class="headIc"> en haut à droite. Déconnecté → lien /p/login.html
//  (icône bonhomme) ; connecté → /p/mon-compte.html (avatar).
// ============================================================================

import { onUser } from "./auth.js";

const PERSON_SVG = `<svg class="line" viewBox="0 0 24 24">
  <path class="c" d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"></path>
  <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22"></path></svg>`;

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
  a.innerHTML = PERSON_SVG;
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
        a.innerHTML = PERSON_SVG;
      }
    } else {
      a.href = "/p/login.html";
      a.setAttribute("aria-label", "Se connecter");
      a.innerHTML = PERSON_SVG;
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
