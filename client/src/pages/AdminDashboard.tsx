import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';


type Tab = 'products' | 'categories' | 'orders';

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('products');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      setLocation('/');
    }
  }, [user, loading, setLocation]);

  // Fetch data
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = trpc.products.list.useQuery();
  const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = trpc.categories.list.useQuery();
  const { data: orders = [], isLoading: ordersLoading } = trpc.orders.list.useQuery();



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

  const renderProductsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold cursor-pointer hover:text-primary-yellow transition" onClick={() => setLocation('/admin/products')}>
          {language === 'ar' ? 'المنتجات' : 'Products'} ({products.length})
        </h2>
        <Button onClick={() => setLocation('/admin/products')} className="bg-primary-yellow text-dark-text hover:bg-accent-yellow">
          <Plus className="w-4 h-4 mr-2" />
          {language === 'ar' ? 'إدارة المنتجات' : 'Manage Products'}
        </Button>
      </div>

      {productsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {language === 'ar' ? 'لا توجد منتجات' : 'No products'}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 text-left">{language === 'ar' ? 'الاسم' : 'Name'}</th>
                <th className="p-3 text-left">{language === 'ar' ? 'السعر' : 'Price'}</th>
                <th className="p-3 text-left">{language === 'ar' ? 'المخزون' : 'Stock'}</th>
                <th className="p-3 text-left">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{language === 'ar' ? product.nameAr : product.nameEn}</td>
                  <td className="p-3">{product.price} KWD</td>
                  <td className="p-3">{product.stock || 0}</td>
                  <td className="p-3 space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setLocation(`/admin/products/${product.id}`)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" disabled>
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
  );

  const renderCategoriesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{language === 'ar' ? 'الفئات' : 'Categories'} ({categories.length})</h2>
        <Button onClick={() => setLocation('/admin/categories')} className="bg-primary-yellow text-dark-text hover:bg-accent-yellow">
          <Plus className="w-4 h-4 mr-2" />
          {language === 'ar' ? 'إضافة فئة' : 'Add Category'}
        </Button>
      </div>

      {categoriesLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {language === 'ar' ? 'لا توجد فئات' : 'No categories'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4 hover:shadow-lg transition bg-white">
              {category.image && (
                <img src={category.image} alt={language === 'ar' ? category.nameAr : category.nameEn} className="w-full h-32 object-cover rounded mb-2" />
              )}
              <h3 className="font-bold mb-2 text-dark-text">{language === 'ar' ? category.nameAr : category.nameEn}</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setLocation(`/admin/categories/${category.id}`)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" disabled>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOrdersTab = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{language === 'ar' ? 'الطلبات' : 'Orders'} ({orders.length})</h2>

      {ordersLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {language === 'ar' ? 'لا توجد طلبات' : 'No orders'}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 text-left">{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                <th className="p-3 text-left">{language === 'ar' ? 'المجموع' : 'Total'}</th>
                <th className="p-3 text-left">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="p-3 text-left">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">#{order.orderNumber}</td>
                  <td className="p-3">{order.totalAmount} KWD</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-light-bg">
      <Header />
      
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8 text-dark-text">{language === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-bold transition ${
              activeTab === 'products'
                ? 'text-primary-yellow border-b-2 border-primary-yellow'
                : 'text-muted-foreground hover:text-dark-text'
            }`}
          >
            {language === 'ar' ? 'المنتجات' : 'Products'}
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 font-bold transition ${
              activeTab === 'categories'
                ? 'text-primary-yellow border-b-2 border-primary-yellow'
                : 'text-muted-foreground hover:text-dark-text'
            }`}
          >
            {language === 'ar' ? 'الفئات' : 'Categories'}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-bold transition ${
              activeTab === 'orders'
                ? 'text-primary-yellow border-b-2 border-primary-yellow'
                : 'text-muted-foreground hover:text-dark-text'
            }`}
          >
            {language === 'ar' ? 'الطلبات' : 'Orders'}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'products' && renderProductsTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'orders' && renderOrdersTab()}
      </div>
    </div>
  );
}
