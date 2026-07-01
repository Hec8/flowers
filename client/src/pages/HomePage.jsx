import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import ScrollRevealSection from '../components/animation/ScrollRevealSection';
import { productService } from '../services';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { useGsapAnimations } from '../hooks/useGsapAnimations';
import {
  heroCascade,
  bindProductCardHover,
  bindImageZoomHover,
  animateAddToCartButton,
} from '../lib/animations/helpers';
import { HOME_ECO_BLOCKS } from '../data/catalogContent';
import { ALL_STATIC_PRODUCTS, combineWithStatic } from '../data/staticProducts';
import insta1 from '../assets/insta1.png';
import insta2 from '../assets/insta2.png';
import insta3 from '../assets/insta3.png';
import insta4 from '../assets/insta4.png';

const HOME_INSTAGRAM_LOCAL = [
  { src: insta1, alt: 'NFlowers Instagram 1' },
  { src: insta2, alt: 'NFlowers Instagram 2' },
  { src: insta3, alt: 'NFlowers Instagram 3' },
  { src: insta4, alt: 'NFlowers Instagram 4' },
];
import HERO_IMAGE from '../assets/hero-accueil.png';
import heroPlant from '../assets/hero-plant.svg';
import VALEURS_IMAGE from '../assets/nos valeurs.png';
const INTERIOR_IMG = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80';

function HomeProductCard({ product }) {
  const { addItem } = useCart();
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const btnRef = useRef(null);
  const image = product.imageUrls?.[0] || 'https://placehold.co/300x300';

  useGsapAnimations(cardRef, () => bindProductCardHover(cardRef.current, imageRef.current), []);

  return (
    <div
      ref={cardRef}
      data-animate-card
      className="bg-white border border-gray-100 rounded-lg overflow-hidden will-change-transform"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <Link to={`/produits/${product.slug}`} className="block overflow-hidden">
        <img ref={imageRef} src={image} alt={product.name} className="w-full h-48 object-cover will-change-transform" />
      </Link>
      <div className="p-4">
        <Link to={`/produits/${product.slug}`}>
          <h3 className="font-medium text-sm text-gray-900 mb-1 hover:text-primary">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className={i < Math.round(product.avgRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
          ))}
          <span className="text-xs text-gray-500">({product.reviewCount || 0} avis)</span>
        </div>
        <p className="font-bold text-gray-900 mb-3">
          {parseFloat(product.price).toLocaleString('fr-FR')} FCFA
        </p>
        <button
          ref={btnRef}
          type="button"
          onClick={() => {
            addItem(product);
            animateAddToCartButton(btnRef.current);
            toast.success('Ajouté au panier');
          }}
          className="w-full bg-primary text-white py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors will-change-transform"
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}

function ProductCarousel({ title, highlight, products }) {
  if (!products?.length) return null;

  return (
    <ScrollRevealSection className="py-12 px-4" selector="[data-animate-card], h2">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center font-serif text-2xl font-bold mb-8">
          {title.split(highlight).map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && <span className="text-primary">{highlight}</span>}
            </span>
          ))}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.slice(0, 5).map((p) => (
            <HomeProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </ScrollRevealSection>
  );
}

