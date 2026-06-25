import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../components/layout/MainLayout';
import { authService } from '../../services';

const schema = z.object({
  email: z.string().email('Email invalide'),
});

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      toast.success('Si cet email existe, un lien de réinitialisation a été envoyé');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <MainLayout>
      <div className="bg-white py-16 px-4 min-h-[50vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Mot de passe oublié ?</h1>
        <p className="text-gray-600 text-center max-w-md mb-8 text-sm">
          Renseignez votre adresse e-mail pour recevoir un lien de réinitialisation temporaire.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">E-mail</label>
            <input
              {...register('email')}
              type="email"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Envoi...' : 'Valider'}
          </button>
        </form>

        <Link to="/connexion" className="flex items-center gap-2 text-sm text-gray-700 mt-8 hover:text-primary">
          <ArrowLeft size={16} /> Retour à la connexion
        </Link>
      </div>
    </MainLayout>
  );
}
