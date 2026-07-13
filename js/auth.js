// ============================================================================
//  auth.js — toute la logique d'authentification Firebase
//  Google · GitHub · Magic link (lien e-mail) · état de session · déconnexion
// ============================================================================

import { auth, LOGIN_URL, ACCOUNT_URL } from "./firebase-config.js";
import { ensureUserProfile } from "./membership.js";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// --- Récupère le paramètre ?next= pour rediriger après connexion ------------
function getNext() {
  const p = new URLSearchParams(location.search).get("next");
  // On n'autorise que des chemins internes (protection open-redirect).
  return (p && p.startsWith("/")) ? p : "/";
}

function redirectAfterLogin() {
  const next = getNext();
  location.href = next.startsWith("http") ? next : location.origin + next;
}

// --- Connexion Google -------------------------------------------------------
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(auth, provider);
  await ensureUserProfile(user);
  redirectAfterLogin();
}

// --- Connexion GitHub -------------------------------------------------------
export async function loginWithGithub() {
  const provider = new GithubAuthProvider();
  const { user } = await signInWithPopup(auth, provider);
  await ensureUserProfile(user);
  redirectAfterLogin();
}

// --- Magic link : étape 1, envoyer le lien ----------------------------------
export async function sendMagicLink(email) {
  const actionCodeSettings = {
    // Après clic sur le lien reçu par mail, l'utilisateur revient sur /login,
    // où l'étape 2 (completeMagicLink) finalise la connexion.
    url: LOGIN_URL + "?next=" + encodeURIComponent(getNext()),
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  // On garde l'e-mail localement pour ne pas le redemander au retour.
  window.localStorage.setItem("emailForSignIn", email);
}

// --- Magic link : étape 2, finaliser au retour sur la page ------------------
// À appeler au chargement de la page login. Renvoie true si une connexion
// par lien a bien été traitée.
export async function completeMagicLink() {
  if (!isSignInWithEmailLink(auth, window.location.href)) return false;

  let email = window.localStorage.getItem("emailForSignIn");
  if (!email) {
    // Cas : l'utilisateur ouvre le lien sur un autre appareil/navigateur.
    email = window.prompt("Confirme ton adresse e-mail pour finaliser la connexion :");
  }
  const { user } = await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem("emailForSignIn");
  await ensureUserProfile(user);
  redirectAfterLogin();
  return true;
}

// --- Observer l'état de connexion (utilisé partout) -------------------------
export function onUser(callback) {
  return onAuthStateChanged(auth, callback);
}

// --- Déconnexion ------------------------------------------------------------
export async function logout(redirectTo = "/") {
  await signOut(auth);
  location.href = redirectTo;
}

export { ACCOUNT_URL };
