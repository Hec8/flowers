import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, MapPin, User, ShoppingCart, ChevronDown, Menu, X,
} from 'lucide-react';
import Logo from '../brand/Logo';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import {
  headerEntrance,
  animateMobileMenuOpen,
  animateMobileMenuClose,
  resetNavLinks,
  pulseBadge,
} from '../../lib/animations/helpers';

const navLinks = [
  { label: 'Plantes', href: '/produits?category=plantes' },
  { label: 'Aménagement extérieur', href: '/produits?category=engrais' },
  { label: 'Jardinage', href: '/produits?category=jardinage' },
  { label: 'Maison & Décoration', href: '/produits?category=maison-decoration' },
  { label: 'Fleurs & Vertus', href: '/produits?category=fleurs-bouquets' },
  { label: 'Conseils et astuces', href: '/conseils' },
];

/** Détecte si un lien nav est actif selon la route courante */
function isNavActive(link, pathname, search) {
  if (link.href.startsWith('/conseils')) return pathname.startsWith('/conseils');
  if (pathname !== '/produits') return false;
  try {
    const linkUrl = new URL(link.href, 'http://x');
    const cur = new URLSearchParams(search);
    const cat = linkUrl.searchParams.get('category');
    const type = linkUrl.searchParams.get('productType');
    const curCat = cur.get('category');
    if (cat) return curCat === cat;
    if (type) return cur.get('productType') === type;
  } catch { /* noop */ }
  return false;
}

function CartBadge({ count, badgeRef }) {
  if (count <= 0) return null;
  return (
    <span
      ref={badgeRef}
      className="absolute top-0 right-0 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center will-change-transform"
    >
      {count}
    </span>
  );
}

function CartBadgeDesktop({ count, badgeRef }) {
  if (count <= 0) return null;
  return (
    <span
      ref={badgeRef}
      className="absolute -top-1 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center will-change-transform"
    >
      {count}
    </span>
  );
}

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const mobileBadgeRef = useRef(null);
  const desktopBadgeRef = useRef(null);
  const prevCountRef = useRef(itemCount);
  const prevMenuOpenRef = useRef(null);

  useGsapAnimations(headerRef, () => {
    headerEntrance(headerRef.current);
  }, []);

  // Animation menu mobile UNIQUEMENT — jamais de "fermeture" au montage initial
  // (cause racine du bug : animateMobileMenuLinks(false) mettait opacity:0 sur les liens desktop)
  useGsapAnimations(navRef, () => {
    if (!navRef.current) return;
    const links = navRef.current.querySelectorAll('[data-nav-link]');
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

    if (isDesktop) {
      resetNavLinks(links);
      prevMenuOpenRef.current = menuOpen;
      return;
    }

    if (menuOpen) {
      animateMobileMenuOpen(links);
    } else if (prevMenuOpenRef.current === true) {
      animateMobileMenuClose(links);
    } else {
      resetNavLinks(links);
    }
    prevMenuOpenRef.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      pulseBadge(mobileBadgeRef.current);
      pulseBadge(desktopBadgeRef.current);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  useEffect(() => {
    setMenuOpen(false);
    setUserOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/produits?search=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <header ref={headerRef} className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        {/* Mobile + tablet top row */}
        <div className="flex items-center justify-between gap-3 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 -ml-2 text-gray-700"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Logo className="h-7 w-auto object-contain" />

          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserOpen((o) => !o)}
                  className="p-2 text-gray-600"
                  aria-label="Mon compte"
                >
                  <User size={22} />
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-lg rounded-md border py-1 z-50">
                    <Link to="/profil" className="block px-4 py-2 text-sm hover:bg-gray-50">Mon profil</Link>
                    <Link to="/profil/adresses" className="block px-4 py-2 text-sm hover:bg-gray-50">Mes adresses</Link>
                    <Link to="/favoris" className="block px-4 py-2 text-sm hover:bg-gray-50">Mes favoris</Link>
                    <Link to="/commandes" className="block px-4 py-2 text-sm hover:bg-gray-50">Mes commandes</Link>
                    {user?.role === 'ADMIN' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50">Administration</Link>
                    )}
                    <button type="button" onClick={logout} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/connexion" className="p-2 text-gray-600" aria-label="Se connecter">
                <User size={22} />
              </Link>
            )}
            <Link to="/panier" className="p-2 text-gray-600 relative" aria-label="Panier">
              <ShoppingCart size={22} />
              <CartBadge count={itemCount} badgeRef={mobileBadgeRef} />
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="flex pb-3 lg:hidden">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Que recherchez vous ?"
            className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm min-w-0"
          />
          <button type="submit" className="bg-primary-dark text-white px-3 rounded-r-md shrink-0">
            <Search size={18} />
          </button>
        </form>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 shrink-0">
            <span className="text-lg">🇧🇯</span>
            <span>BENIN</span>
            <ChevronDown size={14} />
          </div>

          <form onSubmit={handleSearch} className="flex flex-1 max-w-md mx-4 min-w-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Que recherchez vous ?"
              className="flex-1 border border-gray-300 rounded-l-md px-4 py-2.5 text-sm min-w-0"
            />
            <button type="submit" className="bg-primary-dark text-white px-4 rounded-r-md hover:bg-primary transition-colors shrink-0">
              <Search size={18} />
            </button>
          </form>

          <Logo className="h-8 w-auto object-contain" />

          <div className="flex items-center gap-6 text-sm shrink-0">
            <Link to="/magasin" className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors">
              <MapPin size={20} />
              <span className="text-xs mt-0.5">Mon magasin</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative group">
                <button type="button" className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors">
                  <User size={20} />
                  <span className="text-xs mt-0.5 max-w-[4rem] truncate">{user?.name?.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-lg rounded-md border py-1 hidden group-hover:block z-50">
                  <Link to="/profil" className="block px-4 py-2 text-sm hover:bg-gray-50">Mon profil</Link>
                  <Link to="/profil/adresses" className="block px-4 py-2 text-sm hover:bg-gray-50">Mes adresses</Link>
                  <Link to="/favoris" className="block px-4 py-2 text-sm hover:bg-gray-50">Mes favoris</Link>
                  <Link to="/commandes" className="block px-4 py-2 text-sm hover:bg-gray-50">Mes commandes</Link>
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50">Administration</Link>
                  )}
                  <button type="button" onClick={logout} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/connexion" className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors">
                <User size={20} />
                <span className="text-xs mt-0.5">Se connecter</span>
              </Link>
            )}

            <Link to="/panier" className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors relative">
              <ShoppingCart size={20} />
              <span className="text-xs mt-0.5">Panier</span>
              <CartBadgeDesktop count={itemCount} badgeRef={desktopBadgeRef} />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation — mobile drawer + desktop bar */}
      <nav className={`border-t border-gray-100 overflow-hidden ${menuOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <ul ref={navRef} className="flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-6 xl:gap-8 py-3 text-sm">
            {navLinks.map((link) => {
              const active = isNavActive(link, location.pathname, location.search);
              return (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    data-nav-link
                    onClick={() => setMenuOpen(false)}
                    className={`block py-2 lg:py-0 hover:text-primary transition-colors font-medium ${
                      active ? 'text-primary border-b-2 border-primary lg:pb-0.5' : 'text-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="lg:hidden pt-2 border-t mt-2">
              <Link
                to="/magasin"
                data-nav-link
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-gray-700"
              >
                <MapPin size={18} /> Mon magasin
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
