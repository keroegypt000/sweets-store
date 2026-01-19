import { Router, Request, Response } from 'express';
import { getDb } from './db';
import { products, categories, banners, orders } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// ============ PRODUCTS ============

// GET all products
router.get('/products', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const allProducts = await db.select().from(products);
    res.json(allProducts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST create product
router.post('/products', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const { nameAr, nameEn, descriptionAr, descriptionEn, price, stock, image, slug, categoryId } = req.body;
    
    await db.insert(products).values({
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      price: price as any,
      stock: parseInt(stock),
      image,
      slug,
      categoryId: categoryId ? parseInt(categoryId) : 1,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product
router.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const { id } = req.params;
    const { nameAr, nameEn, descriptionAr, descriptionEn, price, stock, image, slug, categoryId } = req.body;

    await db.update(products)
      .set({
        nameAr,
        nameEn,
        descriptionAr,
        descriptionEn,
        price: price as any,
        stock: parseInt(stock),
        image,
        slug,
        categoryId: categoryId ? parseInt(categoryId) : 1,
      } as any)
      .where(eq(products.id, parseInt(id)));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const { id } = req.params;
    await db.delete(products).where(eq(products.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ============ CATEGORIES ============

// GET all categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const allCategories = await db.select().from(categories);
    res.json(allCategories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST create category
router.post('/categories', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const { nameAr, nameEn, descriptionAr, descriptionEn, image, slug, order } = req.body;

    await db.insert(categories).values({
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      image,
      slug,
      order: parseInt(order) || 0,
      isActive: true,
    } as any);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT update category
router.put('/categories/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const { id } = req.params;
    const { nameAr, nameEn, descriptionAr, descriptionEn, image, slug, order } = req.body;

    await db.update(categories)
      .set({
        nameAr,
        nameEn,
        descriptionAr,
        descriptionEn,
        image,
        slug,
        order: parseInt(order) || 0,
      } as any)
      .where(eq(categories.id, parseInt(id)));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE category
router.delete('/categories/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const { id } = req.params;
    await db.delete(categories).where(eq(categories.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ============ BANNERS ============

// GET all banners
router.get('/banners', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const allBanners = await db.select().from(banners);
    res.json(allBanners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// POST create banner
router.post('/banners', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const { titleAr, titleEn, descriptionAr, descriptionEn, image, link, order } = req.body;

    await db.insert(banners).values({
      titleAr,
      titleEn,
      descriptionAr,
      descriptionEn,
      image,
      link,
      order: parseInt(order) || 0,
    } as any);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create banner' });
  }
});

// PUT update banner
router.put('/banners/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const { id } = req.params;
    const { titleAr, titleEn, descriptionAr, descriptionEn, image, link, order } = req.body;

    await db.update(banners)
      .set({
        titleAr,
        titleEn,
        descriptionAr,
        descriptionEn,
        image,
        link,
        order: parseInt(order) || 0,
      } as any)
      .where(eq(banners.id, parseInt(id)));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
});

// DELETE banner
router.delete('/banners/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const { id } = req.params;
    await db.delete(banners).where(eq(banners.id, parseInt(id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

// ============ ORDERS ============

// GET all orders
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const allOrders = await db.select().from(orders);
    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT update order status
router.put('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const { id } = req.params;
    const { status } = req.body;

    await db.update(orders)
      .set({ status } as any)
      .where(eq(orders.id, parseInt(id)));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
