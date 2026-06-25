import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nflowers.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Administrateur NFlowers',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      currency: 'FCFA',
    },
  });

  console.log(`✅ Admin créé : ${admin.email}`);

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'plantes' },
      update: {},
      create: { name: 'Plantes', slug: 'plantes' },
    }),
    prisma.category.upsert({
      where: { slug: 'fleurs-bouquets' },
      update: {},
      create: { name: 'Fleurs & Bouquets', slug: 'fleurs-bouquets' },
    }),
    prisma.category.upsert({
      where: { slug: 'jardin-exterieur' },
      update: {},
      create: { name: 'Jardin & Extérieur', slug: 'jardin-exterieur' },
    }),
    prisma.category.upsert({
      where: { slug: 'maison-decoration' },
      update: {},
      create: { name: 'Maison & Décoration', slug: 'maison-decoration' },
    }),
  ]);

  const producers = await Promise.all([
    prisma.producer.upsert({
      where: { slug: 'ferme-vert-tropical' },
      update: {},
      create: {
        name: 'Ferme Vert Tropical',
        slug: 'ferme-vert-tropical',
        bio: 'Producteur familial spécialisé dans les plantes tropicales depuis 1998.',
        cultivationMethod: 'Culture biologique sans pesticides, irrigation goutte-à-goutte.',
        isBio: true,
        imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
      },
    }),
    prisma.producer.upsert({
      where: { slug: 'jardins-du-benin' },
      update: {},
      create: {
        name: 'Jardins du Bénin',
        slug: 'jardins-du-benin',
        bio: 'Pépinière locale proposant des fleurs et arbustes adaptés au climat ouest-africain.',
        cultivationMethod: 'Culture traditionnelle et sélection de variétés locales résistantes.',
        isBio: false,
        imageUrl: 'https://images.unsplash.com/photo-1466692476866-aef1dfb1e735?w=400',
      },
    }),
  ]);

  const products = [
    {
      name: 'Calathea sanderiana',
      description: 'Plante d\'intérieur aux feuilles pourpre et vert, parfaite pour apporter une touche exotique.',
      price: 15000,
      stock: 25,
      productType: 'INTERIOR',
      virtues: 'Purifie l\'air, apaise l\'esprit',
      flowerLanguage: 'Admiration et respect',
      imageUrls: ['https://images.unsplash.com/photo-1593482892291-5dccc3f23984?w=400'],
      categoryId: categories[0].id,
      producerId: producers[0].id,
    },
    {
      name: 'Orchidée Phalaenopsis',
      description: 'Orchidée élégante aux fleurs blanches délicates, idéale en cadeau.',
      price: 22000,
      stock: 15,
      productType: 'INTERIOR',
      virtues: 'Élégance, longévité',
      flowerLanguage: 'Amour raffiné et beauté',
      imageUrls: ['https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400'],
      categoryId: categories[1].id,
      producerId: producers[0].id,
    },
    {
      name: 'Thuja occidentalis',
      description: 'Arbuste persistant idéal pour les haies et l\'aménagement extérieur.',
      price: 8500,
      stock: 40,
      productType: 'EXTERIOR',
      virtues: 'Brise-vent naturel, persistant toute l\'année',
      flowerLanguage: 'Protection et force',
      imageUrls: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400'],
      categoryId: categories[2].id,
      producerId: producers[1].id,
    },
    {
      name: 'Bouquet de roses rouges',
      description: 'Magnifique bouquet de 12 roses rouges fraîchement coupées.',
      price: 18000,
      stock: 20,
      productType: 'BOUQUET',
      virtues: 'Parfum envoûtant, symbole d\'amour',
      flowerLanguage: 'Passion et amour profond',
      imageUrls: ['https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400'],
      categoryId: categories[1].id,
      producerId: producers[1].id,
    },
    {
      name: 'Monstera deliciosa',
      description: 'Plante tropicale iconique aux grandes feuilles découpées.',
      price: 12000,
      stock: 30,
      productType: 'PLANT',
      virtues: 'Décoration tendance, facile d\'entretien',
      flowerLanguage: 'Grandeur et abondance',
      imageUrls: ['https://images.unsplash.com/photo-1614594975525-e45190c55d0a?w=400'],
      categoryId: categories[0].id,
      producerId: producers[0].id,
    },
    {
      name: 'Lavande en pot',
      description: 'Plante aromatique parfumée, parfaite pour balcon ou terrasse.',
      price: 6500,
      stock: 50,
      productType: 'EXTERIOR',
      virtues: 'Repousse les insectes, parfum apaisant',
      flowerLanguage: 'Sérénité et dévotion',
      imageUrls: ['https://images.unsplash.com/photo-1499006088988-518e9f62a7f8?w=400'],
      categoryId: categories[2].id,
      producerId: producers[1].id,
    },
  ];

  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: { ...p, slug },
    });
  }

  console.log(`✅ ${products.length} produits créés`);
  console.log('🎉 Seed terminé !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