function CategoryCard({ cat }) {
  const imgRef = useRef(null);
  useGsapAnimations(imgRef, () => bindImageZoomHover(imgRef.current), []);

  return (
    <Link
      to={cat.href}
      data-animate-card
      className="bg-white rounded-lg overflow-hidden shadow-sm block hover:shadow-md transition-shadow"
    >
      <div className="overflow-hidden">
        <img ref={imgRef} src={cat.img} alt={cat.title} className="w-full h-48 object-cover will-change-transform" />
      </div>
      <div className="p-5">
        <h3 className="text-primary font-semibold mb-2">{cat.title}</h3>
        <p className="text-sm text-gray-600">{cat.desc}</p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const heroRef = useRef(null);
  const { data: productsData } = useQuery({
    queryKey: ['products', 'home'],
    queryFn: () => productService.getAll({ limit: 12 }).then((r) => r.data),
  });

  // Produits statiques curatifs en premier ; produits API non-dupliqués s'ajoutent après.
  const products = combineWithStatic(ALL_STATIC_PRODUCTS, productsData?.data || []);

  useGsapAnimations(heroRef, () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    heroCascade(heroRef.current, '[data-hero-item]', { stagger: 0.12, delay: 0.1 });
  }, []);

  const categories = [
    { title: 'Plantes d\'intérieur', href: '/produits?category=plantes&productType=INTERIOR', img: INTERIOR_IMG, desc: 'Apportez de la verdure dans votre intérieur.' },
    { title: 'Jardin & Extérieur', href: '/produits?category=plantes&productType=EXTERIOR', img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500', desc: 'Aménagez votre espace extérieur avec style.' },
    { title: 'Fleurs & Bouquets', href: '/produits?category=fleurs-bouquets', img: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500', desc: 'Des bouquets frais pour toutes les occasions.' },
  ];

  return (
    <MainLayout>
      {/* ─── Hero ─── */}
      <section ref={heroRef} className="bg-[#0f4d2a]">
        <div className="lg:grid lg:grid-cols-2 lg:min-h-[480px]">
          {/* Image */}
          <div className="relative h-52 sm:h-64 lg:h-auto lg:min-h-[480px]">
            <img
              src={HERO_IMAGE}
              alt="Producteur NFlowers"
              className="w-full h-full object-cover object-center"
            />
            <div
              data-hero-item
              className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-10 lg:right-10 z-10"
            >
              <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full bg-[#e8a317] flex flex-col items-center justify-center text-white shadow-lg">
                <span className="text-[10px] line-through opacity-80">6000f</span>
                <span className="text-base sm:text-lg font-bold leading-none">5100f</span>
              </div>
            </div>
          </div>

          {/* Contenu texte */}
          <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-12 lg:py-14 text-white flex flex-col justify-center">
            <div className="flex gap-4 items-start mb-5">
              <img
                data-hero-item
                src={heroPlant}
                alt=""
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-lg bg-white/10 shrink-0 p-1"
              />
              <div className="min-w-0">
                <h1
                  data-hero-item
                  className="font-serif text-xl sm:text-2xl lg:text-4xl font-bold leading-snug mb-3"
                >
                  Plongez dans l&apos;Élégance et la Beauté des Fleurs Naturelles
                </h1>
                <p data-hero-item className="text-green-100 text-sm leading-relaxed mb-5">
                  Découvrez notre sélection exquise de fleurs naturelles, cultivées avec soin pour apporter
                  fraîcheur, beauté et émotion à chaque instant de votre vie.
                </p>
              </div>
            </div>

            <div data-hero-item className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                to="/produits"
                className="inline-block bg-white text-[#0f4d2a] px-6 py-2.5 rounded-sm text-sm font-semibold hover:bg-green-50 transition-colors text-center"
              >
                Tous nos produits
              </Link>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#e8a317] text-white text-xs font-bold px-4 py-1.5 -rotate-2 shadow-md whitespace-nowrap">
                  Des offres spéciaux
                </span>
                <span className="bg-[#e8a317] text-white text-xs font-bold px-4 py-1.5 -rotate-2 shadow-md whitespace-nowrap">
                  Stocks limités
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductCarousel title="Nos offres plantes du mois" highlight="offres plantes" products={products} />
      <ProductCarousel title="Recommandé pour vous" highlight="Recommandé" products={[...products].reverse()} />
      <ProductCarousel title="La sélection du moment" highlight="sélection" products={products.slice(0, 6)} />

      <ScrollRevealSection className="py-12 bg-gray-50 px-4" selector="[data-animate-card], h2">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center font-serif text-2xl font-bold mb-8">
            Nos <span className="text-primary">catégories</span> à la une
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <CategoryCard key={cat.title} cat={cat} />
            ))}
          </div>
        </div>
      </ScrollRevealSection>

      {/* ─── Nos valeurs ─── */}
      <ScrollRevealSection className="grid md:grid-cols-2" selector="[data-animate-block]">
        <div data-animate-block className="bg-[#0f4d2a] text-white p-8 sm:p-12 flex items-center">
          <div className="space-y-4 text-sm leading-relaxed text-green-50">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">Nos valeurs</h2>
            <p>
              Chez NFlowers, nous croyons que chaque fleur et chaque plante raconte une histoire.
              Nos compositions florales sont pensées pour sublimer vos moments les plus précieux.
            </p>
            <p>
              Nous nous engageons à respecter l&apos;environnement à travers une culture durable,
              sans pesticides nocifs, en collaboration avec des producteurs locaux engagés.
            </p>
          </div>
        </div>
        <img data-animate-block src={VALEURS_IMAGE} alt="Serre NFlowers" className="w-full h-64 md:h-auto min-h-[280px] object-cover" />
      </ScrollRevealSection>

      {/* ─── Instagram ─── */}
      <ScrollRevealSection className="py-12 px-4 bg-white" selector="[data-animate-block], h2">
        <div className="max-w-7xl mx-auto">
          <h2 data-animate-block className="text-center text-lg sm:text-xl font-medium mb-8">
            Suivez-nous sur Instagram{' '}
            <a href="https://instagram.com" className="text-primary font-semibold hover:underline">@nflowers</a>
          </h2>
          <div className="relative">
            <button type="button" aria-label="Précédent" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-primary hidden sm:block">
              <ChevronLeft size={28} />
            </button>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 px-0 sm:px-10">
              {HOME_INSTAGRAM_LOCAL.map((img) => (
                <div key={img.src} data-animate-block className="aspect-square overflow-hidden rounded-sm">
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
            <button type="button" aria-label="Suivant" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 text-primary hidden sm:block">
              <ChevronRight size={28} />
            </button>
          </div>
        </div>
      </ScrollRevealSection>

      {/* ─── Grille éco-jardinage ─── */}
      <ScrollRevealSection className="py-12 px-4 bg-white border-t border-gray-100" selector="[data-animate-block]">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 gap-x-12 gap-y-10">
          {HOME_ECO_BLOCKS.map((block) => (
            <div key={block.title} data-animate-block>
              <h3 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">{block.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{block.text}</p>
            </div>
          ))}
        </div>
      </ScrollRevealSection>

      <ScrollRevealSection className="bg-green-50 py-8" selector="[data-animate-trust]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {['LIVRAISON EN 24H', 'PAIEMENT SÉCURISÉ', 'PRODUITS FRAIS', 'SERVICE CLIENT'].map((t) => (
            <div key={t} data-animate-trust>
              <p className="font-bold text-sm text-gray-900">{t}</p>
            </div>
          ))}
        </div>
      </ScrollRevealSection>
    </MainLayout>
  );
}
