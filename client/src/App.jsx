import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute, GuestRoute } from './routes/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProductsPage from './pages/products/ProductsPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/cart/CheckoutPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderConfirmationPage from './pages/orders/OrderConfirmationPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import AddressesPage from './pages/profile/AddressesPage';
import WishlistPage from './pages/wishlist/WishlistPage';
import StorePage from './pages/store/StorePage';
import ContactPage from './pages/contact/ContactPage';
import ConseilsPage from './pages/conseils/ConseilsPage';
import ConseilArticlePage from './pages/conseils/ConseilArticlePage';
import ProducerPage from './pages/producers/ProducerPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProducersPage from './pages/admin/AdminProducersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminInboxPage from './pages/admin/AdminInboxPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/produits" element={<ProductsPage />} />
              <Route path="/produits/:slug" element={<ProductDetailPage />} />
              <Route path="/panier" element={<CartPage />} />
              <Route path="/producteurs/:slug" element={<ProducerPage />} />

              <Route path="/connexion" element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="/inscription" element={<GuestRoute><RegisterPage /></GuestRoute>} />
              <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
              <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />

              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/commande/confirmation/:id" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
              <Route path="/commandes" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/commandes/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
              <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/profil/adresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
              <Route path="/favoris" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />

              <Route path="/conseils" element={<ConseilsPage />} />
              <Route path="/conseils/:slug" element={<ConseilArticlePage />} />
              <Route path="/magasin" element={<StorePage />} />
              <Route path="/contact" element={<ContactPage />} />

              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/produits" element={<ProtectedRoute adminOnly><AdminProductsPage /></ProtectedRoute>} />
              <Route path="/admin/commandes" element={<ProtectedRoute adminOnly><AdminOrdersPage /></ProtectedRoute>} />
              <Route path="/admin/clients" element={<ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>} />
              <Route path="/admin/producteurs" element={<ProtectedRoute adminOnly><AdminProducersPage /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute adminOnly><AdminCategoriesPage /></ProtectedRoute>} />
              <Route path="/admin/messages" element={<ProtectedRoute adminOnly><AdminInboxPage /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
