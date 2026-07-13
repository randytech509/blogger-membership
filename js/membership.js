// ============================================================================
//  membership.js — profils utilisateurs & rôles dans Firestore
//  Collection "users" : { uid, email, displayName, photoURL, role, premium, createdAt }
//  role    = "member" (par défaut) | "admin"
//  premium = false (par défaut) | true  → accès au contenu premium (payant)
//  Accès au contenu premium = (role == "admin") OU (premium == true).
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
      premium:     false,             // pas d'accès premium par défaut (payant)
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

// Lit le profil complet ({ role, premium, ... }) d'un utilisateur connecté.
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// Un utilisateur inscrit est-il « membre » (par opposition à visiteur) ?
export function isMember(role) {
  return role === "member" || role === "admin";
}

// A-t-il accès au CONTENU PREMIUM (payant) ? Seulement premium == true ou admin.
// Un simple "member" (inscrit gratuit) est bloqué.
export function hasPremiumAccess(profile) {
  return !!profile && (profile.role === "admin" || profile.premium === true);
}
