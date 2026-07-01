import prisma from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { paginate, paginationMeta, generateOrderNumber } from '../utils/helpers.js';
import { sendEmail } from '../config/mailer.js';
import { orderConfirmationEmail } from '../templates/emailTemplates.js';
import { createSlug } from '../utils/slug.js';
import { resolveProductFromCartItem, syncClientItemsToCart } from '../utils/cartHelpers.js';
import { createFedaPayTransaction, buildFedaPayCallbackUrl, regenerateFedaPayPaymentUrl } from '../services/fedapayService.js';

const SHIPPING_FEE = 800;
const FREE_SHIPPING_THRESHOLD = 50000;

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const WEEKDAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildDashboardCharts(paidOrders, weekOrders, now = new Date()) {
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);

  const monthlySales = [];
  for (let month = 0; month <= now.getMonth(); month += 1) {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 1);
    const sales = paidOrders
      .filter((o) => o.createdAt >= monthStart && o.createdAt < monthEnd)
      .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

    monthlySales.push({
      month: MONTH_LABELS[month],
      sales: Math.round(sales),
    });
  }

  const dailySales = [];

  for (let i = 6; i >= 0; i -= 1) {
    const dayStart = startOfDay(now);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayOrders = paidOrders.filter(
      (o) => o.createdAt >= dayStart && o.createdAt < dayEnd,
    );
    const sales = dayOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const label = dayStart.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

    dailySales.push({
      day: label,
      sales: Math.round(sales),
    });
  }

  const weekStart = startOfDay(now);
  const dayOfWeek = weekStart.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStart.setDate(weekStart.getDate() + diffToMonday);

  const weeklyOrders = [];
  for (let i = 0; i < 7; i += 1) {
    const dayStart = new Date(weekStart);
    dayStart.setDate(dayStart.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const count = paidOrders.filter(
      (o) => o.createdAt >= dayStart && o.createdAt < dayEnd,
    ).length;

    weeklyOrders.push({
      day: WEEKDAY_LABELS[dayStart.getDay()],
      orders: count,
    });
  }

  return {
    monthlySales,
    dailySales,
    weeklyOrders,
  };
}

const cartInclude = {
  product: {
    include: {
      category: { select: { name: true } },
      producer: { select: { name: true } },
    },
  },
};

export const getCart = async (req, res) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: cartInclude,
  });

  const subtotal = items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  res.json({
    success: true,
    data: {
      items,
      subtotal,
      shippingFee: subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE,
      total: subtotal + (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE),
    },
  });
};

export const syncCart = async (req, res) => {
  const { items } = req.body; // [{ productId, slug, quantity }]

  await syncClientItemsToCart(req.user.id, items);

  const cart = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: cartInclude,
  });

  res.json({ success: true, data: cart });
};

export const addToCart = async (req, res) => {
  const { productId, slug, quantity = 1 } = req.body;

  const product = await resolveProductFromCartItem({ productId, slug });
  if (!product) throw new AppError('Produit introuvable', 404);
  if (product.stock < quantity) throw new AppError('Stock insuffisant', 400);

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: req.user.id, productId: product.id } },
  });

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: req.user.id, productId: product.id } },
    update: { quantity: { increment: quantity } },
    create: { userId: req.user.id, productId: product.id, quantity },
    include: cartInclude,
  });

  res.status(201).json({ success: true, data: item });
};

export const updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const item = await prisma.cartItem.findFirst({
    where: { id, userId: req.user.id },
    include: { product: true },
  });
  if (!item) throw new AppError('Article introuvable', 404);

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id } });
    return res.json({ success: true, message: 'Article supprimé' });
  }

  if (item.product.stock < quantity) throw new AppError('Stock insuffisant', 400);

  const updated = await prisma.cartItem.update({
    where: { id },
    data: { quantity },
    include: cartInclude,
  });

  res.json({ success: true, data: updated });
};

export const removeCartItem = async (req, res) => {
  const item = await prisma.cartItem.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!item) throw new AppError('Article introuvable', 404);

  await prisma.cartItem.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Article supprimé' });
};

export const clearCart = async (req, res) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
  res.json({ success: true, message: 'Panier vidé' });
};

