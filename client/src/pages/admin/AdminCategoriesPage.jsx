import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Tag, Pencil, Trash2 } from 'lucide-react';
import AdminLayout, { AdminActionButton } from '../../components/layout/AdminLayout';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminTableToolbar from '../../components/admin/AdminTableToolbar';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useTableRowStagger } from '../../hooks/useTableRowStagger';
import { adminService, productService } from '../../services';

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const { data: categories, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories().then((r) => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      editing ? adminService.updateCategory(editing.id, { name }) : adminService.createCategory({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setModalOpen(false);
      setEditing(null);
      setName('');
      toast.success(editing ? 'Catégorie mise à jour' : 'Catégorie créée');
    },
    onError: (err) => toast.error(err.response?.data?.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      setDeleteId(null);
      toast.success('Catégorie supprimée');
    },
    onError: (err) => toast.error(err.response?.data?.message),
  });

  const filtered = categories?.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const openCreate = () => { setEditing(null); setName(''); setModalOpen(true); };
  const openEdit = (cat) => { setEditing(cat); setName(cat.name); setModalOpen(true); };
  const tableRef = useTableRowStagger('[data-animate-row]');

  return (
    <AdminLayout title="Catégories" subtitle="Gérer les catégories de produits">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <AdminStatCard icon={Tag} label="Total catégories" value={categories?.length || 0} />
        <AdminStatCard icon={Tag} label="Avec produits" value={categories?.filter((c) => c._count?.products > 0).length || 0} />
        <AdminStatCard icon={Tag} label="Sans produit" value={categories?.filter((c) => !c._count?.products).length || 0} />
      </div>

      <div ref={tableRef} className="bg-white rounded-xl shadow-sm overflow-hidden">
        <AdminTableToolbar
          title="Catégories"
          search={search}
          onSearchChange={setSearch}
          onRefresh={() => refetch()}
          action={<AdminActionButton label="Ajouter une catégorie" onClick={openCreate} />}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-green-50 text-gray-600">
              <tr>
                <th className="text-left p-4">Nom</th>
                <th className="text-left p-4">Slug</th>
                <th className="text-left p-4">Produits</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat) => (
                <tr key={cat.id} data-animate-row className="border-t">
                  <td className="p-4 font-semibold text-primary">{cat.name}</td>
                  <td className="p-4 text-gray-500">{cat.slug}</td>
                  <td className="p-4">{cat._count?.products || 0}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(cat)}
                        className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(cat.id)}
                        className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center"
                      >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-primary mb-4">{editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de la catégorie"
              className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm mb-4"
            />
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-md text-sm">Annuler</button>
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={!name.trim() || saveMutation.isPending}
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
        message="Supprimer cette catégorie ? (impossible si des produits y sont rattachés)"
        confirmLabel="Supprimer"
        danger
        onConfirm={() => deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </AdminLayout>
  );
}
