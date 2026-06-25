import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, Truck, CheckCircle } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { orderService } from '../../services';
import { formatPrice } from '../../lib/constants';

const statusConfig = {
  PENDING: { label: 'En attente', color: 'text-yellow-600' },
  CONFIRMED: { label: 'Confirmée', color: 'text-blue-600' },
  SHIPPING: { label: 'En cours de livraison', color: 'text-purple-600' },
  DELIVERED: { label: 'Livrée', color: 'text-green-600' },
  CANCELLED: { label: 'Annulée', color: 'text-red-600' },
};

const timeline = [
  { key: 'CONFIRMED', icon: Package, label: 'Commande confirmée' },
  { key: 'SHIPPING', icon: Truck, label: 'En cours de livraison' },
  { key: 'DELIVERED', icon: CheckCircle, label: 'Livrée' },
];

const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];

export default function OrderDetailPage() {
  const { id } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id).then((r) => r.data.data),
  });

  if (isLoading) {
    return <MainLayout showNewsletter={false}><div className="py-20 text-center">Chargement...</div></MainLayout>;
  }
  if (!order) {
    return <MainLayout showNewsletter={false}><div className="py-20 text-center">Commande introuvable</div></MainLayout>;
  }

  const status = statusConfig[order.status] || statusConfig.PENDING;
  const currentIdx = statusOrder.indexOf(order.status);

  return (
    <MainLayout showNewsletter={false}>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/commandes" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6">
          <ArrowLeft size={16} /> Retour à mes commandes
        </Link>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Commande {order.orderNumber}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <span className={`font-semibold text-sm ${status.color}`}>{status.label}</span>
        </div>

        {/* Timeline */}
        {order.status !== 'CANCELLED' && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
              {timeline.map(({ key, icon: Icon, label }, i) => {
                const stepIdx = statusOrder.indexOf(key);
                const done = currentIdx >= stepIdx;
                return (
                  <div key={key} className="flex flex-col items-center relative z-10 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      done ? 'bg-primary text-white' : 'bg-white border-2 border-gray-200 text-gray-400'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <span className={`text-xs mt-2 text-center max-w-[80px] ${done ? 'text-primary font-medium' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-50 px-5 py-3 font-semibold text-sm">Articles commandés</div>
          <div className="divide-y">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <img
                  src={item.product?.imageUrls?.[0] || 'https://placehold.co/60'}
                  alt=""
                  className="w-14 h-14 object-cover rounded bg-gray-50"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product?.name}</p>
                  <p className="text-xs text-gray-500">Qté : {item.quantity}</p>
                </div>
                <p className="font-medium text-sm">{formatPrice(parseFloat(item.unitPrice) * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary + address */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-sm mb-3">Adresse de livraison</h3>
            {order.address ? (
              <p className="text-sm text-gray-600">
                {order.address.street}<br />
                {order.address.city}, {order.address.country}
              </p>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>
          <div className="border border-gray-200 rounded-lg p-5 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Livraison</span><span>{formatPrice(order.shippingFee)}</span></div>
            <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>{formatPrice(order.totalAmount)}</span></div>
            <div className="flex justify-between text-xs text-gray-500 pt-1">
              <span>Paiement</span>
              <span>{order.paymentStatus === 'PAID' ? 'Payé' : order.paymentStatus === 'FAILED' ? 'Échoué' : 'En attente'}</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
