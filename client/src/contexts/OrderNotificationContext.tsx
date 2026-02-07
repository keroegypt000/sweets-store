import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

interface NewOrder {
  id: number;
  orderNumber: string;
  totalAmount: string;
  customerName: string;
  createdAt: Date;
}

interface OrderNotificationContextType {
  newOrders: NewOrder[];
  unreadCount: number;
  addNotification: (order: NewOrder) => void;
  clearNotifications: () => void;
  markAsRead: (orderId: number) => void;
}

const OrderNotificationContext = createContext<OrderNotificationContextType | undefined>(undefined);

export function OrderNotificationProvider({ children }: { children: React.ReactNode }) {
  const [newOrders, setNewOrders] = useState<NewOrder[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastCheckedTime, setLastCheckedTime] = useState<number>(Date.now());
  const ordersQuery = trpc.orders.list.useQuery(undefined, {
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Check for new orders
  useEffect(() => {
    if (ordersQuery.data && ordersQuery.data.length > 0) {
      const recentOrders = ordersQuery.data.filter(order => {
        const orderTime = new Date(order.createdAt).getTime();
        return orderTime > lastCheckedTime;
      });

      if (recentOrders.length > 0) {
        // Play notification sound
        playNotificationSound();
        
        // Add new orders to notification list
        recentOrders.forEach(order => {
          setNewOrders(prev => {
            const exists = prev.some(o => o.id === order.id);
            if (!exists) {
              return [{
                id: order.id,
                orderNumber: `#${order.id}`,
                totalAmount: order.totalAmount,
                customerName: order.shippingAddress?.split('\n')[0] || 'عميل جديد',
                createdAt: new Date(order.createdAt),
              }, ...prev];
            }
            return prev;
          });
        });

        setUnreadCount(prev => prev + recentOrders.length);
        setLastCheckedTime(Date.now());
      }
    }
  }, [ordersQuery.data, lastCheckedTime]);

  const playNotificationSound = useCallback(() => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not available');
    }
  }, []);

  const addNotification = useCallback((order: NewOrder) => {
    setNewOrders(prev => [order, ...prev]);
    setUnreadCount(prev => prev + 1);
    playNotificationSound();
  }, [playNotificationSound]);

  const clearNotifications = useCallback(() => {
    setNewOrders([]);
    setUnreadCount(0);
  }, []);

  const markAsRead = useCallback((orderId: number) => {
    setNewOrders(prev => prev.filter(o => o.id !== orderId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  return (
    <OrderNotificationContext.Provider value={{
      newOrders,
      unreadCount,
      addNotification,
      clearNotifications,
      markAsRead,
    }}>
      {children}
    </OrderNotificationContext.Provider>
  );
}

export function useOrderNotifications() {
  const context = useContext(OrderNotificationContext);
  if (!context) {
    throw new Error('useOrderNotifications must be used within OrderNotificationProvider');
  }
  return context;
}
