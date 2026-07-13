# Modifications du thème Blogger (Plus UI / Fineshop)

> Tableau de bord ▸ **Thème** ▸ flèche ▸ **Modifier le code HTML**.
> ⚠️ **Sauvegarde d'abord** ton thème (Thème ▸ ⋮ ▸ *Sauvegarder*).
> Remplace partout `randytech509/blogger-membership` par ton dépôt GitHub.

---

## 1. Charger les scripts (juste avant `</head>`)

Colle ce bloc juste avant la balise fermante `&lt;/head&gt;` :

```html
<link rel='stylesheet' href='https://cdn.jsdelivr.net/gh/randytech509/blogger-membership@main/css/auth.css'/>
<script type='module' src='https://cdn.jsdelivr.net/gh/randytech509/blogger-membership@main/js/paywall.js'/>
```

> `paywall.js` importe déjà `auth.js` + `membership.js` (modules ES) : rien d'autre à charger.

---

## 2. Insérer l'emplacement du contenu premium (paywall inviolable)

> Paywall **inviolable** : le vrai contenu n'est PAS dans l'article Blogger, il
> vit dans Firestore et n'est chargé que pour les membres. L'article Blogger ne
> contient que le **teaser**. Le thème ajoute juste un emplacement vide que
> `paywall.js` remplit (membre) ou remplace par un mur (visiteur).

Cherche `<data:post.body/>` dans le **gabarit d'article** (`Blog`/`blog-post`).
Ajoute **juste après** :

```html
<data:post.body/>
<b:if cond='data:post.labels any (label => label.name == &quot;premium&quot;)'>
  <div class='fs-premium-slot' expr:data-post-id='data:post.id'/>
</b:if>
```

Version compatible thèmes anciens (sans `any (... => ...)`) :

```html
<data:post.body/>
<b:loop values='data:post.labels' var='label'>
  <b:if cond='data:label.name == &quot;premium&quot;'>
    <div class='fs-premium-slot' expr:data-post-id='data:post.id'/>
  </b:if>
</b:loop>
```

Résultat : sur un article `premium`, un `<div class="fs-premium-slot"
data-post-id="…">` vide est rendu. `paywall.js` y injecte le contenu Firestore
pour les membres, ou un mur d'invitation pour les visiteurs. Le `data-post-id`
est l'**ID de l'article** — c'est la clé du document `premiumContent/<ID>` que
tu créeras dans l'espace admin.

---

## 3. (Optionnel) Lien Connexion / Compte dans l'en-tête

Ajoute où tu veux dans le thème (ex. barre de navigation) :

```html
<a id='fs-nav-auth' href='/p/login.html'>Connexion</a>
<script type='module'>
  import { onUser, logout } from 'https://cdn.jsdelivr.net/gh/randytech509/blogger-membership@main/js/auth.js';
  const link = document.getElementById('fs-nav-auth');
  onUser((user) => {
    if (user) { link.textContent = 'Mon compte'; link.href = '/p/mon-compte.html'; }
    else      { link.textContent = 'Connexion';  link.href = '/p/login.html'; }
  });
</script>
```

---

## 4. Créer un article premium (paywall inviolable)

1. Dans Blogger, rédige **uniquement le teaser** (2–3 paragraphes accrocheurs).
   ⚠️ Ne mets PAS le contenu premium ici — il serait lisible dans le code source.
2. Ajoute le libellé exact : `premium`. Publie.
3. Ouvre l'article publié en étant connecté **en admin** : le mur affiche
   « ID de l'article : `XXXX` » avec un bouton **Ajouter le contenu**.
4. Ce bouton ouvre `/p/admin.html` avec l'ID pré-rempli → colle le **contenu HTML
   complet** → **Enregistrer**. Il est stocké dans Firestore `premiumContent/<ID>`.
5. Désormais : un membre voit le contenu injecté, un visiteur voit le mur, et le
   contenu n'apparaît **jamais** dans le HTML pour un non-membre. ✅

> Astuce : tu peux aussi récupérer l'ID dans l'URL d'édition Blogger
> (`.../edit/<blogID>/<postID>` → `postID`).

> Rappel option A : le contenu après le teaser est masqué mais reste dans le
> HTML. Pour un verrou réel, garde l'article public court et publie le vrai
> contenu via l'option B (Firestore) — voir README §Paywall sécurisé.
