import { useState, useRef, useEffect } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { animateModalOpen, animateModalClose } from '../../lib/animations/helpers';

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  categories,
  producers,
  editing,
  isSubmitting,
  uploadImage,
}) {
  const [imageUrl, setImageUrl] = useState(editing?.imageUrls?.[0] || '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (open) setImageUrl(editing?.imageUrls?.[0] || '');
  }, [open, editing]);

  useGsapAnimations(overlayRef, () => {
    if (open && overlayRef.current && panelRef.current) {
      animateModalOpen(overlayRef.current, panelRef.current);
    }
  }, [open]);

  const handleClose = () => {
    const close = () => { setImageUrl(''); onClose(); };
    if (reducedMotion || !overlayRef.current || !panelRef.current) {
      close();
      return;
    }
    animateModalClose(overlayRef.current, panelRef.current, close);
  };

  if (!open) return null;

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      setImageUrl(res.data.data.url);
      toast.success('Image chargée');
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    onSubmit({
      name: fd.get('name'),
      description: fd.get('description'),
      price: parseFloat(fd.get('price')),
      stock: parseInt(fd.get('stock'), 10),
      categoryId: fd.get('categoryId'),
      producerId: fd.get('producerId'),
      productType: fd.get('productType'),
      imageUrls: imageUrl ? [imageUrl] : [],
    });
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 opacity-0">
      <div ref={panelRef} className="bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-primary">Enregistrer un produit</h2>
          <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Nom du produit *</label>
            <input
              name="name"
              defaultValue={editing?.name}
              placeholder="Entrez le nom du produit"
              required
              className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm bg-gray-50"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-primary mb-1 block">Prix *</label>
              <input
                name="price"
                type="number"
                defaultValue={editing?.price}
                placeholder="Prix en FCFA"
                required
                min="0"
                className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-primary mb-1 block">Stock *</label>
              <input
                name="stock"
                type="number"
                defaultValue={editing?.stock ?? 10}
                required
                min="0"
                className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm bg-gray-50"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Catégorie *</label>
            <select
              name="categoryId"
              defaultValue={editing?.categoryId}
              required
              className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm bg-gray-50"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Producteur *</label>
            <select
              name="producerId"
              defaultValue={editing?.producerId}
              required
              className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm bg-gray-50"
            >
              <option value="">Sélectionner un producteur</option>
              {producers?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Type</label>
            <select
              name="productType"
              defaultValue={editing?.productType || 'PLANT'}
              className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm bg-gray-50"
            >
              <option value="PLANT">Plante</option>
              <option value="INTERIOR">Intérieur</option>
              <option value="EXTERIOR">Extérieur</option>
              <option value="BOUQUET">Bouquet</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Description *</label>
            <textarea
              name="description"
              defaultValue={editing?.description}
              placeholder="Donner une description au produit"
              required
              rows={4}
              className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm bg-gray-50 resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-primary mb-1 block">Image</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-gray-200 rounded-lg py-10 flex flex-col items-center gap-2 hover:border-primary/40 transition-colors bg-gray-50"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="" className="w-24 h-24 object-cover rounded-md" />
              ) : (
                <>
                  <ImagePlus className="text-gray-400" size={32} />
                  <span className="text-sm text-gray-500">{uploading ? 'Chargement...' : 'Charger une image'}</span>
                </>
              )}
            </button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Réinitialiser
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="px-5 py-2.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark disabled:opacity-60"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
