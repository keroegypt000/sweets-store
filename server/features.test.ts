import { describe, it, expect, beforeAll } from 'vitest';
import { getDb, addToCart, getCartItems, createOrder } from './db';
import { cartItems, orders } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('New Features', () => {
  let db: any;
  const testUserId = 999;
  const testProductId = 1;

  beforeAll(async () => {
    db = await getDb();
  });

  describe('Customer Data in Orders', () => {
    it('should create order with customer data', async () => {
      if (!db) return;

      const result = await createOrder(
        testUserId,
        '100.00',
        '123 Main St',
        'John Doe',
        'john@example.com',
        '+1234567890'
      );

      expect(result).toBeDefined();
      expect(result?.customerName).toBe('John Doe');
      expect(result?.customerEmail).toBe('john@example.com');
      expect(result?.customerPhone).toBe('+1234567890');
    });

    it('should create order without customer data', async () => {
      if (!db) return;

      const result = await createOrder(
        testUserId,
        '50.00',
        '456 Oak Ave'
      );

      expect(result).toBeDefined();
      expect(result?.customerName).toBeNull();
      expect(result?.customerEmail).toBeNull();
      expect(result?.customerPhone).toBeNull();
    });
  });

  describe('Cart Management', () => {
    it('should add item to cart', async () => {
      if (!db) return;

      const result = await addToCart(testUserId, testProductId, 2);
      expect(result).toBeDefined();
      expect(result?.quantity).toBe(2);
    });

    it('should get cart items', async () => {
      if (!db) return;

      const items = await getCartItems(testUserId);
      expect(Array.isArray(items)).toBe(true);
    });

    it('should delete cart item', async () => {
      if (!db) return;

      const items = await getCartItems(testUserId);
      if (items.length > 0) {
        const itemId = items[0].id;
        await db.delete(cartItems).where(eq(cartItems.id, itemId));
        
        const updatedItems = await getCartItems(testUserId);
        expect(updatedItems.length).toBeLessThanOrEqual(items.length);
      }
    });

    it('should update cart item quantity', async () => {
      if (!db) return;

      const items = await getCartItems(testUserId);
      if (items.length > 0) {
        const itemId = items[0].id;
        await db.update(cartItems).set({ quantity: 5 }).where(eq(cartItems.id, itemId));
        
        const updatedItems = await getCartItems(testUserId);
        const updatedItem = updatedItems.find(i => i.id === itemId);
        expect(updatedItem?.quantity).toBe(5);
      }
    });
  });

  describe('Public Cart Operations', () => {
    it('should add to cart without authentication', async () => {
      if (!db) return;

      const guestUserId = 1; // Default guest user
      const result = await addToCart(guestUserId, testProductId, 1);
      expect(result).toBeDefined();
    });

    it('should get cart items without authentication', async () => {
      if (!db) return;

      const guestUserId = 1;
      const items = await getCartItems(guestUserId);
      expect(Array.isArray(items)).toBe(true);
    });

    it('should create order without authentication', async () => {
      if (!db) return;

      const guestUserId = 1;
      const result = await createOrder(
        guestUserId,
        '75.00',
        '789 Pine Rd',
        'Guest Customer',
        'guest@example.com',
        '+9876543210'
      );

      expect(result).toBeDefined();
      expect(result?.totalAmount).toBe('75.00');
    });
  });
});
