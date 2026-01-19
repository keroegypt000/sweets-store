'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import ProductCard from '@/components/ProductCard';
import { ShoppingCart, ArrowLeft, Search } from 'lucide-react';
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
      {/* MOBILE VIEW - Vertical Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Banner */}
        <div className="w-full h-40 bg-gradient-to-r from-yellow-400 via-yellow-300 to-orange-300 flex items-center justify-center overflow-hidden shadow-lg relative">
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
                    onClick={() => setSelectedCategoryId(category.id)}
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
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {language === 'ar' ? selectedCategory?.nameAr : selectedCategory?.nameEn}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP VIEW - Horizontal Layout */}
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

          {/* Categories Grid - 6 per row */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-3 gap-2 auto-rows-max">
              {filteredCategories && filteredCategories.length > 0 && filteredCategories.map((category) => {
                const categoryProductCount = allProducts.filter(p => p.categoryId === category.id).length;
                
                return (
                  <div
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 overflow-hidden group h-32 rounded-lg shadow-md hover:shadow-lg ${
                      selectedCategoryId === category.id
                        ? 'ring-2 ring-yellow-500 shadow-xl'
                        : ''
                    }`}
                  >
                    {category.image && (
                      <img
                        src={category.image}
                        alt={language === 'ar' ? category.nameAr : category.nameEn}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                      <h3 className="text-xs sm:text-sm font-bold text-white drop-shadow-lg text-center line-clamp-2">
                        {language === 'ar' ? category.nameAr : category.nameEn}
                      </h3>
                      <p className="text-xs text-gray-100 drop-shadow-lg mt-1">
                        {categoryProductCount}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Products */}
        <div className="w-1/2 bg-gray-50 overflow-y-auto flex flex-col">
          
          {/* Products Header */}
          <div className="p-6 border-b-2 border-gray-200 bg-white sticky top-0 z-20 shadow-sm flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategoryId
                ? language === 'ar' ? selectedCategory?.nameAr : selectedCategory?.nameEn
                : language === 'ar' ? 'جميع المنتجات' : 'All Products'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {products.length} {language === 'ar' ? 'منتج' : 'products'}
            </p>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500 text-lg mb-2">
                    {language === 'ar' ? 'اختر فئة لعرض المنتجات' : 'Select a category to view products'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
