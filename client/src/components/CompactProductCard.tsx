import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CompactProductCardProps {
  product: Product;
  onAddToCart?: (productId: number, quantity: number) => void;
}

export default function CompactProductCard({ product, onAddToCart }: CompactProductCardProps) {
  const { language } = useLanguage();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const price = parseFloat(product.price.toString());
  const discountPercent = product.discount || null;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-2 flex gap-2">
      {/* Product Image */}
      <div className="relative flex-shrink-0 w-20 h-20 overflow-hidden bg-gray-100 rounded-lg cursor-pointer group">
        {product.image && (
          <img
            src={product.image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        )}
        
        {/* Discount Badge */}
        {discountPercent && (
          <div className="absolute top-1 right-1 bg-primary-yellow text-dark-text px-1.5 py-0.5 rounded-full text-xs font-bold shadow-lg">
            -{discountPercent}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-1 left-1 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
        >
          <Heart
            className={`w-3 h-3 transition-colors duration-300 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-800 text-xs line-clamp-1 hover:text-yellow-600 transition-colors cursor-pointer">
            {name}
          </h3>
          
          {/* Price */}
          <div className="flex items-center gap-1 mt-1">
            <span className="font-bold text-yellow-600 text-xs">
              KWD {price.toFixed(2)}
            </span>
          </div>

          {/* Stock Status */}
          <p className="text-xs mt-0.5">
            {(product.stock ?? 0) > 0 ? (
              <span className="text-green-600 font-bold text-xs">
                {language === 'ar' ? '✓ متوفر' : '✓ In Stock'}
              </span>
            ) : (
              <span className="text-red-600 font-bold text-xs">
                {language === 'ar' ? '✗ غير متوفر' : '✗ Out'}
              </span>
            )}
          </p>
        </div>

        {/* Add to Cart */}
        <div className="flex gap-1 mt-1">
          <div className="flex items-center border border-yellow-300 rounded overflow-hidden bg-gray-50">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-1 py-0.5 hover:bg-yellow-100 transition-colors text-gray-600 font-bold text-xs"
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
              className="w-5 px-0.5 py-0.5 border-0 text-center text-xs font-bold bg-transparent focus:outline-none"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-1 py-0.5 hover:bg-yellow-100 transition-colors text-gray-600 font-bold text-xs"
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
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-bold py-0.5 px-1 rounded transition-all duration-300 flex items-center justify-center gap-0.5 shadow-sm hover:shadow-md text-xs"
          >
            <ShoppingCart className="w-2.5 h-2.5" />
            {language === 'ar' ? 'أضف' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
