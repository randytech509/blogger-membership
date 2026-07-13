// ============================================================================
//  membership.js — profils utilisateurs & rôles dans Firestore
//  Collection "users" : { uid, email, displayName, photoURL, role, createdAt }
//  role = "member" (par défaut) | "admin"
// ============================================================================

import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Crée le profil au premier login, ou met à jour les infos de base ensuite.
// NE réécrit JAMAIS le rôle (pour ne pas rétrograder un admin promu à la main).
export async function ensureUserProfile(user) {
  const ref  = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      uid:         user.uid,
      email:       user.email || "",
      displayName: user.displayName || "",
      photoURL:    user.photoURL || "",
      role:        "member",          // rôle attribué à la 1re connexion
      createdAt:   serverTimestamp(),
    });
    return "member";
  }

  // Profil déjà présent : on rafraîchit les champs volatils, pas le rôle.
  await setDoc(ref, {
    email:       user.email || "",
    displayName: user.displayName || "",
    photoURL:    user.photoURL || "",
  }, { merge: true });

  return snap.data().role || "member";
}

// Lit le rôle d'un utilisateur connecté.
export async function getUserRole(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().role || "member") : null;
}

// Un membre (ou admin) a-t-il accès au contenu premium ?
export function isMember(role) {
  return role === "member" || role === "admin";
}
