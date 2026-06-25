import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import MainLayout from '../../components/layout/MainLayout';
import { authService } from '../../services';

const schema = z.object({
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await authService.resetPassword({ token, password: data.password });
      toast.success('Mot de passe réinitialisé !');
      navigate('/connexion');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lien invalide ou expiré');
    }
  };

  if (!token) {
    return (
      <MainLayout>
        <div className="py-20 text-center">
          <p className="text-red-500">Lien de réinitialisation invalide.</p>
          <Link to="/mot-de-passe-oublie" className="text-primary mt-4 inline-block">Demander un nouveau lien</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showNewsletter={false}>
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-xl font-bold mb-6">Nouveau mot de passe</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register('password')} type="password" placeholder="Nouveau mot de passe" className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm" />
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            <input {...register('confirmPassword')} type="password" placeholder="Confirmer" className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm" />
            {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
            <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary-dark">
              Réinitialiser
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
