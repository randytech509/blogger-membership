# Configurer Firebase en ligne de commande (AndetayNews)

Ce que la CLI **automatise** (config + règles) et ce qui reste **console-only**
(fournisseurs d'auth + domaines). Aucune installation globale : on passe par
`npx firebase-tools`.

## 0. Connexion (interactif — à lancer toi-même)

Dans le terminal Claude Code, préfixe par `!` pour que ça s'exécute ici :

```
! npx firebase-tools login
```

Ça ouvre le navigateur pour t'authentifier avec ton compte Google.

## 1. Choisir le projet

- **Réutiliser un projet existant** :
  ```
  ! npx firebase-tools projects:list
  ! npx firebase-tools use TON_PROJECT_ID
  ```
- **Créer un projet dédié** :
  ```
  ! npx firebase-tools projects:create andetaynews-membres --display-name "AndetayNews Membres"
  ! npx firebase-tools use andetaynews-membres
  ```

## 2. Créer l'app web + récupérer la config automatiquement

```
! npx firebase-tools apps:create web "AndetayNews Web"
! npx firebase-tools apps:sdkconfig web
```

La dernière commande **affiche ton `firebaseConfig`** (apiKey, authDomain, etc.).
→ Copie ces valeurs dans `js/firebase-config.js`. (Ou demande-moi de le faire :
colle-moi la sortie, je remplis le fichier.)

## 3. Déployer les règles Firestore (au lieu du copier-coller console)

Assure-toi d'abord d'avoir **créé la base Firestore** (une fois, console :
Firestore Database ▸ Créer — ou `firebase init firestore`). Ensuite :

```
! npx firebase-tools deploy --only firestore:rules
```

`firebase.json` pointe déjà vers `firestore.rules`.

## 4. ⚠️ Ce qui reste OBLIGATOIREMENT dans la console

Aucune commande CLI pour ça — [console.firebase.google.com](https://console.firebase.google.com) :

1. **Authentication ▸ Sign-in method** : activer **Google**, **GitHub**
   (coller Client ID/Secret de l'OAuth App GitHub), **E-mail ▸ lien magique**.
2. **Authentication ▸ Settings ▸ Domaines autorisés** : ajouter
   `andetaynews.com`, `www.andetaynews.com`, `andetaynews.blogspot.com`.
3. **reCAPTCHA** : clé v2 sur google.com/recaptcha/admin (hors Firebase).

## Résumé

| Fait en CLI | Fait en console |
|---|---|
| login, choix/création projet | activer Google/GitHub/magic link |
| créer app web, récupérer config | ajouter domaines autorisés |
| déployer firestore.rules | OAuth App GitHub, clé reCAPTCHA |
