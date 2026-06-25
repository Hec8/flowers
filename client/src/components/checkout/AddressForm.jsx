export default function AddressForm({
  defaultValues = {},
  onSubmit,
  isSubmitting,
  showBillingCheckbox = true,
  submitLabel = 'Continuer',
}) {
  return (
    <div>
      <p className="text-sm text-gray-600 text-center mb-8 max-w-lg mx-auto">
        L&apos;adresse sélectionnée sera utilisée à la fois comme adresse personnelle (pour la facturation)
        et comme adresse de livraison.
      </p>

      <form onSubmit={onSubmit} className="max-w-xl mx-auto space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Nom et prénoms *</label>
          <input name="label" required defaultValue={defaultValues.label} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Adresse *</label>
          <input name="street" required defaultValue={defaultValues.street} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Code postal *</label>
          <input name="zipCode" required defaultValue={defaultValues.zipCode} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Pays *</label>
          <input name="country" required defaultValue={defaultValues.country || 'Bénin'} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Ville *</label>
          <input name="city" required defaultValue={defaultValues.city} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Téléphone *</label>
          <input name="phone" required defaultValue={defaultValues.phone} className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm" />
        </div>

        {showBillingCheckbox && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="isDefault" defaultChecked className="accent-primary" />
            Utiliser aussi cette adresse pour la facturation
          </label>
        )}

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-10 py-2.5 font-medium hover:bg-primary-dark disabled:opacity-50 w-full sm:w-auto">
            {isSubmitting ? 'Enregistrement…' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
