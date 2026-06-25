import hero from '../assets/hero-maison-deco.png';

import ter1 from '../assets/maison-deco-terasse1.png';
import ter2 from '../assets/maison-deco-terasse2.png';
import ter3 from '../assets/maison-deco-terasse3.png';

import bal1 from '../assets/maison-deco-balcon1.png';
import bal2 from '../assets/maison-deco-balcon2.png';
import bal3 from '../assets/maison-deco-balcon3.png';

import jar1 from '../assets/maison-deco-jardin1.png';
import jar2 from '../assets/maison-deco-jardin2.png';
import jar3 from '../assets/maison-deco-jardin3.png';

import pisc1 from '../assets/maison-deco-piscine1.png';
import pisc2 from '../assets/maison-deco-piscine2.png';
import pisc3 from '../assets/maison-deco-piscine3.png';

import sal1 from '../assets/maison-deco-salon1.png';
import sal2 from '../assets/maison-deco-salon2.png';
import sal3 from '../assets/maison-deco-salon3.png';

export const MAISON_DECO_HERO = hero;

/** Onglets de sous-navigation avec thumbnail */
export const MAISON_DECO_TABS = [
  { label: 'Terrasse', subcategory: 'terrasse', thumbnail: ter1 },
  { label: 'Balcon',   subcategory: 'balcon',   thumbnail: bal1 },
  { label: 'Jardin',   subcategory: 'jardin',   thumbnail: jar1 },
  { label: 'Piscine',  subcategory: 'piscine',  thumbnail: pisc1 },
  { label: 'Salon',    subcategory: 'salon',    thumbnail: sal1 },
];

/** Cartes d'inspiration par sous-catégorie */
export const MAISON_DECO_CARDS = [
  /* ── Terrasse ── */
  { id: 'md-ter-1', subcategory: 'terrasse', imageUrl: ter1, caption: "Idées couleur et style pour profiter pleinement de votre espace extérieur" },
  { id: 'md-ter-2', subcategory: 'terrasse', imageUrl: ter2, caption: "Rendez votre terrasse accueillante et véritable prolongement de votre maison" },
  { id: 'md-ter-3', subcategory: 'terrasse', imageUrl: ter3, caption: "Transformez votre terrasse en un refuge de détente et d'harmonie" },
  /* ── Balcon ── */
  { id: 'md-bal-1', subcategory: 'balcon', imageUrl: bal1, caption: "Un petit espace, de grandes possibilités. Idées pour faire de votre balcon un lieu de vie" },
  { id: 'md-bal-2', subcategory: 'balcon', imageUrl: bal2, caption: "Rendez votre balcon accueillant pour savourer les douceurs de la vie en extérieur" },
  { id: 'md-bal-3', subcategory: 'balcon', imageUrl: bal3, caption: "Transformez votre balcon en un coin de paradis urbain vert" },
  /* ── Jardin ── */
  { id: 'md-jar-1', subcategory: 'jardin', imageUrl: jar1, caption: "Faites de votre jardin un espace où la beauté et la tranquillité se rencontrent" },
  { id: 'md-jar-2', subcategory: 'jardin', imageUrl: jar2, caption: "Laissez libre cours à votre créativité et personnalisez chaque recoin de votre espace" },
  { id: 'md-jar-3', subcategory: 'jardin', imageUrl: jar3, caption: "Rendez votre jardin accueillant pour profiter des plaisirs de la vie en plein air" },
  /* ── Piscine ── */
  { id: 'md-pisc-1', subcategory: 'piscine', imageUrl: pisc1, caption: "Un décor harmonieux autour de la piscine pour des moments de pur bonheur" },
  { id: 'md-pisc-2', subcategory: 'piscine', imageUrl: pisc2, caption: "Laissez libre cours à votre imagination pour personnaliser votre coin de baignade" },
  { id: 'md-pisc-3', subcategory: 'piscine', imageUrl: pisc3, caption: "Faites de votre piscine le cœur de votre jardin, un havre de détente et de convivialité" },
  /* ── Salon ── */
  { id: 'md-sal-1', subcategory: 'salon', imageUrl: sal1, caption: "Laissez libre cours à votre créativité pour faire de votre salon un endroit unique" },
  { id: 'md-sal-2', subcategory: 'salon', imageUrl: sal2, caption: "Un équilibre parfait entre style et fonctionnalité dans votre salon" },
  { id: 'md-sal-3', subcategory: 'salon', imageUrl: sal3, caption: "Inspirez vous des tendances pour personnaliser votre salon avec élégance" },
];

export const MAISON_DECO_DESCRIPTION =
  "Que ce soit pour l'intérieur ou l'extérieur, les idées de décoration jouent un rôle crucial dans la création d'un espace harmonieux et accueillant. Pour l'intérieur, on peut créer avec des éléments comme les plantes d'intérieur, des accessoires textiles, et des meubles au design élégant pour apporter chaleur et personnalité à chaque pièce. À l'extérieur, l'ajout de jardinières, de luminaires et de mobilier d'extérieur peut transformer un simple jardin ou balcon en un véritable havre de paix. L'astuce réside dans l'équilibre entre fonctionnalité et esthétique, créant ainsi des espaces qui reflètent le style et les goûts personnels tout en restant pratiques et confortables.";