// Orders
export const createOrder = async (req, res) => {
  const { addressId, paymentMethod, items: clientItems } = req.body;

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: req.user.id },
  });
  if (!address) throw new AppError('Adresse introuvable', 404);

  // Synchronise le panier client (localStorage) vers la BDD avant validation
  if (clientItems?.length) {
    await syncClientItemsToCart(req.user.id, clientItems);
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: req.user.id },
    include: { product: true },
  });

  if (!cartItems.length) {
    throw new AppError(
      'Panier vide — les produits sélectionnés ne sont pas disponibles en base de données',
      400,
    );
  }

  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      throw new AppError(`Stock insuffisant pour ${item.product.name}`, 400);
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const totalAmount = subtotal + shippingFee;

  const paymentStatus =
    paymentMethod === 'CASH_ON_DELIVERY' || paymentMethod === 'FEADAPAY'
      ? 'PENDING'
      : 'PAID';

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user.id,
        addressId,
        paymentMethod,
        paymentStatus,
        status: paymentStatus === 'PAID' ? 'CONFIRMED' : 'PENDING',
        subtotal,
        shippingFee,
        totalAmount,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product.price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        address: true,
      },
    });

    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { userId: req.user.id } });

    return newOrder;
  });

  let paymentUrl = null;

  if (paymentMethod === 'FEADAPAY') {
    const nameParts = (req.user.name || 'Client NFlowers').trim().split(/\s+/);
    const firstname = nameParts[0] || 'Client';
    const lastname = nameParts.slice(1).join(' ') || 'NFlowers';

    try {
      const feda = await createFedaPayTransaction({
        amount: totalAmount,
        description: `Commande ${order.orderNumber} — NFlowers`,
        callbackUrl: buildFedaPayCallbackUrl(order.id),
        merchantReference: order.orderNumber,
        customer: {
          firstname,
          lastname,
          email: req.user.email,
          phone: address.phone,
          country: 'bj',
        },
      });

      paymentUrl = feda.paymentUrl;

      await prisma.order.update({
        where: { id: order.id },
        data: { fedapayTransactionId: String(feda.transactionId) },
      });
    } catch (err) {
      console.error('FedaPay error:', err.message);
      throw new AppError(`Impossible d'initialiser le paiement FedaPay: ${err.message}`, 502);
    }
  }

  // Pour les paiements non-FedaPay (COD, etc.) : e-mail immédiat car la commande est directement confirmée
  if (paymentMethod !== 'FEADAPAY') {
    try {
      await sendEmail({
        to: req.user.email,
        subject: `Commande confirmée ${order.orderNumber} — NFlowers`,
        html: orderConfirmationEmail({
          orderNumber: order.orderNumber,
          totalAmount,
          status: order.status,
          paymentUrl: null,
        }),
      });
    } catch (mailErr) {
      console.error('[Email] Erreur envoi confirmation commande:', mailErr.message);
    }
  }
  // Pour FedaPay : l'e-mail est envoyé par paymentController.js quand le paiement est confirmé

  res.status(201).json({ success: true, data: order, paymentUrl });
};

export const getMyOrders = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const { status } = req.query;

  const where = { userId: req.user.id };
  if (status === 'PROCESSING') {
    where.status = { in: ['PENDING', 'CONFIRMED', 'SHIPPING'] };
  } else if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: { select: { name: true, imageUrls: true } } } },
        address: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: paginationMeta(total, page, limit),
  });
};

export const getOrderById = async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: {
      items: { include: { product: true } },
      address: true,
    },
  });

  if (!order) throw new AppError('Commande introuvable', 404);
  res.json({ success: true, data: order });
};

// Admin orders
export const adminGetOrders = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const { status } = req.query;

  const where = status ? { status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: paginationMeta(total, page, limit),
  });
};

export const adminUpdateOrderStatus = async (req, res) => {
  const { status, paymentStatus } = req.body;

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
    },
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: true } },
    },
  });

  res.json({ success: true, data: order });
};

