// ============================================================================
//  ui.js — branchement des boutons/formulaires de la page de connexion
//  (chargé UNIQUEMENT par la page /login)
// ============================================================================

import {
  loginWithGoogle,
  loginWithGithub,
  sendMagicLink,
  completeMagicLink,
} from "./auth.js";

const $ = (sel) => document.querySelector(sel);

function toast(msg, kind = "info") {
  const box = $("#fs-msg");
  if (!box) return;
  box.textContent = msg;
  box.className = "fs-msg fs-msg--" + kind;   // info | error | success
  box.style.display = "block";
}

// Emballe un handler async pour afficher joliment les erreurs Firebase.
function guard(fn, btn) {
  return async (e) => {
    e?.preventDefault?.();
    try {
      if (btn) { btn.disabled = true; btn.dataset.loading = "1"; }
      await fn();
    } catch (err) {
      console.error(err);
      toast(friendlyError(err), "error");
    } finally {
      if (btn) { btn.disabled = false; delete btn.dataset.loading; }
    }
  };
}

function friendlyError(err) {
  const code = err?.code || "";
  const map = {
    "auth/popup-closed-by-user": "Fenêtre fermée avant la fin de la connexion.",
    "auth/account-exists-with-different-credential":
      "Un compte existe déjà avec cet e-mail via un autre fournisseur.",
    "auth/invalid-email": "Adresse e-mail invalide.",
    "auth/unauthorized-domain":
      "Domaine non autorisé — ajoute ton blog dans Firebase Auth ▸ Domaines autorisés.",
    "auth/network-request-failed": "Problème réseau, réessaie.",
  };
  return map[code] || ("Erreur : " + (err?.message || code || "inconnue"));
}

// reCAPTCHA v2 : callback global appelé quand la case est validée.
window.__fsHumanOK = false;
window.fsRecaptchaSolved = () => {
  window.__fsHumanOK = true;
  const btn = $("#fs-magic-btn");
  if (btn) btn.disabled = false;
};
window.fsRecaptchaExpired = () => {
  window.__fsHumanOK = false;
  const btn = $("#fs-magic-btn");
  if (btn) btn.disabled = true;
};

document.addEventListener("DOMContentLoaded", async () => {
  // 1) Si on revient d'un magic link, on finalise la connexion tout de suite.
  try {
    if (await completeMagicLink()) return; // redirige, inutile de continuer
  } catch (err) {
    toast(friendlyError(err), "error");
  }

  // 2) Boutons sociaux
  const gBtn = $("#fs-google");
  const hBtn = $("#fs-github");
  gBtn?.addEventListener("click", guard(loginWithGoogle, gBtn));
  hBtn?.addEventListener("click", guard(loginWithGithub, hBtn));

  // 3) Formulaire magic link
  const form = $("#fs-email-form");
  const magicBtn = $("#fs-magic-btn");
  form?.addEventListener("submit", guard(async () => {
    if (!window.__fsHumanOK) {
      toast("Confirme d'abord que tu n'es pas un robot.", "error");
      return;
    }
    const email = $("#fs-email").value.trim();
    if (!email) { toast("Saisis ton adresse e-mail.", "error"); return; }
    await sendMagicLink(email);
    toast("Lien envoyé ! Vérifie ta boîte mail (et les spams).", "success");
    form.reset();
    window.fsRecaptchaExpired?.();
    if (window.grecaptcha) window.grecaptcha.reset();
  }, magicBtn));
});
