import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Printer, Edit2, Save, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: string;
  productName?: string;
  productImage?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: string;
  shippingAddress: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

interface OrderDetailModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedOrder: Order) => void;
}

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onUpdate,
}: OrderDetailModalProps) {
  const { language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order>(order);
  const [printFormat, setPrintFormat] = useState<'thermal' | 'a4'>('thermal');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const updateOrderMutation = trpc.orders.update.useMutation({
    onSuccess: (updatedOrder) => {
      onUpdate?.(updatedOrder as Order);
      setIsEditing(false);
      toast.success(language === 'ar' ? 'تم تحديث الطلب بنجاح' : 'Order updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    },
  });

  useEffect(() => {
    setEditedOrder(order);
  }, [order]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Validate required fields
    if (!editedOrder.customerName?.trim()) {
      toast.error(language === 'ar' ? 'الاسم مطلوب' : 'Name is required');
      return;
    }
    if (!editedOrder.customerPhone?.trim()) {
      toast.error(language === 'ar' ? 'الهاتف مطلوب' : 'Phone is required');
      return;
    }
    if (!editedOrder.shippingAddress?.trim()) {
      toast.error(language === 'ar' ? 'العنوان مطلوب' : 'Address is required');
      return;
    }

    updateOrderMutation.mutate({
      id: editedOrder.id,
      customerName: editedOrder.customerName || undefined,
      customerEmail: editedOrder.customerEmail || undefined,
      customerPhone: editedOrder.customerPhone || undefined,
      shippingAddress: editedOrder.shippingAddress || undefined,
      status: editedOrder.status as any,
    });
  };

  const handleCancel = () => {
    setEditedOrder(order);
    setIsEditing(false);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error(language === 'ar' ? 'فشل فتح نافذة الطباعة' : 'Failed to open print window');
      return;
    }

    const html = printFormat === 'thermal' ? getThermalHTML() : getA4HTML();
    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getThermalHTML = () => {
    const items = editedOrder.items || [];
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    return `
      <!DOCTYPE html>
      <html dir="${language === 'ar' ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <title>${language === 'ar' ? 'إيصال الطلب' : 'Order Receipt'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Arial', sans-serif;
            width: 80mm;
            margin: 0 auto;
            padding: 5mm;
            background: white;
            color: #000;
          }
          .receipt {
            text-align: center;
            border: 1px solid #000;
            padding: 5mm;
          }
          .header {
            border-bottom: 2px dashed #000;
            padding-bottom: 5mm;
            margin-bottom: 5mm;
          }
          .store-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 2mm;
          }
          .order-number {
            font-size: 12px;
            margin-bottom: 3mm;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 3mm 0;
          }
          .customer-info {
            text-align: ${language === 'ar' ? 'right' : 'left'};
            font-size: 11px;
            margin-bottom: 5mm;
          }
          .customer-info p {
            margin: 1mm 0;
          }
          .items-section {
            text-align: ${language === 'ar' ? 'right' : 'left'};
            font-size: 10px;
            margin-bottom: 5mm;
          }
          .item-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            border-bottom: 1px dashed #000;
            padding-bottom: 2mm;
            margin-bottom: 2mm;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2mm;
            padding-bottom: 2mm;
            border-bottom: 1px dotted #ccc;
          }
          .item-name {
            flex: 1;
          }
          .item-qty {
            width: 15mm;
            text-align: center;
          }
          .item-price {
            width: 20mm;
            text-align: right;
          }
          .totals {
            border-top: 2px dashed #000;
            padding-top: 3mm;
            margin-top: 3mm;
            font-size: 11px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2mm;
          }
          .total-amount {
            font-weight: bold;
            font-size: 13px;
            margin-top: 3mm;
            padding-top: 3mm;
            border-top: 1px solid #000;
          }
          .footer {
            border-top: 2px dashed #000;
            padding-top: 5mm;
            margin-top: 5mm;
            font-size: 10px;
          }
          .thank-you {
            font-weight: bold;
            margin-bottom: 3mm;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="store-name">${language === 'ar' ? 'متجر الحلويات' : 'Sweets Store'}</div>
            <div class="order-number">${language === 'ar' ? 'رقم الطلب' : 'Order #'}: ${editedOrder.orderNumber}</div>
          </div>

          <div class="customer-info">
            <p><strong>${language === 'ar' ? 'الاسم' : 'Name'}:</strong> ${editedOrder.customerName || '-'}</p>
            <p><strong>${language === 'ar' ? 'الهاتف' : 'Phone'}:</strong> ${editedOrder.customerPhone || '-'}</p>
            <p><strong>${language === 'ar' ? 'العنوان' : 'Address'}:</strong> ${editedOrder.shippingAddress || '-'}</p>
            <p><strong>${language === 'ar' ? 'التاريخ' : 'Date'}:</strong> ${new Date(editedOrder.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
          </div>

          <div class="divider"></div>

          <div class="items-section">
            <div class="item-header">
              <div class="item-name">${language === 'ar' ? 'المنتج' : 'Product'}</div>
              <div class="item-qty">${language === 'ar' ? 'الكمية' : 'Qty'}</div>
              <div class="item-price">${language === 'ar' ? 'السعر' : 'Price'}</div>
            </div>
            ${items.map(item => `
              <div class="item">
                <div class="item-name">${item.productName || `Product ${item.productId}`}</div>
                <div class="item-qty">${item.quantity}</div>
                <div class="item-price">${(parseFloat(item.price) * item.quantity).toFixed(2)} KWD</div>
              </div>
            `).join('')}
          </div>

          <div class="totals">
            <div class="total-row">
              <span>${language === 'ar' ? 'الإجمالي الفرعي' : 'Subtotal'}:</span>
              <span>${subtotal.toFixed(2)} KWD</span>
            </div>
            <div class="total-row">
              <span>${language === 'ar' ? 'الضريبة (5%)' : 'Tax (5%)'}:</span>
              <span>${tax.toFixed(2)} KWD</span>
            </div>
            <div class="total-amount">
              <div class="total-row">
                <span>${language === 'ar' ? 'المجموع' : 'Total'}:</span>
                <span>${total.toFixed(2)} KWD</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="thank-you">${language === 'ar' ? 'شكراً لتسوقك معنا' : 'Thank you for your purchase'}</div>
            <div>${language === 'ar' ? 'يرجى الاحتفاظ بهذا الإيصال' : 'Please keep this receipt'}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const getA4HTML = () => {
    const items = editedOrder.items || [];
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    return `
      <!DOCTYPE html>
      <html dir="${language === 'ar' ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <title>${language === 'ar' ? 'إيصال الطلب' : 'Order Receipt'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background: white;
            color: #333;
          }
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 40px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .store-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #FCD34D;
          }
          .order-number {
            font-size: 16px;
            color: #666;
          }
          .content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 30px;
          }
          .section {
            text-align: ${language === 'ar' ? 'right' : 'left'};
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            text-transform: uppercase;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          .info-row {
            margin-bottom: 10px;
            font-size: 14px;
          }
          .info-label {
            font-weight: bold;
            color: #666;
            display: inline-block;
            width: 100px;
          }
          .items-section {
            grid-column: 1 / -1;
            margin-top: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #f5f5f5;
            padding: 12px;
            text-align: ${language === 'ar' ? 'right' : 'left'};
            font-weight: bold;
            border-bottom: 2px solid #333;
            font-size: 13px;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
            text-align: ${language === 'ar' ? 'right' : 'left'};
            font-size: 13px;
          }
          tr:hover {
            background: #f9f9f9;
          }
          .totals {
            display: flex;
            justify-content: flex-${language === 'ar' ? 'start' : 'end'};
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #333;
          }
          .totals-table {
            width: 300px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }
          .total-row.final {
            font-size: 18px;
            font-weight: bold;
            color: #FCD34D;
            border-top: 1px solid #ddd;
            padding-top: 12px;
            margin-top: 12px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .receipt {
              border: none;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="store-name">${language === 'ar' ? 'متجر الحلويات' : 'Sweets Store'}</div>
            <div class="order-number">${language === 'ar' ? 'رقم الطلب' : 'Order #'}: ${editedOrder.orderNumber}</div>
          </div>

          <div class="content">
            <div class="section">
              <div class="section-title">${language === 'ar' ? 'معلومات العميل' : 'Customer Information'}</div>
              <div class="info-row">
                <span class="info-label">${language === 'ar' ? 'الاسم' : 'Name'}:</span>
                <span>${editedOrder.customerName || '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${language === 'ar' ? 'الهاتف' : 'Phone'}:</span>
                <span>${editedOrder.customerPhone || '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${language === 'ar' ? 'البريد' : 'Email'}:</span>
                <span>${editedOrder.customerEmail || '-'}</span>
              </div>
            </div>

            <div class="section">
              <div class="section-title">${language === 'ar' ? 'معلومات الطلب' : 'Order Information'}</div>
              <div class="info-row">
                <span class="info-label">${language === 'ar' ? 'التاريخ' : 'Date'}:</span>
                <span>${new Date(editedOrder.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${language === 'ar' ? 'الحالة' : 'Status'}:</span>
                <span>${getStatusLabel(editedOrder.status || 'pending')}</span>
              </div>
            </div>

            <div class="section items-section">
              <div class="section-title">${language === 'ar' ? 'تفاصيل المنتجات' : 'Order Items'}</div>
              <table>
                <thead>
                  <tr>
                    <th>${language === 'ar' ? 'المنتج' : 'Product'}</th>
                    <th>${language === 'ar' ? 'الكمية' : 'Quantity'}</th>
                    <th>${language === 'ar' ? 'السعر' : 'Price'}</th>
                    <th>${language === 'ar' ? 'المجموع' : 'Total'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(item => `
                    <tr>
                      <td>${item.productName || `Product ${item.productId}`}</td>
                      <td>${item.quantity}</td>
                      <td>${parseFloat(item.price).toFixed(2)} KWD</td>
                      <td>${(parseFloat(item.price) * item.quantity).toFixed(2)} KWD</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="totals">
                <div class="totals-table">
                  <div class="total-row">
                    <span>${language === 'ar' ? 'الإجمالي الفرعي' : 'Subtotal'}:</span>
                    <span>${subtotal.toFixed(2)} KWD</span>
                  </div>
                  <div class="total-row">
                    <span>${language === 'ar' ? 'الضريبة (5%)' : 'Tax (5%)'}:</span>
                    <span>${tax.toFixed(2)} KWD</span>
                  </div>
                  <div class="total-row final">
                    <span>${language === 'ar' ? 'المجموع' : 'Total'}:</span>
                    <span>${total.toFixed(2)} KWD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>${language === 'ar' ? 'شكراً لتسوقك معنا' : 'Thank you for your purchase'}</p>
            <p>${language === 'ar' ? 'يرجى الاحتفاظ بهذا الإيصال' : 'Please keep this receipt'}</p>
          </div>
        </div>
      </body>
      </html>
    `;
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

  const items = editedOrder.items || [];
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b sticky top-0 bg-white z-10">
          <CardTitle>
            {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'} - {editedOrder.orderNumber}
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* Print Preview */}
          {showPrintPreview && (
            <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">
                  {language === 'ar' ? 'معاينة الطباعة' : 'Print Preview'}
                </h3>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="thermal"
                    checked={printFormat === 'thermal'}
                    onChange={(e) => setPrintFormat(e.target.value as 'thermal' | 'a4')}
                  />
                  <span>{language === 'ar' ? 'ورق حراري (80 ملم)' : 'Thermal Paper (80mm)'}</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="a4"
                    checked={printFormat === 'a4'}
                    onChange={(e) => setPrintFormat(e.target.value as 'thermal' | 'a4')}
                  />
                  <span>{language === 'ar' ? 'ورقة A4' : 'A4 Paper'}</span>
                </label>
              </div>

              <div className={`${printFormat === 'thermal' ? 'w-80 mx-auto' : 'max-w-4xl mx-auto'} bg-white p-4 border border-gray-300 rounded`}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: printFormat === 'thermal' ? getThermalHTML() : getA4HTML(),
                  }}
                />
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handlePrint}
                  className="flex-1 bg-primary-yellow text-dark-text hover:bg-accent-yellow"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'اطبع الآن' : 'Print Now'}
                </Button>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">
              {language === 'ar' ? 'معلومات العميل' : 'Customer Information'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  {language === 'ar' ? 'الاسم' : 'Name'}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedOrder.customerName || ''}
                    onChange={(e) =>
                      setEditedOrder({ ...editedOrder, customerName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  />
                ) : (
                  <p className="font-semibold">{editedOrder.customerName || '-'}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  {language === 'ar' ? 'الهاتف' : 'Phone'}
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedOrder.customerPhone || ''}
                    onChange={(e) =>
                      setEditedOrder({ ...editedOrder, customerPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  />
                ) : (
                  <p className="font-semibold">{editedOrder.customerPhone || '-'}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedOrder.customerEmail || ''}
                    onChange={(e) =>
                      setEditedOrder({ ...editedOrder, customerEmail: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  />
                ) : (
                  <p className="font-semibold">{editedOrder.customerEmail || '-'}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">
                  {language === 'ar' ? 'التاريخ' : 'Date'}
                </label>
                <p className="font-semibold">
                  {new Date(editedOrder.createdAt).toLocaleDateString(
                    language === 'ar' ? 'ar-SA' : 'en-US'
                  )}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground block mb-2">
                {language === 'ar' ? 'عنوان الشحن' : 'Shipping Address'}
              </label>
              {isEditing ? (
                <textarea
                  value={editedOrder.shippingAddress || ''}
                  onChange={(e) =>
                    setEditedOrder({ ...editedOrder, shippingAddress: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                />
              ) : (
                <p className="font-semibold">{editedOrder.shippingAddress || '-'}</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">
              {language === 'ar' ? 'المنتجات' : 'Order Items'}
            </h3>
            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'لا توجد منتجات' : 'No items'}
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{item.productName || `Product ${item.productId}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'الكمية' : 'Quantity'}: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-yellow">
                        {(parseFloat(item.price) * item.quantity).toFixed(2)} KWD
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {parseFloat(item.price).toFixed(2)} KWD {language === 'ar' ? 'للحبة' : 'each'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {language === 'ar' ? 'الإجمالي الفرعي' : 'Subtotal'}
              </span>
              <span className="font-semibold">{subtotal.toFixed(2)} KWD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {language === 'ar' ? 'الضريبة (5%)' : 'Tax (5%)'}
              </span>
              <span className="font-semibold">{tax.toFixed(2)} KWD</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="font-bold">{language === 'ar' ? 'المجموع' : 'Total'}</span>
              <span className="font-bold text-primary-yellow text-lg">
                {total.toFixed(2)} KWD
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">
              {language === 'ar' ? 'حالة الطلب' : 'Order Status'}
            </h3>
            {isEditing ? (
              <Select
                value={editedOrder.status || 'pending'}
                onValueChange={(value) =>
                  setEditedOrder({ ...editedOrder, status: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{getStatusLabel('pending')}</SelectItem>
                  <SelectItem value="confirmed">{getStatusLabel('confirmed')}</SelectItem>
                  <SelectItem value="shipped">{getStatusLabel('shipped')}</SelectItem>
                  <SelectItem value="delivered">{getStatusLabel('delivered')}</SelectItem>
                  <SelectItem value="cancelled">{getStatusLabel('cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="font-semibold">{getStatusLabel(editedOrder.status || 'pending')}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {isEditing ? (
              <>
            <Button
                    onClick={handleSave}
                    disabled={updateOrderMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateOrderMutation.isPending
                      ? language === 'ar'
                        ? 'جاري الحفظ...'
                        : 'Saving...'
                      : language === 'ar'
                      ? 'حفظ التغييرات'
                      : 'Save Changes'}
                  </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'تعديل' : 'Edit'}
                </Button>
                <Button
                  onClick={() => setShowPrintPreview(!showPrintPreview)}
                  className="flex-1 bg-primary-yellow text-dark-text hover:bg-accent-yellow"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'طباعة' : 'Print'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
