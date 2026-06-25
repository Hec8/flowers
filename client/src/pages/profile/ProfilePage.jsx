import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import AccountLayout from '../../components/account/AccountLayout';
import { authService } from '../../services';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, refreshUser, isAuthenticated } = useAuth();

  const nameParts = (user?.name || '').split(' ');
  const lastName = nameParts[0] || '';
  const firstNames = nameParts.slice(1).join(' ') || '';

  const { register, handleSubmit } = useForm({
    values: {
      lastName,
      firstNames,
      email: user?.email || '',
      phone: '',
      birthDate: user?.birthDate?.slice(0, 10) || '',
    },
  });

  const updateProfile = useMutation({
    mutationFn: (data) =>
      authService.updateProfile({
        name: `${data.lastName} ${data.firstNames}`.trim(),
        birthDate: data.birthDate || undefined,
        currency: user?.currency,
      }),
    onSuccess: () => { refreshUser(); toast.success('Profil mis à jour'); },
    onError: (err) => toast.error(err.response?.data?.message),
  });

  const changePassword = useMutation({
    mutationFn: (data) => authService.changePassword(data),
    onSuccess: () => toast.success('Mot de passe modifié'),
    onError: (err) => toast.error(err.response?.data?.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center">
        <Link to="/connexion" className="text-primary">Connectez-vous</Link>
      </div>
    );
  }

  return (
    <AccountLayout title="Informations Personnelles">
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="font-bold text-primary-dark">Changer vos infos</h2>
          <button
            type="submit"
            form="profile-form"
            disabled={updateProfile.isPending}
            className="bg-primary text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-60 w-full sm:w-auto"
          >
            Modifier
          </button>
        </div>

        <form id="profile-form" onSubmit={handleSubmit((d) => updateProfile.mutate(d))} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Nom</label>
            <input {...register('lastName')} placeholder="Entrez votre nom" className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Prénoms</label>
            <input {...register('firstNames')} placeholder="Entrez votre ou vos prénoms" className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Email</label>
            <div className="relative">
              <input {...register('email')} disabled className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-sm pr-10 text-gray-500" />
              <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Téléphone</label>
            <div className="flex gap-2">
              <span className="bg-gray-50 border border-gray-200 rounded-md px-3 py-3 text-sm">🇧🇯</span>
              <input {...register('phone')} placeholder="Entrez votre numéro de téléphone" className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Date de naissance</label>
            <input type="date" {...register('birthDate')} className="w-full bg-gray-50 border border-gray-200 rounded-md px-4 py-3 text-sm" />
          </div>
        </form>
      </section>

      <section className="border-t pt-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="font-bold text-primary-dark mb-2">Changer de mot de passe</h2>
            <p className="text-sm text-gray-600">
              Nous vous recommandons d&apos;utiliser un mot de passe compliqué que vous n&apos;utilisiez nulle part ailleurs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const current = window.prompt('Mot de passe actuel');
              const next = window.prompt('Nouveau mot de passe');
              if (current && next) changePassword.mutate({ currentPassword: current, newPassword: next });
            }}
            className="border border-primary text-primary px-5 py-2 rounded-md text-sm hover:bg-green-50 w-full sm:w-auto shrink-0"
          >
            Changer de mot de passe
          </button>
        </div>
      </section>
    </AccountLayout>
  );
}
