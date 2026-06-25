import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/admin/Pagination';
import { adminService } from '../../services';

const PAGE_SIZE = 15;

export default function AdminInboxPage() {
  const [tab, setTab] = useState('contact');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: contactData, isLoading: loadingContact } = useQuery({
    queryKey: ['admin-contact', page],
    queryFn: () => adminService.getContactMessages({ page, limit: PAGE_SIZE }).then((r) => r.data),
    enabled: tab === 'contact',
  });

  const { data: newsletterData, isLoading: loadingNewsletter } = useQuery({
    queryKey: ['admin-newsletter', page],
    queryFn: () => adminService.getNewsletterSubscriptions({ page, limit: PAGE_SIZE }).then((r) => r.data),
    enabled: tab === 'newsletter',
  });

  const markRead = useMutation({
    mutationFn: (id) => adminService.markContactRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-contact']);
      toast.success('Message marqué comme lu');
    },
  });

  const messages = contactData?.data || [];
  const contactPagination = contactData?.pagination || { total: 0, totalPages: 1 };
  const subscriptions = newsletterData?.data || [];
  const newsletterPagination = newsletterData?.pagination || { total: 0, totalPages: 1 };
  const pagination = tab === 'contact' ? contactPagination : newsletterPagination;

  return (
    <AdminLayout title="Messages reçus" subtitle="Contact et newsletter">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          <button
            type="button"
            onClick={() => { setTab('contact'); setPage(1); }}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
              tab === 'contact' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
            }`}
          >
            <MessageSquare size={18} /> Messages contact ({contactPagination.total || 0})
          </button>
          <button
            type="button"
            onClick={() => { setTab('newsletter'); setPage(1); }}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap ${
              tab === 'newsletter' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'
            }`}
          >
            <Mail size={18} /> Newsletter ({newsletterPagination.total || 0})
          </button>
        </div>

        {tab === 'contact' ? (
          <div className="overflow-x-auto">
            {loadingContact ? (
              <p className="p-8 text-center text-gray-500">Chargement...</p>
            ) : messages.length === 0 ? (
              <p className="p-8 text-center text-gray-500">Aucun message pour le moment</p>
            ) : (
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-green-50 text-gray-600">
                  <tr>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Nom</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Sujet</th>
                    <th className="text-left p-4">Message</th>
                    <th className="text-left p-4">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className={`border-t ${!msg.isRead ? 'bg-green-50/30' : ''}`}>
                      <td className="p-4 whitespace-nowrap text-gray-500">
                        {new Date(msg.createdAt).toLocaleString('fr-FR')}
                      </td>
                      <td className="p-4 font-medium">{msg.name}</td>
                      <td className="p-4">{msg.email}</td>
                      <td className="p-4">{msg.subject}</td>
                      <td className="p-4 max-w-xs truncate" title={msg.message}>{msg.message}</td>
                      <td className="p-4">
                        {msg.isRead ? (
                          <span className="text-xs text-gray-400">Lu</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => markRead.mutate(msg.id)}
                            className="text-xs text-primary hover:underline"
                          >
                            Marquer lu
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {loadingNewsletter ? (
              <p className="p-8 text-center text-gray-500">Chargement...</p>
            ) : subscriptions.length === 0 ? (
              <p className="p-8 text-center text-gray-500">Aucune inscription</p>
            ) : (
              <table className="w-full text-sm min-w-[400px]">
                <thead className="bg-green-50 text-gray-600">
                  <tr>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Inscrit le</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-t">
                      <td className="p-4">{sub.email}</td>
                      <td className="p-4 text-gray-500">
                        {new Date(sub.createdAt).toLocaleString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

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
