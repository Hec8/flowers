import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/animations/gsapSetup';
import { registerGsapPlugins } from '../lib/animations/gsapSetup';
import { useReducedMotion } from './useReducedMotion';

registerGsapPlugins();

/**
 * Remet tous les éléments d'un scope visibles et propres.
 * Utilisé quand prefers-reduced-motion est actif ou en fallback.
 */
export function resetScopeVisibility(el) {
  if (!el) return;
  const all = [el, ...el.querySelectorAll('*')];
  gsap.set(all, { clearProps: 'opacity,transform,visibility,scale,rotation' });
}

/**
 * Hook GSAP avec cleanup automatique et respect de prefers-reduced-motion.
 */
export function useGsapAnimations(scope, callback, deps = []) {
  const reducedMotion = useReducedMotion();

  return useGSAP(() => {
    if (!scope?.current) return;
    if (reducedMotion) {
      resetScopeVisibility(scope.current);
      return;
    }
    callback();
  }, { scope, dependencies: deps });
}

export { useGSAP };
export { useReducedMotion };
