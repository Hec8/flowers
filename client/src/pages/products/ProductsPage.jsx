import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MaisonDecoPage from './MaisonDecoPage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import ProductCard from '../../components/products/ProductCard';
import StarRating from '../../components/products/StarRating';
import AnimatedProductGrid from '../../components/animation/AnimatedProductGrid';
import SkeletonGrid from '../../components/animation/SkeletonGrid';
import ScrollRevealSection from '../../components/animation/ScrollRevealSection';
import { productService } from '../../services';
import { CATALOG_SECTIONS, DEFAULT_CATALOG } from '../../lib/constants';
import { getStaticProducts, combineWithStatic } from '../../data/staticProducts';
import {
  PLANTES_FAQ,
  PLANTES_EXT_FAQ,
  PLANTES_TESTIMONIALS,
  ENGRAIS_PROMO,
  JARDINAGE_FAQ,
  JARDINAGE_PROMO,
  MAISON_DECO_FAQ,
  FLEURS_FAQ,
  FLEURS_PROMO,
} from '../../data/catalogContent';

const PRODUCTS_PER_PAGE = 4;

function DiamondTitle({ children }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-2">
      <span className="text-amber-500 text-lg leading-none">◆</span>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center">{children}</h1>
      <span className="text-amber-500 text-lg leading-none">◆</span>
    </div>
  );
}

