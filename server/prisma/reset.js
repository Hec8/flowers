/**
 * Reset de la base de données pour la soutenance.
 *
 * Supprime toutes les données SAUF le compte admin.
 * Les produits statiques sont re-créables via le bouton
 * « Synchroniser le catalogue » dans le dashboard.
 *
 * Usage : node prisma/reset.js
 */

import prisma from '../src/config/prisma.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('🧹  Début du reset de la base de données...\n');

  // 1. Supprimer les données transactionnelles
  await prisma.newsletterSubscription.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  console.log('✓  Commandes, panier, avis, wishlist supprimés');

  // 2. Supprimer les produits et le catalogue
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.producer.deleteMany();
  console.log('✓  Produits, catégories, producteurs supprimés');

  // 3. Supprimer tous les utilisateurs SAUF l'admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nflowers.com';
  await prisma.address.deleteMany({
    where: { user: { email: { not: adminEmail } } },
  });
  await prisma.user.deleteMany({
    where: { email: { not: adminEmail } },
  });
  console.log(`✓  Utilisateurs supprimés (admin ${adminEmail} conservé)`);

  // 4. S'assurer que le compte admin existe avec le bon mot de passe
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const hashed = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashed, role: 'ADMIN', isActive: true },
    create: {
      name: 'Administrateur',
      email: adminEmail,
      password: hashed,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`✓  Compte admin ${adminEmail} / ${adminPassword} prêt`);

  console.log('\n✅  Reset terminé ! La base est vierge.');
  console.log('👉  Connectez-vous en admin et cliquez "Synchroniser le catalogue"');
  console.log('    pour re-rendre les produits statiques commandables.\n');
}

main()
  .catch((e) => { console.error('❌ Erreur :', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
