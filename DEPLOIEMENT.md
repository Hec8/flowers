# Déployer NFlowers sur un hébergement cPanel (Node.js + MySQL, sans SSH)

Ce guide explique comment mettre le site en ligne **sans SSH** et **sans aucune commande Artisan** (le projet n'utilise pas Laravel).

Ce qu'il faut savoir avant de commencer :

- Le site (React) est **déjà compilé**. Il se trouve dans `server/public`.
- Le serveur Node.js envoie **le site et l'API en même temps**. Il n'y a donc **qu'une seule application** à installer : le dossier `server`.
- La base de données est **MySQL**.

---

## Étape 1 — Créer la base de données MySQL

Dans cPanel, ouvrir **« Bases de données MySQL »** :

1. Créer une base, par exemple `moncompte_nflowers`.
2. Créer un utilisateur avec un mot de passe, par exemple `moncompte_nf`.
3. **Ajouter l'utilisateur à la base** en cochant **« Tous les privilèges »**.

Noter ces trois informations : le nom de la base, le nom de l'utilisateur et le mot de passe.

## Étape 2 — Envoyer les fichiers

1. Sur l'ordinateur, compresser le dossier **`server`** en `.zip`, **sans** le dossier `node_modules` s'il existe.
2. Dans cPanel, ouvrir le **Gestionnaire de fichiers** et créer un dossier `nflowers` à la racine du compte. Ce dossier doit être **à côté** de `public_html`, pas dedans.
3. Envoyer le `.zip` dans ce dossier, puis faire clic droit → **Extraire**.

Le dossier `nflowers` doit maintenant contenir `app.cjs`, `package.json`, `prisma/`, `public/` et `src/`.

## Étape 3 — Créer l'application Node.js

Dans cPanel, ouvrir **« Setup Node.js App »**. Selon l'hébergeur, le menu peut s'appeler « Node.js » ou « Application Node.js ». Cliquer sur **Create Application** :

| Champ | Valeur |
|---|---|
| Node.js version | **20** (ou au moins 18) |
| Application mode | **Production** |
| Application root | `nflowers` |
| Application URL | le domaine du site |
| Application startup file | **`app.cjs`** |

Ensuite, dans **Environment variables**, ajouter ces variables une par une :

| Nom | Valeur |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `mysql://UTILISATEUR:MOTDEPASSE@localhost:3306/NOM_BASE` |
| `CLIENT_URL` | `https://mon-domaine.com` (l'adresse du site, sans `/` à la fin) |
| `SERVER_URL` | `https://mon-domaine.com` |
| `JWT_ACCESS_SECRET` | une longue phrase secrète d'au moins 32 caractères |
| `JWT_REFRESH_SECRET` | une **autre** longue phrase secrète |
| `JWT_ACCESS_EXPIRES` | `15m` |
| `JWT_REFRESH_EXPIRES` | `7d` |
| `ADMIN_EMAIL` | l'email du compte administrateur |
| `ADMIN_PASSWORD` | le mot de passe du compte administrateur |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | les clés Cloudinary, pour stocker les images |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | les informations d'envoi d'emails |
| `FEADAPAY_SECRET_KEY`, `FEADAPAY_ENV` | la clé FedaPay, et `sandbox` (test) ou `live` (réel) |

> ⚠️ Si le mot de passe MySQL contient des caractères spéciaux, il faut les remplacer dans `DATABASE_URL` :
> `@` devient `%40`, `#` devient `%23`, `/` devient `%2F`, `:` devient `%3A`.

> Autre possibilité : au lieu de remplir ce tableau, créer un fichier `.env` dans le dossier `nflowers`, en partant du modèle `.env.example`.

Cliquer sur **Create**.

## Étape 4 — Installer les dépendances

Sur la page de l'application, cliquer sur **« Run NPM Install »** et attendre la fin de l'installation.
Cette étape prépare aussi Prisma automatiquement, grâce à la commande `prisma generate`.

## Étape 5 — Créer les tables

**Méthode A (la plus simple)** : sur la page de l'application, dans **« Run JS script »**, choisir **`db:push`** et cliquer pour l'exécuter.

**Méthode B (si la méthode A ne marche pas)** : dans cPanel → **phpMyAdmin**, choisir la base de données, aller dans l'onglet **Importer**, envoyer le fichier `prisma/init.sql`, puis cliquer sur **Exécuter**.

## Étape 6 — Ajouter les données de départ

Toujours dans **« Run JS script »**, exécuter **`db:seed`**.
Cette commande crée le compte administrateur, les catégories, les producteurs et des produits d'exemple.

## Étape 7 — Démarrer et vérifier

1. Cliquer sur **Restart**.
2. Ouvrir `https://mon-domaine.com/api/health`. La page doit afficher `"NFlowers API is running"`.
3. Ouvrir `https://mon-domaine.com` : le site doit s'afficher.
4. Se connecter avec le compte administrateur.

---

## En cas de problème

| Problème | Que faire |
|---|---|
| Page d'erreur « We're sorry, but something went wrong » | Lire le fichier `stderr.log` dans le dossier `nflowers` : il indique l'erreur. |
| `Can't reach database server` | Vérifier `DATABASE_URL` : l'hôte est presque toujours `localhost`, et le nom de la base contient le préfixe du compte. |
| `Access denied for user` | L'utilisateur n'a pas été ajouté à la base à l'étape 1, ou le mot de passe est faux. |
| Erreur au sujet du « Query Engine » de Prisma | Refaire **Run NPM Install**, puis **Restart**. |
| `db:push` / `db:seed` absents de la liste | Utiliser la méthode B de l'étape 5. Pour le seed, demander au développeur. |
| Les modifications ne s'affichent pas | Toujours cliquer sur **Restart** après avoir modifié un fichier ou une variable. |

## Mettre à jour le site plus tard

Le développeur lance `npm run build:deploy` à la racine du projet. Cette commande recompile le site dans `server/public`. Il suffit ensuite de renvoyer les fichiers modifiés sur l'hébergement et de cliquer sur **Restart**.
