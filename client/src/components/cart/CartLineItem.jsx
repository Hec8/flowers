import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { formatPriceShort, parsePrice } from '../../lib/constants';
import { animateCartItemOut } from '../../lib/animations/helpers';

export default function CartLineItem({ item, onUpdateQuantity, onRemove }) {
  const rowRef = useRef(null);

  const handleRemove = () => {
    animateCartItemOut(rowRef.current, () => onRemove(item.productId));
  };

  const handleDecrease = () => {
    if (item.quantity <= 1) {
      handleRemove();
    } else {
      onUpdateQuantity(item.productId, item.quantity - 1);
    }
  };

  return (
    <div
      ref={rowRef}
      data-animate-cart-item
      className="grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr_auto] md:grid-cols-[120px_1fr_auto_auto_auto] gap-3 sm:gap-4 items-center border-b border-gray-100 pb-6 will-change-transform"
    >
      <img
        src={item.imageUrl || 'https://placehold.co/120/e8f5e9/1a6b3c?text=NFlowers'}
        alt={item.name}
        className="w-full aspect-square object-cover bg-gray-50"
      />
      <div>
        <Link to={`/produits/${item.slug}`} className="font-medium text-gray-900 hover:text-primary">
          {item.name}
        </Link>
        <p className="text-xs text-gray-500 mt-1">Plante d&apos;intérieur</p>
        <p className="font-bold text-sm mt-2">{formatPriceShort(item.price)}</p>
        <p className="text-xs text-primary font-medium mt-1">En stock</p>
      </div>
      <div className="col-span-2 sm:col-span-1 flex items-center border border-gray-300 w-fit mt-2 sm:mt-0">
        <button
          type="button"
          onClick={handleDecrease}
          className="px-3 py-2 text-gray-600 hover:bg-gray-50"
        >
          −
        </button>
        <span className="px-4 py-2 border-x border-gray-300 text-sm min-w-[3rem] text-center">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
          className="px-3 py-2 text-gray-600 hover:bg-gray-50"
        >
          +
        </button>
      </div>
      <p className="font-bold text-sm col-span-2 sm:col-span-1 md:col-auto">
        {formatPriceShort(parsePrice(item.price) * (Number(item.quantity) || 0))}
      </p>
      <button
        type="button"
        onClick={handleRemove}
        className="text-gray-400 hover:text-red-500 col-span-2 sm:col-span-1 justify-self-end sm:justify-self-auto"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
