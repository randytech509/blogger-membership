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

### ⏳ Reste à faire (côté user — comptes tiers)
- [ ] Créer le projet Firebase (Auth + Firestore)
- [ ] Créer l'OAuth App GitHub (Client ID/Secret → Firebase)
- [ ] Autoriser les domaines : `andetaynews.com`, `www.andetaynews.com`, `andetaynews.blogspot.com`
- [ ] Publier `firestore.rules` dans la console Firebase
- [ ] Générer la clé reCAPTCHA v2
- [ ] Remplir les `REMPLACE_MOI` (`js/firebase-config.js` + `data-sitekey` de `pages/login.html`)
- [ ] Re-push + purge jsDelivr (`purge.jsdelivr.net/gh/randytech509/blogger-membership@main/js/firebase-config.js`)
- [ ] Coller les 4 pages dans Blogger (mode Affichage HTML)
- [ ] Appliquer les snippets du thème (scripts + `fs-premium` autour de `<data:post.body/>`)
- [ ] Tests (checklist README, Phase 6)

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
