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
      <div className="flex flex-col md:flex-row gap-0 max-w-full mx-auto min-h-screen">
        
        {/* Left/Top Column - Categories */}
        <div className={`${
          selectedCategoryId && window.innerWidth < 768 ? 'hidden' : ''
        } w-full md:w-1/2 md:h-screen bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-50 overflow-y-auto flex flex-col md:block`}>
          
          {/* Mobile Banner - Larger size */}
          <div className="md:hidden w-full h-48 sm:h-56 bg-gradient-to-r from-yellow-400 via-yellow-300 to-orange-300 flex items-center justify-center overflow-hidden shadow-lg relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <img
              src="https://images.unsplash.com/photo-1599599810694-b5ac4dd64e90?w=600&h=250&fit=crop"
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                {language === 'ar' ? 'متجر الحلويات' : 'Sweets Store'}
              </h1>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden p-3 sm:p-4 bg-yellow-100 border-b-2 border-yellow-300 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'ابحث عن فئة...' : 'Search categories...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm font-medium bg-white transition-all"
              />
            </div>
          </div>

          {/* Categories Header */}
          <div className="p-4 sm:p-6 md:p-8 border-b-2 border-yellow-300 bg-gradient-to-r from-yellow-100 to-yellow-50 sticky top-0 z-20 md:sticky md:top-0 shadow-sm">
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-800">
              {language === 'ar' ? 'الفئات' : 'Categories'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {language === 'ar' ? 'اختر من بين أفضل الفئات' : 'Choose from our best categories'}
            </p>
          </div>

          {/* Categories Container */}
          <div className="flex-1 flex flex-col md:h-screen md:overflow-y-auto">
            {filteredCategories && filteredCategories.length > 0 && filteredCategories.map((category, index) => {
              if (window.innerWidth >= 768 && index >= 6) return null;
              
              const categoryProductCount = allProducts.filter(p => p.categoryId === category.id).length;
              
              return (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`flex-1 p-3 sm:p-4 md:p-5 cursor-pointer transition-all duration-300 transform hover:scale-105 border-b border-yellow-200 last:border-b-0 ${
                    selectedCategoryId === category.id
                      ? 'bg-white ring-2 ring-yellow-500 shadow-xl'
                      : 'bg-yellow-50 hover:bg-white hover:shadow-md'
                  } flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4 group`}
                >
                  {/* Category Image - Larger and better styled */}
                  {category.image && (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-white border-3 border-yellow-300 shadow-md group-hover:shadow-lg transition-shadow">
                      <img
                        src={category.image}
                        alt={language === 'ar' ? category.nameAr : category.nameEn}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Category Name - Better typography */}
                  <div className="text-center">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg line-clamp-2">
                      {language === 'ar' ? category.nameAr : category.nameEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                      {categoryProductCount} {language === 'ar' ? 'منتج' : 'items'}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="text-yellow-600 text-lg sm:text-xl md:text-2xl group-hover:translate-x-1 transition-transform duration-300 font-bold">
                    {language === 'ar' ? '←' : '→'}
                  </div>
                </div>
              );
            })}
            
            {/* No results message */}
            {filteredCategories.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-500 font-medium">
                  {language === 'ar' ? 'لا توجد فئات' : 'No categories found'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right/Bottom Column - Products */}
        <div className={`${
          !selectedCategoryId && window.innerWidth < 768 ? 'hidden' : ''
        } w-full md:w-1/2 md:h-screen bg-gray-50 overflow-hidden flex flex-col md:block`}>
          {/* Products Header with Back Button */}
          <div className="p-3 sm:p-4 md:p-8 border-b-2 border-gray-200 bg-white sticky top-0 z-20 flex items-center justify-between md:block shadow-sm">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-800">
                {selectedCategory ? (language === 'ar' ? selectedCategory.nameAr : selectedCategory.nameEn) : (language === 'ar' ? 'المنتجات' : 'Products')}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
                {products.length} {language === 'ar' ? 'منتج متاح' : 'products available'}
              </p>
            </div>
            
            {/* Back Button - Mobile only */}
            {selectedCategoryId && window.innerWidth < 768 && (
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="md:hidden p-2 hover:bg-yellow-100 rounded-lg transition-colors duration-300"
              >
                {language === 'ar' ? <ArrowRight className="w-6 h-6 text-yellow-600" /> : <ArrowLeft className="w-6 h-6 text-yellow-600" />}
              </button>
            )}
          </div>

          {/* Products Grid - Scrollable */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-6 md:h-screen md:overflow-y-auto">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
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
                <ShoppingCart className="w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 text-gray-300 mb-3 sm:mb-4 md:mb-6" />
                <p className="text-sm sm:text-base md:text-lg text-gray-500 font-medium">
                  {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 text-gray-300 mb-3 sm:mb-4 md:mb-6" />
                <p className="text-sm sm:text-base md:text-lg text-gray-500 font-medium">
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
