import { useRef } from 'react';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { scrollStaggerIn } from '../../lib/animations/helpers';

/**
 * Wrap qui révèle ses enfants au scroll (descend ET remonte).
 * Les éléments restent visibles une fois révélés — pas de re-hide.
 */
export default function ScrollRevealSection({
  children,
  className = '',
  selector,
  as: Tag = 'section',
  stagger,
  from,
  start,
  ...rest
}) {
  const ref = useRef(null);

  useGsapAnimations(ref, () => {
    scrollStaggerIn(ref.current, selector, { stagger, from, start });
  }, [selector]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
