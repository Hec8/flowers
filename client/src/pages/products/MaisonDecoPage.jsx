import { useSearchParams, Link } from 'react-router-dom';
import { useRef } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import ScrollRevealSection from '../../components/animation/ScrollRevealSection';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { scrollStaggerIn } from '../../lib/animations/helpers';
import {
  MAISON_DECO_HERO,
  MAISON_DECO_TABS,
  MAISON_DECO_CARDS,
  MAISON_DECO_DESCRIPTION,
} from '../../data/maisonDecoAssets';

function InspirationCard({ item }) {
  return (
    <Link
      to={`/produits?category=maison-decoration&subcategory=${item.subcategory}`}
      className="group block overflow-hidden rounded-sm"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.caption}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <p className="mt-3 text-sm text-gray-700 leading-snug line-clamp-2">
        {item.caption}
      </p>
    </Link>
  );
}

export default function MaisonDecoPage() {
  const [params, setParams] = useSearchParams();
  const rawSub = params.get('subcategory') || '';
  const subcategory = rawSub || 'terrasse';

  const gridRef = useRef(null);

  useGsapAnimations(gridRef, () => {
    if (!gridRef.current) return;
    scrollStaggerIn(gridRef.current, '[data-card]');
  }, [subcategory]);

  const activeTab = MAISON_DECO_TABS.find((t) => t.subcategory === subcategory) || MAISON_DECO_TABS[0];
  const cards = MAISON_DECO_CARDS.filter((c) => c.subcategory === subcategory);

  const gridTitle = `Idées de décoration ${activeTab.label.toLowerCase()}`;

  const goTo = (sub) => {
    setParams({ category: 'maison-decoration', subcategory: sub });
  };

  return (
    <MainLayout>
      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 pt-5 text-sm text-gray-500">
        <Link to="/" className="hover:text-primary">Accueil</Link>
        {' / '}
        <Link to="/produits?category=maison-decoration" className="hover:text-primary">Maison et décoration</Link>
        {' / '}
        <span className="text-gray-900">{activeTab.label}</span>
      </div>

      {/* ── Hero pleine largeur ── */}
      <div className="relative w-full mt-4 overflow-hidden" style={{ maxHeight: '400px' }}>
        <img
          src={MAISON_DECO_HERO}
          alt="Maison & Décoration"
          className="w-full h-full object-cover"
          style={{ maxHeight: '400px', objectPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-black/35 flex items-center justify-center px-4">
          <p className="text-white text-center text-xl sm:text-2xl md:text-3xl font-semibold max-w-2xl leading-snug drop-shadow-lg">
            Transformez votre maison avec des idées déco tendances et éco-responsables
          </p>
        </div>
      </div>

      {/* ── Description + sous-navigation ── */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Titre de section */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-amber-500 text-lg">◆</span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center">
            Idées de décoration d&apos;intérieur et d&apos;extérieur
          </h1>
          <span className="text-amber-500 text-lg">◆</span>
        </div>

        {/* Description commune */}
        <p className="text-sm text-gray-600 leading-relaxed text-center mb-10">
          {MAISON_DECO_DESCRIPTION}
        </p>

        {/* Sous-navigation avec thumbnails */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {MAISON_DECO_TABS.map((tab) => {
            const isActive = tab.subcategory === subcategory;
            return (
              <button
                key={tab.subcategory}
                type="button"
                onClick={() => goTo(tab.subcategory)}
                className={`flex flex-col items-center gap-1.5 group transition-all ${
                  isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-sm border-2 transition-colors ${
                    isActive ? 'border-primary' : 'border-transparent group-hover:border-gray-300'
                  }`}
                >
                  <img
                    src={tab.thumbnail}
                    alt={tab.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'text-primary' : 'text-gray-600'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Grille d'inspiration ── */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-8 capitalize">
          {gridTitle}
        </h2>

        {cards.length > 0 ? (
          <>
            <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <div key={card.id} data-card>
                  <InspirationCard item={card} />
                </div>
              ))}
            </div>

            {/* Pagination (indicative — données supplémentaires depuis le dashboard) */}
            <div className="flex justify-center items-center gap-2 mt-12">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    n === 1
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="text-gray-400 text-sm px-1">…</span>
              <button type="button" className="w-8 h-8 rounded-full bg-gray-100 text-sm text-gray-600 hover:bg-gray-200">
                10
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400 py-16 text-sm">
            Aucune idée disponible pour cette catégorie pour le moment.
          </p>
        )}
      </div>

      {/* ── Bandeau de confiance ── */}
      <ScrollRevealSection
        className="border-t border-gray-100 bg-white py-10"
        selector="[data-trust]"
      >
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '🔒', title: 'PAIEMENTS SÉCURISÉS', text: 'Paiement sécurisé par carte bancaire, mastercard, visa, virement.' },
            { icon: '🚚', title: 'LIVRAISON & RETOUR', text: 'Commande expédiée sous 24h, avec garantie satisfait ou remboursé sous 30 jours.' },
            { icon: '🏬', title: 'RETRAIT EN MAGASIN', text: 'Commandez en ligne et retirez votre commande gratuitement en magasin.' },
            { icon: '💬', title: "BESOIN D'AIDE ?", text: 'Disponible à vous servir. Contactez-nous au 53893025 ou par mail.' },
          ].map((item) => (
            <div key={item.title} data-trust className="space-y-2">
              <div className="text-3xl">{item.icon}</div>
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">{item.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </ScrollRevealSection>

      {/* ── Newsletter ── */}
      <ScrollRevealSection
        className="relative py-14 overflow-hidden"
        selector="[data-nl]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${MAISON_DECO_HERO})`, filter: 'brightness(0.35)' }}
        />
        <div className="relative max-w-xl mx-auto px-4 text-center text-white" data-nl>
          <h3 className="text-lg font-bold mb-2">Ne manquez aucune opportunité !</h3>
          <p className="text-sm mb-1 opacity-90">
            Soyez le premier à recevoir nos offres exclusives et promotions.
          </p>
          <p className="text-sm mb-1 opacity-90">
            Trouvez l&apos;inspiration pour aménager votre maison et son jardin.
          </p>
          <p className="text-sm mb-6 opacity-90">
            Bénéficiez de nos conseils et obtenez des réponses à vos questions.
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="Votre adresse e-mail"
              className="flex-1 px-4 py-2.5 rounded-sm text-sm text-gray-900 focus:outline-none"
            />
            <button
              type="button"
              className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-sm text-sm font-medium transition-colors"
            >
              Envoyer
            </button>
          </div>
        </div>
      </ScrollRevealSection>
    </MainLayout>
  );
}
