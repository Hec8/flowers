import { Link, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { getArticleBySlug } from '../../data/articles';

function ArticleBody({ section }) {
  const paragraphs = section.paragraphs?.length
    ? section.paragraphs
    : section.body
      ? [section.body]
      : [];

  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{section.heading}</h2>
      {paragraphs.map((p) => (
        <p key={p.slice(0, 40)} className="text-sm text-gray-700 leading-relaxed mb-4 last:mb-0">
          {p}
        </p>
      ))}
      {section.subsections?.map((sub) => (
        <div key={sub.heading} className="mt-5">
          <h3 className="text-sm font-bold text-gray-900 mb-2">{sub.heading}</h3>
          {(sub.paragraphs || [sub.body]).filter(Boolean).map((p) => (
            <p key={p.slice(0, 40)} className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">
              {p}
            </p>
          ))}
        </div>
      ))}
    </section>
  );
}

export default function ConseilArticlePage() {
  const { slug } = useParams();
  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <MainLayout>
        <div className="py-20 text-center">
          <p className="text-gray-500 mb-4">Article introuvable</p>
          <Link to="/conseils" className="text-primary">Retour aux conseils</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <article className="w-full px-4 sm:px-8 lg:px-16 py-8 max-w-5xl mx-auto">
        <nav className="text-xs text-gray-500 mb-6 uppercase tracking-wide break-words">
          <Link to="/conseils" className="hover:text-primary">Conseils et astuces</Link>
          {' > '}
          <span>{article.category}</span>
          {' / '}
          <span className="text-gray-700">{article.title}</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3 leading-tight">
          {article.title}
        </h1>
        <p className="text-center text-sm text-gray-400 mb-8">{article.date}</p>

        <img
          src={article.image}
          alt={article.title}
          className="w-full h-56 sm:h-72 md:h-80 object-cover mb-10 rounded-sm"
        />

        {article.intro && (
          <p className="text-sm text-gray-700 leading-relaxed mb-10">{article.intro}</p>
        )}

        {article.sections.map((section) => (
          <ArticleBody key={section.heading} section={section} />
        ))}

        <div className="text-center mt-12 pt-8 border-t">
          <Link to="/conseils" className="text-primary font-medium hover:underline">
            ← Retour aux conseils
          </Link>
        </div>
      </article>
    </MainLayout>
  );
}
