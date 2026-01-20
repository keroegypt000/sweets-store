import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle2, Clock, Truck, Package } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';

export default function OrderTracking() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [orderNumber, setOrderNumber] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال رقم الطلب' : 'Please enter order number');
      return;
    }

    setIsSearching(true);
    try {
      // In a real app, you'd call an API to search for the order
      // For now, we'll just show a message
      toast.info(language === 'ar' ? 'جاري البحث عن الطلب...' : 'Searching for order...');
      setSearchedOrder(null);
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <Package className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      pending: { ar: 'قيد الانتظار', en: 'Pending' },
      confirmed: { ar: 'مؤكد', en: 'Confirmed' },
      shipped: { ar: 'تم الشحن', en: 'Shipped' },
      delivered: { ar: 'تم التسليم', en: 'Delivered' },
      cancelled: { ar: 'ملغى', en: 'Cancelled' },
    };
    return labels[status]?.[language === 'ar' ? 'ar' : 'en'] || status;
  };

  return (
    <PageLayout>

      <div className="container py-8">
        {/* Back Button */}
        <button
          onClick={() => setLocation('/')}
          className="flex items-center gap-2 text-primary-yellow hover:text-accent-yellow mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </button>

        <h1 className="text-3xl font-bold text-dark-text mb-8">
          {language === 'ar' ? 'تتبع الطلب' : 'Track Order'}
        </h1>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-dark-text">
              {language === 'ar' ? 'ابحث عن طلبك' : 'Search Your Order'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل رقم الطلب' : 'Enter order number'}
                className="flex-1 px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-primary-yellow text-dark-text hover:bg-accent-yellow"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  language === 'ar' ? 'بحث' : 'Search'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        {searchedOrder && (
          <Card>
            <CardHeader>
              <CardTitle className="text-dark-text">
                {language === 'ar' ? 'حالة الطلب' : 'Order Status'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Number */}
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'رقم الطلب:' : 'Order Number:'}
                </span>
                <span className="font-bold text-dark-text">{searchedOrder.orderNumber}</span>
              </div>

              {/* Order Date */}
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'تاريخ الطلب:' : 'Order Date:'}
                </span>
                <span className="font-bold text-dark-text">
                  {new Date(searchedOrder.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                </span>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'الحالة:' : 'Status:'}
                </span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(searchedOrder.status)}
                  <span className="font-bold text-dark-text">{getStatusLabel(searchedOrder.status)}</span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="text-muted-foreground">
                  {language === 'ar' ? 'المجموع:' : 'Total:'}
                </span>
                <span className="font-bold text-primary-yellow text-lg">
                  {parseFloat(searchedOrder.totalAmount).toFixed(2)} KWD
                </span>
              </div>

              {/* Shipping Address */}
              <div className="pb-4 border-b border-border">
                <span className="text-muted-foreground block mb-2">
                  {language === 'ar' ? 'عنوان الشحن:' : 'Shipping Address:'}
                </span>
                <span className="font-bold text-dark-text">{searchedOrder.shippingAddress}</span>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="font-bold text-dark-text">
                  {language === 'ar' ? 'خط زمني' : 'Timeline'}
                </h3>
                <div className="space-y-3">
                  {['pending', 'confirmed', 'shipped', 'delivered'].map((status, index) => (
                    <div key={status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {getStatusIcon(status)}
                        {index < 3 && <div className="w-0.5 h-8 bg-border mt-2" />}
                      </div>
                      <div className="pt-1">
                        <p className="font-bold text-dark-text">{getStatusLabel(status)}</p>
                        {searchedOrder.status === status && (
                          <p className="text-sm text-muted-foreground">
                            {language === 'ar' ? 'الحالة الحالية' : 'Current status'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!searchedOrder && !isSearching && (
          <Card className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              {language === 'ar' ? 'أدخل رقم طلبك للبحث عن حالته' : 'Enter your order number to track its status'}
            </p>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
