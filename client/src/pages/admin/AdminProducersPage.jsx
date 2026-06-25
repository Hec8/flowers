import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Leaf, Pencil, Trash2, ImagePlus } from 'lucide-react';
import AdminLayout, { AdminActionButton } from '../../components/layout/AdminLayout';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminTableToolbar from '../../components/admin/AdminTableToolbar';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useTableRowStagger } from '../../hooks/useTableRowStagger';
import { adminService } from '../../services';

export default function AdminProducersPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', bio: '', cultivationMethod: '', isBio: false, imageUrl: '' });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: producers, refetch } = useQuery({
    queryKey: ['producers'],
    queryFn: () => adminService.getProducers().then((r) => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editing ? adminService.updateProducer(editing.id, form) : adminService.createProducer(form),
    onSuccess: () => {
      queryClient.invalidateQueries(['producers']);
      setModalOpen(false);
      setEditing(null);
      toast.success(editing ? 'Producteur mis à jour' : 'Producteur créé');
    },
    onError: (err) => toast.error(err.response?.data?.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteProducer(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['producers']);
      setDeleteId(null);
      toast.success('Producteur supprimé');
    },
    onError: (err) => toast.error(err.response?.data?.message),
  });

  const filtered = producers?.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', bio: '', cultivationMethod: '', isBio: false, imageUrl: '' });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      bio: p.bio || '',
      cultivationMethod: p.cultivationMethod || '',
      isBio: p.isBio || false,
      imageUrl: p.imageUrl || '',
    });
    setModalOpen(true);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminService.uploadProducerImage(file);
      setForm((f) => ({ ...f, imageUrl: res.data.data.url }));
      toast.success('Image chargée');
    } catch {
      toast.error('Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const tableRef = useTableRowStagger('[data-animate-row]');

  return (
    <AdminLayout title="Producteurs" subtitle="Gérer vos producteurs partenaires">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <AdminStatCard icon={Leaf} label="Total producteurs" value={producers?.length || 0} />
        <AdminStatCard icon={Leaf} label="Label bio" value={producers?.filter((p) => p.isBio).length || 0} />
        <AdminStatCard icon={Leaf} label="Avec produits" value={producers?.filter((p) => p._count?.products > 0).length || 0} />
      </div>

      <div ref={tableRef} className="bg-white rounded-xl shadow-sm overflow-hidden">
        <AdminTableToolbar
          title="Producteurs"
          search={search}
          onSearchChange={setSearch}
          onRefresh={() => refetch()}
          action={<AdminActionButton label="Ajouter un producteur" onClick={openCreate} />}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-green-50 text-gray-600">
              <tr>
                <th className="text-left p-4">Producteur</th>
                <th className="text-left p-4 hidden md:table-cell">Bio</th>
                <th className="text-left p-4">Produits</th>
                <th className="text-left p-4">Bio</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} data-animate-row className="border-t">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl || 'https://placehold.co/40'} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <span className="font-semibold text-primary">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500 hidden md:table-cell max-w-xs truncate">{p.bio}</td>
                  <td className="p-4">{p._count?.products || 0}</td>
                  <td className="p-4">{p.isBio ? '🌿 Oui' : '—'}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => openEdit(p)} className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => setDeleteId(p.id)} className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40">
          <div className="bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-primary mb-4">{editing ? 'Modifier le producteur' : 'Nouveau producteur'}</h2>
            <div className="space-y-4">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nom du producteur"
                className="w-full border rounded-md px-4 py-2.5 text-sm"
              />
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Histoire / bio"
                rows={3}
                className="w-full border rounded-md px-4 py-2.5 text-sm resize-none"
              />
              <textarea
                value={form.cultivationMethod}
                onChange={(e) => setForm({ ...form, cultivationMethod: e.target.value })}
                placeholder="Méthodes de culture"
                rows={2}
                className="w-full border rounded-md px-4 py-2.5 text-sm resize-none"
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isBio} onChange={(e) => setForm({ ...form, isBio: e.target.checked })} />
                Label bio
              </label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed rounded-lg py-8 flex flex-col items-center gap-2 bg-gray-50"
              >
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <>
                    <ImagePlus className="text-gray-400" size={28} />
                    <span className="text-sm text-gray-500">{uploading ? 'Chargement...' : 'Charger une photo'}</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-md text-sm">Annuler</button>
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={!form.name.trim() || saveMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-md text-sm disabled:opacity-60"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="Confirmation"
        message="Supprimer ce producteur ? (impossible s'il a des produits)"
        confirmLabel="Supprimer"
        danger
        onConfirm={() => deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </AdminLayout>
  );
}
