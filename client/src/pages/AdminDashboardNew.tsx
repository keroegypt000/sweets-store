import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit2, Trash2, LogOut, Menu, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type Tab = 'products' | 'categories';

interface AdminUser {
  id: number;
  username: string;
  role: string;
}

export default function AdminDashboardNew() {
  const { language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Fetch data
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = trpc.products.list.useQuery();
  const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = trpc.categories.allCategories.useQuery();

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
      price: parseFloat(productForm.price).toString(),
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
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => {
              setActiveTab('products');
              setShowForm(false);
            }}
            className={`pb-4 px-4 font-semibold transition ${
              activeTab === 'products'
                ? 'text-primary-yellow border-b-2 border-primary-yellow'
                : 'text-muted-foreground hover:text-dark-text'
            }`}
          >
            {language === 'ar' ? 'المنتجات' : 'Products'}
          </button>
          <button
            onClick={() => {
              setActiveTab('categories');
              setShowForm(false);
            }}
            className={`pb-4 px-4 font-semibold transition ${
              activeTab === 'categories'
                ? 'text-primary-yellow border-b-2 border-primary-yellow'
                : 'text-muted-foreground hover:text-dark-text'
            }`}
          >
            {language === 'ar' ? 'الفئات' : 'Categories'}
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Add Product Button */}
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

            {/* Product Form */}
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

                  <Input
                    placeholder="Slug"
                    value={productForm.slug}
                    onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                    required
                  />

                  <Input
                    placeholder={language === 'ar' ? 'رابط الصورة' : 'Image URL'}
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  />

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
            {/* Add Category Button */}
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

            {/* Category Form */}
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

                  <Input
                    placeholder={language === 'ar' ? 'رابط الصورة' : 'Image URL'}
                    value={categoryForm.image}
                    onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  />

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

            {/* Categories List */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold text-dark-text">
                  {language === 'ar' ? 'قائمة الفئات' : 'Categories List'} ({categories.length})
                </h2>
              </div>

              {categoriesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-yellow" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {language === 'ar' ? 'لا توجد فئات' : 'No categories'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium">{language === 'ar' ? 'الاسم' : 'Name'}</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">{language === 'ar' ? 'الترتيب' : 'Order'}</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category: any) => (
                        <tr key={category.id} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm">{language === 'ar' ? category.nameAr : category.nameEn}</td>
                          <td className="px-6 py-4 text-sm">{category.order || 0}</td>
                          <td className="px-6 py-4 text-sm space-x-2">
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
      </div>
    </div>
  );
}