// Wishlist
export const getWishlist = async (req, res) => {
  const items = await prisma.wishlist.findMany({
    where: { userId: req.user.id },
    include: {
      product: {
        include: {
          category: true,
          producer: { select: { name: true, isBio: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: items });
};

export const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
  });
  if (!product) throw new AppError('Produit introuvable', 404);

  const item = await prisma.wishlist.upsert({
    where: {
      userId_productId: { userId: req.user.id, productId },
    },
    update: {},
    create: { userId: req.user.id, productId },
    include: { product: true },
  });

  res.status(201).json({ success: true, data: item });
};

export const removeFromWishlist = async (req, res) => {
  const item = await prisma.wishlist.findFirst({
    where: { productId: req.params.productId, userId: req.user.id },
  });
  if (!item) throw new AppError('Produit non trouvé dans la wishlist', 404);

  await prisma.wishlist.delete({ where: { id: item.id } });
  res.json({ success: true, message: 'Retiré de la wishlist' });
};

// Producers
export const getProducers = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);

  const [producers, total] = await Promise.all([
    prisma.producer.findMany({
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    }),
    prisma.producer.count(),
  ]);

  res.json({
    success: true,
    data: producers,
    pagination: paginationMeta(total, page, limit),
  });
};

export const getProducerBySlug = async (req, res) => {
  const producer = await prisma.producer.findUnique({
    where: { slug: req.params.slug },
    include: {
      products: {
        where: { isActive: true },
        include: {
          category: true,
          reviews: { select: { rating: true } },
        },
      },
    },
  });

  if (!producer) throw new AppError('Producteur introuvable', 404);
  res.json({ success: true, data: producer });
};

export const adminCreateProducer = async (req, res) => {
  const { name, bio, cultivationMethod, isBio, imageUrl } = req.body;
  const slug = createSlug(name);

  const producer = await prisma.producer.create({
    data: {
      name,
      slug,
      bio,
      cultivationMethod,
      isBio: isBio === true || isBio === 'true',
      imageUrl,
    },
  });

  res.status(201).json({ success: true, data: producer });
};

export const adminUpdateProducer = async (req, res) => {
  const data = { ...req.body };
  if (data.name) data.slug = createSlug(data.name);

  const producer = await prisma.producer.update({
    where: { id: req.params.id },
    data,
  });

  res.json({ success: true, data: producer });
};

export const adminDeleteProducer = async (req, res) => {
  const count = await prisma.product.count({
    where: { producerId: req.params.id },
  });
  if (count > 0) throw new AppError('Producteur lié à des produits', 400);

  await prisma.producer.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Producteur supprimé' });
};

// Admin dashboard & users
export const getDashboard = async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalProducts,
    outOfStock,
    totalUsers,
    monthlyRevenue,
    totalOrders,
    pendingOrders,
    recentOrders,
    lowStockProducts,
    paidOrders,
    unreadMessages,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true, stock: 0 } }),
    prisma.user.count({ where: { role: 'CLIENT', isActive: true } }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        paymentStatus: 'PAID',
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'SHIPPING'] } } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: 5 } },
      take: 10,
      select: { id: true, name: true, stock: true },
    }),
    prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: new Date(now.getFullYear(), 0, 1) },
      },
      select: { createdAt: true, totalAmount: true },
    }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  const charts = buildDashboardCharts(paidOrders, now);

  res.json({
    success: true,
    data: {
      stats: {
        totalProducts,
        outOfStock,
        totalUsers,
        monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
        totalOrders,
        pendingOrders,
        pendingOrdersPercent: totalOrders
          ? Math.round((pendingOrders / totalOrders) * 100)
          : 0,
        unreadMessages,
      },
      weeklyOrders: charts.weeklyOrders,
      dailyOrders: charts.dailyOrders,
      monthlySales: charts.monthlySales,
      dailySales: charts.dailySales,
      recentOrders,
      lowStockProducts,
    },
  });
};

export const adminGetUsers = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const { search } = req.query;

  const where = {
    role: 'CLIENT',
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
        addresses: {
          take: 1,
          orderBy: { isDefault: 'desc' },
          select: { street: true, city: true, phone: true, country: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: paginationMeta(total, page, limit),
  });
};

