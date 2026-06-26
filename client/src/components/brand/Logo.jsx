import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

/**
 * Logo NFlowers — image exportée de la maquette.
 * @param {string} to — lien de destination (défaut: accueil)
 * @param {string} className — classes Tailwind sur l'image
 */
export default function Logo({ to = '/', className = 'h-8 sm:h-9 w-auto object-contain' }) {
  return (
    <Link to={to} className="inline-flex items-center shrink-0" aria-label="NFlowers — Accueil">
      <img src={logo} alt="NFlowers" className={className} />
    </Link>
  );
}
