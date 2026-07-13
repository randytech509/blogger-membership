# Système d'adhésion — AndetayNews (Blogger, style Fineshop Design)

Zone membres privée pour **andetaynews.com** (Blogger, thème Plus UI,
blogID `2097219372030182456`) : page de connexion « Welcome back »
(Google / GitHub / magic link), rôles membres dans Firestore, et restriction du
contenu premium. L'accent de la carte est accroché à la variable Plus UI
`--linkB` → il suit automatiquement le bleu clair/sombre du blog.

## ⚠️ À lire avant de commencer (2 vérités techniques)

1. **Le `firebaseConfig` (apiKey…) n'est pas un secret.** Il est fait pour être
   public dans le HTML. La sécurité vient des **règles Firestore**
   (`firestore.rules`) + des **domaines autorisés** dans Firebase Auth. Ne perds
   pas de temps à vouloir le cacher.
2. **Le paywall côté client n'est pas inviolable.** Le contenu premium reste
   dans le HTML ; on le masque seulement (option A). Bon contre 90 % des
   visiteurs, contournable par un technicien. Pour un vrai verrou → option B.

---

## Architecture

| Fichier | Rôle | Où il vit |
|---|---|---|
| `js/firebase-config.js` | Config + instances Firebase partagées | GitHub → jsDelivr |
| `js/auth.js` | Google / GitHub / magic link / session / logout | idem |
| `js/membership.js` | Profils & rôles Firestore | idem |
| `js/ui.js` | Branche les boutons de la page login | idem |
| `js/paywall.js` | Masque/révèle le contenu premium | idem |
| `css/auth.css` | Style Fineshop (carte, boutons, dark mode) | idem |
| `pages/login.html` | Contenu de la page Blogger `/p/login.html` | Éditeur Pages Blogger |
| `pages/account.html` | Page `/p/mon-compte.html` | Éditeur Pages Blogger |
| `theme/theme-snippets.md` | Modifs à coller dans le thème | Éditeur HTML du thème |
| `firestore.rules` | Règles de sécurité Firestore | Console Firebase |

**Pourquoi jsDelivr ?** Blogger ne peut pas héberger de fichiers `.js`. On pousse
ce dépôt sur GitHub et on charge les scripts via `cdn.jsdelivr.net/gh/…`.

---

## Phase 1 — Projet Firebase (~15 min)

