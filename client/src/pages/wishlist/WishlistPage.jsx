import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../components/layout/MainLayout';
import ProductCard from '../../components/products/ProductCard';
import AnimatedProductGrid from '../../components/animation/AnimatedProductGrid';
import ScrollRevealSection from '../../components/animation/ScrollRevealSection';
import { wishlistService } from '../../services';
import { useAuth } from '../../context/AuthContext';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.get().then((r) => r.data.data),
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => wishlistService.remove(productId),
    onSuccess: () => { queryClient.invalidateQueries(['wishlist']); toast.success('Retiré des favoris'); },
  });

  if (!isAuthenticated) {
    return (
      <MainLayout showNewsletter={false}>
        <div className="py-20 text-center">
          <Heart className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 mb-4">Connectez-vous pour voir vos favoris</p>
          <Link to="/connexion" className="text-primary font-medium">Se connecter</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showNewsletter={false}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="text-primary" size={28} />
          <h1 className="text-2xl font-bold">Mes favoris</h1>
          {wishlist?.length > 0 && (
            <span className="text-sm text-gray-500">({wishlist.length} produit{wishlist.length > 1 ? 's' : ''})</span>
          )}
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 py-12">Chargement...</p>
        ) : !wishlist?.length ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Heart className="mx-auto text-gray-300 mb-4" size={56} />
            <p className="text-gray-500 mb-2">Votre liste de souhaits est vide</p>
            <p className="text-sm text-gray-400 mb-6">Ajoutez des produits depuis le catalogue ou une fiche produit</p>
            <Link to="/produits" className="bg-primary text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary-dark">
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <AnimatedProductGrid
            products={wishlist.map((i) => i.product)}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {wishlist.map((item) => (
              <div key={item.id} className="relative group">
                <ProductCard product={{ ...item.product, avgRating: 0, reviewCount: 0 }} />
                <button
                  type="button"
                  onClick={() => removeMutation.mutate(item.productId)}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Retirer des favoris"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </AnimatedProductGrid>
        )}
      </div>
    </MainLayout>
  );
}
