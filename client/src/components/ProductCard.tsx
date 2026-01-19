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
  const { language, t } = useLanguage();
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
      <Link href={`/product/${product.slug}`}>
        <a className="relative block overflow-hidden bg-light-bg aspect-square">
          {product.image && (
            <img
              src={product.image}
              alt={name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          )}
          
          {/* Discount Badge */}
          {discountPercent && (
            <div className="absolute top-2 right-2 bg-primary-yellow text-dark-text px-2 py-1 rounded-full text-sm font-bold">
              -{discountPercent}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-2 left-2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
          >
            <Heart
              className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
        </a>
      </Link>

      <CardContent className="flex-1 p-4">
        {/* Product Name */}
        <Link href={`/product/${product.slug}`}>
          <a className="block">
            <h3 className="font-bold text-dark-text hover:text-primary-yellow transition-colors line-clamp-2">
              {name}
            </h3>
          </a>
        </Link>

        {/* Product Description */}
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-lg font-bold text-primary-yellow">
            {price.toFixed(2)} KWD
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice.toFixed(2)} KWD
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="mt-2">
          {(product.stock ?? 0) > 0 ? (
            <span className="text-xs text-green-600 font-medium">
              {language === 'ar' ? 'متوفر' : 'In Stock'}
            </span>
          ) : (
            <span className="text-xs text-red-600 font-medium">
              {language === 'ar' ? 'غير متوفر' : 'Out of Stock'}
            </span>
          )}
        </div>
      </CardContent>

      {/* Add to Cart */}
      <CardFooter className="p-4 pt-0 gap-2">
        <input
          type="number"
          min="1"
          max={product.stock ?? 0}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          disabled={(product.stock ?? 0) === 0}
          className="w-16 px-2 py-2 border border-border rounded text-center text-sm"
        />
        <Button
          onClick={() => {
            onAddToCart?.(product.id, quantity);
            setQuantity(1);
          }}
          disabled={(product.stock ?? 0) === 0}
          className="flex-1 bg-primary-yellow text-dark-text hover:bg-accent-yellow"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {t('add_to_cart')}
        </Button>
      </CardFooter>
    </Card>
  );
}
