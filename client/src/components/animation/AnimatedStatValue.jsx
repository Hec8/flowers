import { useRef } from 'react';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { animateCounter, buildScrollTriggerConfig } from '../../lib/animations/helpers';
import { DURATION, EASE, FROM } from '../../lib/animations/constants';
import { gsap } from '../../lib/animations/gsapSetup';

/** Compteur animé pour stats admin (déclenché au scroll, replay bidirectionnel) */
export default function AnimatedStatValue({ value, suffix = '', className = 'text-2xl font-bold text-gray-900' }) {
  const ref = useRef(null);

  useGsapAnimations(ref, () => {
    if (!ref.current || value == null) return;

    gsap.fromTo(
      ref.current,
      { ...FROM.section, y: 24 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: DURATION.section,
        ease: EASE.entrance,
        scrollTrigger: buildScrollTriggerConfig(ref.current, {
          trigger: ref.current,
        }),
      },
    );

    animateCounter(ref.current, value, {
      formatter: (v) => `${Math.round(v).toLocaleString('fr-FR')}${suffix}`,
    });
  }, [value, suffix]);

  return (
    <p ref={ref} className={className}>
      {value?.toLocaleString('fr-FR')}{suffix}
    </p>
  );
}
