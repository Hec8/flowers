import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { pageEnter } from '../../lib/animations/helpers';

/**
 * Enveloppe le contenu de page pour une transition fade + slide à chaque changement de route.
 */
export default function PageTransition({ children }) {
  const ref = useRef(null);
  const location = useLocation();

  useGsapAnimations(ref, () => {
    pageEnter(ref.current);
  }, [location.pathname]);

  return (
    <div ref={ref} className="flex-1">
      {children}
    </div>
  );
}
