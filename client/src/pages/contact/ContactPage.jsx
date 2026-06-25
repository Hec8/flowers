import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { contactService } from '../../services';

export default function ContactPage() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      await contactService.submit(data);
      toast.success('Message envoyé ! Nous vous répondrons sous 24h.');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Contactez-nous</h1>
          <p className="text-gray-600 text-sm">Une question ? Notre équipe est disponible pour vous aider.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="text-primary" size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">Téléphone</p>
                <p className="text-sm text-gray-600">(+229) 53 89 36 25</p>
                <p className="text-xs text-gray-400 mt-1">Lun–Ven 9h–18h</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="text-primary" size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">Email</p>
                <p className="text-sm text-gray-600">contact@nflowers.com</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="text-primary" size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">Adresse</p>
                <p className="text-sm text-gray-600">Rue 123, Quartier Fidjrossè<br />Cotonou, Bénin</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="text-primary" size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">Horaires</p>
                <p className="text-sm text-gray-600">Lundi – Vendredi : 9h00 – 18h00<br />Samedi : 9h00 – 13h00</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="md:col-span-3 bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-lg mb-2">Envoyez-nous un message</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nom *</label>
                <input {...register('name', { required: true })} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                <input type="email" {...register('email', { required: true })} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Sujet *</label>
              <select {...register('subject', { required: true })} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm">
                <option value="">Choisir un sujet</option>
                <option value="commande">Question sur une commande</option>
                <option value="produit">Question sur un produit</option>
                <option value="livraison">Livraison / Retrait</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Message *</label>
              <textarea {...register('message', { required: true })} rows={5} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm resize-none" />
            </div>
            <button type="submit" className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary-dark">
              <Send size={18} /> Envoyer le message
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
