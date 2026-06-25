import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../components/layout/MainLayout';
import CheckoutStepper from '../../components/checkout/CheckoutStepper';
import AddressForm from '../../components/checkout/AddressForm';
import { authService, orderService, cartService } from '../../services';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { PAYMENT_OPTIONS } from '../../lib/constants';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { animateStepIn } from '../../lib/animations/helpers';
import { gsap } from '../../lib/animations/gsapSetup';

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [addressView, setAddressView] = useState('list');
  const [addressId, setAddressId] = useState('');
  const [editingAddress, setEditingAddress] = useState(null);
  const [paymentKey, setPaymentKey] = useState('feadapay');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const stepContentRef = useRef(null);
  const submitBtnRef = useRef(null);

  const stepKey = `${step}-${addressView}`;

  useGsapAnimations(stepContentRef, () => {
    animateStepIn(stepContentRef.current, step === 2 ? 1 : -1);
  }, [stepKey]);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => authService.getAddresses().then((r) => r.data.data),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (addresses?.length && !addressId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setAddressId(def.id);
    }
    if (addresses?.length === 0) setAddressView('form');
  }, [addresses, addressId]);

  const saveAddress = useMutation({
    mutationFn: (data) =>
      editingAddress
        ? authService.updateAddress(editingAddress.id, data)
        : authService.createAddress(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['addresses']);
      setAddressId(res.data.data.id);
      setAddressView('list');
      setEditingAddress(null);
      toast.success('Adresse enregistrée');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  const orderMutation = useMutation({
    mutationFn: async () => {
      const cartPayload = items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      await cartService.sync(cartPayload);

      const paymentMethod = PAYMENT_OPTIONS.find((p) => p.key === paymentKey)?.method || 'FEADAPAY';
      const { data } = await orderService.create({
        addressId,
        paymentMethod,
        items: cartPayload,
      });
      return data;
    },
    onSuccess: (response) => {
      const order = response.data;
      const paymentUrl = response.paymentUrl;
      clearCart();
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }
      navigate(`/commande/confirmation/${order.id}`, { state: { order } });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors de la commande'),
  });

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    saveAddress.mutate({
      label: fd.get('label'),
      street: fd.get('street'),
      zipCode: fd.get('zipCode'),
      country: fd.get('country'),
      city: fd.get('city'),
      phone: fd.get('phone'),
      isDefault: fd.get('isDefault') === 'on',
    });
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="py-20 text-center">
          <p className="mb-4">Connectez-vous pour passer commande</p>
          <Link to="/connexion" className="text-primary font-medium">Se connecter</Link>
        </div>
      </MainLayout>
    );
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="py-20 text-center">
          <p className="mb-4">Votre panier est vide</p>
          <Link to="/produits" className="text-primary">Voir les produits</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <CheckoutStepper step={step} />

        <div ref={stepContentRef}>
        {step === 1 && addressView === 'list' && (
          <div>
            <p className="text-sm text-gray-600 text-center mb-8">
              L&apos;adresse sélectionnée sera utilisée à la fois comme adresse personnelle (pour la facturation)
              et comme adresse de livraison.
            </p>

            {isLoading ? (
              <p className="text-center text-gray-500">Chargement...</p>
            ) : (
              <div className="space-y-4 mb-8">
                {addresses?.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block border rounded-lg p-5 cursor-pointer transition-colors ${
                      addressId === addr.id ? 'border-primary bg-green-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="address"
                        checked={addressId === addr.id}
                        onChange={() => setAddressId(addr.id)}
                        className="mt-1 accent-primary"
                      />
                      <div className="flex-1 text-sm">
                        <p className="font-semibold text-gray-900 mb-2">Mon adresse</p>
                        <p className="font-medium">{addr.label || user?.name}</p>
                        <p className="text-gray-600 mt-1">{addr.street}</p>
                        {addr.zipCode && <p className="text-gray-600">{addr.zipCode}</p>}
                        <p className="text-gray-600">{addr.country}</p>
                        <p className="text-gray-600">{addr.city}</p>
                        {addr.phone && <p className="text-gray-600 mt-1">{addr.phone}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingAddress(addr);
                          setAddressView('form');
                        }}
                        className="text-primary text-sm font-medium hover:underline shrink-0"
                      >
                        Modifier
                      </button>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="text-center mb-6">
              <button
                type="button"
                onClick={() => { setEditingAddress(null); setAddressView('form'); }}
                className="text-sm text-primary hover:underline"
              >
                + Ajouter une nouvelle adresse
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (!addressId) return toast.error('Sélectionnez une adresse');
                  setStep(2);
                }}
                className="bg-primary text-white px-8 sm:px-16 py-3 font-medium hover:bg-primary-dark w-full sm:w-auto"
              >
                Continuer
              </button>
              <Link
                to="/panier"
                className="flex items-center gap-1 text-primary text-sm uppercase tracking-wide hover:underline"
              >
                <ArrowLeft size={16} /> Poursuivre les achats
              </Link>
            </div>
          </div>
        )}

        {step === 1 && addressView === 'form' && (
          <div>
            <AddressForm
              defaultValues={{
                label: editingAddress?.label || user?.name,
                street: editingAddress?.street || '',
                zipCode: editingAddress?.zipCode || '',
                country: editingAddress?.country || 'Bénin',
                city: editingAddress?.city || '',
                phone: editingAddress?.phone || '',
              }}
              onSubmit={handleAddressSubmit}
              isSubmitting={saveAddress.isPending}
            />
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setEditingAddress(null); setAddressView('list'); }}
                className="text-sm text-primary hover:underline"
              >
                ← Retour à la liste des adresses
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className="flex flex-wrap items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentKey === opt.key}
                    onChange={() => setPaymentKey(opt.key)}
                    className="accent-primary w-4 h-4"
                  />
                  <span className={`w-16 text-center ${opt.color}`}>{opt.display}</span>
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 space-y-3">
              {paymentKey === 'feadapay' && (
                <p className="text-xs text-green-800 bg-green-50 border border-green-200 rounded px-3 py-2">
                  Sandbox Momo Test : utilisez <strong>0164000001</strong> ou <strong>0166000001</strong> pour
                  simuler un paiement réussi.
                </p>
              )}
              <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 accent-primary"
                />
                J&apos;ai lu les conditions générales de vente et j&apos;y adhère sans réserve.
              </label>
            </div>

            <div className="px-4 sm:px-6 py-4 border-t flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-primary text-sm hover:underline"
              >
                <ArrowLeft size={16} /> Retour
              </button>
              <button
                ref={submitBtnRef}
                type="button"
                onClick={() => {
                  if (!acceptedTerms) return toast.error('Acceptez les conditions générales');
                  if (submitBtnRef.current) {
                    gsap.fromTo(
                      submitBtnRef.current,
                      { scale: 0.92 },
                      { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.5)' },
                    );
                  }
                  orderMutation.mutate();
                }}
                disabled={orderMutation.isPending}
                className="bg-primary text-white px-8 py-2.5 font-medium hover:bg-primary-dark disabled:opacity-50 w-full sm:w-auto text-center will-change-transform"
              >
                {orderMutation.isPending ? 'Traitement…' : 'Acheter'}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </MainLayout>
  );
}
