import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit2, Trash2, LogOut, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

type Tab = 'products' | 'categories' | 'banners' | 'orders';

export default function AdminDashboardWithDB() {
  const { language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch data from database
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = trpc.products.list.useQuery();
  const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = trpc.categories.list.useQuery();
  const { data: banners = [], isLoading: bannersLoading, refetch: refetchBanners } = trpc.banners.list.useQuery();
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = trpc.orders.list.useQuery();

  // Mutations
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم إضافة المنتج' : 'Product added');
      refetchProducts();
      resetProductForm();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم تحديث المنتج' : 'Product updated');
      refetchProducts();
      resetProductForm();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم حذف المنتج' : 'Product deleted');
      refetchProducts();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const createCategoryMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم إضافة الفئة' : 'Category added');
      refetchCategories();
      resetCategoryForm();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const updateCategoryMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم تحديث الفئة' : 'Category updated');
      refetchCategories();
      resetCategoryForm();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const deleteCategoryMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم حذف الفئة' : 'Category deleted');
      refetchCategories();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const createBannerMutation = trpc.banners.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم إضافة البانر' : 'Banner added');
      refetchBanners();
      resetBannerForm();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const updateBannerMutation = trpc.banners.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم تحديث البانر' : 'Banner updated');
      refetchBanners();
      resetBannerForm();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    },
  });

  const deleteBannerMutation = trpc.banners.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم حذف البانر' : 'Banner deleted');
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
    if (!token) {
      setLocation('/admin-login');
    }
  }, [setLocation]);

  // Form states
  const [productForm, setProductForm] = useState<any>({
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

  const [categoryForm, setCategoryForm] = useState<any>({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    image: '',
    slug: '',
    order: '0',
  });

  const [bannerForm, setBannerForm] = useState<any>({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    image: '',
    link: '',
    order: '0',
  });

  // Product handlers
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.nameAr || !productForm.nameEn || !productForm.price || !productForm.slug) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (editingId) {
      updateProductMutation.mutate({
        id: editingId,
        ...productForm,
        stock: parseInt(productForm.stock) || 0,
        categoryId: productForm.categoryId ? parseInt(productForm.categoryId) : undefined,
      });
    } else {
      createProductMutation.mutate({
        ...productForm,
        stock: parseInt(productForm.stock) || 0,
        categoryId: productForm.categoryId ? parseInt(productForm.categoryId) : 1,
      });
    }
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
    setEditingId(null);
    setShowForm(false);
  };

  // Category handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.nameAr || !categoryForm.nameEn || !categoryForm.slug) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (editingId) {
      updateCategoryMutation.mutate({
        id: editingId,
        ...categoryForm,
        order: parseInt(categoryForm.order) || 0,
      });
    } else {
      createCategoryMutation.mutate({
        ...categoryForm,
        order: parseInt(categoryForm.order) || 0,
      });
    }
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
    setEditingId(null);
    setShowForm(false);
  };

  // Banner handlers
  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.titleAr || !bannerForm.titleEn) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (editingId) {
      updateBannerMutation.mutate({
        id: editingId,
        ...bannerForm,
        order: parseInt(bannerForm.order) || 0,
      });
    } else {
      createBannerMutation.mutate({
        ...bannerForm,
        order: parseInt(bannerForm.order) || 0,
      });
    }
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
    setEditingId(null);
    setShowForm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success(language === 'ar' ? 'تم تسجيل الخروج' : 'Logged out successfully');
    setLocation('/admin-login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-primary-yellow shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-dark-text">{language === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1 bg-white rounded text-dark-text font-semibold"
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </button>
            <Button onClick={handleLogout} variant="destructive" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'خروج' : 'Logout'}
            </Button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['products', 'categories', 'banners', 'orders'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setShowForm(false);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? 'bg-primary-yellow text-dark-text'
                  : 'bg-card text-foreground hover:bg-accent-yellow'
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
                {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
              </Button>
            )}

            {showForm && (
              <div className="bg-card rounded-lg shadow-lg p-6">
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder={language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}
                      value={productForm.nameAr}
                      onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })}
                    />
                    <Input
                      placeholder={language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}
                      value={productForm.nameEn}
                      onChange={(e) => setProductForm({ ...productForm, nameEn: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={language === 'ar' ? 'السعر' : 'Price'}
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
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
                    />
                    <select
                      value={productForm.categoryId}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      className="px-4 py-2 border border-border rounded-lg"
                    >
                      <option value="">{language === 'ar' ? 'اختر الفئة' : 'Select Category'}</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {language === 'ar' ? cat.nameAr : cat.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-primary-yellow text-dark-text hover:bg-accent-yellow" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                      {createProductMutation.isPending || updateProductMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                      ) : (
                        language === 'ar' ? 'حفظ' : 'Save'
                      )}
                    </Button>
                    <Button type="button" onClick={resetProductForm} variant="outline">
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {productsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product: any) => (
                  <div key={product.id} className="bg-card rounded-lg shadow p-4">
                    {product.image && <img src={product.image} alt={product.nameAr} className="w-full h-40 object-cover rounded mb-2" />}
                    <h3 className="font-bold text-lg">{language === 'ar' ? product.nameAr : product.nameEn}</h3>
                    <p className="text-sm text-muted-foreground">{product.price} KWD</p>
                    <p className="text-sm">Stock: {product.stock}</p>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => {
                        setProductForm(product);
                        setEditingId(product.id);
                        setShowForm(true);
                      }}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteProductMutation.mutate({ id: product.id })}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                {language === 'ar' ? 'إضافة فئة' : 'Add Category'}
              </Button>
            )}

            {showForm && (
              <div className="bg-card rounded-lg shadow-lg p-6">
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder={language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}
                      value={categoryForm.nameAr}
                      onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                    />
                    <Input
                      placeholder={language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}
                      value={categoryForm.nameEn}
                      onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                    />
                  </div>

                  <Input
                    placeholder="Slug"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  />

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-primary-yellow text-dark-text hover:bg-accent-yellow" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                      {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                      ) : (
                        language === 'ar' ? 'حفظ' : 'Save'
                      )}
                    </Button>
                    <Button type="button" onClick={resetCategoryForm} variant="outline">
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {categoriesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category: any) => (
                  <div key={category.id} className="bg-card rounded-lg shadow p-4">
                    {category.image && <img src={category.image} alt={category.nameAr} className="w-full h-40 object-cover rounded mb-2" />}
                    <h3 className="font-bold text-lg">{language === 'ar' ? category.nameAr : category.nameEn}</h3>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => {
                        setCategoryForm(category);
                        setEditingId(category.id);
                        setShowForm(true);
                      }}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteCategoryMutation.mutate({ id: category.id })}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                {language === 'ar' ? 'إضافة بانر' : 'Add Banner'}
              </Button>
            )}

            {showForm && (
              <div className="bg-card rounded-lg shadow-lg p-6">
                <form onSubmit={handleAddBanner} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder={language === 'ar' ? 'العنوان بالعربية' : 'Arabic Title'}
                      value={bannerForm.titleAr}
                      onChange={(e) => setBannerForm({ ...bannerForm, titleAr: e.target.value })}
                    />
                    <Input
                      placeholder={language === 'ar' ? 'العنوان بالإنجليزية' : 'English Title'}
                      value={bannerForm.titleEn}
                      onChange={(e) => setBannerForm({ ...bannerForm, titleEn: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-primary-yellow text-dark-text hover:bg-accent-yellow" disabled={createBannerMutation.isPending || updateBannerMutation.isPending}>
                      {createBannerMutation.isPending || updateBannerMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                      ) : (
                        language === 'ar' ? 'حفظ' : 'Save'
                      )}
                    </Button>
                    <Button type="button" onClick={resetBannerForm} variant="outline">
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {bannersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((banner: any) => (
                  <div key={banner.id} className="bg-card rounded-lg shadow p-4">
                    {banner.image && <img src={banner.image} alt={banner.titleAr} className="w-full h-40 object-cover rounded mb-2" />}
                    <h3 className="font-bold text-lg">{language === 'ar' ? banner.titleAr : banner.titleEn}</h3>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => {
                        setBannerForm(banner);
                        setEditingId(banner.id);
                        setShowForm(true);
                      }}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteBannerMutation.mutate({ id: banner.id })}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-yellow">
                    <tr>
                      <th className="px-4 py-2 text-left">{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                      <th className="px-4 py-2 text-left">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                      <th className="px-4 py-2 text-left">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="px-4 py-2 text-left">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                      <th className="px-4 py-2 text-left">{language === 'ar' ? 'إجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order: any) => (
                      <tr key={order.id} className="border-b">
                        <td className="px-4 py-2">{order.id}</td>
                        <td className="px-4 py-2">{order.totalAmount} KWD</td>
                        <td className="px-4 py-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatusMutation.mutate({ id: order.id, status: e.target.value as 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' })}
                            className="px-2 py-1 border border-border rounded"
                          >
                            <option value="pending">{language === 'ar' ? 'معلق' : 'Pending'}</option>
                            <option value="confirmed">{language === 'ar' ? 'مؤكد' : 'Confirmed'}</option>
                            <option value="shipped">{language === 'ar' ? 'مشحون' : 'Shipped'}</option>
                            <option value="delivered">{language === 'ar' ? 'مسلم' : 'Delivered'}</option>
                            <option value="cancelled">{language === 'ar' ? 'ملغى' : 'Cancelled'}</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <Button size="sm" variant="outline">
                            {language === 'ar' ? 'عرض' : 'View'}
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
