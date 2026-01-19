import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'wouter';
import { Product } from '@/types';
import { useState } from 'react';

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
  const discountPercent = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Product Image */}
      <div className="relative block overflow-hidden bg-light-bg aspect-square cursor-pointer" onClick={() => window.location.href = `/product/${product.slug}`}>
        {product.image && (
          <img
            src={product.image}
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        )}
        
        {/* Discount Badge */}
        {discountPercent && (
          <div className="absolute top-2 right-2 bg-primary-yellow text-dark-text px-2 py-1 rounded-full text-xs md:text-sm font-bold">
            -{discountPercent}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-2 left-2 bg-white rounded-full p-1.5 md:p-2 shadow-md hover:shadow-lg transition-shadow"
        >
          <Heart
            className={`w-4 h-4 md:w-5 md:h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>
      </div>

      {/* Product Info */}
      <CardContent className="flex-1 p-2 md:p-3 lg:p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-bold text-dark-text hover:text-primary-yellow transition-colors cursor-pointer line-clamp-2 text-xs md:text-sm lg:text-base">
            {name}
          </h3>
        </Link>
        
        {description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 hidden sm:block">
            {description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2 md:mt-3">
          <span className="font-bold text-primary-yellow text-xs md:text-sm lg:text-base">
            {price.toFixed(2)} KWD
          </span>
          {originalPrice && (
            <span className="text-xs text-muted-foreground line-through hidden md:inline">
              {originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <p className="text-xs mt-1 md:mt-2">
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
      </CardContent>

      {/* Add to Cart */}
      <CardFooter className="p-2 md:p-3 lg:p-4 border-t border-border flex gap-2">
        <input
          type="number"
          min="1"
          max={product.stock ?? 0}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          disabled={(product.stock ?? 0) === 0}
          className="w-12 px-2 py-1 border border-border rounded text-center text-xs md:text-sm"
        />
        <Button
          onClick={() => {
            onAddToCart?.(product.id, quantity);
            setQuantity(1);
          }}
          disabled={(product.stock ?? 0) === 0}
          size="sm"
          className="flex-1 bg-primary-yellow text-dark-text hover:bg-accent-yellow text-xs md:text-sm"
        >
          <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1" />
          {language === 'ar' ? 'أضف' : 'Add'}
        </Button>
      </CardFooter>
    </Card>
  );
}
