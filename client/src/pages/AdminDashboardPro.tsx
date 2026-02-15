import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Plus, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import OrdersManagement from './OrdersManagement';
import ImageManagement from './ImageManagement';
import { OrderNotificationProvider } from '@/contexts/OrderNotificationContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: string;
  stock: string;
  image: string;
  slug: string;
  categoryId: string;
  barcode: string;
  sku: string;
  discount: string;
}

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image: string;
  slug: string;
  order: string;
}

function AdminDashboardProContent() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'product' | 'category' | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');


  const [productForm, setProductForm] = useState<Product>({
    id: '',
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    price: '',
    stock: '',
    image: '',
    slug: '',
    categoryId: '',
    barcode: '',
    sku: '',
    discount: '',
  });

  const [categoryForm, setCategoryForm] = useState<Category>({
    id: '',
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    image: '',
    slug: '',
    order: '0',
  });

  const t = {
    products: language === 'ar' ? 'المنتجات' : 'Products',
    categories: language === 'ar' ? 'الفئات' : 'Categories',
    ordersManagement: language === 'ar' ? 'إدارة الطلبات' : 'Orders Management',
    images: language === 'ar' ? 'إدارة الصور' : 'Image Management',
    add: language === 'ar' ? 'إضافة' : 'Add',
    save: language === 'ar' ? 'حفظ' : 'Save',
    cancel: language === 'ar' ? 'إلغاء' : 'Cancel',
    delete: language === 'ar' ? 'حذف' : 'Delete',
    edit: language === 'ar' ? 'تعديل' : 'Edit',
    search: language === 'ar' ? 'بحث' : 'Search',
    nameAr: language === 'ar' ? 'الاسم بالعربية' : 'Name (Arabic)',
    nameEn: language === 'ar' ? 'الاسم بالإنجليزية' : 'Name (English)',
    descriptionAr: language === 'ar' ? 'الوصف بالعربية' : 'Description (Arabic)',
    descriptionEn: language === 'ar' ? 'الوصف بالإنجليزية' : 'Description (English)',
    price: language === 'ar' ? 'السعر' : 'Price',
    stock: language === 'ar' ? 'المخزون' : 'Stock',
    slug: language === 'ar' ? 'الرابط' : 'Slug',
    order: language === 'ar' ? 'الترتيب' : 'Order',
    selectImage: language === 'ar' ? 'اختر صورة' : 'Select Image',
    success: language === 'ar' ? 'تم بنجاح' : 'Success',
    error: language === 'ar' ? 'حدث خطأ' : 'Error',
    noData: language === 'ar' ? 'لا توجد بيانات' : 'No data',
    category: language === 'ar' ? 'الفئة' : 'Category',
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/products`),
        fetch(`/api/categories`),
      ]);
      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch data');
      }
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setFilteredProducts(productsData || []);
      setFilteredCategories(categoriesData || []);
    } catch (error) {
      console.error('Fetch error:', error);
      // Set empty arrays on error
      setProducts([]);
      setCategories([]);
      setFilteredProducts([]);
      setFilteredCategories([]);
    }
  };

  // Image compression function
  const compressImage = (base64: string, callback: (compressed: string) => void): void => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Reduce size if image is too large
      if (width > 800) {
        height = (height * 800) / width;
        width = 800;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        callback(compressed);
      }
    };
    img.src = base64;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCategory = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Check file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error(language === 'ar' ? 'حجم الصورة كبير جداً (الحد الأقصى 5MB)' : 'Image size too large (max 5MB)');
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        
        // Compress image
        compressImage(base64, (compressed) => {
          setImagePreview(compressed);
          if (isCategory) {
            setCategoryForm((prev: Category) => ({ ...prev, image: compressed }));
          } else {
            setProductForm((prev: Product) => ({ ...prev, image: compressed }));
          }
          toast.success(language === 'ar' ? 'تم تحميل الصورة' : 'Image loaded');
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(language === 'ar' ? 'خطأ في تحميل الصورة' : 'Error loading image');
      console.error('Image upload error:', error);
    }
  };

  // Product handlers
  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });
      if (response.ok) {
        toast.success(t.success);
        setShowForm(false);
        setProductForm({
          id: '',
          nameAr: '',
          nameEn: '',
          descriptionAr: '',
          descriptionEn: '',
          price: '',
          stock: '',
          image: '',
          slug: '',
          categoryId: '',
          barcode: '',
          sku: '',
          discount: '',
        });
        setImagePreview('');
        fetchAllData();
      }
    } catch (error) {
      toast.error(t.error);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Ensure image is included in the form data
      const dataToSend = {
        ...productForm,
        image: productForm.image || imagePreview,
      };

      console.log('Updating product with data:', dataToSend);

      const response = await fetch(`/api/products/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();
      console.log('Update response:', responseData);

      if (response.ok) {
        toast.success(t.success);
        setShowForm(false);
        setEditingId(null);
        setEditingType(null);
        setProductForm({
          id: '',
          nameAr: '',
          nameEn: '',
          descriptionAr: '',
          descriptionEn: '',
          price: '',
          stock: '',
          image: '',
          slug: '',
          categoryId: '',
          barcode: '',
          sku: '',
          discount: '',
        });
        setImagePreview('');
        fetchAllData();
      } else {
        toast.error(responseData?.message || t.error);
        console.error('Update failed:', responseData);
      }
    } catch (error) {
      toast.error(t.error);
      console.error('Update error:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setEditingType('product');
    setProductForm(product);
    setImagePreview(product.image || '');
    setShowForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(t.delete)) return;
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success(t.success);
        fetchAllData();
      }
    } catch (error) {
      toast.error(t.error);
    }
  };

  // Category handlers
  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });
      if (response.ok) {
        toast.success(t.success);
        setShowForm(false);
        setCategoryForm({
          id: '',
          nameAr: '',
          nameEn: '',
          descriptionAr: '',
          descriptionEn: '',
          image: '',
          slug: '',
          order: '0',
        });
        setImagePreview('');
        fetchAllData();
      }
    } catch (error) {
      toast.error(t.error);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Ensure image is included in the form data
      const dataToSend = {
        ...categoryForm,
        image: categoryForm.image || imagePreview,
      };

      console.log('Updating category with data:', dataToSend);

      const response = await fetch(`/api/categories/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();
      console.log('Update response:', responseData);

      if (response.ok) {
        toast.success(t.success);
        setShowForm(false);
        setEditingId(null);
        setEditingType(null);
        setCategoryForm({
          id: '',
          nameAr: '',
          nameEn: '',
          descriptionAr: '',
          descriptionEn: '',
          image: '',
          slug: '',
          order: '0',
        });
        setImagePreview('');
        fetchAllData();
      } else {
        toast.error(responseData?.message || t.error);
        console.error('Update failed:', responseData);
      }
    } catch (error) {
      toast.error(t.error);
      console.error('Update error:', error);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingId(category.id);
    setEditingType('category');
    setCategoryForm(category);
    setImagePreview(category.image || '');
    setShowForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm(t.delete)) return;
    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success(t.success);
        fetchAllData();
      }
    } catch (error) {
      toast.error(t.error);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (activeTab === 'products') {
      setFilteredProducts(
        products.filter(p =>
          p.nameAr.includes(term) || p.nameEn.includes(term)
        )
      );
    } else if (activeTab === 'categories') {
      setFilteredCategories(
        categories.filter(c =>
          c.nameAr.includes(term) || c.nameEn.includes(term)
        )
      );
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setEditingType(null);
    setProductForm({
      id: '',
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      price: '',
      stock: '',
      image: '',
      slug: '',
      categoryId: '',
      barcode: '',
      sku: '',
      discount: '',
    });
    setCategoryForm({
      id: '',
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      image: '',
      slug: '',
      order: '0',
    });
    setImagePreview('');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded"
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded"
            >
              {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-4">
          {[
            { id: 'products', label: t.products },
            { id: 'categories', label: t.categories },
            { id: 'ordersManagement', label: t.ordersManagement },
            { id: 'images', label: t.images },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-4 font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-yellow-400 text-yellow-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t.products}</h2>
              <Button onClick={() => {
                setShowForm(!showForm);
                setEditingType('product');
              }} size="lg">
                <Plus size={18} className="mr-2" />
                {t.add}
              </Button>
            </div>

            <div className="mb-6">
              <Input
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-md"
              />
            </div>

            {showForm && editingType === 'product' && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto shadow-lg">
                  <h3 className="text-lg font-bold mb-4">{editingId ? t.edit : t.add} {t.products}</h3>
                  <form onSubmit={editingId ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder={t.nameAr}
                        value={productForm.nameAr}
                        onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })}
                        required
                      />
                      <Input
                        placeholder={t.nameEn}
                        value={productForm.nameEn}
                        onChange={(e) => setProductForm({ ...productForm, nameEn: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <textarea
                        placeholder={t.descriptionAr}
                        value={productForm.descriptionAr || ''}
                        onChange={(e) => setProductForm({ ...productForm, descriptionAr: e.target.value })}
                        className="border rounded px-3 py-2 w-full"
                        rows={3}
                      />
                      <textarea
                        placeholder={t.descriptionEn}
                        value={productForm.descriptionEn || ''}
                        onChange={(e) => setProductForm({ ...productForm, descriptionEn: e.target.value })}
                        className="border rounded px-3 py-2 w-full"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder={t.price}
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                      />
                      <Input
                        type="number"
                        placeholder={t.stock}
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        required
                      />
                    </div>

                    <div className="border-2 border-dashed rounded px-3 py-2">
                      <label className="cursor-pointer flex items-center gap-2">
                        <Upload size={18} />
                        <span>{t.selectImage}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {imagePreview && (
                      <div className="relative w-32 h-32">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setProductForm({ ...productForm, image: '' });
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 justify-end">
                      <Button type="button" variant="outline" onClick={closeForm}>
                        {t.cancel}
                      </Button>
                      <Button type="submit">{editingId ? t.save : t.add}</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.length === 0 ? (
                <p className="text-gray-500 col-span-full">{t.noData}</p>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                    {product.image && (
                      <img src={product.image} alt={product.nameAr} className="w-full h-40 object-cover rounded mb-3" />
                    )}
                    <h3 className="font-bold text-lg">{language === 'ar' ? product.nameAr : product.nameEn}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.price} KWD</p>
                    <p className="text-sm text-gray-500 mb-3">Stock: {product.stock}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t.categories}</h2>
              <Button onClick={() => {
                setShowForm(!showForm);
                setEditingType('category');
              }} size="lg">
                <Plus size={18} className="mr-2" />
                {t.add}
              </Button>
            </div>

            <div className="mb-6">
              <Input
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-md"
              />
            </div>

            {showForm && editingType === 'category' && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto shadow-lg">
                  <h3 className="text-lg font-bold mb-4">{editingId ? t.edit : t.add} {t.categories}</h3>
                  <form onSubmit={editingId ? handleUpdateCategory : handleAddCategory} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder={t.nameAr}
                        value={categoryForm.nameAr}
                        onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                        required
                      />
                      <Input
                        placeholder={t.nameEn}
                        value={categoryForm.nameEn}
                        onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <textarea
                        placeholder={t.descriptionAr}
                        value={categoryForm.descriptionAr || ''}
                        onChange={(e) => setCategoryForm({ ...categoryForm, descriptionAr: e.target.value })}
                        className="border rounded px-3 py-2 w-full"
                        rows={3}
                      />
                      <textarea
                        placeholder={t.descriptionEn}
                        value={categoryForm.descriptionEn || ''}
                        onChange={(e) => setCategoryForm({ ...categoryForm, descriptionEn: e.target.value })}
                        className="border rounded px-3 py-2 w-full"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder={t.slug}
                        value={categoryForm.slug}
                        onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                        required
                      />
                      <Input
                        type="number"
                        placeholder={t.order}
                        value={categoryForm.order}
                        onChange={(e) => setCategoryForm({ ...categoryForm, order: e.target.value })}
                      />
                    </div>

                    <div className="border-2 border-dashed rounded px-3 py-2">
                      <label className="cursor-pointer flex items-center gap-2">
                        <Upload size={18} />
                        <span>{t.selectImage}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {imagePreview && (
                      <div className="relative w-32 h-32">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setCategoryForm({ ...categoryForm, image: '' });
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 justify-end">
                      <Button type="button" variant="outline" onClick={closeForm}>
                        {t.cancel}
                      </Button>
                      <Button type="submit">{editingId ? t.save : t.add}</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.length === 0 ? (
                <p className="text-gray-500 col-span-full">{t.noData}</p>
              ) : (
                filteredCategories.map(category => (
                  <div key={category.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
                    {category.image && (
                      <img src={category.image} alt={category.nameAr} className="w-full h-40 object-cover rounded mb-3" />
                    )}
                    <h3 className="font-bold text-lg">{language === 'ar' ? category.nameAr : category.nameEn}</h3>
                    <p className="text-sm text-gray-600 mb-3">{language === 'ar' ? category.descriptionAr : category.descriptionEn}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ORDERS MANAGEMENT TAB */}
        {activeTab === 'ordersManagement' && (
          <OrdersManagement />
        )}

        {/* BANNERS TAB */}
        {activeTab === 'images' && (
          <ImageManagement />
        )}
      </main>
    </div>
  );
}

export default function AdminDashboardPro() {
  return (
    <OrderNotificationProvider>
      <AdminDashboardProContent />
    </OrderNotificationProvider>
  );
}
