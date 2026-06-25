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
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      toast.success('Connexion réussie !');
      navigate(user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion');
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12 px-4">
        <h1 className="text-2xl font-bold text-center mb-8">
          Connectez-vous à votre compte
        </h1>

        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-lg font-semibold mb-4">Bienvenue chez Flowa</h2>
          <AuthTabs active="login" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register('email')}
                type="email"
                placeholder="Email *"
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe *"
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="text-right">
              <Link to="/mot-de-passe-oublie" className="text-sm text-gray-700 hover:text-primary">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Connexion...' : 'Je me connecte'}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-600">
            Pas de compte ?{' '}
            <Link to="/inscription" className="text-primary font-medium hover:underline">
              Créez-en un
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