function FilterPills({ pills, isActive, onSelect }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-8">
      {pills.map((pill) => (
        <button
          key={pill.label}
          type="button"
          onClick={() => onSelect(pill)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            isActive(pill) ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const productType = params.get('productType') || '';
  const subcategory = params.get('subcategory') || '';
  const search = params.get('search') || '';
  const page = Number(params.get('page') || '1');

  const section = CATALOG_SECTIONS[category] || DEFAULT_CATALOG;
  const isPlantes = category === 'plantes';
  const isEngrais = category === 'engrais';
  const isJardinage = category === 'jardinage';
  // Sous-catégorie effective (défaut par section)
  const effectiveSubcategory = isEngrais && !subcategory
    ? 'organique'
    : isJardinage && !subcategory
      ? 'desherbeur'
      : subcategory;
  const isMaisonDeco = category === 'maison-decoration';
  const isFleurs = category === 'fleurs-bouquets';
  const hasCatalogLayout = isPlantes || isEngrais || isJardinage || isFleurs;
  const isInterior = productType === 'INTERIOR' || (isPlantes && !productType);
  const isExterior = productType === 'EXTERIOR';

  // Hook toujours appelé (Rules of Hooks) — désactivé pour Maison & Décoration
  const { data, isLoading } = useQuery({
    queryKey: ['products', { category, productType, subcategory, search, page }],
    enabled: !isMaisonDeco,
    queryFn: () =>
      productService.getAll({
        category: category || undefined,
        productType: productType || undefined,
        search: search || undefined,
        page,
        limit: PRODUCTS_PER_PAGE,
      }).then((r) => r.data),
  });

  // Maison & Décoration a son propre layout éditorial
  if (isMaisonDeco) return <MaisonDecoPage />;

  const apiProducts = data?.data || [];

  // Statiques toujours en premier ; produits API non-dupliqués s'ajoutent après.
  const staticAll = getStaticProducts({ category, productType, subcategory: effectiveSubcategory });
  const combined = combineWithStatic(staticAll, apiProducts);

  // Pagination sur la liste combinée
  const totalPages = Math.max(1, Math.ceil(combined.length / PRODUCTS_PER_PAGE));
  const products = combined.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  const setFilter = (pill) => {
    const next = new URLSearchParams();
    const cat = pill.category || category;
    if (cat) next.set('category', cat);
    if (pill.productType) next.set('productType', pill.productType);
    if (pill.subcategory !== undefined) next.set('subcategory', pill.subcategory);
    setParams(next);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(params);
    next.set('page', String(p));
    setParams(next);
  };

  const pillActive = (pill) => {
    if (isEngrais || isJardinage || isMaisonDeco || isFleurs) {
      if (pill.subcategory !== undefined) return (pill.subcategory || '') === (effectiveSubcategory || '');
    }
    if (isPlantes) return pill.productType === (productType || 'INTERIOR');
    return pill.productType === (productType || '');
  };

  const pageTitle = isPlantes
    ? (isExterior ? section.titleExterior : section.titleInterior)
    : (isEngrais || isJardinage || isFleurs)
      ? (section.titleBySub?.[effectiveSubcategory] || section.titleBySub?.[''] || section.title)
      : section.title;

  const pageDescription = isPlantes
    ? (isExterior ? section.descriptionExterior : section.descriptionInterior)
    : (isEngrais || isJardinage || isFleurs)
      ? (section.descriptionBySub?.[effectiveSubcategory] ?? section.description)
      : section.description;

  const heroImage = isPlantes
    ? (isExterior ? section.heroImageExterior : section.heroImageInterior)
    : section.heroImage;

  const faqBlocks = isPlantes
    ? (isExterior ? PLANTES_EXT_FAQ : PLANTES_FAQ)
    : isJardinage
      ? JARDINAGE_FAQ
      : isMaisonDeco
        ? MAISON_DECO_FAQ
        : isFleurs
          ? FLEURS_FAQ
          : [];

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-primary">Accueil</Link>
        {' / '}
        {isEngrais ? (
          <>
            <Link to={section.parentHref || '/produits?category=engrais'} className="hover:text-primary">
              {section.parentBreadcrumb}
            </Link>
            {' / '}
            <span className="text-gray-900">{section.breadcrumb}</span>
          </>
        ) : search ? (
          <span className="text-gray-900">Recherche : « {search} »</span>
        ) : (
          <>
            <span className="text-gray-900">{section.breadcrumb || 'Catalogue'}</span>
            {isPlantes && isInterior && (
              <>
                {' / '}
                <span className="text-gray-900">Plantes d&apos;intérieur</span>
              </>
            )}
            {isPlantes && isExterior && (
              <>
                {' / '}
                <span className="text-gray-900">Plantes d&apos;extérieur</span>
              </>
            )}
          </>
        )}
      </div>

      {!search && (
        <>
          {/* Hero bannière */}
          <section className="relative mt-4 mx-4 md:mx-auto max-w-7xl overflow-hidden rounded-sm">
            {isPlantes && isExterior ? (
              <div className="relative h-48 sm:h-64 md:h-80">
                <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/35" />
                <div className="relative h-full flex items-center justify-center px-4">
                  <h2 className="text-white text-lg sm:text-2xl md:text-3xl font-bold text-center leading-tight max-w-lg">
                    QUELLES <span className="text-amber-400">PLANTES</span> METTRE DANS SON{' '}
                    <span className="text-amber-400">ENTRÉE</span> ?
                  </h2>
                </div>
              </div>
            ) : (
              <div className="relative h-44 sm:h-56 md:h-64">
                <img src={heroImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </section>

          {/* Intro catégorie */}
          <section className="max-w-4xl mx-auto px-4 py-8 sm:py-10 text-center">
            {!isEngrais && <DiamondTitle>{pageTitle}</DiamondTitle>}
            {isEngrais && (
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{pageTitle}</h1>
            )}
            <p className="text-primary font-medium mb-3">{section.subtitle}</p>
            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mx-auto">{pageDescription}</p>

            {(isPlantes || isEngrais || isJardinage || isMaisonDeco || isFleurs) && section.pills && (
              <FilterPills pills={section.pills} isActive={pillActive} onSelect={setFilter} />
            )}
          </section>
        </>
      )}

      {/* Grille produits — 4 par page */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        {isLoading ? (
          <SkeletonGrid count={4} />
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Aucun produit dans cette catégorie pour le moment.</p>
          </div>
        ) : (
          <AnimatedProductGrid
            products={products}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatedProductGrid>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2 border rounded disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-full text-sm ${
                  p === page ? 'bg-primary text-white' : 'hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
            {totalPages > 5 && <span className="text-gray-400">… {totalPages}</span>}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 border rounded disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      {/* Bandeau promo */}
      {isEngrais && (
        <section className="bg-[#0f4d2a] text-white py-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">{ENGRAIS_PROMO.title}</h2>
            <p className="text-green-100 text-sm leading-relaxed">{ENGRAIS_PROMO.text}</p>
          </div>
        </section>
      )}
      {isJardinage && (
        <section className="bg-[#0f4d2a] text-white py-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">{JARDINAGE_PROMO.title}</h2>
            <p className="text-green-100 text-sm leading-relaxed">{JARDINAGE_PROMO.text}</p>
          </div>
        </section>
      )}
      {isFleurs && (
        <section className="bg-stone-50 py-12 px-4 border-y border-stone-100">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{FLEURS_PROMO.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{FLEURS_PROMO.text}</p>
          </div>
        </section>
      )}

      {/* FAQ catalogue */}
      {hasCatalogLayout && faqBlocks.length > 0 && (
        <section className="bg-stone-50 py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-10">
            {faqBlocks.map((block) => (
              <div key={block.title} className="flex gap-4">
                <span className="text-primary text-xl shrink-0">🌿</span>
                <div>
                  <h2 className="font-bold text-sm sm:text-base text-gray-900 mb-3 uppercase tracking-wide">
                    {block.title}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{block.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Témoignages plantes */}
      {isPlantes && (
        <ScrollRevealSection className="py-12 px-4" selector="[data-animate-card]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-center text-base sm:text-lg font-bold tracking-wide mb-2">
              BIENVENUE DANS NOTRE FAMILLE DE PLANTES
            </h2>
            <p className="text-center text-sm text-gray-500 mb-8">
              L&apos;excellence au cœur de chaque plante, pour embellir votre quotidien.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {PLANTES_TESTIMONIALS.map((t) => (
                <div key={t.name} data-animate-card className="bg-white border border-gray-100 p-6 text-center shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-green-100 mx-auto mb-3 flex items-center justify-center text-primary font-bold">
                    {t.name[0]}
                  </div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400 mb-2">Posté le {t.date}</p>
                  <StarRating rating={t.rating} size={12} />
                  <p className="font-medium text-sm mt-3 text-primary">{t.quote}</p>
                  <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{t.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollRevealSection>
      )}
    </MainLayout>
  );
}
