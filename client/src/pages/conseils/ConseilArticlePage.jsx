import { Link, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { getArticleBySlug } from '../../data/articles';

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
      <article className="max-w-3xl mx-auto px-4 py-8">
        <nav className="text-xs text-gray-500 mb-6 uppercase tracking-wide break-words">
          <Link to="/conseils" className="hover:text-primary">Conseils et astuces</Link>
          {' > '}
          <span>{article.category}</span>
          {' > '}
          <span className="text-gray-700">{article.title}</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3 leading-tight">
          {article.title}
        </h1>
        <p className="text-center text-sm text-gray-400 mb-8">{article.date}</p>

        <img src={article.image} alt={article.title} className="w-full h-64 md:h-80 object-cover mb-8" />

        {article.sections.map((section) => (
          <section key={section.heading} className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{section.heading}</h2>
            {section.sub && <p className="text-sm font-semibold text-gray-700 mb-2">{section.sub}</p>}
            <p className="text-sm text-gray-700 leading-relaxed">{section.body}</p>
          </section>
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
