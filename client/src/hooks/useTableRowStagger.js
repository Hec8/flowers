import { useRef } from 'react';
import { useGsapAnimations } from './useGsapAnimations';
import { scrollStaggerIn } from '../lib/animations/helpers';
import { STAGGER } from '../lib/animations/constants';

/** Stagger d'apparition pour lignes de tableau admin */
export function useTableRowStagger(rowSelector = '[data-animate-row]') {
  const ref = useRef(null);

  useGsapAnimations(ref, () => {
    scrollStaggerIn(ref.current, rowSelector, { stagger: STAGGER.table });
  }, []);

  return ref;
}
