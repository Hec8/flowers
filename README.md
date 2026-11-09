# NFlowers — E-commerce Fleurs Naturelles

Application web fullstack de vente de fleurs et plantes naturelles, développée en monorepo React + Express + MySQL.

> **Mise en ligne (cPanel, sans SSH)** : voir [DEPLOIEMENT.md](./DEPLOIEMENT.md)

> **Documentation complète** : voir [DOCUMENTATION.md](./DOCUMENTATION.md) — guide technique détaillé (architecture, arborescence, flux métier, soutenance).

## Structure du projet

```
Flowers/
├── README.md
├── package.json                 # Scripts monorepo
├── client/                      # Frontend React (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # AuthTabs, formulaires
│   │   │   └── layout/          # Header, Footer, AdminLayout...
│   │   ├── context/             # AuthContext, CartContext
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── admin/           # Dashboard, CRUD
│   │   │   ├── auth/            # Login, Register, Forgot password
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── producers/
│   │   │   ├── products/
│   │   │   └── profile/
│   │   ├── routes/              # ProtectedRoute
│   │   └── services/            # API Axios
│   └── package.json
└── server/                      # Backend Express
    ├── prisma/
    │   ├── schema.prisma        # Modèle de données
    │   └── seed.js              # Données initiales + admin
    └── src/
        ├── config/              # Prisma, Cloudinary, Mailer
        ├── controllers/
        ├── middlewares/         # Auth, Upload, Validation, Errors
        ├── routes/
        ├── utils/
        ├── app.js
        └── index.js
```

## Prérequis

- Node.js 18+
- MySQL 8+ (ou MariaDB 10.5+)
- Compte Cloudinary (optionnel — placeholder si non configuré)
- Compte SMTP (optionnel — emails simulés en console)

## Installation

> **Important (monorepo)** : un seul `npm install` à la racine **ne suffit pas**.  
> Il faut aussi installer les dépendances du **client** (Vite) et du **serveur** (Nodemon, Prisma).

```bash
# 1. Installer TOUTES les dépendances (racine + server + client)
cd Flowers
npm run install:all

# Équivalent manuel si besoin :
# npm install
# npm install --prefix server
# npm install --prefix client

# 2. Configurer l'environnement serveur
# Windows (PowerShell) : copier server\.env.example vers server\.env
# Linux/Mac : cp server/.env.example server/.env
# Éditer server/.env avec DATABASE_URL, JWT, FEADAPAY_*, CLIENT_URL

# 3. Configurer le client (optionnel)
# cp client/.env.example client/.env

# 4. Initialiser la base de données
cd server
npx prisma generate
npx prisma db push
npm run db:seed
cd ..
```

## Lancement

```bash
# Depuis la racine — lance client + serveur en parallèle
npm run dev

# Ou séparément :
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

## Compte administrateur (seed)

| Champ    | Valeur par défaut   |
|----------|---------------------|
| Email    | admin@nflowers.com  |
| Password | Admin123!           |

Configurable via `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans `server/.env`.

## API — Routes principales

| Module      | Endpoint                        | Auth   |
|-------------|---------------------------------|--------|
| Auth        | POST /api/auth/register         | Public |
| Auth        | POST /api/auth/login            | Public |
| Auth        | POST /api/auth/forgot-password  | Public |
| Produits    | GET /api/products               | Public |
| Panier      | GET/POST /api/cart              | JWT    |
| Commandes   | POST /api/orders                | JWT    |
| Wishlist    | GET/POST /api/wishlist          | JWT    |
| Producteurs | GET /api/producers/:slug        | Public |
| Admin       | GET /api/admin/dashboard        | ADMIN  |

## Décisions métier notables

- **birthDate & currency** : ajoutés au modèle User pour correspondre à la maquette d'inscription (cadeau anniversaire, sélecteur de devise).
- **paymentStatus** : séparé du statut de livraison (`OrderStatus`) pour gérer Payé / Échoué / En attente côté admin.
- **productType** : enum INTERIOR | EXTERIOR | BOUQUET | PLANT pour les filtres catalogue.
- **Paiement** : simulation intégrée (CARD/STRIPE = PAID immédiat, CASH_ON_DELIVERY = PENDING).
- **Images** : Cloudinary en production, placeholder automatique si non configuré.

## Stack technique

**Frontend :** React 19, Vite, Tailwind CSS 4, React Router 7, TanStack Query, React Hook Form + Zod, Sonner, Recharts, Lucide Icons

**Backend :** Express, Prisma, MySQL, JWT (access + refresh), Bcrypt, Multer, Cloudinary, Nodemailer, Helmet, CORS, Rate Limiter
