import { Link, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRef } from 'react';
import { CheckCircle, Package, Truck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../components/layout/MainLayout';
import ScrollRevealSection from '../../components/animation/ScrollRevealSection';
import { orderService } from '../../services';
import { formatPrice } from '../../lib/constants';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { animateSuccessIcon } from '../../lib/animations/helpers';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const orderFromState = location.state?.order;
  const iconRef = useRef(null);
  const fedaTransactionId = searchParams.get('id');
  const fedaStatus = searchParams.get('status');
  const awaitingFedaPay = searchParams.get('payment') === 'feadapay';

  const { data: order, refetch } = useQuery({
    queryKey: ['order', id, awaitingFedaPay, fedaTransactionId, fedaStatus],
    queryFn: async () => {
      if (awaitingFedaPay || fedaTransactionId) {
        try {
          const params = fedaTransactionId ? { id: fedaTransactionId } : undefined;
          const res = await orderService.checkPaymentStatus(id, params);
          return res.data.data;
        } catch {
          const res = await orderService.getById(id);
          return res.data.data;
        }
      }
      const res = await orderService.getById(id);
      return res.data.data;
    },
    enabled: !!id,
    initialData: orderFromState,
    refetchInterval: (query) => {
      const o = query.state.data;
      if (awaitingFedaPay && o?.paymentStatus === 'PENDING') return 3000;
      return false;
    },
  });

  const retryPayment = useMutation({
    mutationFn: () => orderService.retryPayment(id).then((r) => r.data),
    onSuccess: (data) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      refetch();
      toast.success('Paiement confirmé !');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors du paiement'),
  });

  useGsapAnimations(iconRef, () => {
    animateSuccessIcon(iconRef.current);
  }, [order?.id]);

  if (!order) {
    return (
      <MainLayout showNewsletter={false}>
        <div className="py-20 text-center text-gray-500">Chargement...</div>
      </MainLayout>
    );
  }

  const isPaid = order.paymentStatus === 'PAID';
  const isFedaPayPending = order.paymentMethod === 'FEADAPAY' && !isPaid;
  const paymentFailed = isFedaPayPending && ['declined', 'canceled', 'expired'].includes(fedaStatus || '');

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div
          ref={iconRef}
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 will-change-transform ${
            isPaid ? 'bg-green-100' : paymentFailed ? 'bg-red-50' : 'bg-amber-50'
          }`}
        >
          {isPaid ? (
            <CheckCircle className="text-primary" size={40} />
          ) : paymentFailed ? (
            <AlertCircle className="text-red-500" size={40} />
          ) : (
            <CheckCircle className="text-amber-500" size={40} />
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isPaid ? 'Merci pour votre commande !' : 'Commande enregistrée'}
        </h1>
        <p className="text-gray-600 mb-1">
          Votre commande <strong>{order.orderNumber}</strong> a bien été enregistrée.
        </p>
        {isFedaPayPending && !paymentFailed && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-2 mb-4">
            Paiement en cours de validation… Cette page se met à jour automatiquement.
          </p>
        )}
        {paymentFailed && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-4 space-y-3">
            <p>
              Le paiement n&apos;a pas abouti. En sandbox Momo Test, utilisez{' '}
              <strong>0164000001</strong> ou <strong>0166000001</strong> pour simuler un succès.
            </p>
            <button
              type="button"
              onClick={() => retryPayment.mutate()}
              disabled={retryPayment.isPending}
              className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary-dark disabled:opacity-50"
            >
              {retryPayment.isPending ? 'Redirection…' : 'Réessayer le paiement'}
            </button>
          </div>
        )}
        <p className="text-sm text-gray-500 mb-8">
          Un email de confirmation vous a été envoyé.
        </p>

        <ScrollRevealSection selector="[data-animate-block]">
          <div data-animate-block className="bg-gray-50 rounded-lg p-6 text-left mb-8 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Numéro</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-bold">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Paiement</span>
              <span>{isPaid ? 'Payé' : 'En attente'}</span>
            </div>
            {order.address && (
              <div className="border-t pt-3">
                <p className="text-gray-500 mb-1">Livraison à</p>
                <p>{order.address.street}, {order.address.city}</p>
              </div>
            )}
          </div>

          <div data-animate-block className="flex justify-center gap-8 mb-10">
            {[
              { icon: Package, label: 'Confirmée' },
              { icon: Truck, label: 'En livraison' },
              { icon: CheckCircle, label: 'Livrée' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
                  <Icon className="text-primary" size={18} />
                </div>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>

          <div data-animate-block className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/commandes/${order.id}`}
              className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary-dark"
            >
              Voir ma commande
            </Link>
            <Link
              to="/produits"
              className="border border-gray-300 px-6 py-3 rounded-md font-medium hover:bg-gray-50"
            >
              Continuer mes achats
            </Link>
          </div>
        </ScrollRevealSection>
      </div>
    </MainLayout>
  );
}
