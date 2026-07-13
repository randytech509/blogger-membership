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
import { getUserRole, isMember } from "./membership.js";
import { db } from "./firebase-config.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const LOGIN_PATH = "/p/login.html";
const ADMIN_PATH = "/p/admin.html";

function renderWall(slot, html) {
  const wall = document.createElement("div");
  wall.className = "fs-paywall";
  wall.innerHTML = html;
  slot.replaceChildren(wall);
}

function wallForVisitor(slot) {
  renderWall(slot, `
    <h3>🔒 Contenu réservé aux membres</h3>
    <p>Connecte-toi (gratuitement) pour lire l'intégralité de cet article.</p>
    <a class="fs-primary-btn"
       href="${LOGIN_PATH}?next=${encodeURIComponent(location.pathname)}">
       Se connecter / S'inscrire</a>`);
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
        <h3>✍️ Aucun contenu premium pour cet article</h3>
        <p>ID de l'article : <code>${postId}</code></p>
        <a class="fs-primary-btn"
           href="${ADMIN_PATH}?post=${encodeURIComponent(postId)}">
           Ajouter le contenu</a>`);
    } else {
      renderWall(slot, `
        <h3>⏳ Contenu à venir</h3>
        <p>Le contenu premium de cet article n'est pas encore disponible.</p>`);
    }
  } catch (err) {
    console.error("[paywall]", err);
    renderWall(slot, `
      <h3>⚠️ Impossible de charger le contenu</h3>
      <p>Réessaie dans un instant.</p>`);
  }
}

const slots = document.querySelectorAll(".fs-premium-slot");
if (slots.length) {
  onUser(async (user) => {
    if (!user) { slots.forEach(wallForVisitor); return; }
    const role = await getUserRole(user.uid);
    if (!isMember(role)) { slots.forEach(wallForVisitor); return; }
    slots.forEach((slot) => fillSlot(slot, user, role));
  });
}
