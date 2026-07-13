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

## 2. Marquer le corps des articles « premium »

Dans le code du thème, cherche `<data:post.body/>` (souvent écrit
`&lt;data:post.body/&gt;`). Il peut y en avoir plusieurs — vise celui du
**gabarit d'article** (`Blog` / `blog-post`). Entoure-le ainsi :

```html
<div expr:class='data:post.labels any (label => label.name == &quot;premium&quot;) ? &quot;fs-premium&quot; : &quot;&quot;'>
  <data:post.body/>
</div>
```

Si ton thème est ancien et ne supporte pas la syntaxe `any (... => ...)`,
utilise la version compatible par boucle :

```html
<b:eval expr='data:premiumFlag := &quot;&quot;'/>
<b:loop values='data:post.labels' var='label'>
  <b:if cond='data:label.name == &quot;premium&quot;'>
    <b:eval expr='data:premiumFlag := &quot;fs-premium&quot;'/>
  </b:if>
</b:loop>
<div expr:class='data:premiumFlag'>
  <data:post.body/>
</div>
```

Résultat : les articles étiquetés `premium` voient leur corps enveloppé dans
`<div class="fs-premium">`, que `paywall.js` masque ou révèle selon le membre.

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

## 4. Créer un article premium

1. Rédige ton article.
2. Écris un **teaser** (2–3 paragraphes visibles par tous).
3. Insère une **coupure de lecture** (bouton « Insérer un saut de ligne » /
   *jump break*) : le paywall ne masque que ce qui suit dans le corps complet
   affiché sur la page de l'article.
4. Dans les **libellés** de l'article, ajoute exactement : `premium`.
5. Publie.

> Rappel option A : le contenu après le teaser est masqué mais reste dans le
> HTML. Pour un verrou réel, garde l'article public court et publie le vrai
> contenu via l'option B (Firestore) — voir README §Paywall sécurisé.
