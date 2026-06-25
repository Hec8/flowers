import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '../../components/layout/MainLayout';
import { producerService } from '../../services';

export default function ProducerPage() {
  const { slug } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['producer', slug],
    queryFn: () => producerService.getBySlug(slug).then((r) => r.data.data),
  });

  if (isLoading) return <MainLayout><div className="py-20 text-center">Chargement...</div></MainLayout>;
  if (!data) return <MainLayout><div className="py-20 text-center">Producteur introuvable</div></MainLayout>;

  return (
    <MainLayout showNewsletter={false}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <img
            src={data.imageUrl || 'https://placehold.co/300'}
            alt={data.name}
            className="w-48 h-48 rounded-full object-cover mx-auto md:mx-0"
          />
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {data.name} {data.isBio && <span className="text-primary text-sm">🌿 Bio</span>}
            </h1>
            <p className="text-gray-700 leading-relaxed mb-4">{data.bio}</p>
            {data.cultivationMethod && (
              <div>
                <h3 className="font-semibold text-sm mb-1">Méthodes de culture</h3>
                <p className="text-sm text-gray-600">{data.cultivationMethod}</p>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold mb-6">Ses produits</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.products?.map((product) => (
            <Link key={product.id} to={`/produits/${product.slug}`} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <img src={product.imageUrls?.[0]} alt={product.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-medium text-sm">{product.name}</h3>
                <p className="font-bold text-sm mt-1">{parseFloat(product.price).toLocaleString('fr-FR')} FCFA</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
