import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, LogOut, Leaf, Tag, Bell, ChevronDown, SlidersHorizontal, Menu, X, MessageSquare, User,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services';
import Logo from '../brand/Logo';
import ConfirmModal from '../admin/ConfirmModal';
import PageTransition from '../animation/PageTransition';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Produits', icon: Package, href: '/admin/produits' },
  { label: 'Commandes', icon: ShoppingCart, href: '/admin/commandes' },
  { label: 'Clients', icon: Users, href: '/admin/clients' },
  { label: 'Catégories', icon: Tag, href: '/admin/categories' },
  { label: 'Producteurs', icon: Leaf, href: '/admin/producteurs' },
  { label: 'Messages', icon: MessageSquare, href: '/admin/messages' },
  { label: 'Statistiques', icon: BarChart3, href: '/admin' },
];

function SidebarContent({ location, onNavigate, onLogoutClick }) {
  return (
    <>
      <div className="p-5 flex items-center gap-2">
        <Logo to="/admin" className="h-7 w-auto object-contain brightness-0 invert" />
      </div>
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, href }) => {
          const active = location.pathname === href;
          return (
            <Link
              key={label}
              to={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${
                active ? 'bg-white/15 text-white' : 'text-green-100 hover:bg-white/10'
              }`}
            >
              <Icon size={17} /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-green-800 space-y-0.5 shrink-0">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-3 px-4 py-2.5 text-sm text-green-100 hover:bg-white/10 rounded-md">
          <Settings size={17} /> Retour au site
        </Link>
        <button
          type="button"
          onClick={onLogoutClick}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-green-100 hover:bg-white/10 rounded-md w-full"
        >
          <LogOut size={17} /> Déconnexion
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({ children, title, subtitle, action }) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { data: headerStats } = useQuery({
    queryKey: ['admin-header-stats'],
    queryFn: () => adminService.getDashboard().then((r) => r.data.data.stats),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const unreadMessages = headerStats?.unreadMessages ?? 0;
  const pendingOrders = headerStats?.pendingOrders ?? 0;
  const notificationCount = unreadMessages + pendingOrders;

  const roleLabel = user?.role === 'ADMIN' ? 'Super Admin' : 'Utilisateur';

  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 bg-primary-dark text-white flex-col shrink-0">
        <SidebarContent
          location={location}
          onNavigate={() => {}}
          onLogoutClick={() => setLogoutOpen(true)}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer le menu"
          />
          <aside className="relative w-64 max-w-[85vw] h-full bg-primary-dark text-white flex flex-col shadow-xl">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-green-100"
            >
              <X size={22} />
            </button>
            <SidebarContent
              location={location}
              onNavigate={() => setSidebarOpen(false)}
              onLogoutClick={() => { setSidebarOpen(false); setLogoutOpen(true); }}
            />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 overflow-auto">
        <header className="bg-green-50 border-b border-green-100 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-primary-dark shrink-0"
              aria-label="Menu admin"
            >
              <Menu size={22} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-primary-dark truncate">{title || 'Tableau de bord'}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              to="/admin/messages"
              className="relative text-gray-500 hover:text-primary hidden sm:block p-1"
              title="Messages non lus"
            >
              <Bell size={20} />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 px-0.5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </Link>
            <Link
              to="/admin/commandes"
              className="relative text-gray-500 hover:text-primary hidden sm:block p-1"
              title="Commandes en cours"
            >
              <SlidersHorizontal size={20} />
              {pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 px-0.5 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {pendingOrders > 99 ? '99+' : pendingOrders}
                </span>
              )}
            </Link>

            <div className="relative sm:pl-4 sm:border-l" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                  {(user?.name?.[0] || 'A').toUpperCase()}
                </div>
                <div className="hidden md:block min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[10rem]">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{roleLabel}</p>
                </div>
                <ChevronDown size={16} className={`text-gray-400 hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white shadow-lg rounded-md border py-1 z-50">
                  <div className="px-4 py-2 border-b md:hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500">{roleLabel}</p>
                  </div>
                  <Link to="/profil" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                    <User size={15} /> Mon profil
                  </Link>
                  <Link to="/admin/messages" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                    <MessageSquare size={15} />
                    Messages
                    {unreadMessages > 0 && (
                      <span className="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadMessages}</span>
                    )}
                  </Link>
                  <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                    <Settings size={15} /> Retour au site
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); setLogoutOpen(true); }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                  >
                    <LogOut size={15} /> Déconnexion
                  </button>
                </div>
              )}
            </div>

            {/* Badge mobile notifications */}
            {notificationCount > 0 && (
              <Link to="/admin/messages" className="sm:hidden relative p-1 text-gray-500">
                <Bell size={20} />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              </Link>
            )}
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          {action && <div className="mb-4 flex justify-end">{action}</div>}
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      <ConfirmModal
        open={logoutOpen}
        title="Confirmation"
        message="Voulez-vous être déconnecté(e) ?"
        confirmLabel="Accepter"
        danger
        onConfirm={() => { setLogoutOpen(false); handleLogout(); }}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
}

export function AdminActionButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-primary text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center gap-2 hover:bg-primary-dark whitespace-nowrap"
    >
      + {label}
    </button>
  );
}
