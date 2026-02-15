'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit2, Trash2, LogOut, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { CategoryEditModal } from '@/components/admin/CategoryEditModal';


type Tab = 'products' | 'categories' | 'banners' | 'orders';

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

interface Banner {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image?: string;
  link?: string;
  order: number;
}

interface Order {
  id: number;
  totalAmount: string;
  status: string;
  shippingAddress: string;
  createdAt: string;
}

const translations = {
  ar: {
    dashboard: 'لوحة التحكم',
    products: 'المنتجات',
    categories: 'الفئات',
    banners: 'البانرات',
    orders: 'الطلبات',
    logout: 'تسجيل الخروج',
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    name: 'الاسم',
    nameAr: 'الاسم بالعربية',
    nameEn: 'الاسم بالإنجليزية',
    description: 'الوصف',
    descriptionAr: 'الوصف بالعربية',
    descriptionEn: 'الوصف بالإنجليزية',
    price: 'السعر',
    stock: 'المخزون',
    image: 'الصورة',
    slug: 'الرابط',
    category: 'الفئة',
    title: 'العنوان',
    titleAr: 'العنوان بالعربية',
    titleEn: 'العنوان بالإنجليزية',
    link: 'الرابط',
    order: 'الترتيب',
    status: 'الحالة',
    total: 'الإجمالي',
    address: 'العنوان',
    noData: 'لا توجد بيانات',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
  },
  en: {
    dashboard: 'Dashboard',
    products: 'Products',
    categories: 'Categories',
    banners: 'Banners',
    orders: 'Orders',
    logout: 'Logout',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    name: 'Name',
    nameAr: 'Name (Arabic)',
    nameEn: 'Name (English)',
    description: 'Description',
    descriptionAr: 'Description (Arabic)',
    descriptionEn: 'Description (English)',
    price: 'Price',
    stock: 'Stock',
    image: 'Image',
    slug: 'Slug',
    category: 'Category',
    title: 'Title',
    titleAr: 'Title (Arabic)',
    titleEn: 'Title (English)',
    link: 'Link',
    order: 'Order',
    status: 'Status',
    total: 'Total',
    address: 'Address',
    noData: 'No data',
    loading: 'Loading...',
    error: 'Error occurred',
    success: 'Success',
    confirmDelete: 'Are you sure?',
  },
};

const API_BASE = '/api/admin';

