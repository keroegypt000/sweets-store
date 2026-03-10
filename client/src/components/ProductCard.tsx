import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number, quantity: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { language } = useLanguage();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const description = language === 'ar' ? product.descriptionAr : product.descriptionEn;
  const price = parseFloat(product.price.toString());
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice.toString()) : null;
  const discountPercent = product.discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full group border border-gray-100">
      {/* Product Image */}
      <div className="relative block overflow-hidden bg-gray-100 aspect-square cursor-pointer" onClick={() => window.location.href = `/product/${product.slug}`}>
        {product.image && (
          <img
            src={product.image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        )}
        
        {/* Discount Badge */}
        {discountPercent && (
          <div className="absolute top-3 right-3 bg-primary-yellow text-dark-text px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            -{discountPercent}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3 left-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
        >
          <Heart
            className={`w-5 h-5 transition-colors duration-300 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="flex-1 p-2 sm:p-3 flex flex-col">
        <h3 onClick={() => window.location.href = `/product/${product.slug}`} className="font-bold text-gray-800 hover:text-yellow-600 transition-colors cursor-pointer line-clamp-1 text-xs sm:text-sm">
          {name}
        </h3>
        
        {description && (
          <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
            {description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-1 mt-2 mb-1">
          <span className="font-bold text-yellow-600 text-sm sm:text-base">
            KWD {price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              KWD {originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <p className="text-xs mb-1">
          {(product.stock ?? 0) > 0 ? (
            <span className="text-green-600 font-bold">
              {language === 'ar' ? '✓ متوفر' : '✓ In Stock'}
            </span>
          ) : (
            <span className="text-red-600 font-bold">
              {language === 'ar' ? '✗ غير متوفر' : '✗ Out of Stock'}
            </span>
          )}
        </p>
      </div>

      {/* Add to Cart */}
      <div className="p-2 sm:p-3 border-t border-gray-100 flex gap-1.5">
        <div className="flex items-center border-2 border-yellow-300 rounded-lg overflow-hidden bg-gray-50">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-1.5 py-0.5 hover:bg-yellow-100 transition-colors text-gray-600 font-bold text-xs"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max={product.stock ?? 0}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            disabled={(product.stock ?? 0) === 0}
            className="w-6 px-0.5 py-0.5 border-0 text-center text-xs font-bold bg-transparent focus:outline-none"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-1.5 py-0.5 hover:bg-yellow-100 transition-colors text-gray-600 font-bold text-xs"
          >
            +
          </button>
        </div>
        <button
          onClick={() => {
            onAddToCart?.(product.id, quantity);
            setQuantity(1);
          }}
          disabled={(product.stock ?? 0) === 0}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-bold py-1.5 px-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-1 shadow-md hover:shadow-lg text-xs"
        >
          <ShoppingCart className="w-3 h-3" />
          {language === 'ar' ? 'أضف' : 'Add'}
        </button>
      </div>
    </div>
  );
}
