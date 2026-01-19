import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import ProductListItem from '@/components/ProductListItem';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const { language, t } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Fetch categories
  const { data: categories = [] } = trpc.categories.list.useQuery();

  // Always call useQuery - just with enabled: false when no category is selected
  const { data: categoryProducts = [] } = trpc.products.byCategory.useQuery(
    { categoryId: selectedCategoryId || 0 },
    { enabled: selectedCategoryId !== null }
  );

  // Use categoryProducts when category is selected, otherwise empty array
  const products = selectedCategoryId ? categoryProducts : [];

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
      {/* Main Content - Two Column Layout (maintained on all screen sizes) */}
      <div className="flex flex-row gap-2 md:gap-4 lg:gap-6 p-2 md:p-4 lg:p-6 max-w-full mx-auto min-h-screen">
        
        {/* Right Column - Categories */}
        <div className="w-1/3 md:w-1/3 lg:w-1/3 space-y-2 md:space-y-3 overflow-y-auto pr-2 md:pr-4">
          <h2 className="text-sm md:text-lg lg:text-2xl font-bold text-dark-text mb-3 md:mb-4 sticky top-0 bg-background z-10 py-2">
            {language === 'ar' ? 'الفئات' : 'Categories'}
          </h2>

          {/* Categories Vertical List */}
          <div className="space-y-2 md:space-y-3">
            {categories && categories.length > 0 && categories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`p-2 md:p-3 lg:p-4 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                  selectedCategoryId === category.id
                    ? 'bg-primary-yellow ring-2 ring-accent-yellow shadow-lg'
                    : 'bg-primary-yellow hover:shadow-md'
                } flex items-center gap-2 md:gap-3 lg:gap-4 group`}
              >
                {/* Category Image */}
                {category.image && (
                  <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                    <img
                      src={category.image}
                      alt={language === 'ar' ? category.nameAr : category.nameEn}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                )}

                {/* Category Name */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-dark-text text-xs md:text-sm lg:text-base truncate">
                    {language === 'ar' ? category.nameAr : category.nameEn}
                  </h3>
                  <p className="text-xs text-dark-text opacity-75 hidden sm:block">
                    {products.filter(p => p.categoryId === category.id).length} {language === 'ar' ? 'منتج' : 'items'}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="text-dark-text text-base md:text-lg lg:text-xl flex-shrink-0 group-hover:translate-x-1 transition-transform">
                  {language === 'ar' ? '←' : '→'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left Column - Products */}
        <div className="w-2/3 md:w-2/3 lg:w-2/3 overflow-y-auto pl-2 md:pl-4">
          {/* Selected Category Header */}
          {selectedCategory && (
            <div className="mb-3 md:mb-4 lg:mb-6 sticky top-0 bg-background z-10 py-2">
              <h2 className="text-sm md:text-lg lg:text-2xl font-bold text-dark-text">
                {language === 'ar' ? selectedCategory.nameAr : selectedCategory.nameEn}
              </h2>
              <p className="text-xs md:text-sm lg:text-base text-muted-foreground mt-1">
                {language === 'ar' ? 'اختر المنتجات التي تريدها' : 'Select the products you want'}
              </p>
            </div>
          )}

          {/* Products Vertical List */}
          {products && products.length > 0 ? (
            <div className="space-y-2 md:space-y-3 lg:space-y-4">
              {products.map((product) => (
                <ProductListItem
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : selectedCategoryId ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
              <ShoppingCart className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-muted-foreground mb-2 md:mb-4 opacity-50" />
              <p className="text-xs md:text-sm lg:text-lg text-muted-foreground">
                {language === 'ar' ? 'لا توجد منتجات في هذه الفئة' : 'No products in this category'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
              <ShoppingCart className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 text-muted-foreground mb-2 md:mb-4 opacity-50" />
              <p className="text-xs md:text-sm lg:text-lg text-muted-foreground">
                {language === 'ar' ? 'اختر فئة لعرض المنتجات' : 'Select a category to view products'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
