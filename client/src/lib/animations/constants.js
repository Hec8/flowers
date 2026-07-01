/** Constantes d'animation partagées — cohérence visuelle sur tout le site */

export const EASE = {
  standard: 'power3.out',
  section: 'power3.out',
  card: 'back.out(1.7)',
  entrance: 'back.out(1.7)',
  elastic: 'elastic.out(1, 0.5)',
};

export const DURATION = {
  micro: 0.45,
  hover: 0.32,
  section: 0.8,
  page: 0.6,
  modal: 0.5,
  flip: 0.65,
  hero: 1,
};

export const STAGGER = {
  list: 0.12,
  menu: 0.1,
  table: 0.1,
};

export const SCROLL_TRIGGER = {
  start: 'top 85%',
  toggleActions: 'play reverse play reverse',
};

export const FROM = {
  section: { y: 48, scale: 0.92, opacity: 0 },
  card: { y: 40, scale: 0.88, opacity: 0 },
  header: { y: -32, scale: 0.96, opacity: 0 },
  hero: { y: 56, scale: 0.75, opacity: 0, rotation: -3 },
  step: { x: 48, opacity: 0, scale: 0.94 },
};
