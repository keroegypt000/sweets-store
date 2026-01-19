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
      {/* Main Content - Vertical Layout (Top: Categories, Bottom: Products) */}
      <div className="flex flex-col max-w-full mx-auto min-h-screen">
        
        {/* Top Section - Categories (50% height) */}
        <div className="w-full h-1/2 bg-gradient-to-br from-primary-yellow via-accent-yellow to-yellow-200 overflow-hidden flex flex-col">
          {/* Categories Header */}
          <div className="p-4 md:p-6 border-b border-yellow-300 bg-yellow-100 sticky top-0 z-20">
            <h2 className="text-lg md:text-2xl font-bold text-dark-text">
              {language === 'ar' ? 'الفئات' : 'Categories'}
            </h2>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 md:p-4">
            <div className="flex gap-2 md:gap-3 min-w-min pb-2">
              {categories && categories.length > 0 && categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`flex-shrink-0 p-3 md:p-4 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                    selectedCategoryId === category.id
                      ? 'bg-white ring-2 ring-dark-text shadow-lg'
                      : 'bg-white hover:shadow-md'
                  } flex flex-col items-center gap-2 group w-24 md:w-28 lg:w-32`}
                >
                  {/* Category Image */}
                  {category.image && (
                    <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-light-bg border-2 border-primary-yellow">
                      <img
                        src={category.image}
                        alt={language === 'ar' ? category.nameAr : category.nameEn}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                  )}

                  {/* Category Name */}
                  <div className="text-center min-w-0">
                    <h3 className="font-bold text-dark-text text-xs md:text-sm truncate">
                      {language === 'ar' ? category.nameAr : category.nameEn}
                    </h3>
                    <p className="text-xs text-dark-text opacity-70">
                      {allProducts.filter(p => p.categoryId === category.id).length}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Products (50% height) */}
        <div className="w-full h-1/2 bg-gray-50 overflow-hidden flex flex-col">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
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
