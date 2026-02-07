import { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useOrderNotifications } from '@/contexts/OrderNotificationContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function OrderNotificationBell() {
  const { language } = useLanguage();
  const { newOrders, unreadCount, clearNotifications, markAsRead } = useOrderNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const t = {
    ar: {
      newOrders: 'طلبات جديدة',
      noOrders: 'لا توجد طلبات جديدة',
      viewOrder: 'عرض الطلب',
      markAsRead: 'تم قراءته',
      clearAll: 'مسح الكل',
      orderAmount: 'المبلغ',
      orderTime: 'الوقت',
    },
    en: {
      newOrders: 'New Orders',
      noOrders: 'No new orders',
      viewOrder: 'View Order',
      markAsRead: 'Mark as read',
      clearAll: 'Clear all',
      orderAmount: 'Amount',
      orderTime: 'Time',
    },
  };

  const currentT = t[language as keyof typeof t];

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return language === 'ar' ? 'الآن' : 'Now';
    if (minutes < 60) return `${minutes} ${language === 'ar' ? 'دقيقة' : 'min'} ago`;
    if (hours < 24) return `${hours} ${language === 'ar' ? 'ساعة' : 'h'} ago`;
    return `${days} ${language === 'ar' ? 'يوم' : 'd'} ago`;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        title={currentT.newOrders}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className={`absolute ${language === 'ar' ? 'right-0' : 'left-0'} mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200`}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{currentT.newOrders}</h3>
            {newOrders.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {currentT.clearAll}
              </button>
            )}
          </div>

          {/* Orders List */}
          <div className="max-h-96 overflow-y-auto">
            {newOrders.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                {currentT.noOrders}
              </div>
            ) : (
              newOrders.map(order => (
                <div
                  key={order.id}
                  className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {currentT.orderAmount}: {order.totalAmount} KWD
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(order.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => markAsRead(order.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title={currentT.markAsRead}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {newOrders.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <a
                href="/admin-dashboard?tab=ordersManagement"
                className="block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-2"
              >
                {currentT.viewOrder}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
