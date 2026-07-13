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
import { initializeAppCheck, ReCaptchaV3Provider }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js";

export const firebaseConfig = {
  apiKey:            "AIzaSyDfapcXXSjPsuDvGbDXJ3klPSiu0RDaoeo",
  authDomain:        "andetaynews-counter.firebaseapp.com",
  projectId:         "andetaynews-counter",
  storageBucket:     "andetaynews-counter.firebasestorage.app",
  messagingSenderId: "883758406481",
  appId:             "1:883758406481:web:a26aa3dc48d2f7836d1170",
};

// AndetayNews — domaine personnalisé (blogID 2097219372030182456).
// ⚠️ Ajoute andetaynews.com ET www.andetaynews.com dans Firebase Auth ▸
//    Domaines autorisés (+ garde andetaynews.blogspot.com en secours).
export const LOGIN_URL   = "https://andetaynews.com/p/login.html";
// Page où atterrit un membre après connexion.
export const ACCOUNT_URL = "https://andetaynews.com/p/mon-compte.html";

// Clé de site reCAPTCHA v2 « case à cocher » (le « Let us know you are human »).
export const RECAPTCHA_SITE_KEY = "6LcU81EtAAAAANmvPGWqpz84ow-UjykokF9EsC9j";

// Clé de site reCAPTCHA v3 (invisible) pour Firebase App Check = anti-bot RÉEL.
// À créer sur https://www.google.com/recaptcha/admin (type v3), PUIS
// enregistrer l'app dans Firebase ▸ App Check avec cette même clé.
// Tant que la valeur contient "REMPLACE", App Check reste désactivé (aucune
// gêne pour la connexion Google en cours de test).
export const RECAPTCHA_V3_SITE_KEY = "REMPLACE_MOI_RECAPTCHA_V3";

// Instances uniques réutilisées partout.
export const app = initializeApp(firebaseConfig);

// App Check DOIT s'initialiser juste après l'app, avant Auth/Firestore.
export let appCheck = null;
if (RECAPTCHA_V3_SITE_KEY && !RECAPTCHA_V3_SITE_KEY.includes("REMPLACE")) {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(RECAPTCHA_V3_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}

export const auth = getAuth(app);
export const db   = getFirestore(app);
