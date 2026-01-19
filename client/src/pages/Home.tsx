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
      {/* Main Content - 50/50 Layout */}
      <div className="flex flex-col lg:flex-row gap-0 max-w-full mx-auto min-h-screen">
        
        {/* Left Column - Categories (50% width) */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-primary-yellow via-accent-yellow to-yellow-200 overflow-hidden flex flex-col">
          {/* Categories Header */}
          <div className="p-4 md:p-6 border-b border-yellow-300 bg-yellow-100 sticky top-0 z-20">
            <h2 className="text-lg md:text-2xl font-bold text-dark-text">
              {language === 'ar' ? 'الفئات' : 'Categories'}
            </h2>
          </div>

          {/* Categories Scrollable List - Show 6 items */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3">
            {categories && categories.length > 0 && categories.map((category, index) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`p-3 md:p-4 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                  selectedCategoryId === category.id
                    ? 'bg-white ring-2 ring-dark-text shadow-lg'
                    : 'bg-white hover:shadow-md'
                } flex items-center gap-3 group ${index >= 6 ? 'hidden' : ''}`}
              >
                {/* Category Image */}
                {category.image && (
                  <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-light-bg border-2 border-primary-yellow">
                    <img
                      src={category.image}
                      alt={language === 'ar' ? category.nameAr : category.nameEn}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                )}

                {/* Category Name */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-dark-text text-sm md:text-base truncate">
                    {language === 'ar' ? category.nameAr : category.nameEn}
                  </h3>
                  <p className="text-xs text-dark-text opacity-70">
                    {allProducts.filter(p => p.categoryId === category.id).length} {language === 'ar' ? 'منتج' : 'items'}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="text-dark-text text-lg md:text-xl flex-shrink-0 group-hover:translate-x-1 transition-transform">
                  {language === 'ar' ? '←' : '→'}
                </div>
              </div>
            ))}
          </div>

          {/* Show remaining categories indicator */}
          {categories.length > 6 && (
            <div className="p-3 md:p-4 border-t border-yellow-300 bg-yellow-100 text-center text-xs md:text-sm text-dark-text font-medium">
              {language === 'ar' ? `و ${categories.length - 6} فئات أخرى` : `and ${categories.length - 6} more categories`}
            </div>
          )}
        </div>

        {/* Right Column - Products (50% width) */}
        <div className="w-full lg:w-1/2 bg-gray-50 overflow-hidden flex flex-col">
          {/* Products Header */}
          {selectedCategory && (
            <div className="p-4 md:p-6 border-b border-gray-200 bg-white sticky top-0 z-20">
              <h2 className="text-lg md:text-2xl font-bold text-dark-text">
                {language === 'ar' ? selectedCategory.nameAr : selectedCategory.nameEn}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {products.length} {language === 'ar' ? 'منتج' : 'products'}
              </p>
            </div>
          )}

          {/* Products Grid - Scrollable */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-3">
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
                <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4 opacity-30" />
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4 opacity-30" />
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'اختر فئة لعرض المنتجات' : 'Select a category to view products'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
