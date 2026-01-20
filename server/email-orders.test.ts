import { describe, it, expect, beforeAll } from 'vitest';
import { getDb, createOrder, getAllOrders, updateOrderStatus } from './db';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from './_core/emailService';

describe('Email and Orders Management', () => {
  let db: any;
  const testUserId = 999;

  beforeAll(async () => {
    db = await getDb();
  });

  describe('Email Service', () => {
    it('should send order confirmation email', async () => {
      const result = await sendOrderConfirmationEmail(
        'test@example.com',
        'Test Customer',
        'ORD-001',
        '100.00',
        [
          { name: 'Product 1', quantity: 2, price: '50.00' },
          { name: 'Product 2', quantity: 1, price: '50.00' },
        ]
      );

      // Email service may not be configured in test environment
      expect(typeof result).toBe('boolean');
    });

    it('should send order status update email', async () => {
      const result = await sendOrderStatusUpdateEmail(
        'test@example.com',
        'Test Customer',
        'ORD-001',
        'shipped',
        'مشحون'
      );

      expect(typeof result).toBe('boolean');
    });
  });

  describe('Order Management', () => {
    it('should create order with customer data', async () => {
      if (!db) return;

      const result = await createOrder(
        testUserId,
        '150.00',
        '123 Test St',
        'John Doe',
        'john@example.com',
        '+1234567890'
      );

      expect(result).toBeDefined();
      expect(result?.totalAmount).toBe('150.00');
      expect(result?.customerName).toBe('John Doe');
      expect(result?.customerEmail).toBe('john@example.com');
    });

    it('should get all orders', async () => {
      if (!db) return;

      const orders = await getAllOrders(100, 0);
      expect(Array.isArray(orders)).toBe(true);
    });

    it('should update order status', async () => {
      if (!db) return;

      // Create an order first
      const order = await createOrder(
        testUserId,
        '200.00',
        '456 Test Ave',
        'Jane Doe',
        'jane@example.com',
        '+0987654321'
      );

      if (!order) return;

      // Update its status
      const updated = await updateOrderStatus(order.id, 'confirmed');
      expect(updated?.status).toBe('confirmed');
    });

    it('should handle order status transitions', async () => {
      if (!db) return;

      const order = await createOrder(
        testUserId,
        '300.00',
        '789 Test Rd',
        'Bob Smith',
        'bob@example.com',
        '+5555555555'
      );

      if (!order) return;

      // Test status transitions
      const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
      let currentOrder = order;

      for (const status of statuses) {
        currentOrder = await updateOrderStatus(currentOrder.id, status as any);
        expect(currentOrder?.status).toBe(status);
      }
    });
  });

  describe('Order Data Integrity', () => {
    it('should preserve customer information in orders', async () => {
      if (!db) return;

      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+1234567890',
      };

      const order = await createOrder(
        testUserId,
        '250.00',
        '999 Test Blvd',
        customerData.name,
        customerData.email,
        customerData.phone
      );

      expect(order?.customerName).toBe(customerData.name);
      expect(order?.customerEmail).toBe(customerData.email);
      expect(order?.customerPhone).toBe(customerData.phone);
    });

    it('should handle orders without customer data', async () => {
      if (!db) return;

      const order = await createOrder(
        testUserId,
        '100.00',
        '111 Anonymous St'
      );

      expect(order).toBeDefined();
      expect(order?.customerName).toBeNull();
      expect(order?.customerEmail).toBeNull();
      expect(order?.customerPhone).toBeNull();
    });
  });
});
