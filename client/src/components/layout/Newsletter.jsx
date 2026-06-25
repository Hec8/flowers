import { Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { contactService } from '../../services';
import opportunite from '../../assets/opportunite.png';

const benefits = [
  'Soyez le premier à recevoir nos offres exclusives et promotions.',
  'Trouvez l\'inspiration pour aménager ta maison et ton jardin',
  'Bénéficiez de nos conseils et obtenez des réponses à vos questions',
];

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await contactService.subscribe(email);
      toast.success('Merci pour votre inscription à la newsletter !');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${opportunite})`,
        }}
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative max-w-7xl mx-auto px-4 py-10 sm:py-16 flex items-center min-h-[320px] sm:min-h-[400px]">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 sm:p-8 w-full max-w-md shadow-xl">
          <h2 className="text-primary font-serif text-xl sm:text-2xl font-bold mb-4">
            Ne manquez aucune opportunité !
          </h2>
          <ul className="space-y-3 mb-6">
            {benefits.map((text) => (
              <li key={text} className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="text-accent shrink-0 mt-0.5" size={18} />
                {text}
              </li>
            ))}
          </ul>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email..."
              className="flex-1 border border-gray-300 rounded-md px-4 py-2.5 text-sm min-w-0"
              required
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors shrink-0"
            >
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
