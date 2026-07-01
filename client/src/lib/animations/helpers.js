import { gsap, ScrollTrigger, Flip } from './gsapSetup';
import { DURATION, EASE, FROM, SCROLL_TRIGGER, STAGGER } from './constants';

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function resolveEase(selector, options = {}) {
  if (options.ease) return options.ease;
  if (selector?.includes('card') || selector?.includes('row') || selector?.includes('article')) {
    return EASE.card;
  }
  return EASE.section;
}

function resolveFrom(selector, options = {}) {
  if (options.from) return options.from;
  if (selector?.includes('card') || selector?.includes('row') || selector?.includes('article')) {
    return FROM.card;
  }
  return FROM.section;
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
 * Révèle des éléments en cascade au scroll (descente ET remontée).
 * Combinaison translateY + fade + scale avec toggleActions bidirectionnel.
 */
export function scrollStaggerIn(container, selector, options = {}) {
  if (!container) return null;

  const targets = selector
    ? Array.from(container.querySelectorAll(selector))
    : Array.from(container.children);

  if (!targets.length) return null;

  const from = resolveFrom(selector, options);
  const duration = options.duration ?? DURATION.section;
  const ease = resolveEase(selector, options);
  const staggerVal = options.stagger ?? STAGGER.list;
  const stagger = typeof staggerVal === 'object'
    ? staggerVal
    : { each: staggerVal, from: 'start' };

  return gsap.from(targets, {
    ...from,
    force3D: true,
    duration,
    ease,
    stagger,
    scrollTrigger: {
      trigger: container,
      start: options.start ?? SCROLL_TRIGGER.start,
      toggleActions: SCROLL_TRIGGER.toggleActions,
      ...options.scrollTrigger,
    },
  });
}

/** Entrée hero spectaculaire en cascade avec rebond */
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
    ease: options.ease ?? EASE.card,
    stagger: options.stagger ?? STAGGER.list,
    delay: options.delay ?? 0.15,
  });
}

/** Header slide down + fade + scale au chargement */
export function headerEntrance(headerEl) {
  if (!headerEl) return null;
  gsap.set(headerEl, { ...FROM.header, force3D: true });
  return gsap.to(headerEl, {
    y: 0,
    scale: 1,
    opacity: 1,
    duration: DURATION.section,
    ease: EASE.section,
  });
}

export function resetNavLinks(links) {
  if (!links?.length) return;
  gsap.set(links, { x: 0, opacity: 1, clearProps: 'transform,opacity' });
}

export function animateMobileMenuOpen(links) {
  if (!links?.length || prefersReducedMotion()) return null;
  gsap.set(links, { x: -28, opacity: 0, scale: 0.9 });
  return gsap.to(links, {
    x: 0,
    opacity: 1,
    scale: 1,
    duration: DURATION.micro,
    ease: EASE.card,
    stagger: { each: STAGGER.menu, from: 'start' },
  });
}

export function animateMobileMenuClose(links) {
  if (!links?.length || prefersReducedMotion()) return null;
  return gsap.to(links, {
    x: -20,
    opacity: 0,
    scale: 0.94,
    duration: 0.28,
    ease: EASE.standard,
    stagger: { each: 0.08, from: 'end' },
  });
}

export function pulseBadge(el) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { scale: 1.6, opacity: 0.6 },
    { scale: 1, opacity: 1, duration: DURATION.micro, ease: EASE.card },
  );
}

export function animateAddToCartButton(btn) {
  if (!btn || prefersReducedMotion()) return;
  gsap.timeline()
    .to(btn, { scale: 0.88, duration: 0.1, ease: 'power3.in' })
    .to(btn, { scale: 1, duration: DURATION.micro, ease: EASE.card });
}

export function bindProductCardHover(cardEl, imageEl) {
  if (!cardEl || prefersReducedMotion()) return () => {};

  const onEnter = () => {
    gsap.to(cardEl, {
      y: -8,
      scale: 1.03,
      boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
      duration: DURATION.hover,
      ease: EASE.card,
    });
    if (imageEl) {
      gsap.to(imageEl, { scale: 1.08, duration: DURATION.hover, ease: EASE.card });
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
  const onEnter = () => gsap.to(imageEl, { scale, duration: DURATION.hover, ease: EASE.card });
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
    stagger: STAGGER.list,
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
  gsap.set(panel, { scale: 0.82, opacity: 0, y: 36 });

  return gsap.timeline()
    .to(overlay, { opacity: 1, duration: DURATION.modal, ease: EASE.standard })
    .to(panel, {
      scale: 1,
      opacity: 1,
      y: 0,
      duration: DURATION.modal,
      ease: EASE.card,
    }, '-=0.35');
}

export function animateModalClose(overlay, panel, onComplete) {
  return gsap.timeline({ onComplete })
    .to(panel, {
      scale: 0.88,
      opacity: 0,
      y: 20,
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
  gsap.set(el, { autoAlpha: 0, y: 32, scale: 0.94, force3D: true });
  return gsap.to(el, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    duration: DURATION.page,
    ease: EASE.section,
  });
}

export function animateStepIn(el, direction = 1) {
  if (!el) return null;
  gsap.set(el, { x: 56 * direction, opacity: 0, scale: 0.92 });
  return gsap.to(el, {
    x: 0,
    opacity: 1,
    scale: 1,
    duration: DURATION.section,
    ease: EASE.card,
  });
}

export function animateCartItemOut(el, onComplete) {
  if (!el || prefersReducedMotion()) return onComplete?.();
  return gsap.to(el, {
    x: -56,
    opacity: 0,
    scale: 0.92,
    duration: DURATION.micro,
    ease: EASE.standard,
    onComplete,
  });
}

export function animateNumberPulse(el) {
  if (!el) return;
  gsap.fromTo(
    el,
    { scale: 1.2, opacity: 0.5 },
    { scale: 1, opacity: 1, duration: DURATION.micro, ease: EASE.card },
  );
}

export function bindSkeletonPulse(elements) {
  if (!elements?.length) return null;
  return gsap.to(elements, {
    opacity: 0.35,
    scale: 0.96,
    duration: 0.7,
    ease: 'power3.inOut',
    stagger: { each: STAGGER.list, repeat: -1, yoyo: true },
  });
}

export function animateSuccessIcon(el) {
  if (!el) return null;
  gsap.set(el, { scale: 0, opacity: 0, rotation: -35 });
  return gsap.to(el, {
    scale: 1,
    opacity: 1,
    rotation: 0,
    duration: DURATION.section,
    ease: EASE.card,
  });
}

export function animateImageSwap(imgEl) {
  if (!imgEl) return;
  gsap.fromTo(
    imgEl,
    { scale: 0.85, opacity: 0, rotation: 3 },
    { scale: 1, opacity: 1, rotation: 0, duration: DURATION.micro, ease: EASE.card },
  );
}

export function refreshScrollTrigger() {
  ScrollTrigger.refresh();
}
