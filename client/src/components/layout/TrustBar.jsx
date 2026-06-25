import { Lock, Truck, Store, MessageCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const trustItems = [
  {
    icon: Lock,
    title: 'PAIEMENTS SÉCURISÉS',
    text: 'Paiement sécurisé par carte bancaire, mastercard, visa, virement.',
  },
  {
    icon: Truck,
    title: 'LIVRAISON & RETOUR',
    text: 'Commande expédiée sous 24h, avec garantie satisfait ou remboursé sous 30 jours.',
  },
  {
    icon: Store,
    title: 'RETRAIT EN MAGASIN',
    text: 'Commandez en ligne et retirez votre commande gratuitement en magasin.',
  },
  {
    icon: MessageCircle,
    title: 'BESOIN D\'AIDE ?',
    text: 'Disponible à vous servir. Contactez-nous au (+229) 53 89 36 25 ou par mail.',
  },
];

/* ─── Icônes réseaux sociaux en SVG inline ─── */
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

/* ─── Logos paiement stylisés ─── */
const paymentMethods = [
  { label: 'MTN', bg: 'bg-yellow-400', text: 'text-black', weight: 'font-extrabold' },
  { label: 'Moov', bg: 'bg-blue-600', text: 'text-white', weight: 'font-bold' },
  { label: 'PayPal', bg: 'bg-blue-700', text: 'text-white', weight: 'font-bold' },
  { label: 'VISA', bg: 'bg-white border border-gray-200', text: 'text-blue-800', weight: 'font-extrabold italic' },
  { label: 'MC', bg: 'bg-white border border-gray-200', text: 'text-orange-600', weight: 'font-extrabold' },
];

export default function TrustBar() {
  return (
    <section className="bg-green-50 py-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {trustItems.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Icon className="text-amber-600" size={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 mb-1">{title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  const footerLinks = {
    'Mentions légales': [
      { label: 'Mentions légales', href: '#' },
      { label: 'Conditions générales de vente', href: '#' },
      { label: 'Politique de protection des données', href: '#' },
      { label: 'Paramètre des cookies', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
    'Nos univers': [
      { label: 'Plantes', href: '/produits?category=plantes' },
      { label: 'Aménagement extérieur', href: '/produits?category=jardin-exterieur' },
      { label: 'Jardinage', href: '/produits?category=jardinage' },
      { label: 'Maison & décoration', href: '/produits?category=maison-decoration' },
      { label: 'Fleurs et vertus', href: '/produits?category=fleurs-bouquets' },
    ],
    'Nos services': [
      { label: 'Commande rapide', href: '#' },
      { label: 'Livraison', href: '#' },
      { label: 'Testé et approuvé', href: '#' },
      { label: 'Retours et échanges', href: '#' },
      { label: 'Nos engagements', href: '#' },
    ],
  };

  return (
    <footer className="bg-footer text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-green-200 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide">Service client</h4>
            <p className="text-sm text-green-200 mb-4 leading-relaxed">
              Avez-vous une question concernant votre commande ou notre boutique ?
            </p>
            <a href="mailto:contact@nflowers.com" className="text-sm text-green-200 hover:text-white flex items-center gap-2 mb-2 transition-colors">
              <MessageCircle size={15} className="shrink-0" />
              Envoyez-nous un message
            </a>
            <p className="text-sm text-green-200 flex items-center gap-2">
              <span className="text-base">📞</span>
              <span>(+229) 53 89 36 25</span>
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-green-800 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

            {/* Hours */}
            <div className="flex items-center gap-2 text-sm text-green-200 text-center sm:text-left">
              <Clock size={16} className="shrink-0 text-amber-400" />
              <span>Disponible du lundi au vendredi de 9h00 à 18h00</span>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-green-200">Rejoignez-nous</span>
              <div className="flex gap-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full border border-green-500 flex items-center justify-center hover:bg-primary hover:border-primary transition-colors text-green-200 hover:text-white"
                >
                  <FacebookIcon />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full border border-green-500 flex items-center justify-center hover:bg-primary hover:border-primary transition-colors text-green-200 hover:text-white"
                >
                  <InstagramIcon />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-full border border-green-500 flex items-center justify-center hover:bg-primary hover:border-primary transition-colors text-green-200 hover:text-white"
                >
                  <LinkedInIcon />
                </a>
              </div>
            </div>

            {/* Payments */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-green-300 uppercase tracking-wide">Achats 100% sécurisés</span>
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {paymentMethods.map(({ label, bg, text, weight }) => (
                  <span
                    key={label}
                    className={`${bg} ${text} ${weight} text-[10px] px-2 py-0.5 rounded min-w-[2.5rem] text-center`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

          </div>

          <p className="text-center text-xs text-green-400 mt-8">
            Copyright © 2024.nflowers | Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
