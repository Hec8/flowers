import prisma from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { paginate, paginationMeta } from '../utils/helpers.js';
import { createSlug } from '../utils/slug.js';

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  producer: { select: { id: true, name: true, slug: true, isBio: true } },
  reviews: {
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  },
  _count: { select: { reviews: true } },
};

const computeAvgRating = (reviews) => {
  if (!reviews?.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
};

export const getProducts = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const {
    search,
    category,
    productType,
    minPrice,
    maxPrice,
    producerId,
    sort = 'createdAt',
    order = 'desc',
  } = req.query;

  const where = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { virtues: { contains: search, mode: 'insensitive' } },
      { flowerLanguage: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) where.category = { slug: category };
  if (productType) where.productType = productType;
  if (producerId) where.producerId = producerId;

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  const allowedSort = ['createdAt', 'price', 'name'];
  const sortField = allowedSort.includes(sort) ? sort : 'createdAt';
  const sortOrder = order === 'asc' ? 'asc' : 'desc';

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortField]: sortOrder },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        producer: { select: { id: true, name: true, slug: true, isBio: true } },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const data = products.map((p) => ({
    ...p,
    avgRating: computeAvgRating(p.reviews),
    reviewCount: p.reviews.length,
    reviews: undefined,
  }));

  res.json({
    success: true,
    data,
    pagination: paginationMeta(total, page, limit),
  });
};

export const getProductBySlug = async (req, res) => {
  const product = await prisma.product.findFirst({
    where: { slug: req.params.slug, isActive: true },
    include: productInclude,
  });

  if (!product) throw new AppError('Produit introuvable', 404);

  const avgRating = await prisma.review.aggregate({
    where: { productId: product.id },
    _avg: { rating: true },
  });

  res.json({
    success: true,
    data: {
      ...product,
      avgRating: avgRating._avg.rating || 0,
    },
  });
};

export const getCategories = async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  res.json({ success: true, data: categories });
};

export const createReview = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError('Produit introuvable', 404);

  const review = await prisma.review.upsert({
    where: {
      userId_productId: { userId: req.user.id, productId },
    },
    update: { rating, comment },
    create: { userId: req.user.id, productId, rating, comment },
    include: { user: { select: { id: true, name: true } } },
  });

  res.status(201).json({ success: true, data: review });
};

// Admin CRUD
export const adminGetProducts = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const { search } = req.query;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        producer: true,
        _count: { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: paginationMeta(total, page, limit),
  });
};

export const adminCreateProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    stock,
    categoryId,
    producerId,
    productType,
    virtues,
    flowerLanguage,
    imageUrls = [],
  } = req.body;

  const slug = createSlug(name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const product = await prisma.product.create({
    data: {
      name,
      slug: finalSlug,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      categoryId,
      producerId,
      productType: productType || 'PLANT',
      virtues,
      flowerLanguage,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [imageUrls].filter(Boolean),
    },
    include: { category: true, producer: true },
  });

  res.status(201).json({ success: true, data: product });
};

export const adminUpdateProduct = async (req, res) => {
  const { id } = req.params;
  const data = { ...req.body };

  if (data.price) data.price = parseFloat(data.price);
  if (data.stock) data.stock = parseInt(data.stock, 10);
  if (data.name) data.slug = createSlug(data.name);

  const product = await prisma.product.update({
    where: { id },
    data,
    include: { category: true, producer: true },
  });

  res.json({ success: true, data: product });
};

export const adminDeleteProduct = async (req, res) => {
  await prisma.product.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  res.json({ success: true, message: 'Produit désactivé' });
};

export const adminCreateCategory = async (req, res) => {
  const { name } = req.body;
  const slug = createSlug(name);

  const category = await prisma.category.create({
    data: { name, slug },
  });

  res.status(201).json({ success: true, data: category });
};

export const adminUpdateCategory = async (req, res) => {
  const { name } = req.body;
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: { name, slug: createSlug(name) },
  });
  res.json({ success: true, data: category });
};

export const adminDeleteCategory = async (req, res) => {
  const count = await prisma.product.count({
    where: { categoryId: req.params.id },
  });
  if (count > 0) throw new AppError('Catégorie utilisée par des produits', 400);

  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Catégorie supprimée' });
};

export const uploadProductImage = async (req, res) => {
  if (!req.file) throw new AppError('Aucune image fournie', 400);

  const { uploadToCloudinary } = await import('../middlewares/upload.js');
  const url = await uploadToCloudinary(req.file.buffer, 'nflowers/products');

  res.json({ success: true, data: { url } });
};
