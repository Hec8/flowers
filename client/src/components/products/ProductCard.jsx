import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import StarRating from './StarRating';
import { formatPriceShort } from '../../lib/constants';
import { useCart } from '../../context/CartContext';
import { PRODUCT_TYPE_LABELS } from '../../lib/constants';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { bindProductCardHover, animateAddToCartButton } from '../../lib/animations/helpers';

export default function ProductCard({ product, compact = false }) {
  const { addItem } = useCart();
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const btnRef = useRef(null);
  const image = product.imageUrls?.[0] || 'https://placehold.co/400x400/e8f5e9/1a6b3c?text=NFlowers';
  const typeLabel = PRODUCT_TYPE_LABELS[product.productType] || product.category?.name || 'Produit';

  useGsapAnimations(cardRef, () => {
    // Bind hover après que le scroll trigger a terminé son animation initiale
    const timeout = setTimeout(() => {
      const cleanup = bindProductCardHover(cardRef.current, imageRef.current);
      cardRef._hoverCleanup = cleanup;
    }, 800);
    return () => {
      clearTimeout(timeout);
      cardRef._hoverCleanup?.();
    };
  }, []);

  const handleAdd = () => {
    addItem(product);
    animateAddToCartButton(btnRef.current);
    toast.success('Ajouté au panier');
  };

  return (
    <div
      ref={cardRef}
      data-animate-card
      className="bg-white border border-gray-100 group will-change-transform"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <Link to={`/produits/${product.slug}`} className="block overflow-hidden">
        <img
          ref={imageRef}
          src={image}
          alt={product.name}
          className={`w-full object-contain bg-gray-50 will-change-transform ${compact ? 'h-40' : 'h-52'}`}
        />
      </Link>
      <div className="p-4 text-center border-t border-gray-50">
        <Link to={`/produits/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 hover:text-primary min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>
        {!compact && <p className="text-xs text-gray-500 mb-2">{typeLabel}</p>}
        <div className="flex justify-center mb-2">
          <StarRating rating={product.avgRating || 0} count={product.reviewCount || product._count?.reviews} />
        </div>
        <p className="font-bold text-gray-900 mb-3">{formatPriceShort(product.price)}</p>
        <button
          ref={btnRef}
          type="button"
          disabled={product.stock === 0}
          onClick={handleAdd}
          className="w-full bg-primary text-white py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 will-change-transform"
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}
