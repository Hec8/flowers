import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
const stores = [
  {
    name: 'NFlowers Cotonou — Fidjrossè',
    address: 'Rue 123, Quartier Fidjrossè, Cotonou',
    phone: '(+229) 53 89 36 25',
    hours: 'Lun–Ven 9h–18h, Sam 9h–13h',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600',
  },
  {
    name: 'NFlowers Porto-Novo',
    address: 'Avenue Jean Paul II, Porto-Novo',
    phone: '(+229) 53 89 36 26',
    hours: 'Lun–Ven 9h–18h',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600',
  },
];

export default function StorePage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <MapPin className="mx-auto text-primary mb-3" size={32} />
          <h1 className="text-3xl font-bold mb-2">Mon magasin</h1>
          <p className="text-gray-600 max-w-xl mx-auto text-sm">
            Retirez gratuitement vos commandes en ligne dans l&apos;un de nos points de vente.
            Nos équipes vous accueillent pour vous conseiller.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {stores.map((store) => (
            <div key={store.name} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <img src={store.image} alt={store.name} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h2 className="font-bold text-lg mb-3">{store.name}</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-start gap-2"><MapPin size={16} className="shrink-0 mt-0.5 text-primary" />{store.address}</p>
                  <p className="flex items-center gap-2"><Phone size={16} className="text-primary" />{store.phone}</p>
                  <p className="flex items-center gap-2"><Clock size={16} className="text-primary" />{store.hours}</p>
                </div>
                <button type="button" className="mt-4 flex items-center gap-2 text-primary text-sm font-medium hover:underline">
                  <Navigation size={16} /> Itinéraire
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-green-50 rounded-lg p-8 text-center">
          <h3 className="font-semibold mb-2">Retrait en magasin gratuit</h3>
          <p className="text-sm text-gray-600 mb-4">
            Commandez en ligne et récupérez votre commande sous 24h dans le magasin de votre choix.
          </p>
          <Link to="/produits" className="inline-block bg-primary text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary-dark">
            Voir nos produits
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
