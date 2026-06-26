import { gsap, ScrollTrigger, Flip } from './gsapSetup';
import { DURATION, EASE, FROM, SCROLL_TRIGGER, STAGGER } from './constants';

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Vérifie si un élément est déjà visible dans le viewport au montage */
function isInViewport(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

/** Config ScrollTrigger pour les tweens inline (AnimatedStatValue, etc.) */
export function buildScrollTriggerConfig(container, options = {}) {
  return {
    trigger: options.trigger ?? container,
    start: options.start ?? SCROLL_TRIGGER.start,
    toggleActions: SCROLL_TRIGGER.toggleActions,
    ...options.scrollTrigger,
  };
}

/**
 * Révèle des éléments en cascade au scroll.
 *
 * Stratégie robuste :
 * - On utilise ScrollTrigger avec toggleActions 'play none none reverse'
 *   → révélation à l'entrée, retour à l'état initial quand on quitte
 *   → mais pour qu'ils restent visibles une fois révélés, on track "hasPlayed"
 * - Si la section est déjà dans le viewport au montage : révélation immédiate
 *   sans masquage préalable (évite le flash blanc).
 */
export function scrollStaggerIn(container, selector, options = {}) {
  if (!container) return null;

  const targets = selector
    ? Array.from(container.querySelectorAll(selector))
    : Array.from(container.children);

  if (!targets.length) return null;

  const from = options.from ?? FROM.section;
  const duration = options.duration ?? DURATION.section;
  const ease = options.ease ?? EASE.entrance;
  const staggerVal = options.stagger ?? STAGGER.list;
  const stagger = typeof staggerVal === 'object'
    ? staggerVal
    : { each: staggerVal, from: 'start' };

  const animateIn = () => {
    gsap.to(targets, {
      y: 0,
      x: 0,
      scale: 1,
      opacity: 1,
      rotation: 0,
      force3D: true,
      duration,
      ease,
      stagger,
      overwrite: 'auto',
    });
  };

  // Si la section est déjà visible au chargement → révélation immédiate, pas de masquage
  if (isInViewport(container)) {
    gsap.set(targets, { clearProps: 'all' });
    return null;
  }

  // Masquer les éléments hors viewport
  gsap.set(targets, { ...from, force3D: true });

  // ScrollTrigger : révèle à l'entrée ET à la remontée, jamais re-caché
  let revealed = false;
  return ScrollTrigger.create({
    trigger: container,
    start: options.start ?? SCROLL_TRIGGER.start,
    onEnter: () => { if (!revealed) { revealed = true; animateIn(); } else { animateIn(); } },
    onEnterBack: () => { animateIn(); },
  });
}

/** Entrée hero au chargement */
export function heroCascade(container, selector, options = {}) {
  const targets = container.querySelectorAll(selector);
  if (!targets.length) return null;

  gsap.set(targets, { ...FROM.hero, force3D: true });

  return gsap.to(targets, {
    y: 0,
    scale: 1,
    opacity: 1,
    rotation: 0,
    duration: options.duration ?? DURATION.hero,
    ease: options.ease ?? EASE.entrance,
    stagger: options.stagger ?? STAGGER.list,
    delay: options.delay ?? 0.12,
  });
}

/** Header slide down + fade au chargement */
export function headerEntrance(headerEl) {
  if (!headerEl) return null;
  gsap.set(headerEl, { ...FROM.header, force3D: true });
  return gsap.to(headerEl, {
    y: 0,
    opacity: 1,
    duration: DURATION.section,
    ease: EASE.entrance,
  });
}

export function resetNavLinks(links) {
  if (!links?.length) return;
  gsap.set(links, { x: 0, opacity: 1, clearProps: 'transform,opacity' });
}

export function animateMobileMenuOpen(links) {
  if (!links?.length || prefersReducedMotion()) return null;
  gsap.set(links, { x: -24, opacity: 0, scale: 0.95 });
  return gsap.to(links, {
    x: 0,
    opacity: 1,
    scale: 1,
    duration: DURATION.micro,
    ease: EASE.entrance,
    stagger: { each: STAGGER.menu, from: 'start' },
  });
}

export function animateMobileMenuClose(links) {
  if (!links?.length || prefersReducedMotion()) return null;
  return gsap.to(links, {
    x: -16,
    opacity: 0,
    scale: 0.97,
    duration: 0.28,
    ease: EASE.standard,
    stagger: { each: 0.05, from: 'end' },
  });
}

export function pulseBadge(el) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { scale: 1.55 },
    { scale: 1, duration: DURATION.micro, ease: EASE.elastic },
  );
}

export function animateAddToCartButton(btn) {
  if (!btn || prefersReducedMotion()) return;
  gsap.timeline()
    .to(btn, { scale: 0.9, duration: 0.1, ease: 'power3.in' })
    .to(btn, { scale: 1, duration: DURATION.micro, ease: EASE.elastic });
}

