import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import producerRoutes from './routes/producerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Derrière le proxy de l'hébergeur (cPanel / Passenger) : nécessaire pour le rate limiter
app.set('trust proxy', 1);

app.use(helmet({
  // Autorise les images externes (Cloudinary, Unsplash, placehold.co) et Google Fonts
  contentSecurityPolicy: {
    directives: {
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
      'connect-src': ["'self'", 'https:'],
      'form-action': ["'self'", 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Trop de requêtes, réessayez plus tard' },
});
app.use('/api', limiter);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'NFlowers API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/producers', producerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', contactRoutes);

// ── Frontend compilé (dossier server/public) ──────────────────────────────
// Le site React est servi par le même serveur Node : une seule application
// à déployer, et l'API reste accessible sur /api (même domaine).
const publicDir = process.env.PUBLIC_DIR || path.resolve(__dirname, '../public');
if (fs.existsSync(path.join(publicDir, 'index.html'))) {
  app.use(express.static(publicDir, { index: false, maxAge: '7d' }));
  // Toutes les routes hors /api renvoient index.html (React Router)
  app.get(/^\/(?!api(\/|$)).*/, (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
