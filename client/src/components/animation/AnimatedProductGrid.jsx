import { useRef } from 'react';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { scrollStaggerIn } from '../../lib/animations/helpers';

/**
 * Grille produits avec apparition stagger au scroll.
 */
export default function AnimatedProductGrid({ products, className = '', children }) {
  const gridRef = useRef(null);

  useGsapAnimations(gridRef, () => {
    scrollStaggerIn(gridRef.current, '[data-animate-card]', {
      from: { y: 28, opacity: 0, scale: 0.95 },
    });
  }, [products.length]);

  return (
    <div ref={gridRef} className={className}>
      {children}
    </div>
  );
}
