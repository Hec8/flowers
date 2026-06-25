import { Link } from 'react-router-dom';

export default function AuthTabs({ active }) {
  return (
    <div className="grid grid-cols-2 mb-6">
      <Link
        to="/connexion"
        className={`py-3 text-center text-sm font-medium rounded-l-md transition-colors ${
          active === 'login'
            ? 'bg-primary text-white'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        Déjà client(e) ?
      </Link>
      <Link
        to="/inscription"
        className={`py-3 text-center text-sm font-medium rounded-r-md transition-colors ${
          active === 'register'
            ? 'bg-primary text-white'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        Pas encore client(e) ?
      </Link>
    </div>
  );
}
