import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import AccountLayout from '../../components/account/AccountLayout';
import ScrollRevealSection from '../../components/animation/ScrollRevealSection';
import { orderService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { CLIENT_ORDER_TABS, ORDER_STATUS_LABELS } from '../../lib/adminConstants';
import { formatPrice } from '../../lib/constants';

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', tab],
    queryFn: () => orderService.getMyOrders(tab ? { status: tab } : {}).then((r) => r.data),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center">
        <Link to="/connexion" className="text-primary">Connectez-vous</Link> pour voir vos commandes
      </div>
    );
  }

  const orders = data?.data || [];

  return (
    <AccountLayout title="Mes Commandes">
      <div className="border-b mb-6 -mx-2 px-2 overflow-x-auto">
        <div className="flex gap-4 sm:gap-8 min-w-max sm:min-w-0">
          {CLIENT_ORDER_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500 py-12">Chargement...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 mb-4">Aucune commande dans cette catégorie</p>
          <Link to="/produits" className="text-primary font-medium hover:underline">
            Découvrir nos produits
          </Link>
        </div>
      ) : (
        <ScrollRevealSection selector="[data-animate-order]">
        <div className="space-y-4">
          {orders.map((order) => {
            const firstItem = order.items?.[0];
            return (
              <Link
                key={order.id}
                data-animate-order
                to={`/commandes/${order.id}`}
                className="block border border-gray-200 rounded-lg p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    {firstItem?.product?.imageUrls?.[0] && (
                      <img src={firstItem.product.imageUrls[0]} alt="" className="w-14 h-14 object-cover rounded hidden sm:block" />
                    )}
                    <div>
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.items?.length} article{order.items?.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800">
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                    <p className="font-bold mt-2">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        </ScrollRevealSection>
      )}
    </AccountLayout>
  );
}
