import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Contact, LogOut } from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Mes informations', icon: User, href: '/profil', short: 'Infos' },
  { label: 'Mes commandes', icon: ShoppingBag, href: '/commandes', short: 'Commandes' },
  { label: 'Carnets d\'adresse', icon: Contact, href: '/profil/adresses', short: 'Adresses' },
];

export default function AccountLayout({ children, title }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/connexion');
  };

  return (
    <MainLayout showNewsletter={false}>
      <div className="flex flex-col lg:flex-row min-h-[70vh] bg-gray-50">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-64 bg-primary-dark text-white flex-col shrink-0">
          <div className="p-6 flex items-center gap-3 border-b border-green-800">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <User size={20} />
            </div>
            <p className="font-bold text-sm leading-tight break-words">{user?.name}</p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(({ label, icon: Icon, href }) => {
              const active = location.pathname === href;
              return (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                    active ? 'bg-white/15 text-white font-medium' : 'text-green-100 hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} /> {label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-green-800">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm text-green-100 hover:bg-white/10 rounded-lg w-full"
            >
              <LogOut size={18} /> Déconnexion
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 overflow-auto">
          {/* Mobile nav tabs */}
          <div className="lg:hidden bg-primary-dark text-white px-2 pt-3 pb-0">
            <p className="px-3 pb-3 text-sm font-bold truncate">{user?.name}</p>
            <nav className="flex overflow-x-auto scrollbar-hide -mx-1">
              {navItems.map(({ label, icon: Icon, href, short }) => {
                const active = location.pathname === href;
                return (
                  <Link
                    key={href}
                    to={href}
                    className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm whitespace-nowrap rounded-t-lg shrink-0 ${
                      active ? 'bg-gray-50 text-primary-dark font-medium' : 'text-green-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="sm:hidden">{short}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 text-xs sm:text-sm text-green-100 whitespace-nowrap shrink-0 ml-auto"
              >
                <LogOut size={16} /> <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6 lg:p-10">
            {title && (
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 sm:px-6 py-3 sm:py-4 mb-4 sm:mb-6">
                <h1 className="text-base sm:text-lg font-bold text-primary-dark">{title}</h1>
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 lg:p-8 min-h-[300px]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