export default function AdminDashboardAPI() {
  const { language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const t = translations[language as keyof typeof translations];

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, bannersRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/categories`),
        fetch(`${API_BASE}/banners`),
        fetch(`${API_BASE}/orders`),
      ]);

      if (productsRes.ok) setProducts(await productsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (bannersRes.ok) setBanners(await bannersRes.json());
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

  // Product handlers
  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      if (response.ok) {
        toast.success(t.success);
        setShowForm(false);
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
  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success(t.success);
        setShowForm(false);
        setFormData({});
        fetchAllData();
      } else {
        toast.error(t.error);
      }
    } catch (error) {
      toast.error(t.error);
      console.error('Add error:', error);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const response = await fetch(`${API_BASE}/categories/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success(t.success);
        setShowForm(false);
        setEditingId(null);
        setFormData({});
        fetchAllData();
      } else {
        toast.error(t.error);
      }
    } catch (error) {
      toast.error(t.error);
      console.error('Update error:', error);
    }
  };

  const handleSaveCategory = async (category: Category) => {
    try {
      const response = await fetch('/api/trpc/categories.update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json: {
            id: category.id,
            nameAr: category.nameAr,
            nameEn: category.nameEn,
            descriptionAr: category.descriptionAr,
            descriptionEn: category.descriptionEn,
            image: category.image,
            slug: category.slug,
            order: category.order,
          },
        }),
      });
      if (response.ok) {
        fetchAllData();
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      const response = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success(t.success);
        fetchAllData();
      }
    } catch (error) {
      toast.error(t.error);
    }
  };

  // Banner handlers
  const handleAddBanner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const response = await fetch(`${API_BASE}/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      if (response.ok) {
        toast.success(t.success);
        setShowForm(false);
        fetchAllData();
      }
    } catch (error) {
      toast.error(t.error);
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      const response = await fetch(`${API_BASE}/banners/${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success(t.success);
        fetchAllData();
      }
    } catch (error) {
      toast.error(t.error);
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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setLocation('/admin-login');
  };

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
      <header className="bg-white shadow">
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
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 flex gap-4">
          {(['products', 'categories', 'banners', 'orders'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t.products}</h2>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus size={16} className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                {t.add}
              </Button>
            </div>

            {showForm && (
              <form onSubmit={handleAddProduct} className="bg-white p-4 rounded-lg mb-4 space-y-3">
                <Input name="nameAr" placeholder={t.nameAr} required />
                <Input name="nameEn" placeholder={t.nameEn} required />
                <Input name="descriptionAr" placeholder={t.descriptionAr} />
                <Input name="descriptionEn" placeholder={t.descriptionEn} />
                <Input name="price" type="number" placeholder={t.price} required />
                <Input name="stock" type="number" placeholder={t.stock} required />
                <Input name="image" placeholder={t.image} />
                <Input name="slug" placeholder={t.slug} required />
                <select name="categoryId" className="w-full border rounded px-3 py-2">
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {language === 'ar' ? cat.nameAr : cat.nameEn}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button type="submit">{t.save}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    {t.cancel}
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {products.length === 0 ? (
                <p className="text-gray-500">{t.noData}</p>
              ) : (
                products.map(product => (
                  <div key={product.id} className="bg-white p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{language === 'ar' ? product.nameAr : product.nameEn}</h3>
                      <p className="text-sm text-gray-600">{product.price} KWD</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(product.id)}
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

        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t.categories}</h2>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus size={16} className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                {t.add}
              </Button>
            </div>

            {showForm && (
              <form onSubmit={editingId ? handleUpdateCategory : handleAddCategory} className="bg-white p-4 rounded-lg mb-4 space-y-3">
                <Input 
                  name="nameAr" 
                  placeholder={t.nameAr} 
                  value={editingId ? (formData.nameAr || categories.find(c => c.id === editingId)?.nameAr || '') : (formData.nameAr || '')}
                  onChange={(e) => setFormData({...formData, nameAr: e.target.value})}
                  required 
                />
                <Input 
                  name="nameEn" 
                  placeholder={t.nameEn} 
                  value={editingId ? (formData.nameEn || categories.find(c => c.id === editingId)?.nameEn || '') : (formData.nameEn || '')}
                  onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                  required 
                />
                <Input 
                  name="descriptionAr" 
                  placeholder={t.descriptionAr} 
                  value={editingId ? (formData.descriptionAr || categories.find(c => c.id === editingId)?.descriptionAr || '') : (formData.descriptionAr || '')}
                  onChange={(e) => setFormData({...formData, descriptionAr: e.target.value})}
                />
                <Input 
                  name="descriptionEn" 
                  placeholder={t.descriptionEn} 
                  value={editingId ? (formData.descriptionEn || categories.find(c => c.id === editingId)?.descriptionEn || '') : (formData.descriptionEn || '')}
                  onChange={(e) => setFormData({...formData, descriptionEn: e.target.value})}
                />
                <Input 
                  name="image" 
                  placeholder={t.image} 
                  value={editingId ? (formData.image || categories.find(c => c.id === editingId)?.image || '') : (formData.image || '')}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
                <Input 
                  name="slug" 
                  placeholder={t.slug} 
                  value={editingId ? (formData.slug || categories.find(c => c.id === editingId)?.slug || '') : (formData.slug || '')}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  required 
                />
                <Input 
                  name="order" 
                  type="number" 
                  placeholder={t.order} 
                  value={editingId ? (formData.order || categories.find(c => c.id === editingId)?.order || 0) : (formData.order || 0)}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                />
                <div className="flex gap-2">
                  <Button type="submit">{editingId ? t.edit : t.add}</Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({});
                  }}>
                    {t.cancel}
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-gray-500">{t.noData}</p>
              ) : (
                categories.map(category => (
                  <div key={category.id} className="bg-white p-4 rounded-lg flex justify-between items-center">
                    <h3 className="font-bold">{language === 'ar' ? category.nameAr : category.nameEn}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category);
                          setShowCategoryModal(true);
                        }}
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

        {activeTab === 'banners' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t.banners}</h2>
              <Button onClick={() => setShowForm(!showForm)}>
                <Plus size={16} className={language === 'ar' ? 'ml-2' : 'mr-2'} />
                {t.add}
              </Button>
            </div>

            {showForm && (
              <form onSubmit={handleAddBanner} className="bg-white p-4 rounded-lg mb-4 space-y-3">
                <Input name="titleAr" placeholder={t.titleAr} required />
                <Input name="titleEn" placeholder={t.titleEn} required />
                <Input name="descriptionAr" placeholder={t.descriptionAr} />
                <Input name="descriptionEn" placeholder={t.descriptionEn} />
                <Input name="image" placeholder={t.image} />
                <Input name="link" placeholder={t.link} />
                <Input name="order" type="number" placeholder={t.order} defaultValue="0" />
                <div className="flex gap-2">
                  <Button type="submit">{t.save}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    {t.cancel}
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {banners.length === 0 ? (
                <p className="text-gray-500">{t.noData}</p>
              ) : (
                banners.map(banner => (
                  <div key={banner.id} className="bg-white p-4 rounded-lg flex justify-between items-center">
                    <h3 className="font-bold">{language === 'ar' ? banner.titleAr : banner.titleEn}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(banner.id)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBanner(banner.id)}
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

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-bold mb-4">{t.orders}</h2>
            <div className="space-y-2">
              {orders.length === 0 ? (
                <p className="text-gray-500">{t.noData}</p>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">{order.totalAmount} KWD</p>
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="border rounded px-3 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <CategoryEditModal
        isOpen={showCategoryModal}
        category={editingCategory}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
      />
    </div>
  );
}
