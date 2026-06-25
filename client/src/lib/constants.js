import { PLANTES_HERO } from '../data/plantesAssets.js';
import { AMENAGEMENT_HERO } from '../data/amenagementAssets.js';
import { JARDINAGE_HERO } from '../data/jardinageAssets.js';
import { FLEURS_HERO } from '../data/fleursAssets.js';

export const SHIPPING_FEE = 800;
export const FREE_SHIPPING_THRESHOLD = 50000;

export const formatPrice = (price) => {
  const n = parsePrice(price);
  return `${n.toLocaleString('fr-FR')} FCFA`;
};

export const formatPriceShort = (price) => {
  const n = parsePrice(price);
  return `${n.toLocaleString('fr-FR')}f`;
};

/** Parse un prix (nombre, string "5000f", "5 000", etc.) */
export function parsePrice(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/\s/g, '').replace(/[^\d.,-]/g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** Calcule le sous-total d'un panier */
export function calcCartSubtotal(items) {
  return items.reduce(
    (sum, item) => sum + parsePrice(item.price) * (Number(item.quantity) || 0),
    0,
  );
}

export const CATALOG_SECTIONS = {
  plantes: {
    template: 'plantes',
    title: 'Les plantes',
    titleInterior: 'Les plantes d\'intérieur',
    titleExterior: 'Les plantes d\'extérieur',
    subtitle: 'Apportez une touche nature chez vous !',
    breadcrumb: 'Plantes',
    heroImageInterior: PLANTES_HERO.INTERIOR,
    heroImageExterior: PLANTES_HERO.EXTERIOR,
    heroText: 'QUELLES PLANTES METTRE DANS SON ENTRÉE ?',
    descriptionInterior:
      'Transformez votre intérieur en oasis de verdure. Nos plantes d\'intérieur sont sélectionnées pour leur beauté, leur facilité d\'entretien et leur capacité à purifier l\'air.',
    descriptionExterior:
      'Transformez votre jardin, terrasse ou balcon avec nos plantes d\'extérieur adaptées au climat. Haies, arbustes et fleurs pour un espace vert éclatant.',
    pills: [
      { label: 'Plantes d\'intérieur', category: 'plantes', productType: 'INTERIOR' },
      { label: 'Plantes d\'extérieur', category: 'plantes', productType: 'EXTERIOR' },
    ],
  },
  engrais: {
    template: 'engrais',
    title: 'Engrais',
    parentBreadcrumb: 'Aménagement extérieur',
    parentHref: '/produits?category=engrais',
    breadcrumb: 'Engrais',
    subtitle: 'Pour des plantes en pleine santé sans recourir aux pesticides',
    heroImage: AMENAGEMENT_HERO,
    heroText: 'POUR DES PLANTES EN PLEINE SANTÉ',
    description:
      "Les engrais organiques sont les fertilisants naturels dérivés de matières végétales ou animales. Contrairement aux engrais chimiques, ils améliorent la structure du sol tout en fournissant des nutriments essentiels aux plantes. Les engrais organiques comprennent notamment le compost, le sang, les algues, la farine d'os et les coquilles d'escargot. Ils libèrent lentement les nutriments, favorisent une croissance saine et durable des plantes tout en encourageant les micro-organismes bénéfiques dans le sol, contribuant ainsi directement à la réduction des déchets et à la préservation de la biodiversité — des expériences jardinage respectueuses de l'environnement.",
    titleBySub: {
      organique: 'Engrais',
      interieur: "Angrais pour les plantes d'intérieur",
      fleur: 'Angrais pour les fleurs',
      gazon: 'Angrais pour les gazon',
      '': 'Engrais',
    },
    descriptionBySub: {
      organique:
        "Les engrais organiques sont les fertilisants naturels dérivés de matières végétales ou animales. Contrairement aux engrais chimiques, ils améliorent la structure du sol tout en fournissant des nutriments essentiels aux plantes. Les engrais organiques comprennent notamment le compost, le sang, les algues, la farine d'os et les coquilles d'escargot. Ils libèrent lentement les nutriments, favorisent une croissance saine et durable des plantes tout en encourageant les micro-organismes bénéfiques dans le sol, contribuant ainsi directement à la réduction des déchets et à la préservation de la biodiversité — des expériences jardinage respectueuses de l'environnement.",
      interieur:
        "Les engrais pour plantes d'intérieur sont formulés pour répondre aux besoins spécifiques des plantes qui poussent à l'intérieur, où les conditions de lumière, d'humidité et de température peuvent être très différentes de celles à l'extérieur.",
      fleur:
        "Les engrais pour fleurs sont spécialement formulés pour encourager une floraison abondante et prolongée. En fournissant un mélange équilibré de nutriments essentiels comme l'azote, le phosphore et le potassium, ces engrais soutiennent non seulement la santé générale des plantes, mais aussi leur capacité à produire des fleurs éclatantes et durables. L'application régulière de ces engrais garantit que vos fleurs restent vigoureuses tout au long de la saison, maximisant la beauté de votre jardin.",
      gazon:
        "Les engrais pour gazon sont formulés pour améliorer la densité et la vitalité du gazon en fournissant les nutriments nécessaires à sa croissance. En enrichissant le sol, ils favorisent une couleur verte plus intense et une santé générale optimale du gazon.",
      '':
        "Les engrais organiques sont les fertilisants naturels dérivés de matières végétales ou animales. Contrairement aux engrais chimiques, ils améliorent la structure du sol tout en fournissant des nutriments essentiels aux plantes.",
    },
    pills: [
      { label: 'Engrais organique', category: 'engrais', subcategory: 'organique' },
      { label: "Engrais pour plantes d'intérieur", category: 'engrais', subcategory: 'interieur' },
      { label: 'Engrais pour fleur', category: 'engrais', subcategory: 'fleur' },
      { label: 'Engrais pour gazon', category: 'engrais', subcategory: 'gazon' },
    ],
  },
  'jardin-exterieur': {
    title: 'Les plantes d\'extérieur',
    subtitle: 'Apportez une touche de nature chez vous !',
    breadcrumb: 'Aménagement extérieur',
    heroImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1400',
    heroText: 'QUELLES PLANTES METTRE DANS SON ENTRÉE ?',
    description:
      'Transformez votre jardin, terrasse ou balcon avec nos plantes d\'extérieur adaptées au climat ouest-africain. Haies, arbustes, fleurs de jardin et plantes couvre-sol — trouvez la plante parfaite pour chaque espace.',
    pills: [
      { label: 'Engrais', category: 'engrais', subcategory: '' },
      { label: 'Toutes', category: 'jardin-exterieur', productType: '' },
      { label: 'Arbustes & haies', category: 'jardin-exterieur', productType: 'EXTERIOR' },
    ],
  },
  'fleurs-bouquets': {
    title: 'Fleurs & Vertus',
    subtitle: 'La nature au service de votre bien-être',
    breadcrumb: 'Fleurs & Vertus',
    heroImage: FLEURS_HERO,
    heroText: 'DÉCOUVREZ LES VERTUS DES FLEURS NATURELLES',
    description:
      'Nos fleurs ne sont pas seulement belles — elles ont des vertus. Chaque espèce raconte une histoire : la camomille pour la sérénité, la lavande pour l\'apaisement, l\'hibiscus pour la vitalité. Découvrez nos fleurs médicinales et leurs significations.',
    titleBySub: {
      '': 'Toutes nos fleurs & vertus',
      roses: 'Fleurs aromatiques & médicinales',
      bouquets: 'Fleurs ornementales & thérapeutiques',
    },
    descriptionBySub: {
      '': 'Toute notre collection de fleurs aux vertus naturelles — aromatiques, médicinales et ornementales.',
      roses: 'Camomille, lavande, rose de Damas, fleur d\'oranger : des fleurs aromatiques aux vertus thérapeutiques ancestrales.',
      bouquets: 'Hibiscus, jasmin, chrysanthème, passiflore : des fleurs ornementales aux propriétés médicinales reconnues.',
    },
    pills: [
      { label: 'Toutes les fleurs', category: 'fleurs-bouquets', subcategory: '' },
      { label: 'Aromatiques & médicinales', category: 'fleurs-bouquets', subcategory: 'roses' },
      { label: 'Ornementales & thérapeutiques', category: 'fleurs-bouquets', subcategory: 'bouquets' },
    ],
  },
  'maison-decoration': {
    title: 'Idées de décoration d\'intérieur et d\'extérieur',
    subtitle: 'Transformez votre maison avec des idées déco tendances et éco-responsables',
    breadcrumb: 'Maison & Décoration',
    pills: [
      { label: 'Terrasse', category: 'maison-decoration', subcategory: 'terrasse' },
      { label: 'Balcon',   category: 'maison-decoration', subcategory: 'balcon' },
      { label: 'Jardin',   category: 'maison-decoration', subcategory: 'jardin' },
      { label: 'Piscine',  category: 'maison-decoration', subcategory: 'piscine' },
      { label: 'Salon',    category: 'maison-decoration', subcategory: 'salon' },
    ],
  },
  jardinage: {
    title: 'Outils du jardinier',
    subtitle: 'Le jardinage écologique pour un jardin respectueux de la nature',
    breadcrumb: 'Jardinage',
    heroImage: JARDINAGE_HERO,
    heroText: 'OUTILS DU JARDINIER',
    description:
      "Le désherbeur écologique est une méthode respectueuse de l'environnement pour éliminer les mauvaises herbes de manière respectueuse de l'environnement, en évitant l'utilisation de produits chimiques nocifs qui peuvent nuire à la biodiversité, contaminer les sols et les nappes phréatiques, et avoir des effets négatifs sur la santé humaine et animale. Des désherbeurs écologiques reposent généralement sur des principes physiques, thermiques, ou biologiques, et offrent des solutions alternatives durables et efficaces pour le jardinage.",
    titleBySub: {
      desherbeur: 'Outils du jardinier',
      outils:     'Outils de jardinage à main',
      pack:       'Pack outils sans fils pour jardinage',
      soin:       'Produits chimistes et soins des végétaux',
      '':         'Outils du jardinier',
    },
    descriptionBySub: {
      desherbeur:
        "Le désherbeur écologique est une méthode respectueuse de l'environnement pour éliminer les mauvaises herbes de manière respectueuse de l'environnement, en évitant l'utilisation de produits chimiques nocifs qui peuvent nuire à la biodiversité, contaminer les sols et les nappes phréatiques, et avoir des effets négatifs sur la santé humaine et animale. Des désherbeurs écologiques reposent généralement sur des principes physiques, thermiques, ou biologiques, et offrent des solutions alternatives durables et efficaces pour le jardinage.",
      outils:
        "Les outils de jardinage à main sont des équipements essentiels pour tout jardinier, amateurs comme professionnels. Sécateurs, griffes, transplantoirs, bêches et sarcloirs — découvrez notre sélection d'outils ergonomiques en acier inoxydable pour un jardinage précis et confortable.",
      pack:
        "Les packs d'outils sans fils offrent la liberté de mouvement indispensable pour les grands jardins. Coupes-branches, tondeuses, visseuses et souffleurs fonctionnent sur batterie Lithium interchangeable pour un entretien professionnel sans contrainte de câble.",
      soin:
        "Les soins naturels contre les maladies des plantes permettent de protéger votre jardin sans recourir aux pesticides chimiques. Insecticides biologiques, traitements fongiques à base de plantes et activateurs de défense naturelle — prenez soin de vos plantes de façon responsable.",
      '':
        "Le désherbeur écologique est une méthode respectueuse de l'environnement pour éliminer les mauvaises herbes sans produits chimiques nocifs.",
    },
    pills: [
      { label: 'Désherbeur écologique',                      category: 'jardinage', subcategory: 'desherbeur' },
      { label: 'Outils de jardinage à main',                 category: 'jardinage', subcategory: 'outils' },
      { label: 'Pack outils sans fils pour jardinage',       category: 'jardinage', subcategory: 'pack' },
      { label: 'Produits chimistes et soins des végétaux',   category: 'jardinage', subcategory: 'soin' },
    ],
  },
};

export const DEFAULT_CATALOG = {
  title: 'Notre catalogue',
  subtitle: 'Fleurs, plantes et accessoires de jardin',
  breadcrumb: 'Catalogue',
  heroImage: 'https://images.unsplash.com/photo-1466692476866-aef1dfb1e735?w=1400',
  heroText: 'DÉCOUVREZ NOS PRODUITS',
  description: 'Parcourez l\'ensemble de notre gamme : plantes, fleurs, pots, engrais et plus encore.',
  pills: [{ label: 'Tous les produits', category: '', productType: '' }],
};

export const PAYMENT_OPTIONS = [
  { key: 'feadapay', method: 'FEADAPAY', label: 'Payer avec FedaPay (Mobile Money, Carte)', display: 'FedaPay', color: 'text-green-700 font-bold' },
  { key: 'paypal', method: 'STRIPE', label: 'Payer avec un compte PayPal', display: 'PayPal', color: 'text-blue-700' },
  { key: 'visa', method: 'CARD', label: 'Payer par carte VISA', display: 'VISA', color: 'text-blue-900 font-bold italic' },
  { key: 'cb', method: 'CARD', label: 'Payer par carte bancaire', display: 'CB', color: 'text-blue-800 font-bold' },
  { key: 'mastercard', method: 'CARD', label: 'Payer par carte Mastercard', display: 'MC', color: 'text-orange-600 font-bold' },
  { key: 'momo', method: 'CASH_ON_DELIVERY', label: 'Payer à la livraison (MoMo / espèces)', display: 'MoMo', color: 'text-yellow-600 font-bold text-xs' },
];

export const PRODUCT_TYPE_LABELS = {
  INTERIOR: 'Plante d\'intérieur',
  EXTERIOR: 'Plante d\'extérieur',
  BOUQUET: 'Bouquet',
  PLANT: 'Plante',
};
