import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Package, Users, DollarSign, ShoppingCart, RefreshCw } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import ScrollRevealSection from '../../components/animation/ScrollRevealSection';
import AnimatedStatValue from '../../components/animation/AnimatedStatValue';
import { useTableRowStagger } from '../../hooks/useTableRowStagger';
import { adminService } from '../../services';
import { ALL_STATIC_PRODUCTS } from '../../data/staticProducts';

const StatCard = ({ icon: Icon, label, value, numericValue, suffix = '' }) => (
  <div data-animate-card className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between mb-3">
      <Icon className="text-primary" size={24} />
    </div>
    {numericValue != null ? (
      <AnimatedStatValue value={numericValue} suffix={suffix} />
    ) : (
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    )}
    <p className="text-sm text-gray-500 mt-1">{label}</p>
  </div>
);

const paymentLabels = { PAID: 'Payé', FAILED: 'Echoué', PENDING: 'En attente' };
const statusLabels = { PENDING: 'En attente', CONFIRMED: 'En cours', SHIPPING: 'En cours', DELIVERED: 'Livrée', CANCELLED: 'Annulée' };

const formatFcfa = (value) => `${Number(value).toLocaleString('fr-FR')} FCFA`;

export default function AdminDashboard() {
  const tableRef = useTableRowStagger('[data-animate-row]');
  const [seedState, setSeedState] = useState({ loading: false, result: null });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminService.getDashboard().then((r) => r.data.data),
  });

  const handleSeed = async () => {
    setSeedState({ loading: true, result: null });
    try {
      // Sérialise uniquement les champs nécessaires (pas les imports d'images Vite)
      const payload = ALL_STATIC_PRODUCTS.map(({ id: _id, imageUrls: _imgs, careTips: _ct,
        reviews: _rv, features: _ft, descriptionSections: _ds, bienfaits: _bf,
        signification: _sg, plantation: _pl, detailTitle: _dt, detailDescription: _dd,
        ...rest }) => rest);
      const res = await adminService.seedStaticProducts(payload);
      setSeedState({ loading: false, result: res.data });
    } catch (err) {
      setSeedState({ loading: false, result: { error: err.message } });
    }
  };

  if (isLoading) return <AdminLayout><p>Chargement...</p></AdminLayout>;

  const {
    stats,
    weeklyOrders = [],
    monthlySales = [],
    dailySales = [],
    recentOrders,
  } = data;

  return (
    <AdminLayout title="Tableau de bord">
      <ScrollRevealSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" selector="[data-animate-card]">
        <StatCard icon={Package} label="Produits en stock" numericValue={stats.totalProducts} suffix=" articles" value={`${stats.totalProducts} articles`} />
        <StatCard icon={Users} label="Consommateurs" numericValue={stats.totalUsers} value={stats.totalUsers.toLocaleString('fr-FR')} />
        <StatCard icon={DollarSign} label="Chiffre d'affaires du mois" numericValue={Math.round(parseFloat(stats.monthlyRevenue))} suffix=" FCFA" value={`${parseFloat(stats.monthlyRevenue).toLocaleString('fr-FR')} FCFA`} />
        <StatCard icon={ShoppingCart} label="Commandes en cours" numericValue={stats.pendingOrdersPercent} suffix="%" value={`${stats.pendingOrdersPercent}%`} />
      </ScrollRevealSection>

      <ScrollRevealSection className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" selector="[data-animate-card]">
        <div data-animate-card className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-1">Commandes cette semaine</h3>
          <p className="text-xs text-gray-400 mb-4">Toutes commandes par jour (lun. → dim.)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [value, 'Commandes']} />
              <Bar dataKey="orders" fill="#2d8f4e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div data-animate-card className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-1">Évolution des ventes</h3>
          <p className="text-xs text-gray-400 mb-4">Chiffre d&apos;affaires mensuel (commandes payées)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(value) => [formatFcfa(value), 'Ventes']} />
              <Bar dataKey="sales" fill="#86efac" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div data-animate-card className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-1">Ventes quotidiennes</h3>
          <p className="text-xs text-gray-400 mb-4">7 derniers jours (commandes payées)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(value) => [formatFcfa(value), 'Ventes']} />
              <Line type="monotone" dataKey="sales" stroke="#1a6b3c" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ScrollRevealSection>

      {/* ── Synchronisation catalogue statique → DB ── */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-800">Synchroniser le catalogue statique</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Publie tous les produits curatifs en base de données pour qu&apos;ils soient commandables en ligne.
            Idempotent : les slugs déjà existants sont ignorés.
          </p>
          {seedState.result && !seedState.result.error && (
            <p className="text-sm text-green-600 mt-1 font-medium">
              ✓ {seedState.result.created} produit(s) créé(s) · {seedState.result.skipped} déjà présent(s)
              {seedState.result.errors?.length > 0 && ` · ${seedState.result.errors.length} erreur(s)`}
            </p>
          )}
          {seedState.result?.error && (
            <p className="text-sm text-red-500 mt-1">{seedState.result.error}</p>
          )}
        </div>
        <button
          onClick={handleSeed}
          disabled={seedState.loading}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 whitespace-nowrap"
        >
          <RefreshCw size={16} className={seedState.loading ? 'animate-spin' : ''} />
          {seedState.loading ? 'Synchronisation…' : 'Synchroniser le catalogue'}
        </button>
      </div>

      <div ref={tableRef} className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold mb-4">Dernières commandes</h3>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">Commande</th>
                <th className="pb-3 pr-4">Client</th>
                <th className="pb-3 pr-4">Produits</th>
                <th className="pb-3 pr-4">Prix</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Paiement</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.length ? recentOrders.map((order) => (
                <tr key={order.id} data-animate-row className="border-b last:border-0">
                  <td className="py-3 pr-4 font-medium">{order.orderNumber}</td>
                  <td className="py-3 pr-4">{order.user?.name}</td>
                  <td className="py-3 pr-4">{order.items?.[0]?.product?.name}</td>
                  <td className="py-3 pr-4">{parseFloat(order.totalAmount).toLocaleString('fr-FR')}F</td>
                  <td className="py-3 pr-4">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                      order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {paymentLabels[order.paymentStatus]}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {statusLabels[order.status]}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">Aucune commande pour le moment</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
