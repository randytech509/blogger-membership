# PROJET — Système d'adhésion AndetayNews

Fiche de suivi. Pour l'installation pas à pas, voir [`README.md`](./README.md).

- **Blog** : AndetayNews — `andetaynews.com` (Blogger, thème Plus UI)
- **blogID** : `2097219372030182456`
- **Dépôt** : https://github.com/randytech509/blogger-membership (public)
- **CDN** : `https://cdn.jsdelivr.net/gh/randytech509/blogger-membership@main/…`
- **Créé le** : 2026-07-13

## Objectif

Zone membres privée style *Fineshop Design* : page de connexion « Welcome back »
(Google · GitHub · magic link), rôles membres dans Firestore, restriction du
contenu premium (articles étiquetés `premium`).

## Stack

| Brique | Choix |
|---|---|
| Authentification | Firebase Auth (Google, GitHub, e-mail magic link) |
| Base de données | Firestore — collection `users` (rôle `member`/`admin`) |
| Anti-robot | Google reCAPTCHA v2 (« Je ne suis pas un robot ») |
| Hébergement du code | GitHub → jsDelivr (Blogger n'héberge pas de `.js`) |
| Accent visuel | Variable Plus UI `--linkB` (#1976d2 clair / #5798e1 sombre) |

## 2 vérités techniques (à ne pas oublier)

1. Le `firebaseConfig`/apiKey **n'est pas secret** — sécurité = règles Firestore + domaines autorisés.
2. Le paywall côté client **n'est pas inviolable** (contenu masqué, pas supprimé du HTML). Verrou réel = option B (contenu dans Firestore).

## État d'avancement

### ✅ Fait
- [x] Code complet (auth, membership, ui, paywall, css, firestore.rules)
- [x] Pages Blogger prêtes : `login`, `mon-compte`, `confidentialite`, `conditions`
- [x] Snippets thème documentés (`theme/theme-snippets.md`)
- [x] Placeholders `TON-USER` → `randytech509` remplacés
- [x] Repo public créé et poussé sur GitHub
- [x] jsDelivr vérifié (HTTP 200 sur css/js)

### ✅ Fait (suite)
- [x] Projet Firebase réutilisé : **andetaynews-counter** (CLI: loverandy2019@gmail.com, console: loverandy.bonnet1@gmail.com)
- [x] `firebaseConfig` renseigné (récupéré en CLI) + poussé
- [x] Base Firestore créée (édition Standard, eur3) — compteur reste sur Realtime DB
- [x] `firestore.rules` déployées en CLI

### ✅ Fait (backend)
- [x] Fournisseurs activés : Google + magic link (GitHub à faire)
- [x] Domaines autorisés ajoutés
- [x] Clé reCAPTCHA v2 (case UI) intégrée
- [x] Règles élargies déployées : admin gère membres + premiumContent
- [x] **Paywall inviolable** codé (`paywall.js` v2, contenu servi depuis Firestore)
- [x] **Espace admin** codé (`pages/admin.html` : membres + éditeur premium)
- [x] **App Check** câblé dans la config (garde-fou tant que clé v3 absente)

### ✅ Fait (déploiement Blogger)
- [x] Clé reCAPTCHA v3 intégrée + App Check enregistré (console, côté user)
- [x] **5 pages publiées** dans Blogger avec bons slugs (login, mon-compte, admin, confidentialite, conditions) — vérifiées en direct
- [x] Page login validée live : carte « Welcome back », scripts non supprimés, CSS/JS jsDelivr, reCAPTCHA rendu, intégration Plus UI dark

### ✅ Fait (intégration site)
- [x] Bug magic link corrigé (toggle « lien e-mail sans mot de passe » activé dans Firebase)
- [x] `nav.js` : icône compte (porte→avatar) injectée dans `ul.headIc` (haut à droite), distincte du profil natif
- [x] Thème édité : `auth.css` + `paywall.js` + `nav.js` chargés site-wide (insérés au marqueur Plus UI « Custom codes (Global) », ligne 3602). Vérifié : scripts chargés automatiquement en direct.

### ⏳ Reste à faire
- [ ] **Se connecter 1× via Google** sur /p/login.html (crée le doc users/{uid})
- [ ] Se promouvoir admin : Firestore console → users/{uid} → role=admin
- [ ] Tester /p/mon-compte.html + /p/admin.html + l'icône compte devenue avatar
- [ ] Vérifier le graphe App Check (requêtes vérifiées) PUIS activer l'enforcement Firestore
- [ ] Snippet thème §2 (`fs-premium-slot` après `<data:post.body/>`) — pour le paywall sur les articles premium
- [ ] Créer l'OAuth App GitHub (Client ID/Secret → Firebase) pour le bouton GitHub
- [ ] (Sécurité) restreindre la clé API par référents HTTP + fermer l'alerte GitHub secret-scanning

## Structure

```
blogger-membership/
├── README.md                 # guide d'installation (6 phases)
├── PROJET.md                 # ce fichier (suivi)
├── firestore.rules           # sécurité Firestore
├── css/auth.css              # style carte + paywall (accent --linkB)
├── js/
│   ├── firebase-config.js    # config (à remplir)
│   ├── auth.js               # Google · GitHub · magic link · session
│   ├── membership.js         # profils & rôles Firestore
│   ├── ui.js                 # boutons de /login
│   └── paywall.js            # masque/révèle le contenu premium
├── pages/
│   ├── login.html            # /p/login.html
│   ├── account.html          # /p/mon-compte.html
│   ├── confidentialite.html  # /p/confidentialite.html
│   └── conditions.html       # /p/conditions.html
└── theme/theme-snippets.md   # modifs du thème Plus UI
```

## Notes

- E-mail de contact des pages légales : `contact@andetaynews.com` (à valider).
- Promotion en `admin` : à faire à la main dans Firestore (les règles l'interdisent côté client).
- Une fois la config Firebase remplie et re-poussée, Blogger étant connecté, les 4 pages peuvent être collées automatiquement via le navigateur.
