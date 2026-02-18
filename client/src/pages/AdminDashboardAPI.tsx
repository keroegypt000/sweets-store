'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit2, Trash2, LogOut, Search, X, Upload, Eye, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import OrdersManagement from './OrdersManagement';
import BannerManagement from './BannerManagement';
import ImageManagement from './ImageManagement';

type Tab = 'products' | 'categories' | 'orders' | 'banners' | 'images';

interface Product {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: string;
  stock: number;
  image?: string;
  slug: string;
  categoryId?: number;
  barcode?: string;
  discount?: number;
}

interface Category {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image?: string;
  slug: string;
  order: number;
  isActive: boolean;
}

interface Order {
  id: number;
  totalAmount: string;
  status: string;
  shippingAddress: string;
  createdAt: string;
  items?: Array<{ productId: number; quantity: number; price: string }>;
}

const translations = {
  ar: {
    dashboard: 'لوحة التحكم',
    products: 'المنتجات',
    categories: 'الفئات',
    orders: 'الطلبات',
    logout: 'تسجيل الخروج',
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    search: 'بحث',
    print: 'طباعة',
    preview: 'معاينة',
    uploadImage: 'رفع صورة',
    selectImage: 'اختر صورة',
    nameAr: 'الاسم بالعربية',
    nameEn: 'الاسم بالإنجليزية',
    descriptionAr: 'الوصف بالعربية',
    descriptionEn: 'الوصف بالإنجليزية',
    price: 'السعر',
    stock: 'المخزون',
    image: 'الصورة',
    slug: 'الرابط',
    category: 'الفئة',
    order: 'الترتيب',
    status: 'الحالة',
    total: 'الإجمالي',
    address: 'العنوان',
    noData: 'لا توجد بيانات',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    orderDetails: 'تفاصيل الطلب',
    items: 'المنتجات',
    quantity: 'الكمية',
    date: 'التاريخ',
    pending: 'معلق',
    confirmed: 'مؤكد',
    shipped: 'مشحون',
    delivered: 'مسلم',
    cancelled: 'ملغى',
    ordersManagement: 'إدارة الطلبات',
    banners: 'إدارة البنرات',
    images: 'إدارة الصور',
  },
  en: {
    dashboard: 'Dashboard',
    products: 'Products',
    categories: 'Categories',
    orders: 'Orders',
    logout: 'Logout',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    print: 'Print',
    preview: 'Preview',
    uploadImage: 'Upload Image',
    selectImage: 'Select Image',
    nameAr: 'Name (Arabic)',
    nameEn: 'Name (English)',
    descriptionAr: 'Description (Arabic)',
    descriptionEn: 'Description (English)',
    price: 'Price',
    stock: 'Stock',
    image: 'Image',
    slug: 'Slug',
    category: 'Category',
    order: 'Order',
    status: 'Status',
    total: 'Total',
    address: 'Address',
    noData: 'No data',
    loading: 'Loading...',
    error: 'Error occurred',
    success: 'Success',
    confirmDelete: 'Are you sure?',
    orderDetails: 'Order Details',
    items: 'Items',
    quantity: 'Quantity',
    date: 'Date',
    pending: 'Pending',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    ordersManagement: 'Orders Management',
    banners: 'Banner Management',
    images: 'Image Management',
  },
};

const API_BASE = '/api/admin';

