import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import PageLayout from '@/components/PageLayout';
import { useLocation } from 'wouter';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface OrderItem {
  productId: number;
  quantity: number;
  price: string;
  product?: {
    nameAr: string;
    nameEn: string;
    price: string;
  };
}

interface OrderData {
  totalAmount: string;
  shippingAddress: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  items: OrderItem[];
}

export default function OrderConfirmation() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [isConfirming, setIsConfirming] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get order data from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('pendingOrder');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('Loaded order data:', parsed);
        setOrderData(parsed);
      } catch (e) {
        console.error('Failed to parse pending order:', e);
        setOrderData(null);
      }
    }
    setIsLoading(false);
  }, []);

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (createdOrder) => {
      console.log('Order created successfully:', createdOrder);
      toast.success(language === 'ar' ? 'تم إنشاء الطلب بنجاح' : 'Order created successfully');
      
      // Save the created order to localStorage for receipt page with the generated order number
      if (orderData && createdOrder) {
        const orderForReceipt = {
          ...orderData,
          id: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          createdAt: new Date(),
          status: createdOrder.status || 'pending',
        };
        console.log('Saving order to localStorage:', orderForReceipt);
        localStorage.setItem('lastOrder', JSON.stringify(orderForReceipt));
      }
      
      // Clear pending order
      localStorage.removeItem('pendingOrder');
      // Redirect to receipt
      setLocation('/receipt');
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
      setIsConfirming(false);
    },
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container py-8 text-center">
          <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </PageLayout>
    );
  }

  if (!orderData || !orderData.items || orderData.items.length === 0) {
    return (
      <PageLayout>
        <div className="container py-8 text-center">
          <p className="text-red-600 mb-4">
            {language === 'ar' ? 'لا توجد بيانات طلب' : 'No order data found'}
          </p>
          <Button onClick={() => setLocation('/cart')} className="bg-primary-yellow hover:bg-accent-yellow">
            {language === 'ar' ? 'العودة للسلة' : 'Back to Cart'}
          </Button>
        </div>
      </PageLayout>
    );
  }

  const subtotal = parseFloat(orderData.totalAmount);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleConfirm = async () => {
    setIsConfirming(true);
    console.log('Confirming order with data:', orderData);
    
    // Save order data to localStorage before creating
    localStorage.setItem('lastOrder', JSON.stringify(orderData));
    
    createOrderMutation.mutate({
      totalAmount: orderData.totalAmount,
      shippingAddress: orderData.shippingAddress,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone,
      items: orderData.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  };

  const handleEdit = () => {
    // Save order data back to localStorage for Cart page
    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
    setLocation('/cart');
  };

  return (
    <PageLayout>
      <div className="container py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => setLocation('/cart')}
          className="flex items-center gap-2 text-primary-yellow hover:text-accent-yellow mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'ar' ? 'العودة للسلة' : 'Back to Cart'}
        </button>

        {/* Confirmation Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-yellow rounded-full p-3">
              <Check className="w-8 h-8 text-dark-text" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {language === 'ar' ? 'تأكيد الطلب' : 'Order Confirmation'}
          </h1>
          <p className="text-gray-600">
            {language === 'ar' ? 'يرجى مراجعة بيانات طلبك قبل التأكيد' : 'Please review your order details before confirming'}
          </p>
        </div>

        {/* Customer Information Card */}
        <Card className="mb-6 border-border">
          <CardHeader className="bg-primary-yellow/10">
            <CardTitle className="text-lg">
              {language === 'ar' ? 'بيانات العميل' : 'Customer Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-dark-text mb-2">
                  {language === 'ar' ? 'الاسم' : 'Name'}
                </label>
                <p className="text-gray-700">{orderData.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark-text mb-2">
                  {language === 'ar' ? 'الهاتف' : 'Phone'}
                </label>
                <p className="text-gray-700">{orderData.customerPhone}</p>
              </div>
              {orderData.customerEmail && (
                <div>
                  <label className="block text-sm font-semibold text-dark-text mb-2">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <p className="text-gray-700">{orderData.customerEmail}</p>
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-dark-text mb-2">
                  {language === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}
                </label>
                <p className="text-gray-700">{orderData.shippingAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items Card */}
        <Card className="mb-6 border-border">
          <CardHeader className="bg-primary-yellow/10">
            <CardTitle className="text-lg">
              {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className={`py-3 px-4 font-semibold ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'المنتج' : 'Product'}
                    </th>
                    <th className={`py-3 px-4 font-semibold ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'السعر' : 'Price'}
                    </th>
                    <th className={`py-3 px-4 font-semibold ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'الكمية' : 'Quantity'}
                    </th>
                    <th className={`py-3 px-4 font-semibold ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' ? 'الإجمالي' : 'Total'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.items.map((item, index) => (
                    <tr key={index} className="border-b border-border hover:bg-gray-50">
                      <td className={`py-3 px-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {language === 'ar' ? item.product?.nameAr : item.product?.nameEn}
                      </td>
                      <td className={`py-3 px-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {parseFloat(item.price).toFixed(2)} KWD
                      </td>
                      <td className={`py-3 px-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {item.quantity}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {(parseFloat(item.price) * item.quantity).toFixed(2)} KWD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Totals Card */}
        <Card className="mb-8 border-border">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  {language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}
                </span>
                <span className="font-semibold">{subtotal.toFixed(2)} KWD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  {language === 'ar' ? 'الضريبة (5%)' : 'Tax (5%)'}
                </span>
                <span className="font-semibold">{tax.toFixed(2)} KWD</span>
              </div>
              <div className="border-t-2 border-border pt-3 flex justify-between items-center">
                <span className="text-lg font-bold">
                  {language === 'ar' ? 'الإجمالي النهائي' : 'Total'}
                </span>
                <span className="text-2xl font-bold text-primary-yellow">{total.toFixed(2)} KWD</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleEdit}
            variant="outline"
            className="border-border hover:bg-gray-100 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            {language === 'ar' ? 'تعديل البيانات' : 'Edit Information'}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming || createOrderMutation.isPending}
            className="bg-primary-yellow hover:bg-accent-yellow text-dark-text font-semibold flex items-center gap-2"
          >
            {isConfirming || createOrderMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dark-text"></div>
                {language === 'ar' ? 'جاري التأكيد...' : 'Confirming...'}
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {language === 'ar' ? 'تأكيد الطلب' : 'Confirm Order'}
              </>
            )}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
