import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronDown, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
}

export default function OrdersManagement() {
  const { language } = useLanguage();
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, string>>({});

  // Fetch all orders
  const { data: orders = [], isLoading, refetch } = trpc.orders.allOrders.useQuery();

  // Update order status mutation
  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم تحديث الحالة' : 'Status updated');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    },
  });

  // Send email mutation
  const sendEmailMutation = trpc.orders.sendStatusEmail.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم إرسال البريد' : 'Email sent');
    },
    onError: (error: any) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    },
  });

  const handleStatusChange = (orderId: number, newStatus: string) => {
    setSelectedStatuses(prev => ({ ...prev, [orderId]: newStatus }));
    updateStatusMutation.mutate({ id: orderId, status: newStatus as any });
  };

  const handleSendEmail = (order: Order) => {
    if (!order.customerEmail) {
      toast.error(language === 'ar' ? 'لا يوجد بريد إلكتروني' : 'No email address');
      return;
    }
    sendEmailMutation.mutate({
      orderId: order.id,
      customerEmail: order.customerEmail,
      customerName: order.customerName || 'Customer',
      status: (order.status || 'pending') as any,
    });
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-yellow" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-text">
          {language === 'ar' ? 'إدارة الطلبات' : 'Orders Management'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === 'ar' ? `إجمالي الطلبات: ${orders.length}` : `Total Orders: ${orders.length}`}
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              {language === 'ar' ? 'لا توجد طلبات' : 'No orders yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-dark-text">
                          {language === 'ar' ? 'الطلب:' : 'Order:'} {order.orderNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName || (language === 'ar' ? 'عميل' : 'Customer')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status || 'pending')}`}>
                        {getStatusLabel(order.status || 'pending')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedOrderId === order.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              </CardHeader>

              {expandedOrderId === order.id && (
                <CardContent className="space-y-4 border-t border-border pt-4">
                  {/* Order Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'المبلغ' : 'Amount'}
                      </p>
                      <p className="font-bold text-primary-yellow text-lg">
                        {parseFloat(order.totalAmount).toFixed(2)} KWD
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'التاريخ' : 'Date'}
                      </p>
                      <p className="font-bold text-dark-text">
                        {new Date(order.createdAt).toLocaleDateString(
                          language === 'ar' ? 'ar-SA' : 'en-US'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-bold text-dark-text mb-3">
                      {language === 'ar' ? 'معلومات العميل' : 'Customer Information'}
                    </h4>
                    <div className="space-y-2 text-sm">
                      {order.customerName && (
                        <p>
                          <span className="text-muted-foreground">
                            {language === 'ar' ? 'الاسم:' : 'Name:'}
                          </span>{' '}
                          {order.customerName}
                        </p>
                      )}
                      {order.customerEmail && (
                        <p>
                          <span className="text-muted-foreground">
                            {language === 'ar' ? 'البريد:' : 'Email:'}
                          </span>{' '}
                          {order.customerEmail}
                        </p>
                      )}
                      {order.customerPhone && (
                        <p>
                          <span className="text-muted-foreground">
                            {language === 'ar' ? 'الهاتف:' : 'Phone:'}
                          </span>{' '}
                          {order.customerPhone}
                        </p>
                      )}
                      <p>
                        <span className="text-muted-foreground">
                          {language === 'ar' ? 'العنوان:' : 'Address:'}
                        </span>{' '}
                        {order.shippingAddress}
                      </p>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">
                      {language === 'ar' ? 'تحديث الحالة' : 'Update Status'}
                    </label>
                    <Select
                      value={selectedStatuses[order.id] || order.status || 'pending'}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          {getStatusLabel('pending')}
                        </SelectItem>
                        <SelectItem value="confirmed">
                          {getStatusLabel('confirmed')}
                        </SelectItem>
                        <SelectItem value="shipped">
                          {getStatusLabel('shipped')}
                        </SelectItem>
                        <SelectItem value="delivered">
                          {getStatusLabel('delivered')}
                        </SelectItem>
                        <SelectItem value="cancelled">
                          {getStatusLabel('cancelled')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Send Email Button */}
                  {order.customerEmail && (
                    <Button
                      onClick={() => handleSendEmail(order)}
                      disabled={sendEmailMutation.isPending}
                      className="w-full bg-primary-yellow text-dark-text hover:bg-accent-yellow"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {sendEmailMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        language === 'ar' ? 'إرسال إشعار بريد' : 'Send Email Notification'
                      )}
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
