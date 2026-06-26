import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Trash2, X } from 'lucide-react';
import AccountLayout from '../../components/account/AccountLayout';
import { authService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { label: '', phone: '', country: 'Bénin', city: '', street: '', isDefault: false };

export default function AddressesPage() {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => authService.getAddresses().then((r) => r.data.data),
    enabled: isAuthenticated,
  });

  const saveAddress = useMutation({
    mutationFn: () =>
      editing ? authService.updateAddress(editing.id, form) : authService.createAddress(form),
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      closeModal();
      toast.success('Adresse enregistrée');
    },
    onError: (err) => toast.error(err.response?.data?.message),
  });

  const deleteAddress = useMutation({
    mutationFn: (id) => authService.deleteAddress(id),
    onSuccess: () => { queryClient.invalidateQueries(['addresses']); toast.success('Adresse supprimée'); },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, label: user?.name || '' });
    setModalOpen(true);
  };

  const openEdit = (addr) => {
    setEditing(addr);
    setForm({
      label: addr.label || user?.name || '',
      phone: addr.phone || '',
      country: addr.country || 'Bénin',
      city: addr.city || '',
      street: addr.street || '',
      isDefault: addr.isDefault || false,
    });
    setModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center"><Link to="/connexion" className="text-primary">Connectez-vous</Link></div>
    );
  }

  return (
    <AccountLayout title="Carnets d'adresse">
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={openCreate}
          className="bg-primary text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-primary-dark"
        >
          Nouvelle adresse
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {addresses?.map((addr) => (
          <div key={addr.id} className="border border-gray-200 rounded-lg p-5">
            <div className="space-y-2 text-sm mb-4">
              <p><span className="text-primary font-medium">Nom :</span> {addr.label || user?.name}</p>
              <p><span className="text-primary font-medium">Numéro de téléphone :</span> {addr.phone || '—'}</p>
              <p><span className="text-primary font-medium">Pays :</span> {addr.country}</p>
              <p><span className="text-primary font-medium">Ville :</span> {addr.city}</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <input type="radio" checked={addr.isDefault} readOnly className="text-primary" />
              Définir comme adresse de livraison par défaut
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => openEdit(addr)} className="w-9 h-9 border rounded flex items-center justify-center hover:bg-gray-50">
                <Pencil size={16} className="text-gray-600" />
              </button>
              <button type="button" onClick={() => deleteAddress.mutate(addr.id)} className="w-9 h-9 border rounded flex items-center justify-center hover:bg-red-50">
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
        {!addresses?.length && (
          <p className="text-gray-500 text-sm col-span-2 text-center py-8">Aucune adresse enregistrée</p>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40"
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-lg p-6 max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="address-modal-title"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            <h2 id="address-modal-title" className="font-bold text-primary text-center mb-6 pr-8">
              {editing ? 'Modifier l\'adresse' : 'Enregistrer une adresse'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-primary mb-1 block">Nom & Prénoms</label>
                <input
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Nom complet"
                  className="w-full border rounded-md px-4 py-2.5 text-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="text-sm text-primary mb-1 block">Numéro de téléphone</label>
                <div className="flex gap-2">
                  <span className="border rounded-md px-2 py-2.5 text-sm bg-gray-50">🇧🇯</span>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Numéro"
                    className="flex-1 border rounded-md px-4 py-2.5 text-sm bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-primary mb-1 block">Pays</label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full border rounded-md px-4 py-2.5 text-sm bg-gray-50"
                >
                  <option value="Bénin">Bénin</option>
                  <option value="Togo">Togo</option>
                  <option value="Côte d'Ivoire">Côte d&apos;Ivoire</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-primary mb-1 block">Ville</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Ville"
                  className="w-full border rounded-md px-4 py-2.5 text-sm bg-gray-50"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-primary mb-1 block">Adresse</label>
                <input
                  value={form.street || ''}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  placeholder="Rue, quartier..."
                  className="w-full border rounded-md px-4 py-2.5 text-sm bg-gray-50"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              />
              Définir comme adresse de livraison par défaut
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 border rounded-md text-sm hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => saveAddress.mutate()}
                disabled={saveAddress.isPending || !form.city || !form.street}
                className="px-5 py-2 bg-primary text-white rounded-md text-sm disabled:opacity-60"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