export default function AdminDashboardPro() {
  const { language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<'product' | 'category' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

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
    barcode: '',
    sku: '',
    discount: '',
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

  const [imagePreview, setImagePreview] = useState<string>('');

  const t = translations[language as keyof typeof translations];

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/categories`),
        fetch(`${API_BASE}/orders`),
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
    } catch (error) {
      toast.error(t.error);
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCategory = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImagePreview(base64);
        if (isCategory) {
          setCategoryForm({ ...categoryForm, image: base64 });
        } else {
          setProductForm({ ...productForm, image: base64 });
        }
        toast.success(language === 'ar' ? 'تم تحميل الصورة' : 'Image loaded');
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
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });
      if (response.ok) {
        toast.success(t.success);
        setShowForm(false);
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

  const handleDeleteProduct = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      const response = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success(t.success);
        fetchAllData();
      }
    } catch (error) {
      toast.error(t.error);
    }
  };

  // Category handlers
  const createCategoryMutation = trpc.categories.create.useMutation();
  const updateCategoryMutation = trpc.categories.update.useMutation();
  
  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Convert image to base64 if it's a data URL
      const imageUrl = imagePreview && imagePreview.startsWith('data:') 
        ? imagePreview 
        : categoryForm.image;
      
      await createCategoryMutation.mutateAsync({
        nameAr: categoryForm.nameAr,
        nameEn: categoryForm.nameEn,
        descriptionAr: categoryForm.descriptionAr || '',
        descriptionEn: categoryForm.descriptionEn || '',
        image: imageUrl || '',
        slug: categoryForm.slug,
        order: parseInt(categoryForm.order) || 0,
      });
      
      toast.success(t.success);
      setShowForm(false);
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
      fetchAllData();
    } catch (error) {
      toast.error(t.error);
      console.error('Failed to create category:', error);
    }
  };

  const deleteCategoryMutation = trpc.categories.delete.useMutation();
  
  const handleDeleteCategory = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await deleteCategoryMutation.mutateAsync({ id });
      toast.success(t.success);
      fetchAllData();
    } catch (error) {
      toast.error(t.error);
      console.error('Failed to delete category:', error);
    }
  };

  // Order handlers
  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        toast.success(t.success);
        fetchAllData();
      }
    } catch (error) {
      toast.error(t.error);
    }
  };

  // Print thermal receipt
  const handlePrintReceipt = (order: Order) => {
    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html dir="${language === 'ar' ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <title>Order #${order.id}</title>
        <style>
          * { margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; width: 80mm; padding: 10px; }
          .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
          .order-id { font-size: 14px; font-weight: bold; }
          .date { font-size: 12px; color: #666; }
          .items { margin: 10px 0; border-bottom: 1px dashed #000; padding-bottom: 10px; }
          .item { display: flex; justify-content: space-between; font-size: 12px; margin: 5px 0; }
          .total { font-size: 14px; font-weight: bold; text-align: right; margin: 10px 0; }
          .status { text-align: center; margin: 10px 0; font-size: 12px; }
          .footer { text-align: center; font-size: 11px; margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px; }
          @media print { body { width: 80mm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="order-id">Order #${order.id}</div>
          <div class="date">${new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div class="items">
          <div style="font-weight: bold; margin-bottom: 5px;">${t.items}</div>
          <div class="item">
            <span>${t.quantity}</span>
            <span>${t.price}</span>
          </div>
        </div>
        <div class="total">
          ${t.total}: ${order.totalAmount} KWD
        </div>
        <div class="status">
          ${t.status}: ${order.status}
        </div>
        <div class="footer">
          ${t.address}: ${order.shippingAddress}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  // Edit handlers
  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setEditingType('product');
    setProductForm(product);
    setImagePreview(product.image || '');
    setShowForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingId(category.id);
    setEditingType('category');
    setCategoryForm(category);
    setImagePreview(category.image || '');
    setShowForm(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/products/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });
      if (response.ok) {
        toast.success(t.success);
        setShowForm(false);
        setEditingId(null);
        setEditingType(null);
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

  const handleUpdateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/categories/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });
      if (response.ok) {
        toast.success(t.success);
        setShowForm(false);
        setEditingId(null);
        setEditingType(null);
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
        fetchAllData();
      }
    } catch (error) {
      toast.error(t.error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setLocation('/admin-login');
  };

  // Filter data based on search
  const filteredProducts = products.filter(p =>
    p.nameAr.includes(searchQuery) ||
    p.nameEn.includes(searchQuery) ||
    p.slug.includes(searchQuery)
  );

  const filteredCategories = categories.filter(c =>
    c.nameAr.includes(searchQuery) ||
    c.nameEn.includes(searchQuery)
  );

  const filteredOrders = orders.filter(o =>
    o.id.toString().includes(searchQuery) ||
    o.status.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t.dashboard}</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut size={16} className={language === 'ar' ? 'ml-2' : 'mr-2'} />
              {t.logout}
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 flex gap-4">
          {(['products', 'categories', 'orders', 'banners', 'images'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearchQuery('');
              }}
              className={`px-4 py-2 font-medium border-b-2 ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t[tab as keyof typeof t]}
            </button>
          ))}
        </div>
      </div>



      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t.products}</h2>
              <Button onClick={() => setShowForm(!showForm)} size="lg" className={language === 'ar' ? 'flex-row-reverse' : ''}>
                <Plus size={18} className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                {t.add}
              </Button>
            </div>

            {showForm && editingType === 'product' && (
              <div className="bg-white p-6 rounded-lg mb-6 shadow">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Input
                      placeholder={t.slug}
                      value={productForm.slug}
                      onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder={language === 'ar' ? 'الباركود (داخلي)' : 'Barcode (Internal)'}
                      value={productForm.barcode || ''}
                      onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    />
                    <Input
                      placeholder={language === 'ar' ? 'SKU (خارجي)' : 'SKU (External)'}
                      value={productForm.sku || ''}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder={language === 'ar' ? 'نسبة الخصم (%)' : 'Discount (%)'}
                      value={productForm.discount || ''}
                      onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={productForm.categoryId}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      className="border rounded px-3 py-2 w-full"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {language === 'ar' ? cat.nameAr : cat.nameEn}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <div className="border-2 border-dashed rounded px-3 py-2 flex-1">
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab('images')}
                        className="whitespace-nowrap"
                      >
                        {language === 'ar' ? 'من المعرض' : 'From Gallery'}
                      </Button>
                    </div>
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

                  <div className="flex gap-2 pt-4">
                    <Button type="submit">{editingId ? t.save : t.add}</Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setEditingType(null);
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
                        barcode: '',
                        sku: '',
                        discount: '',
                      });
                      setImagePreview('');
                    }}>
                      {t.cancel}
                    </Button>
                  </div>
                </form>
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
              <Button onClick={() => setShowForm(!showForm)} size="lg" className={language === 'ar' ? 'flex-row-reverse' : ''}>
                <Plus size={18} className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                {t.add}
              </Button>
            </div>

            {showForm && editingType === 'category' && (
              <div className="bg-white p-6 rounded-lg mb-6 shadow">
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

                  <div className="flex gap-2">
                    <div className="border-2 border-dashed rounded px-3 py-2 flex-1">
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('images')}
                      className="whitespace-nowrap"
                    >
                      {language === 'ar' ? 'من المعرض' : 'From Gallery'}
                    </Button>
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

                  <div className="flex gap-2 pt-4">
                    <Button type="submit">{editingId ? t.save : t.add}</Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setEditingType(null);
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
                    }}>
                      {t.cancel}
                    </Button>
                  </div>
                </form>
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

        {/* ORDERS TAB - UNIFIED WITH ADVANCED FEATURES */}
        {activeTab === 'orders' && (
          <OrdersManagement />
        )}

        {/* BANNERS TAB */}
        {activeTab === 'banners' && (
          <BannerManagement />
        )}

        {activeTab === 'images' && (
          <ImageManagement />
        )}
      </main>
    </div>
  );
}