export const adminToggleUser = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new AppError('Utilisateur introuvable', 404);
  if (user.role === 'ADMIN') throw new AppError('Impossible de désactiver un admin', 400);

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: !user.isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });

  res.json({ success: true, data: updated });
};

export const submitContact = async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    throw new AppError('Tous les champs sont requis', 400);
  }

  const record = await prisma.contactMessage.create({
    data: { name, email, subject, message },
  });

  res.status(201).json({ success: true, data: record, message: 'Message envoyé' });
};

export const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email requis', 400);

  const record = await prisma.newsletterSubscription.upsert({
    where: { email: email.toLowerCase().trim() },
    update: {},
    create: { email: email.toLowerCase().trim() },
  });

  res.status(201).json({ success: true, data: record, message: 'Inscription enregistrée' });
};

export const adminGetContactMessages = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contactMessage.count(),
  ]);

  res.json({
    success: true,
    data: messages,
    pagination: paginationMeta(total, page, limit),
  });
};

export const adminMarkContactRead = async (req, res) => {
  const message = await prisma.contactMessage.update({
    where: { id: req.params.id },
    data: { isRead: true },
  });
  res.json({ success: true, data: message });
};

export const adminGetNewsletterSubscriptions = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);

  const [subscriptions, total] = await Promise.all([
    prisma.newsletterSubscription.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.newsletterSubscription.count(),
  ]);

  res.json({
    success: true,
    data: subscriptions,
    pagination: paginationMeta(total, page, limit),
  });
};

/* ─────────────────────────────────────────────────────────────────
   SEED : synchronise les produits statiques du catalogue vers la DB.
   POST /api/admin/seed-products
   Body: { products: [ { name, slug, description, price, stock,
                         productType, subcategory,
                         category: { slug, name } } ] }
───────────────────────────────────────────────────────────────── */
export const seedStaticProducts = async (req, res) => {
  const { products } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ success: false, message: 'Aucun produit fourni.' });
  }

  // 1. Trouver ou créer le producteur par défaut "NFlowers Catalogue"
  let defaultProducer = await prisma.producer.findFirst({
    where: { slug: 'nflowers-catalogue' },
  });
  if (!defaultProducer) {
    defaultProducer = await prisma.producer.create({
      data: {
        name: 'NFlowers Catalogue',
        slug: 'nflowers-catalogue',
        bio: 'Producteur officiel du catalogue curatif NFlowers.',
        isBio: true,
      },
    });
  }

  // 2. Résoudre / créer les catégories à partir des slugs
  const uniqueCatSlugs = [...new Set(products.map((p) => p.category?.slug).filter(Boolean))];
  const categoryMap = {};
  for (const catSlug of uniqueCatSlugs) {
    let cat = await prisma.category.findUnique({ where: { slug: catSlug } });
    if (!cat) {
      const catName = products.find((p) => p.category?.slug === catSlug)?.category?.name || catSlug;
      cat = await prisma.category.create({ data: { name: catName, slug: catSlug } });
    }
    categoryMap[catSlug] = cat.id;
  }

  // 3. Créer chaque produit si son slug n'existe pas encore
  let created = 0;
  let skipped = 0;
  const errors = [];

  for (const product of products) {
    try {
      const exists = await prisma.product.findUnique({ where: { slug: product.slug } });
      if (exists) { skipped++; continue; }

      const catSlug = product.category?.slug || 'plantes';
      const categoryId = categoryMap[catSlug];
      if (!categoryId) { errors.push(`Catégorie introuvable : ${catSlug}`); continue; }

      const validTypes = ['INTERIOR', 'EXTERIOR', 'BOUQUET', 'PLANT'];
      const productType = validTypes.includes(product.productType) ? product.productType : 'PLANT';

      await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description || product.name,
          price: Number(product.price) || 0,
          stock: Number(product.stock) || 10,
          imageUrls: [],          // images gérées côté frontend (assets Vite)
          productType,
          isActive: true,
          categoryId,
          producerId: defaultProducer.id,
        },
      });
      created++;
    } catch (err) {
      errors.push(`${product.slug}: ${err.message}`);
    }
  }

  return res.json({
    success: true,
    created,
    skipped,
    total: products.length,
    errors,
  });
};
