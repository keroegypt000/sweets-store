import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useState } from 'react';
import { Link } from 'wouter';

interface ProductListItemProps {
  product: Product;
  onAddToCart?: (productId: number, quantity: number) => void;
}

export default function ProductListItem({ product, onAddToCart }: ProductListItemProps) {
  const { language, t } = useLanguage();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const description = language === 'ar' ? product.descriptionAr : product.descriptionEn;
  const price = parseFloat(product.price.toString());
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice.toString()) : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;

  return (
    <div className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow p-4 border border-border flex gap-4">
      {/* Product Image */}
      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-light-bg relative">
        {product.image && (
          <img
            src={product.image}
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => window.location.href = `/product/${product.slug}`}
          />
        )}
        
        {/* Discount Badge */}
        {discountPercent && (
          <div className="absolute top-1 right-1 bg-primary-yellow text-dark-text px-2 py-1 rounded text-xs font-bold">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Name and Description */}
        <div>
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-bold text-dark-text hover:text-primary-yellow transition-colors cursor-pointer line-clamp-1">
              {name}
            </h3>
          </Link>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary-yellow">
                {price.toFixed(2)} KWD
              </span>
              {originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-xs mt-1">
              {(product.stock ?? 0) > 0 ? (
                <span className="text-green-600 font-medium">
                  {language === 'ar' ? 'متوفر' : 'In Stock'}
                </span>
              ) : (
                <span className="text-red-600 font-medium">
                  {language === 'ar' ? 'غير متوفر' : 'Out of Stock'}
                </span>
              )}
            </p>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="p-2 rounded-full hover:bg-light-bg transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
        </div>
      </div>

      {/* Add to Cart Section */}
      <div className="flex flex-col items-center gap-2 justify-center">
        <input
          type="number"
          min="1"
          max={product.stock ?? 0}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          disabled={(product.stock ?? 0) === 0}
          className="w-12 px-2 py-1 border border-border rounded text-center text-sm"
        />
        <Button
          onClick={() => {
            onAddToCart?.(product.id, quantity);
            setQuantity(1);
          }}
          disabled={(product.stock ?? 0) === 0}
          size="sm"
          className="bg-primary-yellow text-dark-text hover:bg-accent-yellow whitespace-nowrap"
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
