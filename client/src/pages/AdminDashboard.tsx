import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { language, t } = useLanguage();
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      setLocation('/');
    }
  }, [user, loading, setLocation]);

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
        <h1 className="text-3xl font-bold text-dark-text mb-8">
          {language === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Products Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-dark-text">
                {language === 'ar' ? 'المنتجات' : 'Products'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary-yellow mb-4">0</p>
              <Button
                onClick={() => setLocation('/admin/products')}
                className="w-full bg-primary-yellow text-dark-text hover:bg-accent-yellow"
              >
                {language === 'ar' ? 'إدارة المنتجات' : 'Manage Products'}
              </Button>
            </CardContent>
          </Card>

          {/* Categories Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-dark-text">
                {language === 'ar' ? 'الفئات' : 'Categories'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary-yellow mb-4">33</p>
              <Button
                onClick={() => setLocation('/admin/categories')}
                className="w-full bg-primary-yellow text-dark-text hover:bg-accent-yellow"
              >
                {language === 'ar' ? 'إدارة الفئات' : 'Manage Categories'}
              </Button>
            </CardContent>
          </Card>

          {/* Orders Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-dark-text">
                {language === 'ar' ? 'الطلبات' : 'Orders'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary-yellow mb-4">0</p>
              <Button
                onClick={() => setLocation('/admin/orders')}
                className="w-full bg-primary-yellow text-dark-text hover:bg-accent-yellow"
              >
                {language === 'ar' ? 'عرض الطلبات' : 'View Orders'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Message */}
        <Card>
          <CardHeader>
            <CardTitle className="text-dark-text">
              {language === 'ar' ? 'ملاحظة' : 'Note'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {language === 'ar'
                ? 'صفحات الإدارة المتقدمة قيد التطوير. يمكنك إدارة المنتجات والفئات من خلال قاعدة البيانات.'
                : 'Advanced admin pages are under development. You can manage products and categories through the database.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
