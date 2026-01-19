import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import ProductCard from '@/components/ProductCard';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const { language } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Fetch categories
  const { data: categories = [] } = trpc.categories.list.useQuery();

  // Always fetch all products
  const { data: allProducts = [] } = trpc.products.list.useQuery();

  // Filter products based on selected category
  const products = selectedCategoryId
    ? allProducts.filter(p => p.categoryId === selectedCategoryId)
    : allProducts;

  // Add to cart mutation
  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تمت إضافة المنتج إلى السلة' : 'Product added to cart');
    },
    onError: (error: any) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const handleAddToCart = (productId: number, quantity: number) => {
    addToCartMutation.mutate({ productId, quantity });
  };

  // Get selected category info
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Main Content - Horizontal 50/50 Layout (Left: Categories, Right: Products) */}
      {/* Same layout on mobile and desktop */}
      <div className="flex flex-row gap-0 max-w-full mx-auto min-h-screen">
        
        {/* Left Column - Categories (50% width) */}
        <div className="w-1/2 bg-gradient-to-br from-primary-yellow via-accent-yellow to-yellow-200 overflow-hidden flex flex-col">
          {/* Categories Header */}
          <div className="p-2 sm:p-3 md:p-6 border-b border-yellow-300 bg-yellow-100 sticky top-0 z-20">
            <h2 className="text-sm sm:text-base md:text-2xl font-bold text-dark-text">
              {language === 'ar' ? 'الفئات' : 'Categories'}
            </h2>
          </div>

          {/* Categories Vertical Scroll - Limited to 6 on mobile */}
          <div className="flex-1 overflow-y-auto p-1 sm:p-2 md:p-4 space-y-0.5 sm:space-y-1 md:space-y-3">
            {categories && categories.length > 0 && categories.map((category, index) => (
              // Show only first 6 categories on mobile, all on desktop
              <div
                key={category.id}
                className={`${index >= 6 ? 'hidden' : ''}`}
              >
                <div
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`p-1.5 sm:p-2 md:p-4 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                    selectedCategoryId === category.id
                      ? 'bg-white ring-2 ring-dark-text shadow-lg'
                      : 'bg-white hover:shadow-md'
                  } flex items-center gap-1 sm:gap-2 md:gap-3 group`}
                >
                  {/* Category Image */}
                  {category.image && (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-light-bg border-2 border-primary-yellow">
                      <img
                        src={category.image}
                        alt={language === 'ar' ? category.nameAr : category.nameEn}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                  )}

                  {/* Category Name */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-dark-text text-xs sm:text-sm md:text-base truncate">
                      {language === 'ar' ? category.nameAr : category.nameEn}
                    </h3>
                    <p className="text-xs text-dark-text opacity-70 hidden sm:block">
                      {allProducts.filter(p => p.categoryId === category.id).length} {language === 'ar' ? 'منتج' : 'items'}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="text-dark-text text-sm sm:text-base md:text-xl flex-shrink-0 group-hover:translate-x-1 transition-transform">
                    {language === 'ar' ? '←' : '→'}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Scroll indicator for mobile */}
            {categories && categories.length > 6 && (
              <div className="text-center text-xs text-dark-text opacity-50 py-1 sm:py-2">
                {language === 'ar' ? '↓ اسحب للأسفل' : '↓ Scroll'}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Products (50% width) */}
        <div className="w-1/2 bg-gray-50 overflow-hidden flex flex-col">
          {/* Products Header */}
          {selectedCategory && (
            <div className="p-2 sm:p-3 md:p-6 border-b border-gray-200 bg-white sticky top-0 z-20">
              <h2 className="text-sm sm:text-base md:text-2xl font-bold text-dark-text">
                {language === 'ar' ? selectedCategory.nameAr : selectedCategory.nameEn}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                {products.length} {language === 'ar' ? 'منتج' : 'products'}
              </p>
            </div>
          )}

          {/* Products Grid - Scrollable */}
          <div className="flex-1 overflow-y-auto p-1 sm:p-2 md:p-4">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-1 sm:gap-2 md:gap-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : selectedCategoryId ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-6 sm:w-8 md:w-12 h-6 sm:h-8 md:h-12 text-muted-foreground mb-1 sm:mb-2 md:mb-4 opacity-30" />
                <p className="text-xs sm:text-sm md:text-sm text-muted-foreground">
                  {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-6 sm:w-8 md:w-12 h-6 sm:h-8 md:h-12 text-muted-foreground mb-1 sm:mb-2 md:mb-4 opacity-30" />
                <p className="text-xs sm:text-sm md:text-sm text-muted-foreground">
                  {language === 'ar' ? 'اختر فئة' : 'Select category'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
