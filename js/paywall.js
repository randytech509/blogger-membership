// ============================================================================
//  paywall.js — restriction du contenu premium (chargé sur TOUT le blog)
//
//  ⚠️  SÉCURITÉ (option A, côté client) : le contenu premium reste présent dans
//  le HTML — on ne fait que le MASQUER pour les non-membres. Suffisant contre le
//  visiteur lambda, PAS contre quelqu'un qui lit le code source. Pour un vrai
//  verrou, voir l'option B décrite dans le README (contenu stocké dans Firestore).
//
//  Fonctionnement : le thème ajoute la classe `fs-premium` autour du corps des
//  articles portant le label "premium". Ce script :
//    - membre connecté   ➜ révèle le contenu
//    - visiteur          ➜ masque le contenu et affiche un mur d'invitation
// ============================================================================

import { onUser } from "./auth.js";
import { getUserRole, isMember } from "./membership.js";

const LOGIN_PATH = "/p/login.html";

function lockPremium() {
  document.querySelectorAll(".fs-premium").forEach((zone) => {
    if (zone.dataset.fsDone) return;
    zone.dataset.fsDone = "1";
    zone.classList.add("fs-locked");           // cache le contenu premium

    const wall = document.createElement("div");
    wall.className = "fs-paywall";
    wall.innerHTML = `
      <h3>🔒 Contenu réservé aux membres</h3>
      <p>Connecte-toi (gratuitement) pour lire l'intégralité de cet article.</p>
      <a class="fs-primary-btn"
         href="${LOGIN_PATH}?next=${encodeURIComponent(location.pathname)}">
         Se connecter / S'inscrire
      </a>`;
    zone.insertAdjacentElement("afterend", wall);
    zone._fsWall = wall;
  });
}

function unlockPremium() {
  document.querySelectorAll(".fs-premium").forEach((zone) => {
    zone.classList.remove("fs-locked");
    if (zone._fsWall) { zone._fsWall.remove(); zone._fsWall = null; }
    zone.dataset.fsDone = "1";
  });
}

// Rien à faire s'il n'y a aucun contenu premium sur la page.
if (document.querySelector(".fs-premium")) {
  onUser(async (user) => {
    if (!user) { lockPremium(); return; }
    const role = await getUserRole(user.uid);
    if (isMember(role)) unlockPremium();
    else lockPremium();
  });
}
