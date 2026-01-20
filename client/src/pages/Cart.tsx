import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, ArrowLeft, Printer } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Cart() {
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [shippingAddress, setShippingAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Fetch cart items
  const { data: cartItems = [], isLoading } = trpc.cart.list.useQuery();

  // Delete cart item mutation
  const deleteCartMutation = trpc.cart.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم حذف المنتج' : 'Product removed');
      utils.cart.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    },
  });

  // Update cart quantity mutation
  const updateCartMutation = trpc.cart.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم تحديث الكمية' : 'Quantity updated');
      utils.cart.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    },
  });

  // Create order mutation
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم إنشاء الطلب بنجاح' : 'Order created successfully');
      // Redirect to receipt page
      setLocation('/receipt');
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    },
  });

  // Calculate totals
  const total = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product?.price?.toString() || '0');
    const qty = item.quantity ?? 1;
    return sum + price * qty;
  }, 0);

  const handleCheckout = () => {
    if (!shippingAddress.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال عنوان الشحن' : 'Please enter shipping address');
      return;
    }
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال جميع بيانات العميل' : 'Please enter all customer information');
      return;
    }

    createOrderMutation.mutate({
      totalAmount: total.toFixed(2),
      shippingAddress,
      customerName,
      customerEmail,
      customerPhone,
    });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>

      <div className="container py-8">
        {/* Back Button */}
        <button
          onClick={() => setLocation('/')}
          className="flex items-center gap-2 text-primary-yellow hover:text-accent-yellow mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
        </button>

        <h1 className="text-3xl font-bold text-dark-text mb-8">
          {language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}
        </h1>

        {cartItems.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              {language === 'ar' ? 'سلة التسوق فارغة' : 'Your cart is empty'}
            </p>
            <Button onClick={() => setLocation('/')} className="bg-primary-yellow text-dark-text">
              {language === 'ar' ? 'ابدأ التسوق' : 'Start Shopping'}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      {item.product?.image && (
                        <img
                          src={item.product.image}
                          alt={language === 'ar' ? item.product.nameAr : item.product.nameEn}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-bold text-dark-text">
                          {language === 'ar' ? item.product?.nameAr : item.product?.nameEn}
                        </h3>
                        
                        {/* Price Breakdown */}
                        <div className="mt-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {language === 'ar' ? 'سعر الحبة:' : 'Price per item:'}
                            </span>
                            <span className="font-semibold text-primary-yellow">
                              {parseFloat(item.product?.price?.toString() || '0').toFixed(2)} KWD
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <label className="text-muted-foreground">
                              {language === 'ar' ? 'الكمية:' : 'Quantity:'}
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity ?? 1}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value) || 1;
                                updateCartMutation.mutate({ cartItemId: item.id, quantity: newQty });
                              }}
                              className="w-16 px-2 py-1 border border-border rounded text-center text-sm"
                            />
                          </div>
                          
                          <div className="flex justify-between border-t border-border pt-2">
                            <span className="font-bold text-dark-text">
                              {language === 'ar' ? 'الإجمالي:' : 'Total:'}
                            </span>
                            <span className="font-bold text-primary-yellow text-lg">
                              {(parseFloat(item.product?.price?.toString() || '0') * (item.quantity ?? 1)).toFixed(2)} KWD
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteCartMutation.mutate({ cartItemId: item.id })}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-dark-text">
                    {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {language === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}
                    </span>
                    <span className="font-medium text-dark-text">
                      {total.toFixed(2)} KWD
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'الاسم' : 'Name'}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'الهاتف' : 'Phone'}
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder={language === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone'}
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Shipping Address */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}
                    </label>
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder={language === 'ar' ? 'أدخل عنوان الشحن' : 'Enter shipping address'}
                      className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                  </div>

                  {/* Total */}
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between mb-4">
                      <span className="font-bold text-dark-text">
                        {language === 'ar' ? 'الإجمالي:' : 'Total:'}
                      </span>
                      <span className="text-2xl font-bold text-primary-yellow">
                        {total.toFixed(2)} KWD
                      </span>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      onClick={handleCheckout}
                      disabled={createOrderMutation.isPending}
                      className="w-full bg-primary-yellow text-dark-text hover:bg-accent-yellow py-6 font-bold"
                    >
                      {createOrderMutation.isPending
                        ? language === 'ar'
                          ? 'جاري المعالجة...'
                          : 'Processing...'
                        : language === 'ar'
                          ? 'إتمام الشراء'
                          : 'Checkout'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