export function bindProductCardHover(cardEl, imageEl) {
  if (!cardEl || prefersReducedMotion()) return () => {};

  const onEnter = () => {
    gsap.to(cardEl, {
      y: -8,
      scale: 1.02,
      boxShadow: '0 16px 32px rgba(0,0,0,0.13)',
      duration: DURATION.hover,
      ease: EASE.entrance,
    });
    if (imageEl) {
      gsap.to(imageEl, { scale: 1.07, duration: DURATION.hover, ease: EASE.standard });
    }
  };

  const onLeave = () => {
    gsap.to(cardEl, {
      y: 0,
      scale: 1,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      duration: DURATION.hover,
      ease: EASE.standard,
    });
    if (imageEl) {
      gsap.to(imageEl, { scale: 1, duration: DURATION.hover, ease: EASE.standard });
    }
  };

  cardEl.addEventListener('mouseenter', onEnter);
  cardEl.addEventListener('mouseleave', onLeave);

  return () => {
    cardEl.removeEventListener('mouseenter', onEnter);
    cardEl.removeEventListener('mouseleave', onLeave);
  };
}

export function bindImageZoomHover(imageEl, scale = 1.08) {
  if (!imageEl || prefersReducedMotion()) return () => {};

  const parent = imageEl.parentElement;
  const onEnter = () => gsap.to(imageEl, { scale, duration: DURATION.hover, ease: EASE.entrance });
  const onLeave = () => gsap.to(imageEl, { scale: 1, duration: DURATION.hover, ease: EASE.standard });

  (parent || imageEl).addEventListener('mouseenter', onEnter);
  (parent || imageEl).addEventListener('mouseleave', onLeave);

  return () => {
    (parent || imageEl).removeEventListener('mouseenter', onEnter);
    (parent || imageEl).removeEventListener('mouseleave', onLeave);
  };
}

export function flipProductGrid(gridEl, flipStateRef) {
  if (!gridEl || !flipStateRef?.current) return;
  Flip.from(flipStateRef.current, {
    duration: DURATION.flip,
    ease: EASE.standard,
    stagger: 0.06,
    absolute: true,
    prune: true,
  });
  flipStateRef.current = null;
}

export function captureFlipState(gridEl, flipStateRef) {
  if (!gridEl) return;
  flipStateRef.current = Flip.getState(gridEl.querySelectorAll('[data-animate-card]'));
}

export function animateModalOpen(overlay, panel) {
  gsap.set(overlay, { opacity: 0 });
  gsap.set(panel, { scale: 0.85, opacity: 0, y: 28 });

  return gsap.timeline()
    .to(overlay, { opacity: 1, duration: DURATION.modal, ease: EASE.standard })
    .to(panel, {
      scale: 1,
      opacity: 1,
      y: 0,
      duration: DURATION.modal,
      ease: EASE.entrance,
    }, '-=0.35');
}

export function animateModalClose(overlay, panel, onComplete) {
  return gsap.timeline({ onComplete })
    .to(panel, {
      scale: 0.9,
      opacity: 0,
      y: 16,
      duration: 0.32,
      ease: 'power3.in',
    })
    .to(overlay, { opacity: 0, duration: 0.22 }, '-=0.12');
}

export function animateCounter(el, endValue, options = {}) {
  if (!el) return null;
  const obj = { val: 0 };
  return gsap.to(obj, {
    val: endValue,
    duration: options.duration ?? DURATION.section,
    ease: EASE.standard,
    onUpdate: () => {
      const v = Math.round(obj.val);
      el.textContent = options.formatter ? options.formatter(v) : v.toLocaleString('fr-FR');
    },
  });
}

export function pageEnter(el) {
  if (!el) return null;
  gsap.set(el, { autoAlpha: 0, y: 20, scale: 0.98, force3D: true });
  return gsap.to(el, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    duration: DURATION.page,
    ease: EASE.entrance,
  });
}

export function animateStepIn(el, direction = 1) {
  if (!el) return null;
  gsap.set(el, { x: 48 * direction, opacity: 0, scale: 0.96 });
  return gsap.to(el, {
    x: 0,
    opacity: 1,
    scale: 1,
    duration: DURATION.section,
    ease: EASE.entrance,
  });
}

export function animateCartItemOut(el, onComplete) {
  if (!el || prefersReducedMotion()) return onComplete?.();
  return gsap.to(el, {
    x: -48,
    opacity: 0,
    scale: 0.96,
    duration: DURATION.micro,
    ease: EASE.standard,
    onComplete,
  });
}

export function animateNumberPulse(el) {
  if (!el) return;
  gsap.fromTo(
    el,
    { scale: 1.15, opacity: 0.5 },
    { scale: 1, opacity: 1, duration: DURATION.micro, ease: EASE.entrance },
  );
}

export function bindSkeletonPulse(elements) {
  if (!elements?.length) return null;
  return gsap.to(elements, {
    opacity: 0.4,
    scale: 0.98,
    duration: 0.7,
    ease: 'power3.inOut',
    stagger: { each: 0.1, repeat: -1, yoyo: true },
  });
}

export function animateSuccessIcon(el) {
  if (!el) return null;
  gsap.set(el, { scale: 0, opacity: 0, rotation: -30 });
  return gsap.to(el, {
    scale: 1,
    opacity: 1,
    rotation: 0,
    duration: DURATION.section,
    ease: EASE.entrance,
  });
}

export function animateImageSwap(imgEl) {
  if (!imgEl) return;
  gsap.fromTo(
    imgEl,
    { scale: 0.88, opacity: 0, rotation: 2 },
    { scale: 1, opacity: 1, rotation: 0, duration: DURATION.micro, ease: EASE.entrance },
  );
}

export function refreshScrollTrigger() {
  ScrollTrigger.refresh();
}
