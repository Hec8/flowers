import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import ScrollRevealSection from '../../components/animation/ScrollRevealSection';
import { ARTICLES, ARTICLES_PER_PAGE } from '../../data/articles';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { heroCascade } from '../../lib/animations/helpers';

const CATEGORIES = ['Tous', 'Conseils en jardinage'];

export default function ConseilsPage() {
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const heroRef = useRef(null);

  const filtered = activeCategory === 'Tous'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory);

  const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);
  const articles = filtered.slice((page - 1) * ARTICLES_PER_PAGE, page * ARTICLES_PER_PAGE);

  useGsapAnimations(heroRef, () => {
    heroCascade(heroRef.current, '[data-hero-el]');
  }, []);

  return (
    <MainLayout>
      {/* Hero */}
      <section className="bg-primary text-white py-16 px-4" ref={heroRef}>
        <div className="max-w-4xl mx-auto text-center">
          <p data-hero-el className="text-sm uppercase tracking-widest text-green-200 mb-3">
            NFlowers — Blog
          </p>
          <h1 data-hero-el className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Conseils et astuces
          </h1>
          <p data-hero-el className="text-green-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Découvrez nos conseils d&apos;experts pour entretenir vos plantes, décorer votre intérieur
            et profiter de votre jardin toute l&apos;année.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-primary">Accueil</Link>
        {' / '}
        <span className="text-gray-900">Conseils et astuces</span>
      </div>

      {/* Category filters */}
      <div className="max-w-7xl mx-auto px-4 pb-6 flex gap-3 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => { setActiveCategory(cat); setPage(1); }}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      <ScrollRevealSection
        className="max-w-7xl mx-auto px-4 pb-12"
        selector="[data-animate-article]"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {articles.map((article) => (
            <Link
              key={article.slug}
              to={`/conseils/${article.slug}`}
              data-animate-article
              className="group bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className="text-xs text-primary font-medium uppercase tracking-wide">
                  {article.category}
                </span>
                <p className="text-xs text-gray-400 mt-1 mb-2">{article.date}</p>
                <h2 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
                <span className="inline-block mt-4 text-sm text-primary font-medium group-hover:underline">
                  Lire la suite →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                  p === page ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </ScrollRevealSection>

      {/* Cta newsletter */}
      <section className="bg-green-50 py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Ne manquez aucun conseil !
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Inscrivez-vous à notre newsletter et recevez chaque semaine les meilleures astuces
            de jardinage et d&apos;entretien de plantes directement dans votre boîte mail.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Votre adresse e-mail"
              className="flex-1 border border-gray-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2.5 text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              S&apos;inscrire
            </button>
          </form>
        </div>
      </section>
    </MainLayout>
  );
}
