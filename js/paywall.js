// ============================================================================
//  paywall.js — PAYWALL INVIOLABLE (le vrai contenu vit dans Firestore)
//
//  Le thème insère, dans les articles labellisés "premium", un emplacement vide :
//     <div class="fs-premium-slot" data-post-id="<ID>"></div>
//  Ce script :
//    - visiteur / non-membre  ➜ affiche un mur (le contenu n'est JAMAIS chargé)
//    - membre                 ➜ récupère premiumContent/<ID> et l'injecte
//    - admin sans contenu     ➜ propose de le créer dans l'espace admin
//
//  Sécurité : les règles Firestore n'autorisent la lecture de premiumContent
//  qu'aux membres connectés → un visiteur ne peut pas récupérer le contenu,
//  même en lisant le code source. C'est le vrai verrou (contrairement au
//  simple masquage CSS).
// ============================================================================

import { onUser } from "./auth.js";
import { getUserProfile, hasPremiumAccess } from "./membership.js";
import { db } from "./firebase-config.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const LOGIN_PATH = "/p/login.html";
const ADMIN_PATH = "/p/admin.html";
const ACCOUNT_PATH_MEMBER = "/p/mon-compte.html";

function renderWall(slot, html) {
  const wall = document.createElement("div");
  wall.className = "fs-paywall";
  wall.innerHTML = html;
  slot.replaceChildren(wall);
}

// Icônes d'interface (trait) — s'appuient sur .fs-paywall-ico dans auth.css.
const ICO_LOCK = `<svg class="fs-ico fs-paywall-ico" viewBox="0 0 24 24" aria-hidden="true">
  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const ICO_PENCIL = `<svg class="fs-ico fs-paywall-ico" viewBox="0 0 24 24" aria-hidden="true">
  <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>`;
const ICO_CLOCK = `<svg class="fs-ico fs-paywall-ico" viewBox="0 0 24 24" aria-hidden="true">
  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const ICO_ALERT = `<svg class="fs-ico fs-paywall-ico" viewBox="0 0 24 24" aria-hidden="true">
  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const ICO_STAR = `<svg class="fs-ico fs-paywall-ico" viewBox="0 0 24 24" aria-hidden="true">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

// Visiteur non connecté → invitation à se connecter/s'inscrire.
function wallForVisitor(slot) {
  renderWall(slot, `
    ${ICO_LOCK}
    <h3>Contenu réservé</h3>
    <p>Connecte-toi à ton compte pour accéder à cet article.</p>
    <a class="fs-primary-btn"
       href="${LOGIN_PATH}?next=${encodeURIComponent(location.pathname)}">
       Se connecter / S'inscrire</a>`);
}

// Connecté mais SANS accès premium (membre gratuit) → invitation à passer premium.
function wallForNonPremium(slot) {
  renderWall(slot, `
    ${ICO_STAR}
    <h3>Contenu premium</h3>
    <p>Cet article est réservé aux membres <b>premium</b>. Passe à l'offre premium
       pour débloquer tout le contenu exclusif.</p>
    <a class="fs-primary-btn" href="${ACCOUNT_PATH_MEMBER}">Passer premium</a>`);
}

async function fillSlot(slot, user, role) {
  const postId = slot.dataset.postId;
  if (!postId) return;

  try {
    const snap = await getDoc(doc(db, "premiumContent", postId));
    if (snap.exists()) {
      // Contenu autorisé (règles) → on l'injecte. HTML rédigé par un admin.
      const div = document.createElement("div");
      div.className = "fs-premium-content";
      div.innerHTML = snap.data().html || "";
      slot.replaceChildren(div);
    } else if (role === "admin") {
      renderWall(slot, `
        ${ICO_PENCIL}
        <h3>Aucun contenu premium pour cet article</h3>
        <p>ID de l'article : <code>${postId}</code></p>
        <a class="fs-primary-btn"
           href="${ADMIN_PATH}?post=${encodeURIComponent(postId)}">
           Ajouter le contenu</a>`);
    } else {
      renderWall(slot, `
        ${ICO_CLOCK}
        <h3>Contenu à venir</h3>
        <p>Le contenu premium de cet article n'est pas encore disponible.</p>`);
    }
  } catch (err) {
    console.error("[paywall]", err);
    renderWall(slot, `
      ${ICO_ALERT}
      <h3>Impossible de charger le contenu</h3>
      <p>Réessaie dans un instant.</p>`);
  }
}

const slots = document.querySelectorAll(".fs-premium-slot");
if (slots.length) {
  onUser(async (user) => {
    if (!user) { slots.forEach(wallForVisitor); return; }          // visiteur
    const profile = await getUserProfile(user.uid);
    if (!hasPremiumAccess(profile)) {                              // membre non-premium
      slots.forEach(wallForNonPremium);
      return;
    }
    const role = profile.role || "member";                        // premium ou admin
    slots.forEach((slot) => fillSlot(slot, user, role));
  });
}
