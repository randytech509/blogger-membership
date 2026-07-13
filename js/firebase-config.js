// ============================================================================
//  firebase-config.js
//  Configuration Firebase PARTAGÉE (importée par auth.js, membership.js…)
//
//  ⚠️  RAPPEL : ces valeurs NE SONT PAS secrètes. Le firebaseConfig est fait
//  pour être public. La sécurité vient des RÈGLES Firestore + des DOMAINES
//  AUTORISÉS dans Firebase Auth, jamais du fait de cacher cette clé.
//
//  → Remplace les valeurs ci-dessous par celles de ta console Firebase :
//    Paramètres du projet  ➜  Tes applications  ➜  Configuration du SDK
// ============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey:            "REMPLACE_MOI",
  authDomain:        "ton-projet.firebaseapp.com",
  projectId:         "ton-projet",
  storageBucket:     "ton-projet.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "1:000000000000:web:xxxxxxxxxxxx",
};

// AndetayNews — domaine personnalisé (blogID 2097219372030182456).
// ⚠️ Ajoute andetaynews.com ET www.andetaynews.com dans Firebase Auth ▸
//    Domaines autorisés (+ garde andetaynews.blogspot.com en secours).
export const LOGIN_URL   = "https://andetaynews.com/p/login.html";
// Page où atterrit un membre après connexion.
export const ACCOUNT_URL = "https://andetaynews.com/p/mon-compte.html";

// Clé de site reCAPTCHA v2 « case à cocher » (le « Let us know you are human »).
// Crée-la sur https://www.google.com/recaptcha/admin  (type v2 « I'm not a robot »).
export const RECAPTCHA_SITE_KEY = "REMPLACE_MOI_RECAPTCHA";

// Instances uniques réutilisées partout.
export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
