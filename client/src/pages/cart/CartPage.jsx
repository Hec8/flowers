import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useRef } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import ProductCard from '../../components/products/ProductCard';
import CartLineItem from '../../components/cart/CartLineItem';
import AnimatedNumber from '../../components/animation/AnimatedNumber';
import ScrollRevealSection from '../../components/animation/ScrollRevealSection';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services';
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD, formatPrice, formatPriceShort } from '../../lib/constants';
import { ALL_STATIC_PRODUCTS, combineWithStatic } from '../../data/staticProducts';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { scrollStaggerIn } from '../../lib/animations/helpers';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const listRef = useRef(null);

  const { data: suggestionsApi } = useQuery({
    queryKey: ['products', 'suggestions'],
    queryFn: () => productService.getAll({ limit: 8 }).then((r) => r.data.data),
  });
  // Statiques toujours affichés avec leurs images ; DB non-dupliqués s'ajoutent après
  const suggestions = combineWithStatic(ALL_STATIC_PRODUCTS.slice(0, 8), suggestionsApi || []);

  useGsapAnimations(listRef, () => {
    if (items.length) {
      scrollStaggerIn(listRef.current, '[data-animate-cart-item]', { start: 'top 95%' });
    }
  }, [items.length]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Panier d&apos;achat</h1>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">Votre panier est vide</p>
            <Link
              to="/produits"
              className="inline-flex items-center gap-2 text-primary font-medium uppercase text-sm tracking-wide"
            >
              <ArrowLeft size={16} /> Poursuivre les achats
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div ref={listRef} className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <CartLineItem
                  key={item.productId}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}

              <Link
                to="/produits"
                className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-primary uppercase tracking-wide"
              >
                <ArrowLeft size={16} /> Poursuivre les achats
              </Link>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-100 p-6 sticky top-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>{itemCount} article{itemCount > 1 ? 's' : ''}</span>
                    <AnimatedNumber value={subtotal} format={formatPrice} className="font-medium" />
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison :</span>
                    <span>{shipping === 0 ? 'Gratuite' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-3">
                    <span>Total :</span>
                    <AnimatedNumber value={total} format={formatPrice} />
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="block w-full bg-primary text-white text-center py-3.5 font-bold tracking-wide mt-6 hover:bg-primary-dark transition-colors uppercase text-sm"
                >
                  Commander
                </Link>
              </div>
            </div>
          </div>
        )}

        {suggestions?.length > 0 && (
          <ScrollRevealSection className="mt-16" selector="[data-animate-card]">
            <h2 className="text-center text-xl mb-8">
              Avez-vous <span className="text-primary font-bold">besoin</span> de cela ?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestions.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </ScrollRevealSection>
        )}
      </div>
    </MainLayout>
  );
}
