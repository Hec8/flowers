import moustique from '../assets/moustiq.png';
import fleuri from '../assets/fleuri.png';
import marc from '../assets/plante-marc-de-cafe-7169-640-0.png';
import tout from '../assets/tout ce que vs.png';

export const ARTICLES = [
  {
    slug: 'plantes-nocives-animaux',
    title: 'Attention à ces plantes nocives pour les animaux',
    date: '08/05/24',
    excerpt: 'Certaines plantes d\'intérieur et d\'extérieur peuvent être toxiques pour vos compagnons à fourrure.',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800',
    category: 'Conseils en jardinage',
    sections: [
      { heading: 'Les plantes d\'intérieur', body: 'Le lys, le philodendron ou le dieffenbachia peuvent provoquer des troubles digestifs chez les chats et chiens. Placez-les hors de portée ou optez pour des variétés non toxiques.' },
      { heading: 'Les plantes d\'extérieur', body: 'L\'if, le laurier rose ou certaines bulbes sont dangereux en cas d\'ingestion. Identifiez les plantes de votre jardin et consultez un vétérinaire en cas de doute.' },
      { heading: 'Que faire si votre animal est intoxiqué ?', body: 'Contactez immédiatement votre vétérinaire et conservez un échantillon de la plante. Ne provoquez pas de vomissements sans avis médical.' },
    ],
  },
  {
    slug: 'entretien-printemps-jardin',
    title: 'Entretien et nettoyage de printemps du jardin',
    date: '09/03/24',
    excerpt: 'Le printemps est la saison idéale pour remettre votre jardin en état après l\'hiver.',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    category: 'Conseils en jardinage',
    sections: [
      { heading: 'Le grand ménage de printemps', body: 'Retirez les feuilles mortes, taillez les branches abîmées et aérez les massifs pour favoriser la repousse.' },
      { heading: 'Première étape : préparation du sol', body: 'Binez, amendez avec du compost et vérifiez le drainage. Un sol léger et riche garantit de belles floraisons.' },
      { heading: 'L\'entretien des plantations', body: 'Arrosez régulièrement les jeunes plants, paillez pour conserver l\'humidité et surveillez l\'apparition des parasites.' },
      { heading: 'Un jardin prêt à renaître', body: 'Avec ces gestes simples, votre espace vert retrouvera toute sa vitalité pour l\'été.' },
    ],
  },
  {
    slug: 'fleurs-anti-moustiques',
    title: 'Plantez ces fleurs pour éloigner les moustiques cet été',
    date: '20/06/24',
    excerpt: 'Profitez de votre terrasse sans être dérangé grâce à ces plantes aux propriétés répulsives naturelles.',
    image: moustique,
    category: 'Conseils en jardinage',
    sections: [
      { heading: 'La citronnelle : un incontournable de l\'été', body: 'Son parfum citronné repousse naturellement les moustiques. Plantez-la en pot près de vos zones de détente.', sub: 'Conseils de culture : soleil, terre humide, rempotage au printemps.' },
      { heading: 'La lavande : un parfum agréable et dissuasif', body: 'Outre son parfum apaisant, la lavande éloigne les insectes. Idéale en bordure ou en pot sur la terrasse.' },
      { heading: 'La menthe : un parfum rafraîchissant et dissuasif', body: 'Facile à cultiver, la menthe peut être invasive — contenir-la en pot suffit pour profiter de ses vertus.' },
      { heading: 'Le pélargonium : un allié qui habille votre extérieur', body: 'Les géraniums odorants possèdent des feuilles parfumées qui repoussent les moustiques tout en embellissant votre balcon.' },
    ],
  },
  {
    slug: 'marc-de-cafe-jardin',
    title: 'Découvrez comment utiliser le marc de café au jardin. Ne le jetez plus !',
    date: '20/05/21',
    excerpt: 'Le marc de café est un engrais naturel riche en nutriments pour vos plantes.',
    image: marc,
    category: 'Conseils en jardinage',
    sections: [
      { heading: 'Le marc de café : un engrais naturel riche en nutriments', body: 'Riche en azote, phosphore et potassium, il améliore la structure du sol et nourrit vos plantes en douceur.' },
      { heading: 'Protection contre les fourmis', body: 'Sa texture et son odeur perturbent les fourmis — saupoudrez-le autour des zones sensibles.' },
      { heading: 'Éloigner les pucerons', body: 'Mélangez du marc de café séché à votre terreau pour limiter les infestations de pucerons.' },
      { heading: 'Nos conseils pour bien utiliser votre marc de café', body: 'Laissez-le sécher, incorporez-le en surface ou au compost, sans excès pour ne pas acidifier le sol.' },
    ],
  },
  {
    slug: 'varietes-fleurs-jardin-fleuri',
    title: 'Les plus belles variétés de fleurs à planter pour un jardin fleuri',
    date: '08/01/24',
    excerpt: 'Découvrez notre sélection de fleurs adaptées au climat ouest-africain pour un jardin éclatant.',
    image: fleuri,
    category: 'Conseils en jardinage',
    sections: [
      { heading: 'L\'hibiscus', body: 'Floraison généreuse et couleurs vives, parfait en massif ou en pot.' },
      { heading: 'Le bougainvillier', body: 'Résistant à la chaleur, il couvre murs et pergolas de bracts colorées.' },
      { heading: 'Le frangipanier', body: 'Parfum envoûtant et fleurs délicates, emblématique des jardins tropicaux.' },
      { heading: 'Le marigold (Tagète)', body: 'Repousse certains nuisibles tout en apportant des touches orangées éclatantes.' },
      { heading: 'Le géranium', body: 'Indispensable en pot ou en jardinière, facile d\'entretien et longue floraison.' },
    ],
  },
  {
    slug: 'laurier-rose-entretien',
    title: 'Tout ce que vous devez savoir pour avoir un beau laurier rose cette année',
    date: '08/03/21',
    excerpt: 'Le laurier rose est une plante méditerranéenne qui s\'épanouit sous le soleil.',
    image: tout,
    category: 'Conseils en jardinage',
    sections: [
      { heading: 'Le laurier rose, une plante qui a besoin de soleil', body: 'Exposez-le au soleil au moins 6 heures par jour pour une floraison optimale.' },
      { heading: 'Un arbuste peu exigeant', body: 'Tolère bien la sécheresse une fois installé. Arrosez modérément et évitez les excès d\'eau.' },
      { heading: 'Taille et entretien', body: 'Taillez après la floraison pour conserver une forme harmonieuse et stimuler de nouvelles pousses.' },
    ],
  },
  {
    slug: 'jardinage-eco-responsable',
    title: 'Nos astuces pour jardiner de manière éco-responsable !',
    date: '01/02/24',
    excerpt: 'Adoptez des pratiques durables pour un jardin sain et respectueux de l\'environnement.',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    category: 'Conseils en jardinage',
    sections: [
      { heading: 'Choisir des engrais et pesticides naturels', body: 'Privilégiez le compost, le purin d\'ortie et les prédateurs naturels plutôt que les produits chimiques.' },
      { heading: 'Un entretien raisonné et adapté', body: 'Arrosez tôt le matin, adaptez la fréquence au climat et choisissez des variétés locales résistantes.' },
      { heading: 'Privilégier un désherbage manuel', body: 'Le binage et le paillage limitent les mauvaises herbes sans herbicides.' },
      { heading: 'Un arrosage économique', body: 'Installez un système goutte-à-goutte et récupérez l\'eau de pluie.' },
      { heading: 'Recycler les déchets verts', body: 'Compostez vos tailles et feuilles mortes pour enrichir naturellement votre sol.' },
    ],
  },
  {
    slug: 'eloigner-nuisibles-jardin',
    title: 'Éloignez les nuisibles : oiseaux prédateurs, rongeurs et insectes indésirables',
    date: '22/03/21',
    excerpt: 'Protégez votre jardin naturellement sans recourir à des produits agressifs.',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800',
    category: 'Conseils en jardinage',
    sections: [
      { heading: 'Protéger votre jardin des oiseaux prédateurs', body: 'Filets de protection, effaroucheurs visuels et sons répulsifs protègent vos récoltes sans nuire à la biodiversité.' },
      { heading: 'Éloigner les rongeurs du jardin', body: 'Plantes répulsives, prédateurs naturels et pièges sans cruauté sont des solutions efficaces.' },
      { heading: 'Éliminer les insectes indésirables', body: 'Insecticides naturels, auxiliaires (coccinelles, chrysopes) et barrières physiques limitent les dégâts.' },
    ],
  },
];

export const getArticleBySlug = (slug) => ARTICLES.find((a) => a.slug === slug);

export const ARTICLES_PER_PAGE = 9;
