import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LayoutGrid, User, Package, ShoppingCart, Pencil, Trash2, ExternalLink, Eye } from 'lucide-react';
import AdminLayout, { AdminActionButton } from '../../components/layout/AdminLayout';
import AdminStatCard from '../../components/admin/AdminStatCard';
import ScrollRevealSection from '../../components/animation/ScrollRevealSection';
import { useTableRowStagger } from '../../hooks/useTableRowStagger';
import AdminTableToolbar from '../../components/admin/AdminTableToolbar';
import Pagination from '../../components/admin/Pagination';
import ProductFormModal from '../../components/admin/ProductFormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { adminService, productService } from '../../services';
import { formatAdminNumber, formatReviewCount } from '../../lib/adminConstants';
import { formatPriceShort } from '../../lib/constants';

const PAGE_SIZE = 12;

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => adminService.getProducts({ page, limit: PAGE_SIZE, search: search || undefined }).then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories().then((r) => r.data.data),
  });

  const { data: producers } = useQuery({
    queryKey: ['producers'],
    queryFn: () => adminService.getProducers().then((r) => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (formData) =>
      editing ? adminService.updateProduct(editing.id, formData) : adminService.createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      setModalOpen(false);
      setEditing(null);
      toast.success(editing ? 'Produit mis à jour' : 'Produit créé');
    },
    onError: (err) => toast.error(err.response?.data?.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      setDeleteId(null);
      toast.success('Produit supprimé');
    },
  });

  const products = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1 };
  const totalProducts = pagination.total;
  const inStock = products.filter((p) => p.stock > 0).length;
  const tableRef = useTableRowStagger('[data-animate-row]');

  return (
    <AdminLayout title="Vos produits" subtitle="Gérer vos plantes">
      <ScrollRevealSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" selector="[data-animate-card]">
        <div data-animate-card><AdminStatCard icon={LayoutGrid} label="Tous les produits" value={formatAdminNumber(totalProducts)} /></div>
        <div data-animate-card><AdminStatCard icon={User} label="Produits actifs" value={formatAdminNumber(totalProducts)} /></div>
        <div data-animate-card><AdminStatCard icon={Package} label="Produits en stock" value={formatAdminNumber(inStock || totalProducts)} /></div>
        <div data-animate-card><AdminStatCard icon={ShoppingCart} label="Catégories de produits" value={categories?.length || 0} /></div>
      </ScrollRevealSection>

      <div ref={tableRef} className="bg-white rounded-xl shadow-sm overflow-hidden">
        <AdminTableToolbar
          title="Produits"
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          onRefresh={() => refetch()}
          action={
            <AdminActionButton
              label="Ajouter un produit"
              onClick={() => { setEditing(null); setModalOpen(true); }}
            />
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-green-50 text-gray-600">
              <tr>
                <th className="p-4 w-10"><input type="checkbox" className="rounded" /></th>
                <th className="p-4 w-10"><Eye size={16} /></th>
                <th className="text-left p-4">Produit</th>
                <th className="text-left p-4 hidden lg:table-cell">Description</th>
                <th className="text-left p-4">Nb avis</th>
                <th className="text-left p-4">Prix</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Chargement...</td></tr>
              ) : products.map((p) => (
                <tr key={p.id} data-animate-row className="border-t hover:bg-gray-50/50">
                  <td className="p-4"><input type="checkbox" className="rounded" /></td>
                  <td className="p-4"><Eye size={16} className="text-gray-400" /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-green-50 overflow-hidden shrink-0">
                        {p.imageUrls?.[0] && <img src={p.imageUrls[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-semibold text-primary">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500 hidden lg:table-cell max-w-xs truncate">{p.description}</td>
                  <td className="p-4">{formatReviewCount(p._count?.reviews)}</td>
                  <td className="p-4">{formatPriceShort(p.price)}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => { setEditing(p); setModalOpen(true); }}
                        className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-600"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(p.id)}
                        className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                      <Link
                        to={`/produits/${p.slug}`}
                        target="_blank"
                        className="w-8 h-8 bg-primary text-white rounded flex items-center justify-center hover:bg-primary-dark"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={pagination.totalPages || 1}
          total={pagination.total || 0}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <ProductFormModal
        key={editing?.id || 'new'}
        open={modalOpen}
        editing={editing}
        categories={categories}
        producers={producers}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={(data) => saveMutation.mutate(data)}
        isSubmitting={saveMutation.isPending}
        uploadImage={adminService.uploadImage}
      />

      <ConfirmModal
        open={!!deleteId}
        title="Confirmation"
        message="Voulez-vous supprimer ce produit ?"
        confirmLabel="Accepter"
        danger
        onConfirm={() => deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </AdminLayout>
  );
}
