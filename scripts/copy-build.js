// Copie le frontend compilé (client/dist) vers server/public,
// pour que le serveur Node serve le site et l'API ensemble.
import fs from 'fs';
import path from 'path';

const src = path.resolve('client/dist');
const dest = path.resolve('server/public');

if (!fs.existsSync(src)) {
  console.error('client/dist introuvable : lancez d\'abord "npm run build --prefix client"');
  process.exit(1);
}
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log('✓ Frontend copié dans server/public');
