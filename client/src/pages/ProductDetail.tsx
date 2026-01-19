import { useParams } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import ProductCard from '@/components/ProductCard';

export default function ProductDetail() {
  const { language, t: useLanguageT } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Fetch product
  const { data: product, isLoading } = trpc.products.bySlug.useQuery({ slug: slug || '' });

  // Fetch all categories to get category name
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const categoryName = useMemo(() => {
    if (!product || !categories) return null;
    const category = categories.find((c: any) => c.id === product.categoryId);
    return category ? (language === 'ar' ? category.nameAr : category.nameEn) : null;
  }, [product, categories, language]);

  // Fetch related products (same category)
  const { data: relatedProducts = [] } = trpc.products.byCategory.useQuery(
    product ? { categoryId: product.categoryId, limit: 4, offset: 0 } : { categoryId: 0, limit: 4, offset: 0 },
    { enabled: !!product }
  );

  // Add to cart mutation
  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم إضافة المنتج إلى السلة' : 'Product added to cart');
      setQuantity(1);
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-bg">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-light-bg">
        <Header />
        <div className="container py-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            {language === 'ar' ? 'المنتج غير موجود' : 'Product not found'}
          </p>
          <Button onClick={() => setLocation('/')}>
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </div>
      </div>
    );
  }

  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const description = language === 'ar' ? product.descriptionAr : product.descriptionEn;
  const price = parseFloat(product.price.toString());
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice.toString()) : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;
  const stock = product.stock ?? 0;

  return (
    <div className="min-h-screen bg-light-bg">
      <Header />

      <div className="container py-8">
        {/* Back Button */}
        <button
          onClick={() => setLocation('/')}
          className="flex items-center gap-2 text-primary-yellow hover:text-accent-yellow mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'ar' ? 'العودة' : 'Back'}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-white rounded-lg p-8 shadow-sm">
            {product.image && (
              <img
                src={product.image}
                alt={name}
                className="w-full h-full object-contain max-h-96"
              />
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-dark-text mb-2">
                {name}
              </h1>
              {discountPercent && (
                <div className="inline-block bg-primary-yellow text-dark-text px-3 py-1 rounded-full text-sm font-bold">
                  -{discountPercent}%
                </div>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary-yellow">
                  {price.toFixed(2)} KWD
                </span>
                {originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {originalPrice.toFixed(2)} KWD
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {description && (
              <div>
                <h3 className="font-bold text-dark-text mb-2">
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            )}

            {/* Stock Status */}
            <div>
              <p className={`font-medium ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock > 0
                  ? language === 'ar'
                    ? `متوفر (${stock} قطعة)`
                    : `In Stock (${stock} items)`
                  : language === 'ar'
                    ? 'غير متوفر'
                    : 'Out of Stock'}
              </p>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium text-dark-text">
                  {language === 'ar' ? 'الكمية' : 'Quantity'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={stock === 0}
                  className="w-20 px-3 py-2 border border-border rounded text-center"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => addToCartMutation.mutate({ productId: product.id, quantity })}
                  disabled={stock === 0 || addToCartMutation.isPending}
                  className="flex-1 bg-primary-yellow text-dark-text hover:bg-accent-yellow py-6 text-lg font-bold"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addToCartMutation.isPending
                    ? language === 'ar'
                      ? 'جاري الإضافة...'
                      : 'Adding...'
                    : language === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="px-6"
                >
                  <Heart
                    className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                  />
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-light-bg p-4 rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-dark-text">SKU:</span> {product.sku || 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-dark-text">
                  {language === 'ar' ? 'الفئة:' : 'Category:'}
                </span>{' '}
                {categoryName || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 1 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-dark-text mb-8">
              {language === 'ar' ? 'منتجات ذات صلة' : 'Related Products'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts
                .filter((p: any) => p.id !== product.id)
                .slice(0, 4)
                .map((relatedProduct: any) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
