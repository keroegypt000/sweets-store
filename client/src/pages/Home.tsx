import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import ProductCard from '@/components/ProductCard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const { language, t } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  // Fetch products
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery({
    limit: 20,
    offset: page * 20,
  });

  // Fetch featured products
  const { data: featuredProducts } = trpc.products.featured.useQuery({ limit: 10 });

  // Add to cart mutation
  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم إضافة المنتج إلى السلة' : 'Product added to cart');
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    },
  });

  const handleAddToCart = (productId: number, quantity: number) => {
    addToCartMutation.mutate({ productId, quantity });
  };

  const handleSelectCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setPage(0);
  };

  // Determine which products to display
  const displayProducts = selectedCategoryId
    ? products?.filter((p) => p.categoryId === selectedCategoryId)
    : products;

  return (
    <div className="min-h-screen bg-light-bg">
      <Header onSearchChange={setSearchQuery} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-yellow to-accent-yellow py-12 md:py-20">
        <div className="container">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-dark-text mb-4">
              {t('welcome')}
            </h1>
            <p className="text-lg text-dark-text opacity-90">
              {t('best_sweets')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="md:col-span-1">
            <CategorySidebar
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={handleSelectCategory}
            />
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {/* Featured Products Section */}
            {!selectedCategoryId && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-dark-text mb-6">
                  {t('recently_added')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProducts?.slice(0, 6).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Products Section */}
            <div>
              <h2 className="text-2xl font-bold text-dark-text mb-6">
                {selectedCategoryId ? t('products') : t('all_products') || 'All Products'}
              </h2>

              {productsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : displayProducts && displayProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    {language === 'ar' ? 'لا توجد منتجات' : 'No products found'}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {displayProducts && displayProducts.length > 0 && (
              <div className="flex justify-center gap-4 mt-12">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-light-bg disabled:opacity-50"
                >
                  {language === 'ar' ? 'السابق' : 'Previous'}
                </button>
                <span className="px-4 py-2 text-dark-text">
                  {language === 'ar' ? `الصفحة ${page + 1}` : `Page ${page + 1}`}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-light-bg"
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
