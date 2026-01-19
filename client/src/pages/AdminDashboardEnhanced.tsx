import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit2, Trash2, LogOut, Menu, X, Upload } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type Tab = 'products' | 'categories' | 'banners' | 'orders';

interface AdminUser {
  id: number;
  username: string;
  role: string;
}

export default function AdminDashboardEnhanced() {
  const { language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    price: '',
    stock: '',
    image: '',
    slug: '',
    categoryId: '',
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    image: '',
    slug: '',
    order: '0',
  });

  // Banner form state
  const [bannerForm, setBannerForm] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    image: '',
    link: '',
    order: '0',
  });

  // Fetch data
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = trpc.products.list.useQuery();
  const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = trpc.categories.allCategories.useQuery();
  const { data: banners = [], isLoading: bannersLoading, refetch: refetchBanners } = trpc.banners.allBanners.useQuery();
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = trpc.orders.allOrders.useQuery();

  // Mutations
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم إضافة المنتج بنجاح' : 'Product added successfully');
      resetProductForm();
      refetchProducts();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully');
      resetProductForm();
      refetchProducts();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully');
      refetchProducts();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const createCategoryMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم إضافة الفئة بنجاح' : 'Category added successfully');
      resetCategoryForm();
      refetchCategories();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const updateCategoryMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم تحديث الفئة بنجاح' : 'Category updated successfully');
      resetCategoryForm();
      refetchCategories();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const deleteCategoryMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم حذف الفئة بنجاح' : 'Category deleted successfully');
      refetchCategories();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const createBannerMutation = trpc.banners.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم إضافة البانر بنجاح' : 'Banner added successfully');
      resetBannerForm();
      refetchBanners();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const updateBannerMutation = trpc.banners.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم تحديث البانر بنجاح' : 'Banner updated successfully');
      resetBannerForm();
      refetchBanners();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const deleteBannerMutation = trpc.banners.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم حذف البانر بنجاح' : 'Banner deleted successfully');
      refetchBanners();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const updateOrderStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم تحديث حالة الطلب' : 'Order status updated');
      refetchOrders();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  // Check admin session
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');

    if (!token || !user) {
      setLocation('/admin-login');
      return;
    }

    try {
      setAdminUser(JSON.parse(user));
    } catch {
      setLocation('/admin-login');
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success(language === 'ar' ? 'تم تسجيل الخروج' : 'Logged out successfully');
    setLocation('/admin-login');
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, formType: 'product' | 'category' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);

      if (formType === 'product') {
        setProductForm({ ...productForm, image: base64 });
      } else if (formType === 'category') {
        setCategoryForm({ ...categoryForm, image: base64 });
      } else if (formType === 'banner') {
        setBannerForm({ ...bannerForm, image: base64 });
      }
      setIsUploading(false);
      toast.success(language === 'ar' ? 'تم تحميل الصورة' : 'Image uploaded');
    };
    reader.readAsDataURL(file);
  };

  const resetProductForm = () => {
    setProductForm({
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      price: '',
      stock: '',
      image: '',
      slug: '',
      categoryId: '',
    });
    setImagePreview('');
    setEditingId(null);
    setShowForm(false);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      image: '',
      slug: '',
      order: '0',
    });
    setImagePreview('');
    setEditingId(null);
    setShowForm(false);
  };

  const resetBannerForm = () => {
    setBannerForm({
      titleAr: '',
      titleEn: '',
      descriptionAr: '',
      descriptionEn: '',
      image: '',
      link: '',
      order: '0',
    });
    setImagePreview('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productForm.nameAr || !productForm.nameEn || !productForm.price || !productForm.slug) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    const data: any = {
      nameAr: productForm.nameAr,
      nameEn: productForm.nameEn,
      descriptionAr: productForm.descriptionAr,
      descriptionEn: productForm.descriptionEn,
      price: productForm.price,
      stock: parseInt(productForm.stock) || 0,
      image: productForm.image,
      slug: productForm.slug,
    };
    if (productForm.categoryId) {
      data.categoryId = parseInt(productForm.categoryId);
    }

    if (editingId) {
      updateProductMutation.mutate({ id: editingId, ...data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryForm.nameAr || !categoryForm.nameEn || !categoryForm.slug) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    const data = {
      nameAr: categoryForm.nameAr,
      nameEn: categoryForm.nameEn,
      descriptionAr: categoryForm.descriptionAr,
      descriptionEn: categoryForm.descriptionEn,
      image: categoryForm.image,
      slug: categoryForm.slug,
      order: parseInt(categoryForm.order) || 0,
    };

    if (editingId) {
      updateCategoryMutation.mutate({ id: editingId, ...data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bannerForm.titleAr || !bannerForm.titleEn || !bannerForm.image) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    const data = {
      titleAr: bannerForm.titleAr,
      titleEn: bannerForm.titleEn,
      descriptionAr: bannerForm.descriptionAr,
      descriptionEn: bannerForm.descriptionEn,
      image: bannerForm.image,
      link: bannerForm.link,
      order: parseInt(bannerForm.order) || 0,
    };

    if (editingId) {
      updateBannerMutation.mutate({ id: editingId, ...data });
    } else {
      createBannerMutation.mutate(data);
    }
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-yellow" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16 gap-4">
          <h1 className="text-2xl font-bold text-dark-text">
            <span className="text-primary-yellow">Sweets</span>
            <span className="text-dark-text ml-2">Store</span>
          </h1>

          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {language === 'ar' ? 'مرحبا' : 'Welcome'}, <strong>{adminUser.username}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'خروج' : 'Logout'}
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border p-4 space-y-2">
            <div className="text-sm text-muted-foreground mb-2">
              {language === 'ar' ? 'مرحبا' : 'Welcome'}, <strong>{adminUser.username}</strong>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="w-full"
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'خروج' : 'Logout'}
            </Button>
          </div>
        )}
      </header>

      <div className="container py-8">
        {/* Tabs */}
        <div className="flex gap-2 md:gap-4 mb-8 border-b border-border overflow-x-auto">
          {(['products', 'categories', 'banners', 'orders'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setShowForm(false);
              }}
              className={`pb-4 px-2 md:px-4 font-semibold transition whitespace-nowrap ${
                activeTab === tab
                  ? 'text-primary-yellow border-b-2 border-primary-yellow'
                  : 'text-muted-foreground hover:text-dark-text'
              }`}
            >
              {language === 'ar'
                ? tab === 'products'
                  ? 'المنتجات'
                  : tab === 'categories'
                  ? 'الفئات'
                  : tab === 'banners'
                  ? 'البانرات'
                  : 'الطلبات'
                : tab === 'products'
                ? 'Products'
                : tab === 'categories'
                ? 'Categories'
                : tab === 'banners'
                ? 'Banners'
                : 'Orders'}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {!showForm && (
              <Button
                onClick={() => {
                  resetProductForm();
                  setShowForm(true);
                }}
                className="bg-primary-yellow text-dark-text hover:bg-accent-yellow"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
              </Button>
            )}

            {showForm && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-dark-text">
                  {editingId ? (language === 'ar' ? 'تعديل المنتج' : 'Edit Product') : (language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')}
                </h2>

                <form onSubmit={handleProductSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder={language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}
                      value={productForm.nameAr}
                      onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })}
                      required
                    />
                    <Input
                      placeholder={language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}
                      value={productForm.nameEn}
                      onChange={(e) => setProductForm({ ...productForm, nameEn: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={language === 'ar' ? 'السعر' : 'Price'}
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                    />
                    <Input
                      type="number"
                      placeholder={language === 'ar' ? 'المخزون' : 'Stock'}
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Slug"
                      value={productForm.slug}
                      onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                      required
                    />
                    <select
                      value={productForm.categoryId}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      className="px-4 py-2 border border-border rounded-lg"
                      required
                    >
                      <option value="">{language === 'ar' ? 'اختر الفئة' : 'Select Category'}</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {language === 'ar' ? cat.nameAr : cat.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-border rounded-lg p-4">
                    <label className="flex items-center justify-center cursor-pointer">
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'اضغط لتحميل الصورة' : 'Click to upload image'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'product')}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    {imagePreview && (
                      <div className="mt-4">
                        <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                      </div>
                    )}
                  </div>

                  <textarea
                    placeholder={language === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'}
                    value={productForm.descriptionAr}
                    onChange={(e) => setProductForm({ ...productForm, descriptionAr: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg"
                  />

                  <textarea
                    placeholder={language === 'ar' ? 'الوصف بالإنجليزية' : 'English Description'}
                    value={productForm.descriptionEn}
                    onChange={(e) => setProductForm({ ...productForm, descriptionEn: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg"
                  />

                  <div className="flex gap-4 justify-end">
                    <Button variant="outline" onClick={resetProductForm}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary-yellow text-dark-text hover:bg-accent-yellow"
                      disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    >
                      {createProductMutation.isPending || updateProductMutation.isPending ? (
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
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium">{language === 'ar' ? 'الاسم' : 'Name'}</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">{language === 'ar' ? 'السعر' : 'Price'}</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">{language === 'ar' ? 'المخزون' : 'Stock'}</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product: any) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm">{language === 'ar' ? product.nameAr : product.nameEn}</td>
                          <td className="px-6 py-4 text-sm">{product.price} KWD</td>
                          <td className="px-6 py-4 text-sm">{product.stock || 0}</td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setProductForm({
                                  nameAr: product.nameAr,
                                  nameEn: product.nameEn,
                                  descriptionAr: product.descriptionAr || '',
                                  descriptionEn: product.descriptionEn || '',
                                  price: product.price.toString(),
                                  stock: (product.stock || 0).toString(),
                                  image: product.image || '',
                                  slug: product.slug,
                                  categoryId: product.categoryId?.toString() || '',
                                });
                                setImagePreview(product.image || '');
                                setEditingId(product.id);
                                setShowForm(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) {
                                  deleteProductMutation.mutate({ id: product.id });
                                }
                              }}
                              disabled={deleteProductMutation.isPending}
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
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {!showForm && (
              <Button
                onClick={() => {
                  resetCategoryForm();
                  setShowForm(true);
                }}
                className="bg-primary-yellow text-dark-text hover:bg-accent-yellow"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'إضافة فئة جديدة' : 'Add New Category'}
              </Button>
            )}

            {showForm && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-dark-text">
                  {editingId ? (language === 'ar' ? 'تعديل الفئة' : 'Edit Category') : (language === 'ar' ? 'إضافة فئة جديدة' : 'Add New Category')}
                </h2>

                <form onSubmit={handleCategorySubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder={language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}
                      value={categoryForm.nameAr}
                      onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                      required
                    />
                    <Input
                      placeholder={language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}
                      value={categoryForm.nameEn}
                      onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                      required
                    />
                  </div>

                  <Input
                    placeholder="Slug"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    required
                  />

                  <Input
                    type="number"
                    placeholder={language === 'ar' ? 'ترتيب العرض' : 'Display Order'}
                    value={categoryForm.order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, order: e.target.value })}
                  />

                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-border rounded-lg p-4">
                    <label className="flex items-center justify-center cursor-pointer">
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'اضغط لتحميل الصورة' : 'Click to upload image'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'category')}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    {imagePreview && (
                      <div className="mt-4">
                        <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                      </div>
                    )}
                  </div>

                  <textarea
                    placeholder={language === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'}
                    value={categoryForm.descriptionAr}
                    onChange={(e) => setCategoryForm({ ...categoryForm, descriptionAr: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg"
                  />

                  <textarea
                    placeholder={language === 'ar' ? 'الوصف بالإنجليزية' : 'English Description'}
                    value={categoryForm.descriptionEn}
                    onChange={(e) => setCategoryForm({ ...categoryForm, descriptionEn: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg"
                  />

                  <div className="flex gap-4 justify-end">
                    <Button variant="outline" onClick={resetCategoryForm}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary-yellow text-dark-text hover:bg-accent-yellow"
                      disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                    >
                      {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
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

            {/* Categories with Products */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categoriesLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-yellow" />
                </div>
              ) : categories.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  {language === 'ar' ? 'لا توجد فئات' : 'No categories'}
                </div>
              ) : (
                categories.map((category: any) => (
                  <div key={category.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {category.image && (
                      <img src={category.image} alt={category.nameAr} className="w-full h-40 object-cover" />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-dark-text mb-2">
                        {language === 'ar' ? category.nameAr : category.nameEn}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {language === 'ar' ? category.descriptionAr : category.descriptionEn}
                      </p>

                      {/* Products in Category */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">
                          {language === 'ar' ? 'المنتجات' : 'Products'}:
                        </h4>
                        <div className="space-y-2">
                          {products
                            .filter((p: any) => p.categoryId === category.id)
                            .slice(0, 3)
                            .map((product: any) => (
                              <div key={product.id} className="text-xs bg-gray-50 p-2 rounded">
                                {language === 'ar' ? product.nameAr : product.nameEn}
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCategoryForm({
                              nameAr: category.nameAr,
                              nameEn: category.nameEn,
                              descriptionAr: category.descriptionAr || '',
                              descriptionEn: category.descriptionEn || '',
                              image: category.image || '',
                              slug: category.slug,
                              order: (category.order || 0).toString(),
                            });
                            setImagePreview(category.image || '');
                            setEditingId(category.id);
                            setShowForm(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) {
                              deleteCategoryMutation.mutate({ id: category.id });
                            }
                          }}
                          disabled={deleteCategoryMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            {!showForm && (
              <Button
                onClick={() => {
                  resetBannerForm();
                  setShowForm(true);
                }}
                className="bg-primary-yellow text-dark-text hover:bg-accent-yellow"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'إضافة بانر جديد' : 'Add New Banner'}
              </Button>
            )}

            {showForm && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-dark-text">
                  {editingId ? (language === 'ar' ? 'تعديل البانر' : 'Edit Banner') : (language === 'ar' ? 'إضافة بانر جديد' : 'Add New Banner')}
                </h2>

                <form onSubmit={handleBannerSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder={language === 'ar' ? 'العنوان بالعربية' : 'Arabic Title'}
                      value={bannerForm.titleAr}
                      onChange={(e) => setBannerForm({ ...bannerForm, titleAr: e.target.value })}
                      required
                    />
                    <Input
                      placeholder={language === 'ar' ? 'العنوان بالإنجليزية' : 'English Title'}
                      value={bannerForm.titleEn}
                      onChange={(e) => setBannerForm({ ...bannerForm, titleEn: e.target.value })}
                      required
                    />
                  </div>

                  <Input
                    placeholder={language === 'ar' ? 'الرابط' : 'Link (optional)'}
                    value={bannerForm.link}
                    onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                  />

                  <Input
                    type="number"
                    placeholder={language === 'ar' ? 'ترتيب العرض' : 'Display Order'}
                    value={bannerForm.order}
                    onChange={(e) => setBannerForm({ ...bannerForm, order: e.target.value })}
                  />

                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-border rounded-lg p-4">
                    <label className="flex items-center justify-center cursor-pointer">
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'اضغط لتحميل الصورة' : 'Click to upload image'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'banner')}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                    {imagePreview && (
                      <div className="mt-4">
                        <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded" />
                      </div>
                    )}
                  </div>

                  <textarea
                    placeholder={language === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'}
                    value={bannerForm.descriptionAr}
                    onChange={(e) => setBannerForm({ ...bannerForm, descriptionAr: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg"
                  />

                  <textarea
                    placeholder={language === 'ar' ? 'الوصف بالإنجليزية' : 'English Description'}
                    value={bannerForm.descriptionEn}
                    onChange={(e) => setBannerForm({ ...bannerForm, descriptionEn: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg"
                  />

                  <div className="flex gap-4 justify-end">
                    <Button variant="outline" onClick={resetBannerForm}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary-yellow text-dark-text hover:bg-accent-yellow"
                      disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
                    >
                      {createBannerMutation.isPending || updateBannerMutation.isPending ? (
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

            {/* Banners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bannersLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-yellow" />
                </div>
              ) : banners.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  {language === 'ar' ? 'لا توجد بانرات' : 'No banners'}
                </div>
              ) : (
                banners.map((banner: any) => (
                  <div key={banner.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {banner.image && (
                      <img src={banner.image} alt={banner.titleAr} className="w-full h-40 object-cover" />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-dark-text mb-2">
                        {language === 'ar' ? banner.titleAr : banner.titleEn}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {language === 'ar' ? banner.descriptionAr : banner.descriptionEn}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setBannerForm({
                              titleAr: banner.titleAr,
                              titleEn: banner.titleEn,
                              descriptionAr: banner.descriptionAr || '',
                              descriptionEn: banner.descriptionEn || '',
                              image: banner.image || '',
                              link: banner.link || '',
                              order: (banner.order || 0).toString(),
                            });
                            setImagePreview(banner.image || '');
                            setEditingId(banner.id);
                            setShowForm(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) {
                              deleteBannerMutation.mutate({ id: banner.id });
                            }
                          }}
                          disabled={deleteBannerMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-dark-text">
                {language === 'ar' ? 'الطلبات' : 'Orders'} ({orders.length})
              </h2>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-yellow" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'ar' ? 'لا توجد طلبات' : 'No orders'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">{language === 'ar' ? 'رقم الطلب' : 'Order #'}</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">{language === 'ar' ? 'الإجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: any) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-sm">{order.totalAmount} KWD</td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={order.status}
                            onChange={(e) => {
                              updateOrderStatusMutation.mutate({
                                id: order.id,
                                status: e.target.value as any,
                              });
                            }}
                            className="px-3 py-1 border border-border rounded text-sm"
                          >
                            <option value="pending">{language === 'ar' ? 'معلق' : 'Pending'}</option>
                            <option value="confirmed">{language === 'ar' ? 'مؤكد' : 'Confirmed'}</option>
                            <option value="shipped">{language === 'ar' ? 'مشحون' : 'Shipped'}</option>
                            <option value="delivered">{language === 'ar' ? 'مسلم' : 'Delivered'}</option>
                            <option value="cancelled">{language === 'ar' ? 'ملغى' : 'Cancelled'}</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              alert(`${language === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}: ${order.shippingAddress}`);
                            }}
                          >
                            {language === 'ar' ? 'التفاصيل' : 'Details'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
