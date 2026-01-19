import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function AdminProducts() {
  const { language } = useLanguage();
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    categoryId: 1,
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    price: '',
    originalPrice: '',
    stock: 0,
    image: '',
    sku: '',
    slug: '',
    isFeatured: false,
    isPromotion: false,
  });

  // Fetch data
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = trpc.products.allProducts.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();

  // Mutations
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم إضافة المنتج بنجاح' : 'Product added successfully');
      resetForm();
      refetchProducts();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error occurred'));
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully');
      resetForm();
      refetchProducts();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error occurred'));
    },
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully');
      refetchProducts();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error occurred'));
    },
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      setLocation('/');
    }
  }, [user, loading, setLocation]);

  const resetForm = () => {
    setFormData({
      categoryId: 1,
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      price: '',
      originalPrice: '',
      stock: 0,
      image: '',
      sku: '',
      slug: '',
      isFeatured: false,
      isPromotion: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product: any) => {
    setFormData({
      categoryId: product.categoryId,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      descriptionAr: product.descriptionAr || '',
      descriptionEn: product.descriptionEn || '',
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      stock: product.stock || 0,
      image: product.image || '',
      sku: product.sku || '',
      slug: product.slug,
      isFeatured: product.isFeatured || false,
      isPromotion: product.isPromotion || false,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameAr || !formData.nameEn || !formData.price || !formData.slug) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-light-bg">
      <Header />

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation('/admin')}
              className="flex items-center gap-2 text-primary-yellow hover:text-accent-yellow transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{language === 'ar' ? 'العودة' : 'Back'}</span>
            </button>
            <h1 className="text-3xl font-bold text-dark-text">
              {language === 'ar' ? 'إدارة المنتجات' : 'Manage Products'}
            </h1>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-primary-yellow text-dark-text hover:bg-accent-yellow"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
          </Button>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-dark-text">
              {editingId ? (language === 'ar' ? 'تعديل المنتج' : 'Edit Product') : (language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category & SKU Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    {language === 'ar' ? 'الفئة' : 'Category'} *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  >
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {language === 'ar' ? cat.nameAr : cat.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    SKU
                  </label>
                  <Input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SKU"
                  />
                </div>
              </div>

              {/* Arabic Name & English Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    {language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'} *
                  </label>
                  <Input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder={language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    {language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'} *
                  </label>
                  <Input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder={language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}
                    required
                  />
                </div>
              </div>

              {/* Arabic Description & English Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    {language === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'}
                  </label>
                  <textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder={language === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'}
                    rows={4}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    {language === 'ar' ? 'الوصف بالإنجليزية' : 'English Description'}
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder={language === 'ar' ? 'الوصف بالإنجليزية' : 'English Description'}
                    rows={4}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  />
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    {language === 'ar' ? 'السعر' : 'Price'} * (KWD)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    {language === 'ar' ? 'السعر الأصلي' : 'Original Price'} (KWD)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Stock & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    {language === 'ar' ? 'المخزون' : 'Stock'}
                  </label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Slug *
                  </label>
                  <Input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="product-slug"
                    required
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  {language === 'ar' ? 'رابط الصورة' : 'Image URL'}
                </label>
                <Input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-dark-text">{language === 'ar' ? 'منتج مميز' : 'Featured Product'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPromotion}
                    onChange={(e) => setFormData({ ...formData, isPromotion: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-dark-text">{language === 'ar' ? 'عرض ترويجي' : 'Promotional'}</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-yellow text-dark-text hover:bg-accent-yellow"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    language === 'ar' ? 'حفظ' : 'Save'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-dark-text">
              {language === 'ar' ? 'قائمة المنتجات' : 'Products List'} ({products.length})
            </h2>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-yellow" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {language === 'ar' ? 'لا توجد منتجات' : 'No products'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'الاسم' : 'Name'}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'السعر' : 'Price'}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'المخزون' : 'Stock'}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product.id} className="border-b border-border hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-dark-text">
                        {language === 'ar' ? product.nameAr : product.nameEn}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-text">
                        {product.price} KWD
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-text">
                        {product.stock || 0}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) {
                              deleteMutation.mutate({ id: product.id });
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
