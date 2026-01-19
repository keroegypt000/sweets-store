import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, products, cartItems, orders, orderItems, banners } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Categories queries
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.order);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Products queries
export async function getProducts(limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products)
    .where(eq(products.isActive, true))
    .limit(limit)
    .offset(offset);
}

export async function getProductsByCategory(categoryId: number, limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products)
    .where((eq(products.categoryId, categoryId) as any) && (eq(products.isActive, true) as any))
    .limit(limit)
    .offset(offset);
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFeaturedProducts(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products)
    .where(eq(products.isFeatured, true) && eq(products.isActive, true))
    .limit(limit);
}

export async function getPromotionalProducts(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products)
    .where(eq(products.isPromotion, true) && eq(products.isActive, true))
    .limit(limit);
}

// Cart queries
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  // Fetch product details for each cart item
  const itemsWithProducts = await Promise.all(
    items.map(async (item) => {
      const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      return {
        ...item,
        product: product[0] || null,
      };
    })
  );
  return itemsWithProducts;
}

export async function addToCart(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(cartItems).values({ userId, productId, quantity });
  return result;
}

// Orders queries
export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createOrder(userId: number, totalAmount: string, shippingAddress: string) {
  const db = await getDb();
  if (!db) return null;
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(orders).values({
    userId,
    orderNumber,
    totalAmount: totalAmount as any,
    shippingAddress,
  });
  // Fetch the created order
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : null;
}


// Product CRUD operations
export async function createProduct(data: {
  categoryId: number;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: string;
  originalPrice?: string;
  stock?: number;
  image?: string;
  sku?: string;
  slug: string;
  isFeatured?: boolean;
  isPromotion?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(products).values({
    ...data,
    price: data.price as any,
    originalPrice: data.originalPrice as any,
    isActive: true,
  });
  
  // Fetch and return the created product
  const created = await db.select().from(products).where(eq(products.slug, data.slug)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function updateProduct(id: number, data: {
  categoryId?: number;
  nameAr?: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price?: string;
  originalPrice?: string;
  stock?: number;
  image?: string;
  sku?: string;
  slug?: string;
  isFeatured?: boolean;
  isPromotion?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const updateData: any = {};
  Object.keys(data).forEach(key => {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  });
  
  if (Object.keys(updateData).length === 0) return null;
  
  await db.update(products).set(updateData).where(eq(products.id, id));
  
  // Fetch and return the updated product
  const updated = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return updated.length > 0 ? updated[0] : null;
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) return false;
  
  // Soft delete by setting isActive to false
  await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  return true;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllProducts(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).limit(limit).offset(offset);
}


// Category CRUD operations
export async function createCategory(data: {
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image?: string;
  slug: string;
  order?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(categories).values({
    ...data,
    isActive: true,
  });
  
  // Fetch and return the created category
  const created = await db.select().from(categories).where(eq(categories.slug, data.slug)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function updateCategory(id: number, data: {
  nameAr?: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image?: string;
  slug?: string;
  order?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const updateData: any = {};
  Object.keys(data).forEach(key => {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  });
  
  if (Object.keys(updateData).length === 0) return null;
  
  await db.update(categories).set(updateData).where(eq(categories.id, id));
  
  // Fetch and return the updated category
  const updated = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return updated.length > 0 ? updated[0] : null;
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) return false;
  
  // Soft delete by setting isActive to false
  await db.update(categories).set({ isActive: false }).where(eq(categories.id, id));
  return true;
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCategories(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).limit(limit).offset(offset);
}


// Banner CRUD operations
export async function createBanner(data: {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image: string;
  link?: string;
  order?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  
  await db.insert(banners).values({
    ...data,
    isActive: true,
  });
  
  const created = await db.select().from(banners).orderBy(banners.id).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function updateBanner(id: number, data: {
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image?: string;
  link?: string;
  order?: number;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const updateData: any = {};
  Object.keys(data).forEach(key => {
    if (data[key as keyof typeof data] !== undefined) {
      updateData[key] = data[key as keyof typeof data];
    }
  });
  
  if (Object.keys(updateData).length === 0) return null;
  
  await db.update(banners).set(updateData).where(eq(banners.id, id));
  
  const updated = await db.select().from(banners).where(eq(banners.id, id)).limit(1);
  return updated.length > 0 ? updated[0] : null;
}

export async function deleteBanner(id: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.update(banners).set({ isActive: false }).where(eq(banners.id, id));
  return true;
}

export async function getBanners() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(banners).where(eq(banners.isActive, true)).orderBy(banners.order);
}

export async function getAllBanners(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(banners).limit(limit).offset(offset);
}

// Order queries
export async function getAllOrders(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).limit(limit).offset(offset);
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
  
  const updated = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return updated.length > 0 ? updated[0] : null;
}

export async function getOrderWithItems(orderId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (order.length === 0) return null;
  
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  
  return {
    ...order[0],
    items: items,
  };
}
