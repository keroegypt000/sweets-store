import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import ProductCard from '@/components/ProductCard';
import { ShoppingCart, ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const { language } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch categories
  const { data: categories = [] } = trpc.categories.list.useQuery();

  // Always fetch all products
  const { data: allProducts = [] } = trpc.products.list.useQuery();

  // Filter products based on selected category
  const products = selectedCategoryId
    ? allProducts.filter(p => p.categoryId === selectedCategoryId)
    : allProducts;

  // Filter categories by search query
  const filteredCategories = categories.filter(cat => {
    const name = language === 'ar' ? cat.nameAr : cat.nameEn;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
      {/* Main Content - Responsive Layout */}
      {/* Mobile: Toggle between categories and products | Desktop: Side by side */}
      <div className="flex flex-col md:flex-row gap-0 max-w-full mx-auto min-h-screen">
        
        {/* Left/Top Column - Categories (Mobile: Full screen when no category selected) */}
        {/* Desktop: 50% width, full height | Mobile: Full width when showing categories */}
        <div className={`${
          selectedCategoryId && window.innerWidth < 768 ? 'hidden' : ''
        } w-full md:w-1/2 md:h-screen bg-gradient-to-br from-primary-yellow via-accent-yellow to-yellow-200 overflow-y-auto flex flex-col md:block`}>
          
          {/* Mobile Banner - Only on mobile */}
          <div className="md:hidden w-full h-32 sm:h-40 bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1599599810694-b5ac4dd64e90?w=500&h=200&fit=crop"
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Mobile Search Bar - Only on mobile */}
          <div className="md:hidden p-2 sm:p-3 bg-yellow-100 border-b border-yellow-300">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'ابحث عن فئة...' : 'Search categories...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow text-sm"
              />
            </div>
          </div>

          {/* Categories Header */}
          <div className="p-2 sm:p-3 md:p-6 border-b border-yellow-300 bg-yellow-100 sticky top-0 z-20 md:sticky md:top-0">
            <h2 className="text-sm sm:text-base md:text-2xl font-bold text-dark-text">
              {language === 'ar' ? 'الفئات' : 'Categories'}
            </h2>
          </div>

          {/* Categories Container */}
          <div className="flex-1 flex flex-col md:h-screen md:overflow-y-auto">
            {filteredCategories && filteredCategories.length > 0 && filteredCategories.map((category, index) => {
              // On mobile: show all filtered categories
              // On desktop: show only first 6 categories
              if (window.innerWidth >= 768 && index >= 6) return null;
              
              const categoryProductCount = allProducts.filter(p => p.categoryId === category.id).length;
              
              return (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`flex-1 p-2 sm:p-3 md:p-4 cursor-pointer transition-all transform hover:scale-105 border-b border-yellow-300 last:border-b-0 ${
                    selectedCategoryId === category.id
                      ? 'bg-white ring-2 ring-dark-text shadow-lg'
                      : 'bg-yellow-100 hover:bg-yellow-50'
                  } flex flex-col items-center justify-center gap-1 sm:gap-2 md:gap-3 group`}
                >
                  {/* Category Image */}
                  {category.image && (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white border-2 border-primary-yellow">
                      <img
                        src={category.image}
                        alt={language === 'ar' ? category.nameAr : category.nameEn}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                  )}

                  {/* Category Name */}
                  <div className="text-center">
                    <h3 className="font-bold text-dark-text text-xs sm:text-sm md:text-base line-clamp-2">
                      {language === 'ar' ? category.nameAr : category.nameEn}
                    </h3>
                    <p className="text-xs text-dark-text opacity-70 mt-0.5">
                      {categoryProductCount} {language === 'ar' ? 'منتج' : 'items'}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="text-dark-text text-sm sm:text-base md:text-lg group-hover:translate-x-1 transition-transform">
                    {language === 'ar' ? '←' : '→'}
                  </div>
                </div>
              );
            })}
            
            {/* No results message */}
            {filteredCategories.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-dark-text opacity-50">
                  {language === 'ar' ? 'لا توجد فئات' : 'No categories found'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right/Bottom Column - Products */}
        {/* Desktop: 50% width, full height | Mobile: Full width when category selected */}
        <div className={`${
          !selectedCategoryId && window.innerWidth < 768 ? 'hidden' : ''
        } w-full md:w-1/2 md:h-screen bg-gray-50 overflow-hidden flex flex-col md:block`}>
          {/* Products Header with Back Button (Mobile only) */}
          <div className="p-2 sm:p-3 md:p-6 border-b border-gray-200 bg-white sticky top-0 z-20 flex items-center justify-between md:block">
            <div className="flex-1">
              <h2 className="text-sm sm:text-base md:text-2xl font-bold text-dark-text">
                {selectedCategory ? (language === 'ar' ? selectedCategory.nameAr : selectedCategory.nameEn) : (language === 'ar' ? 'المنتجات' : 'Products')}
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                {products.length} {language === 'ar' ? 'منتج' : 'products'}
              </p>
            </div>
            
            {/* Back Button - Mobile only */}
            {selectedCategoryId && window.innerWidth < 768 && (
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {language === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
              </button>
            )}
          </div>

          {/* Products Grid - Scrollable */}
          <div className="flex-1 overflow-y-auto p-1 sm:p-2 md:p-4 md:h-screen md:overflow-y-auto">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-1 sm:gap-2 md:gap-3">
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
