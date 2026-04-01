import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import PageLayout from '@/components/PageLayout';
import { useEffect, useState } from 'react';
import { formatLocationMultiLine, formatLocationFullAddress } from '@/lib/locationFormatter';

interface OrderItem {
  id: number;
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
  id: number;
  orderNumber: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: string;
  totalAmount: string;
  status: string;
  createdAt: Date;
  items?: OrderItem[];
  area?: string | null;
  block?: string | null;
  street?: string | null;
  avenue?: string | null;
  houseNumber?: string | null;
  additionalDetails?: string | null;
}

export default function Receipt() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get order from localStorage (saved from OrderConfirmation)
    const savedOrder = localStorage.getItem('lastOrder');
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder);
        console.log('Loaded order from localStorage:', order);
        setOrderData(order);
        setIsLoading(false);
        return;
      } catch (e) {
        console.error('Failed to parse saved order:', e);
      }
    }

    // If no saved order, show a placeholder
    setOrderData({
      id: 1,
      orderNumber: 'ORD-001',
      customerName: 'عميل / Customer',
      customerEmail: 'customer@example.com',
      customerPhone: '123456789',
      shippingAddress: 'عنوان الشحن / Shipping Address',
      totalAmount: '0.00',
      status: 'pending',
      createdAt: new Date(),
      items: [],
    });
    setIsLoading(false);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    // Clear order data and go back to home
    localStorage.removeItem('lastOrder');
    setLocation('/');
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container py-8 text-center">
          <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </PageLayout>
    );
  }
  
  if (!orderData) {
    return (
      <PageLayout>
        <div className="container py-8 text-center">
          <p className="text-red-600 mb-4">{language === 'ar' ? 'لا توجد بيانات طلب' : 'No order data found'}</p>
          <Button onClick={() => setLocation('/')} className="bg-primary-yellow hover:bg-accent-yellow">
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </div>
      </PageLayout>
    );
  }

  const items = orderData?.items || [];
  const subtotal = parseFloat(orderData?.totalAmount || '0');
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;
  
  console.log('Receipt orderData:', orderData);
  console.log('Receipt items:', items);

  return (
    <PageLayout>
      <div className="container py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-primary-yellow hover:text-accent-yellow mb-8 transition-colors print:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </button>

        {/* Print Button */}
        <div className="flex justify-end mb-8 print:hidden">
          <Button
            onClick={handlePrint}
            className="bg-primary-yellow text-dark-text hover:bg-accent-yellow flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            {language === 'ar' ? 'طباعة الإيصال' : 'Print Receipt'}
          </Button>
        </div>

        {/* Receipt Container */}
        <div className="bg-white text-black p-8 rounded-lg shadow-lg print:shadow-none print:rounded-none print:p-0 print:bg-white">
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
            <h1 className="text-3xl font-bold mb-2">متجر الحلويات</h1>
            <h1 className="text-3xl font-bold mb-4">Sweets Store</h1>
            <div className="space-y-1">
              <p className="text-gray-600">
                <span className="font-semibold">رقم الطلب: </span>
                <span>{orderData?.orderNumber}</span>
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Order ID: </span>
                <span>{orderData?.orderNumber}</span>
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-8 grid grid-cols-1 gap-6">
            {/* Arabic Section */}
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-bold mb-3">بيانات العميل</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">الاسم:</span>
                  <span>{orderData?.customerName || 'لم يتم تحديده'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">البريد الإلكتروني:</span>
                  <span>{orderData?.customerEmail || 'لم يتم تحديده'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">الهاتف:</span>
                  <span>{orderData?.customerPhone || 'لم يتم تحديده'}</span>
                </div>
                {/* Delivery Address */}
                <div className="flex flex-col gap-1 border-t pt-2">
                  <span className="font-semibold">عنوان التسليم:</span>
                  <div className="bg-blue-50 p-2 rounded text-right text-xs space-y-1">
                    {orderData?.area || orderData?.block || orderData?.street || orderData?.avenue || orderData?.houseNumber ? (
                      <>
                        {orderData?.area && <div><span className="font-medium">المنطقة:</span> {orderData.area}</div>}
                        {orderData?.block && <div><span className="font-medium">القطعة:</span> {orderData.block}</div>}
                        {orderData?.street && <div><span className="font-medium">الشارع:</span> {orderData.street}</div>}
                        {orderData?.avenue && <div><span className="font-medium">الجادة:</span> {orderData.avenue}</div>}
                        {orderData?.houseNumber && <div><span className="font-medium">رقم البيت:</span> {orderData.houseNumber}</div>}
                        {orderData?.additionalDetails && <div><span className="font-medium">تفاصيل إضافية:</span> {orderData.additionalDetails}</div>}
                      </>
                    ) : (
                      <span>لم يتم تحديده</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">التاريخ:</span>
                  <span>{new Date(orderData?.createdAt || new Date()).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            </div>

            {/* English Section */}
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-bold mb-3">Customer Information</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">Name:</span>
                  <span>{orderData?.customerName || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Email:</span>
                  <span>{orderData?.customerEmail || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Phone:</span>
                  <span>{orderData?.customerPhone || 'Not provided'}</span>
                </div>
                {/* Delivery Address */}
                <div className="flex flex-col gap-1 border-t pt-2">
                  <span className="font-semibold">Shipping Address:</span>
                  <div className="bg-blue-50 p-2 rounded text-xs space-y-1">
                    {orderData?.area || orderData?.block || orderData?.street || orderData?.avenue || orderData?.houseNumber ? (
                      <>
                        {orderData?.area && <div><span className="font-medium">Area:</span> {orderData.area}</div>}
                        {orderData?.block && <div><span className="font-medium">Block:</span> {orderData.block}</div>}
                        {orderData?.street && <div><span className="font-medium">Street:</span> {orderData.street}</div>}
                        {orderData?.avenue && <div><span className="font-medium">Avenue:</span> {orderData.avenue}</div>}
                        {orderData?.houseNumber && <div><span className="font-medium">House Number:</span> {orderData.houseNumber}</div>}
                        {orderData?.additionalDetails && <div><span className="font-medium">Additional Details:</span> {orderData.additionalDetails}</div>}
                      </>
                    ) : (
                      <span>Not provided</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Date:</span>
                  <span>{new Date(orderData?.createdAt || new Date()).toLocaleDateString('en-US')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-8">
            {/* Arabic Items Header */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3">تفاصيل الطلب</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-right py-2 px-2 font-bold">المنتج</th>
                      <th className="text-right py-2 px-2 font-bold">السعر</th>
                      <th className="text-right py-2 px-2 font-bold">الكمية</th>
                      <th className="text-right py-2 px-2 font-bold">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length > 0 ? (
                      items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-200">
                          <td className="text-right py-2 px-2">{item.product?.nameAr || 'منتج'}</td>
                          <td className="text-right py-2 px-2">{parseFloat(item.price).toFixed(2)} KWD</td>
                          <td className="text-right py-2 px-2">{item.quantity}</td>
                          <td className="text-right py-2 px-2 font-semibold">
                            {(parseFloat(item.price) * item.quantity).toFixed(2)} KWD
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b border-gray-200">
                        <td colSpan={4} className="text-right py-4 px-2 text-gray-500">
                          لا توجد منتجات
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* English Items Header */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3">Order Details</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-2 font-bold">Product</th>
                      <th className="text-left py-2 px-2 font-bold">Price</th>
                      <th className="text-left py-2 px-2 font-bold">Quantity</th>
                      <th className="text-left py-2 px-2 font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length > 0 ? (
                      items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-200">
                          <td className="text-left py-2 px-2">{item.product?.nameEn || 'Product'}</td>
                          <td className="text-left py-2 px-2">{parseFloat(item.price).toFixed(2)} KWD</td>
                          <td className="text-left py-2 px-2">{item.quantity}</td>
                          <td className="text-left py-2 px-2 font-semibold">
                            {(parseFloat(item.price) * item.quantity).toFixed(2)} KWD
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b border-gray-200">
                        <td colSpan={4} className="text-left py-4 px-2 text-gray-500">
                          No products
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Totals Section */}
          <div className="mb-8 grid grid-cols-1 gap-6">
            {/* Arabic Totals */}
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-semibold">{subtotal.toFixed(2)} KWD</span>
                </div>
                <div className="flex justify-between">
                  <span>الضريبة (5%):</span>
                  <span className="font-semibold">{tax.toFixed(2)} KWD</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2">
                  <span>الإجمالي:</span>
                  <span>{total.toFixed(2)} KWD</span>
                </div>
              </div>
            </div>

            {/* English Totals */}
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{subtotal.toFixed(2)} KWD</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%):</span>
                  <span className="font-semibold">{tax.toFixed(2)} KWD</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2">
                  <span>Total:</span>
                  <span>{total.toFixed(2)} KWD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t-2 border-gray-300 pt-4 text-sm text-gray-600 space-y-2">
            <p className="font-semibold">شكراً لتسوقك معنا</p>
            <p className="font-semibold">Thank you for shopping with us</p>
            <p className="text-xs mt-4">
              {new Date().toLocaleString('en-US')}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
        }
      `}</style>
    </PageLayout>
  );
}
