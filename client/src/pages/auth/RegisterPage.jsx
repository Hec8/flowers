import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../components/layout/MainLayout';
import AuthTabs from '../../components/auth/AuthTabs';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  currency: z.string().min(1),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string(),
  birthDate: z.string().optional(),
  street: z.string().min(3, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  country: z.string().optional(),
  marketingOptIn: z.boolean().optional(),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Vous devez accepter les conditions' }) }),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'FCFA', country: 'Bénin', marketingOptIn: false },
  });

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, acceptTerms, ...payload } = data;
      await registerUser(payload);
      toast.success('Compte créé avec succès !');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12 px-4">
        <h1 className="text-2xl font-bold text-center mb-8">Création de compte</h1>

        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-lg font-semibold mb-4">Bienvenue chez Flowa</h2>
          <AuthTabs active="register" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('name')} placeholder="Nom et prénoms *" className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm" />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}

            <input {...register('email')} type="email" placeholder="Email *" className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm" />
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}

            <select {...register('currency')} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-600">
              <option value="FCFA">FCFA</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>

            <div className="relative">
              <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Mot de passe *" className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}

            <div className="relative">
              <input {...register('confirmPassword')} type={showConfirm ? 'text' : 'password'} placeholder="Confirmer votre mot de passe *" className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm pr-10" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}

            <div>
              <p className="text-sm text-gray-600 mb-2">Recevez un cadeau le jour de votre anniversaire</p>
              <input {...register('birthDate')} type="date" placeholder="Entrez votre date de naissance *" className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm" />
            </div>

            <input {...register('street')} placeholder="Adresse de livraison *" className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm" />
            {errors.street && <p className="text-red-500 text-xs">{errors.street.message}</p>}

            <div className="grid grid-cols-2 gap-3">
              <input {...register('city')} placeholder="Ville *" className="border border-gray-300 rounded-md px-4 py-3 text-sm" />
              <input {...register('country')} placeholder="Pays" className="border border-gray-300 rounded-md px-4 py-3 text-sm" />
            </div>
            {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}

            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input type="checkbox" {...register('marketingOptIn')} className="mt-1" />
              Je souhaite recevoir par email les actualités promotionnelles et les offres de NFlowers.
            </label>

            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input type="checkbox" {...register('acceptTerms')} className="mt-1" />
              J&apos;accepte les conditions générales et la politique de confidentialité
            </label>
            {errors.acceptTerms && <p className="text-red-500 text-xs">{errors.acceptTerms.message}</p>}

            <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
              {isSubmitting ? 'Création...' : 'Je crée mon compte'}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/connexion" className="text-primary font-medium hover:underline">Connectez-vous</Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
