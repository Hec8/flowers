# NFlowers — Guide technique complet

> Documentation de référence pour comprendre, maintenir et présenter le projet lors de la soutenance.
> Application e-commerce de fleurs, plantes et accessoires de jardin — marché ouest-africain (FCFA, Bénin).

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Arborescence du projet](#2-arborescence-du-projet)
3. [Installation et lancement](#3-installation-et-lancement)
4. [Architecture technique](#4-architecture-technique)
5. [Backend (serveur)](#5-backend-serveur)
6. [Frontend (client)](#6-frontend-client)
7. [Catalogue produits : statique + base de données](#7-catalogue-produits--statique--base-de-données)
8. [Parcours utilisateur clés](#8-parcours-utilisateur-clés)
9. [Paiement FedaPay](#9-paiement-fedapay)
10. [Espace administrateur](#10-espace-administrateur)
11. [Animations (GSAP)](#11-animations-gsap)
12. [Variables d'environnement](#12-variables-denvironnement)
13. [Déploiement et partage du projet](#13-déploiement-et-partage-du-projet)
14. [Questions fréquentes en soutenance](#14-questions-fréquentes-en-soutenance)
15. [Comment étendre le projet](#15-comment-étendre-le-projet)

---

## 1. Vue d'ensemble

### Objectif du projet

NFlowers est une plateforme e-commerce permettant de :
- Consulter un catalogue riche (plantes, engrais, jardinage, décoration, fleurs & vertus)
- Ajouter des produits au panier et passer commande
- Payer en ligne via **FedaPay** (Mobile Money, cartes — sandbox en développement)
- Gérer le catalogue, les commandes et les clients depuis un **dashboard admin**

### Stack technique

| Couche | Technologies |
|--------|--------------|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Router 7, TanStack Query, GSAP, Recharts |
| **Backend** | Node.js, Express 4, Prisma 6, MySQL |
| **Auth** | JWT (access + refresh token), Bcrypt |
| **Paiement** | FedaPay SDK |
| **Images admin** | Cloudinary (optionnel) |
| **Emails** | Nodemailer (optionnel — mock en console si non configuré) |

### Organisation monorepo

Le projet est un **monorepo** : un dossier racine orchestre deux applications indépendantes :

```
Flowers/
├── package.json          ← scripts globaux (dev, build, db:seed)
├── client/               ← application React (port 5173)
└── server/               ← API Express (port 5000)
```

En développement, `npm run dev` lance les deux en parallèle via `concurrently`.

---

## 2. Arborescence du projet

### Racine

```
Flowers/
├── DOCUMENTATION.md      ← ce fichier
├── README.md             ← installation rapide
├── package.json
├── client/
└── server/
```

### Frontend — `client/src/`

```
client/src/
├── main.jsx                 # Point d'entrée React + enregistrement GSAP
├── App.jsx                  # Routes + providers (Auth, Cart, Query)
│
├── pages/                   # Une page = une route principale
│   ├── HomePage.jsx
│   ├── products/
│   │   ├── ProductsPage.jsx       # Catalogue (plantes, engrais, jardinage, fleurs)
│   │   ├── MaisonDecoPage.jsx     # Page éditoriale (maison & décoration)
│   │   └── ProductDetailPage.jsx  # Fiche produit
│   ├── cart/
│   │   ├── CartPage.jsx
│   │   └── CheckoutPage.jsx
│   ├── orders/
│   ├── auth/
│   ├── profile/
│   ├── admin/               # 7 pages admin
│   ├── conseils/            # Blog
│   ├── contact/
│   ├── store/
│   ├── producers/
│   └── wishlist/
│
├── components/
│   ├── layout/              # Header, Footer, MainLayout, AdminLayout
│   ├── products/            # ProductCard, StarRating
│   ├── cart/                # CartLineItem
│   ├── checkout/            # CheckoutStepper, AddressForm
│   ├── animation/           # ScrollRevealSection, AnimatedProductGrid...
│   ├── admin/               # Modales CRUD, Pagination
│   └── auth/
│
├── context/
│   ├── AuthContext.jsx      # Utilisateur connecté, tokens JWT
│   └── CartContext.jsx      # Panier (localStorage + sync serveur)
│
├── services/
│   ├── api.js               # Instance Axios + refresh token automatique
│   └── index.js             # authService, productService, orderService...
│
├── data/                    # Données statiques (catalogue curatif)
│   ├── staticProducts.js      # ~52 produits + combineWithStatic()
│   ├── plantesAssets.js     # Images plantes
│   ├── amenagementAssets.js   # Images engrais / aménagement
│   ├── jardinageAssets.js
│   ├── fleursAssets.js
│   ├── maisonDecoAssets.js
│   ├── catalogContent.js    # FAQ, témoignages par section
│   └── articles.js          # Articles blog conseils
│
├── lib/
│   ├── constants.js         # CATALOG_SECTIONS, frais livraison, paiements
│   ├── adminConstants.js
│   └── animations/          # GSAP : helpers, constantes, setup
│
├── hooks/
│   ├── useGsapAnimations.js
│   ├── useReducedMotion.js
│   └── useTableRowStagger.js
│
├── routes/
│   └── ProtectedRoute.jsx   # Garde JWT + adminOnly
│
└── assets/                  # Images PNG exportées des maquettes
```

### Backend — `server/src/`

```
server/src/
├── index.js                 # Démarre le serveur (PORT)
├── app.js                   # Express : middlewares + routes
│
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── shopRoutes.js        # Panier, commandes, wishlist, producteurs
│   ├── paymentRoutes.js     # FedaPay callback + statut
│   └── adminRoutes.js       # Dashboard, users, seed catalogue
│
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── shopController.js    # Cœur e-commerce + seedStaticProducts
│   └── paymentController.js
│
├── services/
│   └── fedapayService.js
│
├── middlewares/
│   ├── auth.js              # authenticate, requireAdmin
│   ├── errorHandler.js
│   ├── validate.js
│   └── upload.js            # Multer → Cloudinary
│
├── config/
│   ├── prisma.js
│   ├── cloudinary.js
│   └── mailer.js
│
└── utils/
    ├── cartHelpers.js       # Résolution produit par slug ou ID
    ├── AppError.js
    └── helpers.js           # Pagination, numéro de commande
```

### Base de données — `server/prisma/`

```
server/prisma/
├── schema.prisma    # Modèles User, Product, Order, CartItem...
└── seed.js          # Admin + quelques produits démo
```

---

## 3. Installation et lancement

### Prérequis

- Node.js 18+
- MySQL 8+ ou MariaDB 10.5+ (local ou chez l'hébergeur)
- Compte FedaPay sandbox (pour tester les paiements)

### Étapes

```bash
# 1. Installer TOUTES les dépendances (obligatoire — 3 dossiers)
cd Flowers
npm run install:all

# Équivalent :
# npm install && npm install --prefix server && npm install --prefix client

# 2. Configurer l'environnement
cp server/.env.example server/.env
# Éditer server/.env : DATABASE_URL, JWT, FEADAPAY_*, CLIENT_URL

# 3. Initialiser la base
cd server
npx prisma generate
npx prisma db push
npm run db:seed

# 4. Lancer l'application
cd ..
npm run dev
```

- **Site** : http://localhost:5173
- **API** : http://localhost:5000
- **Admin** : `admin@nflowers.com` / `Admin123!` (valeurs du seed)

### Checklist avant une démo / soutenance

1. `npm run dev` fonctionne sans erreur
2. Se connecter en admin → **Tableau de bord** → cliquer **« Synchroniser le catalogue »**
   - Cela rend les ~52 produits statiques commandables en base
3. Créer un compte client test ou utiliser un compte existant
4. Tester un parcours complet : catalogue → panier → checkout → FedaPay sandbox

---

## 4. Architecture technique

### Schéma global

```
┌─────────────────────────────────────────────────────────────┐
│                     NAVIGATEUR (React)                       │
│  Pages ──► Components ──► Context (Auth, Cart)              │
│              │                                               │
│              ▼                                               │
│         services/index.js (Axios)                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP /api/*
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVEUR (Express)                          │
│  Routes ──► Controllers ──► Prisma ──► MySQL           │
│                  │                                           │
│                  ├──► FedaPay (paiement)                     │
│                  ├──► Cloudinary (images admin)              │
│                  └──► Nodemailer (emails)                    │
└─────────────────────────────────────────────────────────────┘
```

### Flux de données produits (concept clé)

Le catalogue affiché au client combine **deux sources** :

1. **Produits statiques** (`client/src/data/staticProducts.js`)  
   - Contenu riche (images locales, descriptions, bienfaits, careTips)  
   - IDs fictifs (`s-fl-1`, `s-int-2`…) — **non persistés en DB**

2. **Produits en base** (créés via admin ou synchronisation)  
   - Vrais IDs Prisma (`cuid`) — **nécessaires pour le panier et les commandes**

La fonction `combineWithStatic()` fusionne les deux : affichage statique + ID DB si le slug existe.

### Authentification

- **Access token** (court, 15 min) : envoyé dans le header `Authorization: Bearer ...`
- **Refresh token** (7 jours) : stocké en DB et localStorage ; renouvelé automatiquement par l'intercepteur Axios (`services/api.js`)
- Routes protégées : composant `ProtectedRoute` vérifie la présence du token
- Routes admin : `ProtectedRoute adminOnly` vérifie `user.role === 'ADMIN'`

---

## 5. Backend (serveur)

### Point d'entrée

- `index.js` : charge `dotenv`, importe `app`, écoute sur `PORT` (5000)
- `app.js` : configure Helmet, CORS, JSON, rate limiting, monte toutes les routes sous `/api`

### Modèles Prisma (résumé)

| Modèle | Rôle |
|--------|------|
| **User** | Compte client ou admin (email, password hashé, role) |
| **Address** | Adresses de livraison liées à un user |
| **Category** | Catégories catalogue (`plantes`, `engrais`, `fleurs-bouquets`…) |
| **Producer** | Producteurs (bio, image, slug) |
| **Product** | Produit vendable (prix, stock, slug, images, productType) |
| **CartItem** | Ligne de panier (userId + productId + quantity) |
| **Order** | Commande (statut livraison + statut paiement séparés) |
| **OrderItem** | Ligne de commande (snapshot prix au moment de l'achat) |
| **Review** | Avis client sur un produit |
| **Wishlist** | Favoris |
| **ContactMessage** | Messages du formulaire contact |
| **NewsletterSubscription** | Emails newsletter |

**Enums importants :**
- `ProductType` : `INTERIOR`, `EXTERIOR`, `BOUQUET`, `PLANT`
- `OrderStatus` : `PENDING`, `CONFIRMED`, `SHIPPING`, `DELIVERED`, `CANCELLED`
- `PaymentStatus` : `PENDING`, `PAID`, `FAILED`
- `PaymentMethod` : `CARD`, `CASH_ON_DELIVERY`, `STRIPE`, `FEADAPAY`

### Routes API principales

#### Authentification — `/api/auth`

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/register` | Inscription |
| POST | `/login` | Connexion → tokens |
| POST | `/refresh` | Renouveler access token |
| GET | `/me` | Profil utilisateur |
| POST | `/forgot-password` | Envoi email reset |
| CRUD | `/addresses` | Gestion adresses |

#### Produits — `/api/products`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Liste paginée (filtres category, search…) |
| GET | `/:slug` | Détail par slug |
| GET/POST/PUT/DELETE | `/admin/*` | CRUD admin + upload image |

#### E-commerce — `/api`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET/POST/PUT/DELETE | `/cart` | Panier utilisateur |
| POST | `/cart/sync` | Synchroniser panier client → serveur |
| POST | `/orders` | Créer une commande |
| GET | `/orders/:id` | Détail commande |
| GET/POST/DELETE | `/wishlist` | Favoris |

#### Paiement — `/api`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET/POST | `/payments/fedapay/callback` | Webhook / retour FedaPay |
| GET | `/orders/:id/payment-status` | Polling statut paiement |
| POST | `/orders/:id/retry-payment` | Réessayer un paiement échoué |

#### Admin — `/api/admin`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/dashboard` | Stats + graphiques |
| GET/PATCH | `/users` | Gestion clients |
| POST | `/seed-products` | **Synchroniser catalogue statique → DB** |

### Logique panier et commande (`shopController.js`)

**Constantes livraison :**
- Frais : 800 FCFA
- Gratuit à partir de 50 000 FCFA

**Création de commande (`createOrder`) :**
1. Reçoit `addressId`, `paymentMethod`, éventuellement `items` du client
2. Synchronise le panier client avec la DB (`syncClientItemsToCart`)
3. Vérifie le stock de chaque produit
4. Calcule sous-total + frais de port
5. Crée `Order` + `OrderItem` en transaction
6. Décrémente le stock, vide le panier
7. Si `FEADAPAY` : crée transaction FedaPay, retourne `paymentUrl`
8. Sinon (CARD, espèces) : met le statut paiement selon la méthode
9. Envoie email de confirmation

**Résolution produit (`cartHelpers.js`) :**
- Le panier client peut contenir un `productId` ou un `slug`
- Le serveur résout toujours vers un vrai `Product` en DB
- Si le produit n'existe qu'en statique (pas seedé) → panier considéré vide côté serveur

### Seed catalogue (`seedStaticProducts`)

Endpoint appelé depuis le dashboard admin. Pour chaque produit statique envoyé :
1. Crée le producteur `NFlowers Catalogue` si absent
2. Crée les catégories manquantes
3. Si le **slug** n'existe pas encore en DB → crée le produit
4. Si le slug existe déjà → ignore (idempotent)

> Les images ne sont pas stockées en DB pour les produits seedés : elles restent dans les assets Vite côté frontend. C'est voulu.

---

## 6. Frontend (client)

### Routing (`App.jsx`)

Toutes les routes sont déclarées dans `App.jsx`. Les providers enveloppent l'application :

```jsx
QueryClientProvider → AuthProvider → CartProvider → BrowserRouter
```

| URL | Page | Accès |
|-----|------|-------|
| `/` | Accueil | Public |
| `/produits?category=...` | Catalogue | Public |
| `/produits/:slug` | Fiche produit | Public |
| `/panier` | Panier | Public |
| `/checkout` | Paiement | Connecté |
| `/commande/confirmation/:id` | Confirmation | Connecté |
| `/connexion`, `/inscription` | Auth | Invité seulement |
| `/admin` | Dashboard | Admin |
| `/admin/produits` | CRUD produits | Admin |
| ... | 5 autres pages admin | Admin |

### Contextes React

#### `AuthContext`
- Stocke `user`, `accessToken`, `refreshToken` dans `localStorage`
- `login()` / `register()` / `logout()`
- Au chargement : appelle `GET /api/auth/me` si token présent

#### `CartContext`
- Clé localStorage : `nflowers_cart`
- `addItem(product)`, `updateQuantity`, `removeItem`, `clearCart`
- À la connexion : `POST /api/cart/sync` pour fusionner panier local et serveur
- Chaque `addItem` déclenche aussi `POST /api/cart` si connecté

### Couche API (`services/`)

`api.js` configure Axios :
- `baseURL` : `/api` (proxy Vite en dev) ou `VITE_API_URL` en prod
- Intercepteur 401 : tente refresh token, relance la requête

`index.js` expose des services nommés :
- `authService`, `productService`, `cartService`, `orderService`
- `adminService` (dont `seedStaticProducts`)

### Pages catalogue — logique par catégorie

`ProductsPage.jsx` lit les query params : `category`, `productType`, `subcategory`, `page`.

| category | Comportement |
|----------|--------------|
| `plantes` | Filtre intérieur / extérieur, 4 produits/page |
| `engrais` | 4 sous-pages (organique, intérieur, fleur, gazon) |
| `jardinage` | 4 sous-pages (désherbeur, outils, pack, soin) |
| `fleurs-bouquets` | 8 produits, 2 onglets |
| `maison-decoration` | Délègue à `MaisonDecoPage` (galerie éditoriale, pas de prix) |

La configuration UI (titres, hero, pills, descriptions) est dans `lib/constants.js` → `CATALOG_SECTIONS`.

### Fiche produit (`ProductDetailPage.jsx`)

1. Tente `GET /api/products/:slug`
2. Si absent → fallback `getStaticProductBySlug(slug)`
3. Affichage adapté selon la catégorie :
   - **Engrais** : sections description structurées
   - **Jardinage** : description longue + tableau caractéristiques
   - **Fleurs** : plantation, bienfaits, signification, culture en pratique

### Données statiques (`data/staticProducts.js`)

**~52 produits** répartis en :

| Groupe | Slug catégorie | Nombre |
|--------|----------------|--------|
| Plantes intérieur | `plantes` / INTERIOR | 4 |
| Plantes extérieur | `plantes` / EXTERIOR | 4 |
| Engrais | `engrais` | 16 (4 × 4 sous-cat.) |
| Jardinage | `jardinage` | 16 |
| Fleurs & Vertus | `fleurs-bouquets` | 8 |
| Maison & Décoration | `maison-decoration` | 4 |

**Fonctions exportées :**
- `getStaticProducts({ category, productType, subcategory })` — filtre
- `getStaticProductBySlug(slug)` — un produit
- `combineWithStatic(staticList, apiList)` — fusion intelligente
- `ALL_STATIC_PRODUCTS` — liste complète

### Images

Les images des maquettes sont dans `client/src/assets/` et importées via des fichiers dédiés :

- `plantesAssets.js`, `amenagementAssets.js`, `jardinageAssets.js`, `fleursAssets.js`, `maisonDecoAssets.js`

Vite les bundle au build → URLs locales fiables, pas besoin de CDN pour le catalogue curatif.

---

## 7. Catalogue produits : statique + base de données

### Pourquoi ce choix ?

| Besoin | Solution |
|--------|----------|
| Maquettes riches sans CMS lourd | Fichiers JS + images PNG locales |
| Panier, stock, commandes réels | MySQL |
| Site jamais vide en démo | Statiques toujours affichés |
| Produits ajoutés par l'admin | API s'ajoute après les statiques |
| Checkout fonctionnel | Sync slug → ID DB |

### Comment fonctionne `combineWithStatic`

```javascript
// Règle simplifiée :
// 1. Pour chaque produit statique :
//    - Si son slug existe en DB → garder TOUT le contenu statique (images, textes)
//      mais remplacer id par l'ID DB (pour que le panier fonctionne)
// 2. Ajouter à la fin les produits API qui n'ont pas d'équivalent statique
```

**Où c'est utilisé :**
- `ProductsPage.jsx` — grille catalogue
- `HomePage.jsx` — carrousels accueil
- `CartPage.jsx` — suggestions « Avez-vous besoin de cela ? »

### Workflow opérationnel

```
[Développement]
  Ajouter produit dans staticProducts.js + image dans assets/
       ↓
[Admin — une fois ou après chaque ajout]
  Dashboard → « Synchroniser le catalogue »
       ↓
[Runtime]
  combineWithStatic affiche contenu riche + ID DB
       ↓
[Client]
  Ajout panier → checkout → commande OK
```

### Produits créés uniquement depuis l'admin

Ils n'ont pas d'entrée statique. Ils apparaissent **après** les produits curatifs dans les listes. Leurs images viennent de Cloudinary (upload admin).

---

## 8. Parcours utilisateur clés

### Parcours achat complet

```
1. /produits?category=fleurs-bouquets
2. Clic sur une fiche → /produits/camomille-matricaria-chamomilla
3. « Ajouter au panier » → CartContext (localStorage)
4. /panier → récapitulatif
5. /checkout (connecté) → adresse + mode de paiement
6. POST /api/orders → redirection FedaPay ou confirmation directe
7. /commande/confirmation/:id → polling statut si FedaPay
```

### Panier : local + serveur

Le panier vit **d'abord** dans le navigateur (`localStorage`). Quand l'utilisateur se connecte :
- `POST /api/cart/sync` envoie les items locaux au serveur
- Les `CartItem` en DB deviennent la source de vérité pour la commande

Cela permet d'ajouter au panier **sans être connecté**, puis de finaliser après login.

### Maison & Décoration (cas particulier)

`MaisonDecoPage` est une page **éditoriale** : galerie d'inspiration (terrasse, balcon, jardin, piscine, salon). Pas de prix, pas d'ajout au panier. Les données viennent de `maisonDecoAssets.js`.

---

## 9. Paiement FedaPay

### Flux

```
Checkout (FEADAPAY sélectionné)
    → POST /api/orders
    → createFedaPayTransaction() — montant XOF, téléphone Bénin
    → Réponse { paymentUrl }
    → window.location = paymentUrl (page FedaPay)
    → Utilisateur paie
    → FedaPay redirige vers /commande/confirmation/:id?payment=feadapay
    → OrderConfirmationPage poll GET /orders/:id/payment-status
    → Callback serveur confirme paymentStatus = PAID
```

### Fichiers concernés

| Fichier | Rôle |
|---------|------|
| `server/src/services/fedapayService.js` | Création transaction, token, vérification |
| `server/src/controllers/paymentController.js` | Callback, polling, retry |
| `client/src/pages/cart/CheckoutPage.jsx` | Choix paiement, redirection |
| `client/src/pages/orders/OrderConfirmationPage.jsx` | Attente + retry |

### Sandbox — numéros de test

Affichés dans le checkout :
- **0164000001**
- **0166000001**

Format Bénin : 10 chiffres avec indicatif `01`.

### Autres modes de paiement (simulation)

| Méthode | Comportement |
|---------|--------------|
| `CARD` / `STRIPE` | `PAID` + `CONFIRMED` immédiat |
| `CASH_ON_DELIVERY` | `PENDING` — paiement à la livraison |

---

## 10. Espace administrateur

### Accès

URL : `/admin` — réservé aux utilisateurs `role: ADMIN`.

### Pages admin

| Route | Fonction |
|-------|----------|
| `/admin` | Dashboard : KPIs, graphiques Recharts, sync catalogue |
| `/admin/produits` | CRUD produits + upload image |
| `/admin/commandes` | Liste commandes, changement statut |
| `/admin/clients` | Utilisateurs, activation/désactivation |
| `/admin/producteurs` | CRUD producteurs |
| `/admin/categories` | CRUD catégories |
| `/admin/messages` | Messages contact + newsletter |

### Dashboard — données réelles

Les graphiques ne sont plus simulés. `getDashboard` agrège :
- Commandes par jour (semaine en cours)
- Chiffre d'affaires par mois (année)
- Ventes des 7 derniers jours
- Alertes stock (≤ 5 unités)

### Bouton « Synchroniser le catalogue »

**Indispensable avant toute démo de commande** sur les produits des maquettes.

Envoie les 52 produits de `ALL_STATIC_PRODUCTS` vers `POST /api/admin/seed-products`.  
Résultat affiché : `X créés · Y déjà présents`.

---

## 11. Animations (GSAP)

### Organisation

```
lib/animations/
├── gsapSetup.js      # Enregistre ScrollTrigger, Flip
├── constants.js      # Durées, easing, toggleActions
└── helpers.js        # scrollStaggerIn, heroCascade, bindProductCardHover...
```

### Principes

- Animations centralisées dans `helpers.js` — pas de GSAP éparpillé dans les pages
- `useGsapAnimations(ref, callback, deps)` gère le lifecycle et le cleanup
- `useReducedMotion` respecte `prefers-reduced-motion` (accessibilité)
- `ScrollRevealSection` : wrapper réutilisable pour révélation au scroll

### Comportement scroll

Les éléments **restent visibles** une fois animés (pas de disparition au scroll vers le haut).  
`toggleActions: 'play none none none'` — animation jouée une fois à l'entrée.

---

## 12. Variables d'environnement

### `server/.env` (obligatoires)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL MySQL |
| `JWT_ACCESS_SECRET` | Secret token court |
| `JWT_REFRESH_SECRET` | Secret token long |
| `CLIENT_URL` | URL frontend (CORS, emails, callback FedaPay) |
| `FEADAPAY_SECRET_KEY` | Clé API FedaPay |
| `FEADAPAY_ENV` | `sandbox` ou `live` |

### `server/.env` (optionnelles)

| Variable | Description |
|----------|-------------|
| `CLOUDINARY_*` | Upload images admin |
| `SMTP_*` | Envoi emails réels |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Compte admin du seed |

### `client/.env`

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL API en production (ex: `https://api.monsite.com/api`) |

En dev, le proxy Vite redirige `/api` → `localhost:5000` — pas besoin de `VITE_API_URL`.

---

## 13. Déploiement et partage du projet

### Partager avec un testeur / jury

**Ne pas envoyer `node_modules`** (plusieurs centaines de Mo).

```bash
# Créer une archive sans node_modules ni .git
zip -r nflowers.zip . -x "*/node_modules/*" -x "*/.git/*"
```

Le testeur :
```bash
unzip nflowers.zip && cd Flowers
npm run install:all
# Copier server/.env (fichier séparé, jamais dans le zip)
cd server && npx prisma generate && npx prisma db push && npm run db:seed
cd .. && npm run dev
```

> Si la base est hébergée dans le cloud (chez l'hébergeur), le testeur utilise la même `DATABASE_URL` dans son `.env` — pas besoin d'installer MySQL localement.

### Déploiement production (schéma type)

| Composant | Hébergement suggéré |
|-----------|---------------------|
| Frontend (`client/dist`) | Vercel, Netlify, Nginx |
| Backend | Railway, Render, VPS |
| MySQL | Base MySQL de l'hébergeur (cPanel), PlanetScale, RDS |
| Images admin | Cloudinary |

Build frontend :
```bash
cd client
VITE_API_URL=https://votre-api.com/api npm run build
```

---

## 14. Questions fréquentes en soutenance

### « Pourquoi React + Express et pas un framework tout-en-un ? »

Séparation claire frontend / backend : le client peut être déployé sur un CDN, l'API sur un serveur Node. Prisma donne un ORM typé pour MySQL. C'est une architecture classique et maintenable pour un e-commerce.

### « Pourquoi des produits statiques ET une base de données ? »

Les maquettes exigent un contenu riche (images locales, textes longs, sections bienfaits) difficile à saisir uniquement via un formulaire admin. Le catalogue statique garantit un rendu fidèle aux maquettes. La DB gère ce qui doit être transactionnel : stock, panier, commandes, paiement. La synchronisation par slug fait le pont entre les deux.

### « Comment gérez-vous la sécurité ? »

- Mots de passe hashés (Bcrypt, 12 rounds)
- JWT avec refresh token rotation
- Helmet, CORS restrictif, rate limiting (200 req / 15 min)
- Routes admin protégées par middleware `requireAdmin`
- Validation des entrées (`express-validator`)

### « Que se passe-t-il si FedaPay est indisponible ? »

La commande est créée en `PENDING`. L'utilisateur peut réessayer via `retryPayment`. En sandbox, les numéros de test permettent de simuler succès/échec.

### « Comment ajouter une nouvelle catégorie de produits ? »

1. Ajouter les images dans `client/src/assets/`
2. Créer ou étendre un fichier `*Assets.js`
3. Ajouter les produits dans `staticProducts.js`
4. Configurer `CATALOG_SECTIONS` dans `lib/constants.js`
5. Adapter `ProductsPage.jsx` si layout spécifique (comme `MaisonDecoPage`)
6. Synchroniser le catalogue depuis l'admin

### « Où sont les tests ? »

Le projet est orienté démo / mémoire. Les tests manuels couvrent : parcours achat, paiement sandbox, CRUD admin, responsive mobile.

---

## 15. Comment étendre le projet

### Ajouter un produit au catalogue curatif

1. **Image** → `client/src/assets/mon-produit.png`
2. **Import** → dans le fichier `*Assets.js` de la section
3. **Données** → nouvel objet dans le tableau correspondant de `staticProducts.js` :
   ```javascript
   {
     id: 's-xxx-n',           // ID fictif unique
     name: '...',
     slug: 'mon-produit',     // URL : /produits/mon-produit
     price: 5000,
     stock: 10,
     productType: 'PLANT',
     subcategory: '...',
     category: { name: '...', slug: 'engrais' },
     imageUrls: [MON_IMAGE],
     description: '...',
     features: [...],
     // champs optionnels selon la section
   }
   ```
4. **Admin** → Synchroniser le catalogue
5. Vérifier sur `/produits?category=...` et tester l'ajout au panier

### Ajouter une route

1. Créer la page dans `client/src/pages/`
2. Importer et ajouter `<Route>` dans `App.jsx`
3. Si protégée : envelopper avec `<ProtectedRoute>` ou `adminOnly`

### Ajouter un endpoint API

1. Fonction dans le controller approprié
2. Route dans `server/src/routes/`
3. Monter la route dans `app.js` si nouveau fichier
4. Exposer dans `client/src/services/index.js`

---

## Annexe — Fichiers à connaître par cœur pour la soutenance

| Fichier | Pourquoi c'est important |
|---------|--------------------------|
| `client/src/App.jsx` | Toutes les routes |
| `client/src/data/staticProducts.js` | Catalogue + `combineWithStatic` |
| `client/src/context/CartContext.jsx` | Logique panier |
| `client/src/pages/products/ProductsPage.jsx` | Cœur du catalogue |
| `client/src/lib/constants.js` | Config sections catalogue |
| `server/prisma/schema.prisma` | Modèle de données |
| `server/src/controllers/shopController.js` | Commandes, panier, seed |
| `server/src/services/fedapayService.js` | Intégration paiement |
| `server/src/app.js` | Montage de l'API |

---

*Documentation générée pour le projet NFlowers — à mettre à jour lors de chaque évolution majeure du code.*
