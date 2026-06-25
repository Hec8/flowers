import prisma from '../config/prisma.js';

/**
 * Résout un produit à partir d'un item panier client (id statique ou slug).
 */
export async function resolveProductFromCartItem(item) {
  if (item?.productId) {
    const byId = await prisma.product.findFirst({
      where: { id: item.productId, isActive: true },
    });
    if (byId) return byId;
  }

  if (item?.slug) {
    const bySlug = await prisma.product.findFirst({
      where: { slug: item.slug, isActive: true },
    });
    if (bySlug) return bySlug;
  }

  return null;
}

/** Synchronise les items client vers le panier serveur (résolution par slug si besoin). */
export async function syncClientItemsToCart(userId, items = []) {
  for (const item of items) {
    const product = await resolveProductFromCartItem(item);
    if (!product) continue;

    const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

    await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId, productId: product.id },
      },
      update: { quantity },
      create: {
        userId,
        productId: product.id,
        quantity,
      },
    });
  }
}
