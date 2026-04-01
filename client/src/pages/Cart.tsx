import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, ArrowLeft, Printer, MapPin } from 'lucide-react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useLocation as useWouterLocation } from 'wouter';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFormValidation, type FormField } from '@/hooks/useFormValidation';
import { useLocation } from '@/contexts/LocationContext';
import { formatLocationSingleLine } from '@/lib/locationFormatter';
import { trpc } from '@/lib/trpc';

export default function Cart() {
  const { language, t } = useLanguage();
  const [, setWouterLocation] = useWouterLocation();
  const { location, setShowLocationModal } = useLocation();
  const utils = trpc.useUtils();
  const [shippingAddress, setShippingAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Fetch cart items
  const { data: cartItems = [], isLoading } = trpc.cart.list.useQuery();

  // Debounce timer for quantity updates
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Delete cart item mutation with optimistic updates
  const deleteCartMutation = trpc.cart.delete.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await utils.cart.list.cancel();
      // Snapshot the previous value
      const previousData = utils.cart.list.getData();
      // Optimistically update to the new value
      utils.cart.list.setData(undefined, (old) =>
        old ? old.filter((item) => item.id !== variables.cartItemId) : []
      );
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.cart.list.setData(undefined, context.previousData);
      }
      toast.error(err.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    },
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم حذف المنتج' : 'Product removed');
    },
  });

  // Update cart quantity mutation with debouncing
  const updateCartMutation = trpc.cart.update.useMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await utils.cart.list.cancel();
      // Snapshot the previous value
      const previousData = utils.cart.list.getData();
      // Optimistically update to the new value
      utils.cart.list.setData(undefined, (old) =>
        old
          ? old.map((item) =>
              item.id === variables.cartItemId
                ? { ...item, quantity: variables.quantity }
                : item
            )
          : []
      );
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.cart.list.setData(undefined, context.previousData);
      }
      toast.error(err.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    },
    onSuccess: () => {
      // Silent success - no toast needed for quantity updates
    },
  });

  // Create order mutation (not used directly anymore, moved to confirmation page)
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم إنشاء الطلب بنجاح' : 'Order created successfully');
      // Redirect to receipt page
      setWouterLocation('/receipt');
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    },
  });
  
  // Remove unused createOrderMutation from handleCheckout
  // It's now called from OrderConfirmation page

  // Calculate totals
  const total = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product?.price?.toString() || '0');
    const qty = item.quantity ?? 1;
    return sum + price * qty;
  }, 0);

  // Debounced quantity update handler
  const handleQuantityChange = useCallback((cartItemId: number, newQuantity: number) => {
    // Clear previous timer
    if (updateTimerRef.current !== null) {
      clearTimeout(updateTimerRef.current);
    }
    // Set new timer with 500ms debounce
    updateTimerRef.current = setTimeout(() => {
      if (newQuantity > 0) {
        updateCartMutation.mutate({ cartItemId, quantity: newQuantity });
      }
    }, 500);
  }, [updateCartMutation]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (updateTimerRef.current !== null) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  const { errors, validate, registerField, clearError } = useFormValidation();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLTextAreaElement>(null);

  // Register refs
  useEffect(() => {
    if (nameInputRef.current) registerField('customerName', nameInputRef.current);
    if (emailInputRef.current) registerField('customerEmail', emailInputRef.current);
    if (phoneInputRef.current) registerField('customerPhone', phoneInputRef.current);
    if (addressInputRef.current) registerField('shippingAddress', addressInputRef.current);
  }, [registerField]);

  const handleCheckout = useCallback(() => {
    // Check if location is selected
    if (!location) {
      toast.error(language === 'ar' ? 'يرجى اختيار موقعك أولاً' : 'Please select your location first');
      setShowLocationModal(true);
      return;
    }

    const fields: FormField[] = [
      { id: 'customerName', name: language === 'ar' ? 'الاسم' : 'Name', value: customerName, required: true, type: 'text', minLength: 2 },
      { id: 'customerPhone', name: language === 'ar' ? 'الهاتف' : 'Phone', value: customerPhone, required: true, type: 'tel' },
      { id: 'shippingAddress', name: language === 'ar' ? 'التفاصيل' : 'Details', value: shippingAddress, required: false, type: 'textarea', minLength: 0 },
    ];

    if (!validate(fields)) {
      return;
    }

    // Prepare cart items for order
    const items = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity ?? 1,
      price: item.product?.price?.toString() || '0',
    }));

    // Save order data to localStorage for confirmation page
    const orderData = {
      totalAmount: total.toFixed(2),
      shippingAddress,
      customerName,
      customerEmail,
      customerPhone,
      // Include all address fields from location
      area: location.area,
      block: location.block,
      street: location.street,
      avenue: location.avenue,
      houseNumber: location.houseNumber,
      additionalDetails: location.additionalDetails || shippingAddress,
      items: cartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity ?? 1,
        price: item.product?.price?.toString() || '0',
        product: item.product,
      })),
    };
    localStorage.setItem('pendingOrder', JSON.stringify(orderData));

    // Navigate to confirmation page
    setWouterLocation('/order-confirmation');
  }, [shippingAddress, customerName, customerEmail, customerPhone, total, createOrderMutation, language, validate, location, setShowLocationModal]);

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
          onClick={() => setWouterLocation('/')}
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
            <Button onClick={() => setWouterLocation('/')} className="bg-primary-yellow text-dark-text">
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
                              handleQuantityChange(item.id, newQty);
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
                  {/* Location Display - Single Line Summary */}
                  {location && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-dark-text">
                            {formatLocationSingleLine(location, language)}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowLocationModal(true)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap ml-2"
                        >
                          {language === 'ar' ? 'تغيير' : 'Change'}
                        </button>
                      </div>
                    </div>
                  )}

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
                      ref={nameInputRef}
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (errors.customerName) clearError('customerName');
                      }}
                      placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                      className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                        errors.customerName
                          ? 'border-red-500 focus:ring-red-500 bg-red-50'
                          : 'border-border focus:ring-primary'
                      }`}
                    />
                    {errors.customerName && (
                      <p className="text-red-600 text-xs mt-1">{errors.customerName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
                    </label>
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={customerEmail}
                      onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        if (errors.customerEmail) clearError('customerEmail');
                      }}
                      placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                        errors.customerEmail
                          ? 'border-red-500 focus:ring-red-500 bg-red-50'
                          : 'border-border focus:ring-primary'
                      }`}
                    />
                    {errors.customerEmail && (
                      <p className="text-red-600 text-xs mt-1">{errors.customerEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'الهاتف' : 'Phone'}
                    </label>
                    <input
                      ref={phoneInputRef}
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (errors.customerPhone) clearError('customerPhone');
                      }}
                      placeholder={language === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone'}
                      className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                        errors.customerPhone
                          ? 'border-red-500 focus:ring-red-500 bg-red-50'
                          : 'border-border focus:ring-primary'
                      }`}
                    />
                    {errors.customerPhone && (
                      <p className="text-red-600 text-xs mt-1">{errors.customerPhone}</p>
                    )}
                  </div>

                  {/* Details Field (Optional) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'التفاصيل (اختياري)' : 'Details (Optional)'}
                    </label>
                    <textarea
                      ref={addressInputRef}
                      id="shippingAddress"
                      value={shippingAddress}
                      onChange={(e) => {
                        setShippingAddress(e.target.value);
                        if (errors.shippingAddress) clearError('shippingAddress');
                      }}
                      placeholder={language === 'ar' ? 'أدخل عنوان الشحن' : 'Enter shipping address'}
                      className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                        errors.shippingAddress
                          ? 'border-red-500 focus:ring-red-500 bg-red-50'
                          : 'border-border focus:ring-primary'
                      }`}
                      rows={3}
                    />
                    {errors.shippingAddress && (
                      <p className="text-red-600 text-xs mt-1">{errors.shippingAddress}</p>
                    )}
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
