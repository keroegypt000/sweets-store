import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const { language, t } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Fetch categories
  const { data: categories = [] } = trpc.categories.list.useQuery();

  // Fetch products - all products or filtered by category
  const { data: products = [] } = selectedCategoryId
    ? trpc.products.byCategory.useQuery({ categoryId: selectedCategoryId })
    : trpc.products.list.useQuery();

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
      {/* Main Content - Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
        
        {/* Right Column - Categories (on desktop) / Top (on mobile) */}
        <div className="w-full lg:w-1/3 space-y-4">
          <h2 className="text-2xl font-bold text-dark-text mb-6">
            {language === 'ar' ? 'الفئات' : 'Categories'}
          </h2>

          {/* Categories Grid */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                  selectedCategoryId === category.id
                    ? 'bg-primary-yellow ring-2 ring-accent-yellow shadow-lg'
                    : 'bg-primary-yellow hover:shadow-md'
                } flex items-center gap-4 group`}
              >
                {/* Category Image */}
                {category.image && (
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                    <img
                      src={category.image}
                      alt={language === 'ar' ? category.nameAr : category.nameEn}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                )}

                {/* Category Name */}
                <div className="flex-1">
                  <h3 className="font-bold text-dark-text text-sm">
                    {language === 'ar' ? category.nameAr : category.nameEn}
                  </h3>
                  <p className="text-xs text-dark-text opacity-75">
                    {products.filter(p => p.categoryId === category.id).length} {language === 'ar' ? 'منتج' : 'items'}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="text-dark-text text-xl group-hover:translate-x-1 transition-transform">
                  {language === 'ar' ? '←' : '→'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left Column - Products (on desktop) / Bottom (on mobile) */}
        <div className="w-full lg:w-2/3">
          {/* Selected Category Header */}
          {selectedCategory && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-dark-text">
                {language === 'ar' ? selectedCategory.nameAr : selectedCategory.nameEn}
              </h2>
              <p className="text-muted-foreground mt-1">
                {language === 'ar' ? 'اختر المنتجات التي تريدها' : 'Select the products you want'}
              </p>
            </div>
          )}

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : selectedCategoryId ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                {language === 'ar' ? 'لا توجد منتجات في هذه الفئة' : 'No products in this category'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                {language === 'ar' ? 'اختر فئة لعرض المنتجات' : 'Select a category to view products'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
