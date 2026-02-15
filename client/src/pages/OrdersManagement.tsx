import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronDown, Mail, Bell, Search, X, Eye } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import OrderDetailModal from '@/components/admin/OrderDetailModal';
import { trpc } from '@/lib/trpc';

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

export default function OrdersManagement() {
  const { language } = useLanguage();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  // Fetch all orders with items
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

  // Check for new orders and show notification
  useEffect(() => {
    if (orders.length > lastOrderCount) {
      const newOrders = orders.length - lastOrderCount;
      setUnreadCount(newOrders);
      setShowNotification(true);
      
      // Play notification sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBg==');
      audio.play().catch(() => {});
      
      // Show toast
      toast.success(
        language === 'ar' 
          ? `${newOrders} طلب جديد!` 
          : `${newOrders} new order(s)!`
      );
      
      setLastOrderCount(orders.length);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [orders.length, lastOrderCount, language]);

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

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    if (updatedOrder.status !== selectedOrder?.status) {
      handleStatusChange(updatedOrder.id, updatedOrder.status || 'pending');
    }
    setShowDetailModal(false);
    refetch();
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

  // Filter and search orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        order.orderNumber.toLowerCase().includes(searchLower) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
        (order.customerPhone && order.customerPhone.includes(searchQuery));

      // Date filter
      const orderDate = new Date(order.createdAt);
      const matchesDateFrom = !dateFrom || orderDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || orderDate <= new Date(dateTo + 'T23:59:59');

      return matchesSearch && matchesDateFrom && matchesDateTo;
    });
  }, [orders, searchQuery, dateFrom, dateTo]);

  // Count pending orders
  const pendingCount = filteredOrders.filter((o: Order) => o.status === 'pending').length;
  const confirmedCount = filteredOrders.filter((o: Order) => o.status === 'confirmed').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-yellow" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onUpdate={handleUpdateOrder}
        />
      )}

      {/* Notification Bell */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <span>
              {language === 'ar' 
                ? `${unreadCount} طلب جديد!` 
                : `${unreadCount} new order(s)!`}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text flex items-center gap-3">
            {language === 'ar' ? 'إدارة الطلبات' : 'Orders Management'}
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ar' 
              ? `إجمالي الطلبات: ${filteredOrders.length} | قيد الانتظار: ${pendingCount} | مؤكد: ${confirmedCount}` 
              : `Total Orders: ${filteredOrders.length} | Pending: ${pendingCount} | Confirmed: ${confirmedCount}`}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'ابحث برقم الطلب أو اسم العميل أو الهاتف...' : 'Search by order ID, customer name, or phone...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                {language === 'ar' ? 'من التاريخ' : 'From Date'}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                {language === 'ar' ? 'إلى التاريخ' : 'To Date'}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || dateFrom || dateTo) && (
            <Button
              onClick={() => {
                setSearchQuery('');
                setDateFrom('');
                setDateTo('');
              }}
              variant="outline"
              className="w-full"
            >
              {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              {language === 'ar' ? 'لا توجد طلبات' : 'No orders found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: Order) => (
            <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                          {order.customerPhone && ` • ${order.customerPhone}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status || 'pending')}`}>
                        {getStatusLabel(order.status || 'pending')}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleOpenDetail(order)}
                    size="sm"
                    variant="outline"
                    className="ml-2"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              {selectedOrderId === order.id && (
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
                  <Button
                    onClick={() => handleSendEmail(order)}
                    disabled={sendEmailMutation.isPending}
                    className="w-full bg-primary-yellow text-dark-text hover:bg-accent-yellow flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {sendEmailMutation.isPending
                      ? language === 'ar'
                        ? 'جاري الإرسال...'
                        : 'Sending...'
                      : language === 'ar'
                      ? 'إرسال بريد للعميل'
                      : 'Send Email to Customer'}
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
