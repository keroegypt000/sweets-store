import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import ProductCard from '@/components/ProductCard';
import CompactProductCard from '@/components/CompactProductCard';
import PageLayout from '@/components/PageLayout';
import BannerSlider from '@/components/BannerSlider';
import { ShoppingCart, ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { toast } from 'sonner';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function Home() {
  const { language } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const productsContainerRef = useRef<HTMLDivElement>(null);
  const productsHeaderRef = useRef<HTMLDivElement>(null);
  const mobileProductsGridRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch categories
  const { data: categories = [] } = trpc.categories.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  // Fetch products
  const { data: products = [] } = trpc.products.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  // Fetch banners
  const { data: banners = [] } = trpc.banners.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const handleAddToCart = (productId: number, quantity: number) => {
    toast.success(language === 'ar' ? 'تم إضافة المنتج إلى السلة' : 'Product added to cart');
  };

  // Category navigation functions
  const handlePreviousCategory = () => {
    if (!selectedCategoryId) {
      // If no category selected, select the last one
      if (filteredCategories.length > 0) {
        setSelectedCategoryId(filteredCategories[filteredCategories.length - 1].id);
      }
    } else {
      // Find current category index and go to previous
      const currentIndex = filteredCategories.findIndex(c => c.id === selectedCategoryId);
      if (currentIndex > 0) {
        setSelectedCategoryId(filteredCategories[currentIndex - 1].id);
      } else if (currentIndex === 0 && filteredCategories.length > 1) {
        // Wrap to last category
        setSelectedCategoryId(filteredCategories[filteredCategories.length - 1].id);
      }
    }
  };

  const handleNextCategory = () => {
    if (!selectedCategoryId) {
      // If no category selected, select the first one
      if (filteredCategories.length > 0) {
        setSelectedCategoryId(filteredCategories[0].id);
      }
    } else {
      // Find current category index and go to next
      const currentIndex = filteredCategories.findIndex(c => c.id === selectedCategoryId);
      if (currentIndex < filteredCategories.length - 1) {
        setSelectedCategoryId(filteredCategories[currentIndex + 1].id);
      } else if (currentIndex === filteredCategories.length - 1) {
        // Wrap to first category
        setSelectedCategoryId(filteredCategories[0].id);
      }
    }
  };

  // Filter categories based on search (must be before navigation functions)
  const filteredCategories = categories.filter((category) => {
    const searchLower = debouncedSearchQuery.toLowerCase();
    const nameMatch =
      (language === 'ar'
        ? category.nameAr?.toLowerCase()
        : category.nameEn?.toLowerCase()
      )?.includes(searchLower) || false;
    return nameMatch;
  });

  // Filter products based on selected category
  const filteredProducts = selectedCategoryId
    ? products.filter((product) => product.categoryId === selectedCategoryId)
    : products;

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const allProducts = products;

  // Get recommended products (different from currently displayed) - Show 8 random products
  const recommendedProducts = (() => {
    let candidates = selectedCategoryId
      ? products.filter(p => p.categoryId !== selectedCategoryId)
      : products;
    
    // Shuffle and get 8 random products
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  })();

  // Sample banners data
  const sampleBanners = banners.map((banner) => ({
    id: banner.id,
    image: banner.image,
    titleAr: banner.titleAr,
    titleEn: banner.titleEn,
    order: banner.order || 0,
    isActive: banner.isActive !== false,
  }));

  return (
    <PageLayout>
      {/* MOBILE VIEW - Vertical Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Banner Slider */}
        <div className="w-full p-3 sm:p-4">
          <BannerSlider banners={sampleBanners} language={language as 'ar' | 'en'} />
        </div>

        {/* Search Bar */}
        <div className="p-3 sm:p-4 bg-yellow-100 border-b-2 border-yellow-300 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'ابحث عن فئة...' : 'Search categories...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm font-medium bg-white transition-all"
              spellCheck="false"
            />
          </div>
        </div>

        {/* Mobile Content - Toggle between Categories and Products */}
        {!selectedCategoryId ? (
          // Categories View
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-50">
            <div className="p-4 sm:p-6 border-b-2 border-yellow-300 bg-gradient-to-r from-yellow-100 to-yellow-50 sticky top-0 z-20 shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {language === 'ar' ? 'الفئات' : 'Categories'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {language === 'ar' ? 'اختر من بين أفضل الفئات' : 'Choose from our best categories'}
              </p>
            </div>

            <div className="flex flex-col">
              {filteredCategories && filteredCategories.length > 0 && filteredCategories.map((category) => {
                const categoryProductCount = allProducts.filter(p => p.categoryId === category.id).length;
                
                return (
                  <div
                    key={category.id}
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      // On mobile, scroll to products grid (skip banner and search bar)
                      setTimeout(() => {
                        if (mobileProductsGridRef.current) {
                          mobileProductsGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className="relative cursor-pointer transition-all duration-300 transform hover:scale-105 border-b border-yellow-200 last:border-b-0 overflow-hidden group h-24 sm:h-28"
                  >
                    {category.image && (
                      <img
                        src={category.image}
                        alt={language === 'ar' ? category.nameAr : category.nameEn}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <div className="flex-1">
                        <h3 className="text-sm sm:text-base font-bold text-white drop-shadow-lg">
                          {language === 'ar' ? category.nameAr : category.nameEn}
                        </h3>
                        <p className="text-xs text-gray-100 drop-shadow-lg">
                          {categoryProductCount} {language === 'ar' ? 'منتج' : 'products'}
                        </p>
                      </div>
                      <ArrowLeft className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Products View
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-4 sm:p-6 border-b-2 border-gray-200 bg-white sticky top-0 z-20 shadow-sm flex items-center gap-3">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                {language === 'ar' ? 'رجوع' : 'Back'}
              </button>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                {language === 'ar' ? selectedCategory?.nameAr : selectedCategory?.nameEn}
              </h2>
            </div>

            <div ref={mobileProductsGridRef} className="grid grid-cols-2 gap-2 p-2 sm:gap-4 sm:p-4">
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                  </p>
                </div>
              )}
            </div>

            {/* Category Navigation Footer */}
            {filteredProducts && filteredProducts.length > 0 && (
              <div className="bg-white border-t-2 border-gray-200 p-6 sm:p-8 flex items-center justify-center gap-4 sm:gap-6 shadow-lg">
                {/* Previous Category Button */}
                <button
                  onClick={() => {
                    const currentIndex = filteredCategories.findIndex(c => c.id === selectedCategoryId);
                    if (currentIndex > 0) {
                      setSelectedCategoryId(filteredCategories[currentIndex - 1].id);
                    }
                  }}
                  disabled={filteredCategories.findIndex(c => c.id === selectedCategoryId) === 0}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-gray-800 transition-colors shadow-md"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <span className="text-sm font-medium text-gray-600">
                  {language === 'ar' ? 'التنقل بين الفئات' : 'Browse Categories'}
                </span>

                {/* Next Category Button */}
                <button
                  onClick={() => {
                    const currentIndex = filteredCategories.findIndex(c => c.id === selectedCategoryId);
                    if (currentIndex < filteredCategories.length - 1) {
                      setSelectedCategoryId(filteredCategories[currentIndex + 1].id);
                    }
                  }}
                  disabled={filteredCategories.findIndex(c => c.id === selectedCategoryId) === filteredCategories.length - 1}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-gray-800 transition-colors shadow-md"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DESKTOP VIEW - Split Layout */}
      <div className="hidden md:flex gap-0 max-w-full mx-auto min-h-screen">
        {/* Left Column - Categories */}
        <div className="w-1/2 bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-50 overflow-y-auto flex flex-col">
          {/* Banner */}
          <div className="w-full h-32 bg-gradient-to-r from-yellow-400 via-yellow-300 to-orange-300 flex items-center justify-center overflow-hidden shadow-lg relative flex-shrink-0">
            <div className="absolute inset-0 bg-black/10"></div>
            <img
              src="https://images.unsplash.com/photo-1599599810694-b5ac4dd64e90?w=600&h=250&fit=crop"
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                {language === 'ar' ? 'متجر الحلويات' : 'Sweets Store'}
              </h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 bg-yellow-100 border-b-2 border-yellow-300 shadow-sm flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'ابحث عن فئة...' : 'Search categories...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm font-medium bg-white transition-all"
              />
            </div>
          </div>

          {/* Categories Header */}
          <div className="p-4 border-b-2 border-yellow-300 bg-gradient-to-r from-yellow-100 to-yellow-50 sticky top-0 z-20 shadow-sm flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800">
              {language === 'ar' ? 'الفئات' : 'Categories'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {language === 'ar' ? 'اختر من بين أفضل الفئات' : 'Choose from our best categories'}
            </p>
          </div>

          {/* Categories List */}
          <div className="flex-1 overflow-y-auto">
            {filteredCategories && filteredCategories.length > 0 ? (
              filteredCategories.map((category) => {
                const categoryProductCount = allProducts.filter(p => p.categoryId === category.id).length;
                const isSelected = selectedCategoryId === category.id;

                return (
                  <div
                    key={category.id}
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      // Desktop: scroll entire page to products header
                      setTimeout(() => {
                        if (productsHeaderRef.current) {
                          productsHeaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 0);
                    }}
                    className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 border-b border-yellow-200 last:border-b-0 overflow-hidden group h-24 ${
                      isSelected ? 'ring-4 ring-yellow-500' : ''
                    }`}
                  >
                    {category.image && (
                      <img
                        src={category.image}
                        alt={language === 'ar' ? category.nameAr : category.nameEn}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                    <div className={`absolute inset-0 ${isSelected ? 'bg-black/20' : 'bg-black/40'} group-hover:bg-black/50 transition-colors duration-300`}></div>
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-white drop-shadow-lg">
                          {language === 'ar' ? category.nameAr : category.nameEn}
                        </h3>
                        <p className="text-xs text-gray-100 drop-shadow-lg">
                          {categoryProductCount} {language === 'ar' ? 'منتج' : 'products'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-600">
                {language === 'ar' ? 'لا توجد فئات' : 'No categories found'}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Products */}
        <div ref={productsContainerRef} className="w-1/2 bg-gray-50 overflow-y-auto flex flex-col">
          {/* Products Header */}
          <div ref={productsHeaderRef} className="p-6 border-b-2 border-gray-200 bg-white sticky top-0 z-20 shadow-sm flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategoryId
                ? language === 'ar'
                  ? selectedCategory?.nameAr
                  : selectedCategory?.nameEn
                : language === 'ar'
                ? 'جميع المنتجات'
                : 'All Products'}
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {filteredProducts.length} {language === 'ar' ? 'منتج' : 'products'}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 p-6 auto-rows-max">
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                </p>
              </div>
            )}
          </div>

          {/* Category Navigation Arrows - Always Visible */}
          <div className="border-t-2 border-gray-200 bg-white p-4 flex items-center justify-center gap-4 shadow-lg flex-shrink-0">
            <button
              onClick={handlePreviousCategory}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 transition-colors shadow-md"
              title={language === 'ar' ? 'الفئة السابقة' : 'Previous Category'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-600">
              {language === 'ar' ? 'التمرير بين الفئات' : 'Browse Categories'}
            </span>
            <button
              onClick={handleNextCategory}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 transition-colors shadow-md"
              title={language === 'ar' ? 'الفئة التالية' : 'Next Category'}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Available Products Section - Recommendations */}
          <div className="border-t-2 border-gray-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 flex-shrink-0">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {language === 'ar' ? 'منتجات موصى بها' : 'Recommended Products'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'ar' ? 'اكتشف منتجات أخرى قد تعجبك' : 'Discover other products you may like'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendedProducts && recommendedProducts.length > 0 ? (
                recommendedProducts.map((product) => (
                  <CompactProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-4 text-gray-600 text-sm">
                  {language === 'ar' ? 'لا توجد منتجات موصى بها' : 'No recommendations available'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
