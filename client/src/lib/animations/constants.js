/** Constantes d'animation partagées — cohérence visuelle sur tout le site */

export const EASE = {
  standard: 'power3.out',
  entrance: 'back.out(1.4)',
  elastic: 'elastic.out(1, 0.5)',
};

export const DURATION = {
  micro: 0.45,
  hover: 0.3,
  section: 0.75,
  page: 0.55,
  modal: 0.5,
  flip: 0.65,
  hero: 0.85,
};

export const STAGGER = {
  list: 0.10,
  menu: 0.09,
  table: 0.07,
};

export const SCROLL_TRIGGER = {
  start: 'top 88%',
  /** Joue une seule fois par sens — jamais de re-hide */
  toggleActions: 'play none none none',
};

export const FROM = {
  section: { y: 40, scale: 0.92, opacity: 0 },
  header: { y: -28, opacity: 0 },
  hero: { y: 40, scale: 0.82, opacity: 0, rotation: -2 },
  step: { x: 48, opacity: 0, scale: 0.96 },
};
