import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AdminLayout from '../../components/layout/AdminLayout';
import AdminTableToolbar from '../../components/admin/AdminTableToolbar';
import Pagination from '../../components/admin/Pagination';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useTableRowStagger } from '../../hooks/useTableRowStagger';
import { adminService } from '../../services';

const PAGE_SIZE = 12;

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [toggleId, setToggleId] = useState(null);
  const [toggleActive, setToggleActive] = useState(true);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminService.getUsers({ page, limit: PAGE_SIZE, search: search || undefined }).then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => adminService.toggleUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setToggleId(null);
      toast.success('Statut mis à jour');
    },
  });

  const users = data?.data || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1 };
  const tableRef = useTableRowStagger('[data-animate-row]');

  return (
    <AdminLayout title="Vos clients" subtitle="Gérer vos données des clients">
      <div ref={tableRef} className="bg-white rounded-xl shadow-sm overflow-hidden">
        <AdminTableToolbar
          title="Clients"
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          onRefresh={() => refetch()}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-green-50 text-gray-600">
              <tr>
                <th className="text-left p-4">N°</th>
                <th className="text-left p-4">Nom & Prénoms</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Téléphone</th>
                <th className="text-left p-4">Addresse</th>
                <th className="text-left p-4">Statut</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Chargement...</td></tr>
              ) : users.map((user, i) => {
                const addr = user.addresses?.[0];
                return (
                  <tr key={user.id} data-animate-row className="border-t">
                    <td className="p-4 text-gray-500">{String((page - 1) * PAGE_SIZE + i + 1).padStart(4, '0')}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-green-50 flex items-center justify-center text-primary font-bold text-sm">
                          {user.name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-primary">{user.name}</p>
                          <p className="text-xs text-gray-400">{user._count?.orders || 0} commande(s)</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{addr?.phone || '—'}</td>
                    <td className="p-4">
                      {addr ? `${addr.city}${addr.street ? `, ${addr.street}` : ''}` : '—'}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => { setToggleId(user.id); setToggleActive(user.isActive); }}
                        className={`text-xs px-3 py-1.5 rounded-md border ${
                          user.isActive ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-primary border-green-200 hover:bg-green-50'
                        }`}
                      >
                        {user.isActive ? 'Désactiver' : 'Réactiver'}
                      </button>
                    </td>
                  </tr>
                );
              })}
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

      <ConfirmModal
        open={!!toggleId}
        title="Confirmation"
        message={toggleActive ? 'Voulez-vous désactiver ce client ?' : 'Voulez-vous réactiver ce client ?'}
        confirmLabel="Accepter"
        danger={toggleActive}
        onConfirm={() => toggleMutation.mutate(toggleId)}
        onCancel={() => setToggleId(null)}
      />
    </AdminLayout>
  );
}
