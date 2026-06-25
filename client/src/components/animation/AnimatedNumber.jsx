import { useRef, useEffect } from 'react';
import { animateNumberPulse } from '../../lib/animations/helpers';

/** Affiche un nombre avec pulse GSAP à chaque changement de valeur */
export default function AnimatedNumber({ value, className = '', format = (v) => v }) {
  const ref = useRef(null);
  const prev = useRef(value);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.textContent = format(value);
    if (prev.current !== value) {
      animateNumberPulse(ref.current);
    }
    prev.current = value;
  }, [value, format]);

  return <span ref={ref} className={className}>{format(value)}</span>;
}
