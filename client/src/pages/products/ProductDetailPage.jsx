import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Sun, Droplets, Leaf, Flower2, AlertTriangle, Star } from 'lucide-react';
import { toast } from 'sonner';
import MainLayout from '../../components/layout/MainLayout';
import ScrollRevealSection from '../../components/animation/ScrollRevealSection';
import StarRating from '../../components/products/StarRating';
import ProductCard from '../../components/products/ProductCard';
import { productService } from '../../services';
import { useCart } from '../../context/CartContext';
import { formatPriceShort, PRODUCT_TYPE_LABELS } from '../../lib/constants';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { animateAddToCartButton, animateImageSwap } from '../../lib/animations/helpers';
import { getStaticProductBySlug, getStaticProducts } from '../../data/staticProducts';

const CARE_ICON_MAP = {
  '☀️': Sun,
  '🌿': Leaf,
  '💧': Droplets,
  '⚠️': AlertTriangle,
  '🌸': Flower2,
  '✨': Star,
  '📐': Leaf,
  '💡': Leaf,
};

const DEFAULT_CARE_TIPS = [
  { icon: Sun, label: 'Exposition', text: 'Lumière indirecte vive, évitez le soleil direct sur les feuilles.' },
  { icon: Leaf, label: 'Entretien', text: 'Essuyez les feuilles avec un chiffon humide pour les garder brillantes.' },
  { icon: Droplets, label: 'Arrosage', text: 'Arrosez lorsque le substrat est sec sur 2 cm. Brumisez régulièrement.' },
  { icon: AlertTriangle, label: 'Toxicité', text: 'Certaines plantes sont toxiques — gardez hors de portée des animaux et enfants.' },
];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const addBtnRef = useRef(null);
  const productImgRef = useRef(null);
  const [activeImg, setActiveImg] = useState(0);

  const { data: apiProduct, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getBySlug(slug).then((r) => r.data.data).catch(() => null),
  });

  const staticProduct = getStaticProductBySlug(slug);

  // Si le produit vient de l'API mais que ses images sont vides (produit seedé
  // depuis le catalogue statique), on injecte les images du statique.
  const product = apiProduct
    ? {
        ...apiProduct,
        imageUrls:
          apiProduct.imageUrls?.length
            ? apiProduct.imageUrls
            : (staticProduct?.imageUrls || []),
        // Données riches venant du statique si absentes de l'API
        features: apiProduct.features?.length ? apiProduct.features : staticProduct?.features,
        careTips: apiProduct.careTips?.length ? apiProduct.careTips : staticProduct?.careTips,
        characteristics: Object.keys(apiProduct.characteristics || {}).length
          ? apiProduct.characteristics
          : staticProduct?.characteristics,
        bienfaits: staticProduct?.bienfaits,
        signification: staticProduct?.signification,
        plantation: staticProduct?.plantation,
        detailTitle: staticProduct?.detailTitle,
        detailDescription: staticProduct?.detailDescription,
        descriptionSections: staticProduct?.descriptionSections,
      }
    : staticProduct;
  const isStatic = !apiProduct && !!staticProduct;

  const reviewMutation = useMutation({
    mutationFn: () => productService.createReview(product.id, { rating, comment }),
    onSuccess: () => {
      toast.success('Avis publié');
      queryClient.invalidateQueries(['product', slug]);
      setComment('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Connectez-vous pour laisser un avis'),
  });

  const imageUrl = product?.imageUrls?.[activeImg];

  useGsapAnimations(productImgRef, () => {
    if (!imageUrl || !productImgRef.current) return;
    animateImageSwap(productImgRef.current);
  }, [imageUrl]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="py-20 text-center text-gray-500">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Chargement...
        </div>
      </MainLayout>
    );
  }
  if (!product) {
    return <MainLayout><div className="py-20 text-center">Produit introuvable</div></MainLayout>;
  }

  const categorySlug = product.category?.slug || 'plantes';
  const isEngrais   = categorySlug === 'engrais';
  const isJardinage = categorySlug === 'jardinage';
  const isFleurs    = categorySlug === 'fleurs-bouquets';

  /* Breadcrumb parent */
  const parentLabel = isEngrais
    ? 'Aménagement extérieur'
    : isJardinage
      ? 'Jardinage'
      : isFleurs
        ? 'Fleurs & Vertus'
        : (PRODUCT_TYPE_LABELS[product.productType] || product.category?.name || 'Plantes');
  const parentHref = isEngrais
    ? '/produits?category=engrais'
    : isJardinage
      ? '/produits?category=jardinage'
      : isFleurs
        ? '/produits?category=fleurs-bouquets'
        : `/produits?category=${categorySlug}`;

  const highlights = product.features || [
    'Sélectionné avec soin pour sa qualité',
    'Idéal pour décorer votre espace',
    'Livraison sécurisée sous 24h',
  ];

  const productCareTips = product.careTips?.length
    ? product.careTips.map((tip) => ({
        icon: CARE_ICON_MAP[tip.icon] || Leaf,
        label: tip.label,
        text: tip.text,
      }))
    : DEFAULT_CARE_TIPS;

  const characteristics = product.characteristics || {
    Hauteur: product.height ? `${product.height} cm` : '—',
    Stock: `${product.stock} disponibles`,
  };

  const reviews = product.reviews || [];

  /* Related products for engrais / jardinage / fleurs */
  const relatedProducts = (isEngrais || isJardinage || isFleurs)
    ? getStaticProducts({ category: categorySlug })
        .filter((p) => p.slug !== slug)
        .slice(0, 10)
    : [];

  const handleAddToCart = () => {
    addItem(product);
    animateAddToCartButton(addBtnRef.current);
    toast.success('Ajouté au panier');
  };

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-6 text-sm text-gray-500">
        <Link to={parentHref} className="hover:text-primary">
          {parentLabel}
        </Link>
        {' > '}
        <span className="text-gray-900">{product.name}</span>
      </div>

      {/* Product hero */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">

          {/* ── Col 1 : Image ── ordre 2 mobile (titre passe avant) */}
          <div className="order-2 lg:order-1 lg:col-span-4">
            <div className="bg-gray-100 aspect-square flex items-center justify-center overflow-hidden">
              <img
                ref={productImgRef}
                src={product.imageUrls?.[activeImg] || 'https://placehold.co/500/e8f5e9/1a6b3c?text=NFlowers'}
                alt={product.name}
                className="max-h-full max-w-full object-contain p-6 will-change-transform"
              />
            </div>

            {product.imageUrls?.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 overflow-hidden border-2 transition-colors ${
                      i === activeImg ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <Link
              to={parentHref}
              className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-primary mt-4 uppercase tracking-wide"
            >
              <ArrowLeft size={16} /> Poursuivre les achats
            </Link>
          </div>

          {/* ── Col 2 : Features + characteristics — ordre 3 mobile ── */}
          <div className="order-3 lg:order-2 lg:col-span-4 space-y-6">
            <ul className="space-y-4">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                  {h}
                </li>
              ))}
            </ul>

            {/* Table caractéristiques en col 2 pour engrais et plantes */}
            {!isJardinage && (
              <div className="border border-gray-200 text-sm">
                <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">Caractéristiques</div>
                <table className="w-full">
                  <tbody>
                    {Object.entries(characteristics).map(([key, val]) => (
                      <tr key={key} className="border-t border-gray-200">
                        <td className="px-4 py-2 text-gray-500">{key}</td>
                        <td className="px-4 py-2 font-medium">{val}</td>
                      </tr>
                    ))}
                    {!characteristics.Stock && (
                      <tr className="border-t border-gray-200">
                        <td className="px-4 py-2 text-gray-500">Stock</td>
                        <td className="px-4 py-2 font-medium">{product.stock} disponibles</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Col 3 : Nom, prix, CTA — ordre 1 mobile (en premier) ── */}
          <div className="order-1 lg:order-3 lg:col-span-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-1">
              <StarRating rating={product.avgRating || 0} count={product._count?.reviews ?? product.reviewCount ?? 0} />
            </div>

            {reviews.length > 0 && (
              <p className="text-xs text-gray-400 mb-4">
                Avis disponible le{' '}
                <span className="font-medium text-gray-600">
                  {reviews[0].date || (reviews[0].createdAt ? new Date(reviews[0].createdAt).toLocaleDateString('fr-FR') : '')}
                </span>{' '}
                par <span className="font-medium text-gray-600">{reviews[0].author || reviews[0].user?.name}</span>
              </p>
            )}

            <p className="text-3xl font-bold text-amber-600 mt-3 mb-4">{formatPriceShort(product.price)}</p>

            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {product.description?.slice(0, 200)}
              {product.description?.length > 200 ? '…' : ''}
            </p>

            <button
              ref={addBtnRef}
              type="button"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              className="w-full bg-primary text-white py-3.5 font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 will-change-transform"
            >
              Ajouter au panier
            </button>

            {product.producer && (
              <Link
                to={`/producteurs/${product.producer.slug}`}
                className="block text-sm text-primary mt-4 hover:underline"
              >
                Producteur : {product.producer.name} {product.producer.isBio && '🌿 Bio'}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Description (engrais + plantes standard) ── */}
      {!isJardinage && !isFleurs && (
        <ScrollRevealSection className="bg-gray-50 py-10" selector="[data-animate-block]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
            <h2 data-animate-block className="text-xl font-bold mb-4">Description</h2>
            <div data-animate-block className="text-sm text-gray-700 leading-relaxed space-y-4">
              <p>{product.description}</p>

              {isEngrais && product.descriptionSections?.map((sec) => (
                <div key={sec.title}>
                  <p className="font-semibold text-primary mb-1">{sec.title}</p>
                  <p>{sec.text}</p>
                </div>
              ))}

              {!isEngrais && !isJardinage && !isFleurs && product.flowerLanguage && (
                <p className="italic text-gray-500">
                  Langage des fleurs : {product.flowerLanguage}
                </p>
              )}
            </div>
          </div>
        </ScrollRevealSection>
      )}

      {/* ── Fleurs & Vertus : sections riches ── */}
      {isFleurs && (
        <>
          {/* Plantation et multiplication */}
          {product.plantation && (
            <ScrollRevealSection className="bg-white py-12" selector="[data-animate-block]">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
                <h2 data-animate-block className="text-xl font-bold text-gray-900 mb-4">
                  Plantation et multiplication de {product.name.split(' ')[0].replace(/[()]/g, '')}
                </h2>
                <p data-animate-block className="text-sm text-gray-700 leading-relaxed">
                  {product.plantation}
                </p>
              </div>
            </ScrollRevealSection>
          )}

          {/* Bienfaits */}
          {product.bienfaits?.length > 0 && (
            <ScrollRevealSection className="bg-green-50 py-12" selector="[data-animate-block]">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
                <h2 data-animate-block className="text-xl font-bold text-gray-900 mb-6">
                  Bienfaits de {product.name.split(' ')[0].replace(/[()]/g, '')}
                </h2>
                <ul className="space-y-4">
                  {product.bienfaits.map((benefit, i) => (
                    <li key={i} data-animate-block className="flex items-start gap-3">
                      <span className="mt-1 flex-shrink-0 w-3 h-3 rounded-full bg-amber-500" />
                      <p className="text-sm text-gray-700 leading-relaxed">{benefit}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollRevealSection>
          )}

          {/* Signification symbolique */}
          {product.signification && (
            <ScrollRevealSection className="bg-white py-12" selector="[data-animate-block]">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
                <h2 data-animate-block className="text-xl font-bold text-gray-900 mb-4">Signification symbolique</h2>
                <p data-animate-block className="text-sm text-gray-700 leading-relaxed mb-3">
                  <span className="font-semibold text-primary">{product.signification.highlight} </span>
                  {product.signification.text}
                </p>
              </div>
            </ScrollRevealSection>
          )}
        </>
      )}

      {/* ── Jardinage : description + caractéristiques en 2 colonnes ── */}
      {isJardinage && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Description longue */}
            <div>
              {product.detailTitle && (
                <h2 className="text-lg font-bold text-gray-900 mb-4 leading-snug">
                  {product.detailTitle}
                </h2>
              )}
              <p className="text-sm text-gray-700 leading-relaxed">
                {product.detailDescription || product.description}
              </p>
            </div>
            {/* Caractéristiques */}
            <div className="border border-gray-200 text-sm">
              <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">Caractéristiques</div>
              <table className="w-full">
                <tbody>
                  {Object.entries(characteristics).map(([key, val]) => (
                    <tr key={key} className="border-t border-gray-200">
                      <td className="px-4 py-2 text-gray-500">{key}</td>
                      <td className="px-4 py-2 font-medium">{val}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-2 text-gray-500">Stock</td>
                    <td className="px-4 py-2 font-medium">{product.stock} disponibles</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Engrais / Jardinage / Fleurs : Autres produits ── */}
      {(isEngrais || isJardinage || isFleurs) && relatedProducts.length > 0 && (
        <ScrollRevealSection className="bg-white py-12" selector="[data-animate-card]">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-xl font-bold text-center mb-8">Autres produits</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedProducts.map((p) => (
                <div key={p.id} data-animate-card>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </ScrollRevealSection>
      )}

      {/* ── Plantes / Fleurs : Conseils d'entretien / Culture en pratique ── */}
      {!isEngrais && (
        <ScrollRevealSection className="max-w-7xl mx-auto px-4 py-12" selector="[data-animate-card]">
          <h2 className="text-xl font-bold text-center mb-8">
            {isFleurs
              ? `Culture de ${product.name.split(' ')[0].replace(/[()]/g, '')} en pratique`
              : `Nos conseils d'entretien pour ${product.name.split(' ')[0]}`}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productCareTips.map(({ icon: Icon, label, text }) => (
              <div key={label} data-animate-card className="text-center">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-sm text-primary mb-2">{label}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </ScrollRevealSection>
      )}

      {/* ── Avis (plantes seulement) ── */}
      {!isEngrais && (
        <ScrollRevealSection className="max-w-4xl mx-auto px-4 pb-12" selector="[data-animate-block]">
          <h2 data-animate-block className="text-xl font-bold text-amber-600 mb-6">Avis</h2>

          {reviews.length > 0 ? (
            reviews.map((review, i) => (
              <div key={review.id || i} data-animate-block className="border border-gray-200 rounded-lg p-6 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-sm">{review.user?.name || review.author}</p>
                    <p className="text-xs text-gray-400">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString('fr-FR')
                        : review.date}
                    </p>
                  </div>
                  <StarRating rating={review.rating} size={12} />
                </div>
                {(review.comment || review.text) && (
                  <p className="text-sm text-gray-700">{review.comment || review.text}</p>
                )}
              </div>
            ))
          ) : (
            <p data-animate-block className="text-sm text-gray-500 mb-6">
              Aucun avis pour le moment. Soyez le premier !
            </p>
          )}

          {!isStatic && (
            <form
              data-animate-block
              onSubmit={(e) => { e.preventDefault(); reviewMutation.mutate(); }}
              className="border border-gray-200 rounded-lg p-6 bg-gray-50"
            >
              <p className="text-sm font-medium mb-3">Laisser un avis</p>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onClick={() => setRating(r)}>
                    <span className={`text-lg ${r <= rating ? 'text-amber-400' : 'text-gray-300'}`}>★</span>
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Votre commentaire..."
                className="w-full border rounded-md p-3 text-sm mb-3"
                rows={3}
              />
              <button type="submit" className="bg-primary text-white px-5 py-2 rounded-md text-sm hover:bg-primary-dark transition-colors">
                Publier
              </button>
            </form>
          )}
        </ScrollRevealSection>
      )}
    </MainLayout>
  );
}