1. [console.firebase.google.com](https://console.firebase.google.com) → **Créer un projet**.
2. **Authentication ▸ Commencer**, active les fournisseurs :
   - **Google** (1 clic).
   - **GitHub** : crée d'abord une OAuth App sur
     GitHub ▸ *Settings ▸ Developer settings ▸ OAuth Apps*.
     *Authorization callback URL* = celle affichée par Firebase
     (`https://ton-projet.firebaseapp.com/__/auth/handler`). Copie *Client ID*
     + *Client secret* dans Firebase.
   - **E-mail/Mot de passe** ▸ active aussi **Lien de connexion par e-mail
     (sans mot de passe)** — c'est le magic link.
3. **Authentication ▸ Settings ▸ Domaines autorisés** : ajoute
   `andetaynews.com`, `www.andetaynews.com` **et** `andetaynews.blogspot.com`
   (secours). **Crucial**, sinon `auth/unauthorized-domain`.
4. **Firestore Database ▸ Créer** (mode production).
5. **Firestore ▸ Règles** : colle le contenu de `firestore.rules` ▸ *Publier*.
6. **Paramètres du projet ▸ Tes applications ▸ Web (`</>`)** : enregistre une app
   web, copie le `firebaseConfig`.

## Phase 2 — reCAPTCHA (le « Let us know you are human »)

1. [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin) → nouveau
   site, type **reCAPTCHA v2 ▸ « Je ne suis pas un robot »**.
2. Domaines : `andetaynews.com` et `www.andetaynews.com`.
3. Copie la **clé de site** (site key).

## Phase 3 — Renseigner la config puis publier sur GitHub

1. Édite `js/firebase-config.js` : remplace le `firebaseConfig`, `LOGIN_URL`,
   `ACCOUNT_URL`, `RECAPTCHA_SITE_KEY`.
2. Publie le dépôt :
   ```bash
   cd ~/dev/blogger-membership
   git init && git add . && git commit -m "Système d'adhésion Blogger"
   git branch -M main
   git remote add origin https://github.com/randytech509/blogger-membership.git
   git push -u origin main
   ```
3. Dans **tous** les fichiers, remplace `randytech509/blogger-membership` par ton
   `utilisateur/dépôt`. (jsDelivr sert directement depuis GitHub, aucune conf.)
   > Astuce : jsDelivr met en cache ~12 h. Pour forcer une version fraîche
   > pendant les tests, utilise un tag (`@v1`) plutôt que `@main`, ou purge via
   > `https://purge.jsdelivr.net/gh/randytech509/blogger-membership@main/js/auth.js`.

## Phase 4 — Pages Blogger

- **Login** : Blogger ▸ Pages ▸ Nouvelle page ▸ titre `Login` ▸ menu ⋮ ▸
  *Options* ▸ décoche la barre latérale si tu veux ▸ passe en **Affichage HTML**
  ▸ colle `pages/login.html` ▸ mets aussi la clé reCAPTCHA dans `data-sitekey` ▸
  Publier. Vérifie que l'URL est bien `/p/login.html`.
- **Mon compte** : idem avec `pages/account.html` → `/p/mon-compte.html`.
- (Optionnel) crée `/p/confidentialite.html` et `/p/conditions.html`.

> Si Blogger retire tes balises `<script type="module">` de la page, déplace-les
> vers le thème (voir `theme-snippets.md` §1) — le résultat est identique.

## Phase 5 — Thème (paywall)

Suis `theme/theme-snippets.md` : charge les scripts avant `</head>`, entoure
`<data:post.body/>` de `fs-premium`, et (optionnel) ajoute le lien Connexion.

## Phase 6 — Tests

- [ ] `/p/login.html` : la carte « Welcome back » s'affiche, dark mode OK mobile.
- [ ] La case reCAPTCHA active le bouton « magic link ».
- [ ] Connexion Google → redirige, doc créé dans Firestore `users/{uid}` (`role: member`).
- [ ] Connexion GitHub OK.
- [ ] Magic link : mail reçu → clic → connecté (teste aussi sur un autre appareil).
- [ ] Article étiqueté `premium` : masqué + mur pour visiteur, visible pour membre.
- [ ] `/p/mon-compte.html` : infos + déconnexion ; non connecté → redirigé vers login.
- [ ] `?next=` : se connecter depuis un article premium ramène à cet article.

---

## Rôle admin

Pour te promouvoir : Firebase ▸ Firestore ▸ `users/{ton-uid}` ▸ change `role`
en `admin` à la main (les règles interdisent de le faire depuis le client).

## Option B — Paywall réellement sécurisé

L'article Blogger public ne contient que le teaser. Le vrai contenu vit dans
Firestore `premiumContent/{postId}` (lisible seulement par un membre, cf. le bloc
commenté dans `firestore.rules`). `paywall.js` charge alors le document et
l'injecte dans une `<div class="fs-premium">` vide. Contenu jamais présent dans
le HTML pour un non-membre → verrou réel. Coût : gérer le contenu dans Firestore
au lieu de l'éditeur Blogger.

## Dépannage

| Symptôme | Cause probable |
|---|---|
| `auth/unauthorized-domain` | Domaine du blog absent de Firebase Auth ▸ Domaines autorisés |
| Popup Google se ferme sans rien | Bloqueur de popups, ou domaine non autorisé |
| Magic link « invalid-action-code » | Lien déjà utilisé/expiré, ou `authDomain` incorrect |
| Scripts non chargés | Cache jsDelivr (purge) ou chemin `TON-USER/dépôt` non remplacé |
| `Missing or insufficient permissions` | Règles Firestore non publiées |
