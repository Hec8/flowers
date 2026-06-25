import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShoppingCart, Clock, Calendar } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminStatCard from '../../components/admin/AdminStatCard';
import ScrollRevealSection from '../../components/animation/ScrollRevealSection';
import { useTableRowStagger } from '../../hooks/useTableRowStagger';
import AdminTableToolbar from '../../components/admin/AdminTableToolbar';
import Pagination from '../../components/admin/Pagination';
import { adminService } from '../../services';
import { ORDER_STATUS_OPTIONS, formatAdminNumber } from '../../lib/adminConstants';
import { formatPriceShort } from '../../lib/constants';

const PAGE_SIZE = 12;

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => adminService.getOrders({ page, limit: PAGE_SIZE }).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.updateOrderStatus(id, { status }),
    onSuccess: () => { queryClient.invalidateQueries(['admin-orders']); toast.success('Statut mis à jour'); },
  });

  const orders = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1 };

  const filtered = search
    ? orders.filter((o) =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  const todayCount = orders.length;
  const pendingCount = orders.filter((o) => ['PENDING', 'CONFIRMED', 'SHIPPING'].includes(o.status)).length;
  const tableRef = useTableRowStagger('[data-animate-row]');

  const formatDateTime = (date) => {
    const d = new Date(date);
    return `${d.toLocaleDateString('fr-FR')} à ${d.getHours()}H${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <AdminLayout title="Vos commandes" subtitle="Gérer vos commandes">
      <ScrollRevealSection className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" selector="[data-animate-card]">
        <div data-animate-card><AdminStatCard icon={ShoppingCart} label="Commandes aujourd'hui" value={formatAdminNumber(todayCount)} /></div>
        <div data-animate-card><AdminStatCard icon={Clock} label="Commandes en attente" value={formatAdminNumber(pendingCount)} /></div>
        <div data-animate-card><AdminStatCard icon={Calendar} label="Commandes cette semaine" value={formatAdminNumber(pagination.total)} /></div>
      </ScrollRevealSection>

      <div ref={tableRef} className="bg-white rounded-xl shadow-sm overflow-hidden">
        <AdminTableToolbar
          title="Commandes"
          search={search}
          onSearchChange={setSearch}
          onRefresh={() => refetch()}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-green-50 text-gray-600">
              <tr>
                <th className="text-left p-4">N°</th>
                <th className="text-left p-4">Produits commandés</th>
                <th className="text-left p-4">Date & heure</th>
                <th className="text-left p-4">Utilisateur</th>
                <th className="text-left p-4">Prix total</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Chargement...</td></tr>
              ) : filtered.map((order) => (
                <tr key={order.id} data-animate-row className="border-t">
                  <td className="p-4 font-medium">{order.orderNumber}</td>
                  <td className="p-4">
                    <ul className="space-y-1">
                      {order.items?.map((item) => (
                        <li key={item.id} className="flex items-center gap-2 text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {item.product?.name} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                  <td className="p-4">{order.user?.name}</td>
                  <td className="p-4">{formatPriceShort(order.totalAmount)}</td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateMutation.mutate({ id: order.id, status: e.target.value })}
                      className="border border-gray-200 rounded-md px-3 py-1.5 text-xs bg-white min-w-[130px]"
                    >
                      {ORDER_STATUS_OPTIONS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
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
    </AdminLayout>
  );
}
