import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, products, cartItems, orders, orderItems, banners, images } from "../drizzle/schema";
import { eq, sql, desc } from "drizzle-orm";
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

export async function createOrder(userId: number, totalAmount: string, shippingAddress: string, customerName?: string, customerEmail?: string, customerPhone?: string, cartItems?: Array<{productId: number, quantity: number, price: string}>, area?: string, block?: string, street?: string, avenue?: string, houseNumber?: string, additionalDetails?: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Generate unique order number: ORD-YYYYMMDD-HHMMSS-RANDOM
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const orderNumber = `ORD-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
  
  console.log('Creating order with number:', orderNumber);
  
  await db.insert(orders).values({
    userId,
    orderNumber,
    totalAmount: totalAmount as any,
    shippingAddress,
    customerName: customerName || null,
    customerEmail: customerEmail || null,
    customerPhone: customerPhone || null,
    area: area || null,
    block: block || null,
    street: street || null,
    avenue: avenue || null,
    houseNumber: houseNumber || null,
    additionalDetails: additionalDetails || null,
  });
  
  // Fetch the created order
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  
  // Save order items if provided
  if (result.length > 0 && cartItems && cartItems.length > 0) {
    const orderId = result[0].id;
    for (const item of cartItems) {
      await db.insert(orderItems).values({
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price as any,
      });
    }
  }
  
  console.log('Order created:', result.length > 0 ? result[0] : null);
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
  
  // Auto-register product image if provided
  if (created.length > 0 && data.image) {
    try {
      const product = created[0];
      const existingImage = await db.select().from(images).where(eq(images.url, data.image)).limit(1);
      
      if (existingImage.length === 0) {
        const fileName = data.image.split('/').pop() || `product-${product.id}.jpg`;
        await db.insert(images).values({
          fileName: fileName,
          fileKey: `products/${product.id}-${fileName}`,
          url: data.image,
          mimeType: 'image/jpeg',
          usageType: 'product',
          description: `Product image for ${data.nameAr}`,
        });
      }
    } catch (error) {
      console.error('Error registering product image:', error);
    }
  }
  
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
  
  // Auto-register category image if provided
  if (created.length > 0 && data.image) {
    try {
      const category = created[0];
      const existingImage = await db.select().from(images).where(eq(images.url, data.image)).limit(1);
      
      if (existingImage.length === 0) {
        const fileName = data.image.split('/').pop() || `category-${category.id}.jpg`;
        await db.insert(images).values({
          fileName: fileName,
          fileKey: `categories/${category.id}-${fileName}`,
          url: data.image,
          mimeType: 'image/jpeg',
          usageType: 'category',
          description: `Category image for ${data.nameAr}`,
        });
      }
    } catch (error) {
      console.error('Error registering category image:', error);
    }
  }
  
  return created.length > 0 ? created[0] : null;
}

export async function updateCategory(id: number, data: {
  nameAr?: string;
  nameEn?: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  image?: string | null;
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
  
  // Auto-register banner image if provided
  if (created.length > 0 && data.image) {
    try {
      const banner = created[0];
      const existingImage = await db.select().from(images).where(eq(images.url, data.image)).limit(1);
      
      if (existingImage.length === 0) {
        const fileName = data.image.split('/').pop() || `banner-${banner.id}.jpg`;
        await db.insert(images).values({
          fileName: fileName,
          fileKey: `banners/${banner.id}-${fileName}`,
          url: data.image,
          mimeType: 'image/jpeg',
          usageType: 'banner',
          description: `Banner image for ${data.titleAr}`,
        });
      }
    } catch (error) {
      console.error('Error registering banner image:', error);
    }
  }
  
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
  
  try {
    // Get all orders sorted by newest first
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit).offset(offset);
    
    console.log('Fetched orders from database:', allOrders.length);
    
    // Get items for each order
    const ordersWithItems = await Promise.all(
      allOrders.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return {
          ...order,
          items,
        };
      })
    );
    
    console.log('Orders with items:', ordersWithItems);
    return ordersWithItems;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
  
  const updated = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return updated.length > 0 ? updated[0] : null;
}

export async function updateOrder(id: number, data: {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  status?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const updateData: any = {};
  if (data.customerName !== undefined) updateData.customerName = data.customerName;
  if (data.customerEmail !== undefined) updateData.customerEmail = data.customerEmail;
  if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone;
  if (data.shippingAddress !== undefined) updateData.shippingAddress = data.shippingAddress;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;
  
  if (Object.keys(updateData).length === 0) return null;
  
  await db.update(orders).set(updateData).where(eq(orders.id, id));
  
  const updated = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (updated.length === 0) return null;
  
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  
  return {
    ...updated[0],
    items: items,
  };
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

// Image CRUD operations
export async function createImage(data: {
  fileName: string;
  fileKey: string;
  url: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  altText?: string;
  description?: string;
  usageType?: string;
  uploadedBy?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(images).values({
    ...data,
    mimeType: data.mimeType || "image/jpeg",
    usageType: (data.usageType || "general") as any,
  });
  
  const created = await db.select().from(images).where(eq(images.fileKey, data.fileKey)).limit(1);
  return created.length > 0 ? created[0] : null;
}

export async function getImages(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(images).limit(limit).offset(offset);
}

export async function getImagesByUsageType(usageType: string, limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(images).where(eq(images.usageType, usageType as any)).limit(limit).offset(offset);
}

export async function getImageById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(images).where(eq(images.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteImage(id: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(images).where(eq(images.id, id));
  return true;
}

export async function updateImage(id: number, data: {
  altText?: string;
  description?: string;
  usageType?: string;
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
  
  await db.update(images).set(updateData).where(eq(images.id, id));
  
  const updated = await db.select().from(images).where(eq(images.id, id)).limit(1);
  return updated.length > 0 ? updated[0] : null;
}


// Image Statistics Functions
export async function getImageStatistics() {
  const db = await getDb();
  if (!db) return null;
  
  try {
    // Get all images
    const allImages = await db.select().from(images);
    
    // Calculate total storage
    const totalSize = allImages.reduce((sum, img) => sum + (img.fileSize || 0), 0);
    
    // Count by usage type
    const countByType = {
      product: allImages.filter(img => img.usageType === 'product').length,
      category: allImages.filter(img => img.usageType === 'category').length,
      banner: allImages.filter(img => img.usageType === 'banner').length,
      general: allImages.filter(img => img.usageType === 'general').length,
    };
    
    // Size by usage type
    const sizeByType = {
      product: allImages.filter(img => img.usageType === 'product').reduce((sum, img) => sum + (img.fileSize || 0), 0),
      category: allImages.filter(img => img.usageType === 'category').reduce((sum, img) => sum + (img.fileSize || 0), 0),
      banner: allImages.filter(img => img.usageType === 'banner').reduce((sum, img) => sum + (img.fileSize || 0), 0),
      general: allImages.filter(img => img.usageType === 'general').reduce((sum, img) => sum + (img.fileSize || 0), 0),
    };
    
    return {
      totalImages: allImages.length,
      totalSize,
      countByType,
      sizeByType,
      storageLimit: 1024 * 1024 * 1024, // 1GB default limit
      usagePercentage: (totalSize / (1024 * 1024 * 1024)) * 100,
    };
  } catch (error) {
    console.error('Error calculating image statistics:', error);
    return null;
  }
}

export async function getImagesByType(usageType: string) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(images).where(eq(images.usageType, usageType as any));
  } catch (error) {
    console.error('Error fetching images by type:', error);
    return [];
  }
}


// Unused Images Detection Functions
export async function getUnusedImages() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    // Get all images
    const allImages = await db.select().from(images);
    
    // Get all image URLs used in products
    const productsData = await db.select().from(products);
    const usedProductImages = new Set<string>();
    
    for (const product of productsData) {
      if (product.image) {
        usedProductImages.add(product.image);
      }
      if (product.images) {
        try {
          const imageUrls = JSON.parse(product.images);
          if (Array.isArray(imageUrls)) {
            imageUrls.forEach((url: string) => usedProductImages.add(url));
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    // Get all image URLs used in categories
    const categoriesData = await db.select().from(categories);
    const usedCategoryImages = new Set<string>();
    
    for (const category of categoriesData) {
      if (category.image) {
        usedCategoryImages.add(category.image);
      }
    }
    
    // Get all image URLs used in banners
    const bannersData = await db.select().from(banners);
    const usedBannerImages = new Set<string>();
    
    for (const banner of bannersData) {
      if (banner.image) {
        usedBannerImages.add(banner.image);
      }
    }
    
    // Find unused images
    const unusedImages = allImages.filter(img => {
      const isUsedInProduct = usedProductImages.has(img.url);
      const isUsedInCategory = usedCategoryImages.has(img.url);
      const isUsedInBanner = usedBannerImages.has(img.url);
      
      return !isUsedInProduct && !isUsedInCategory && !isUsedInBanner;
    });
    
    return unusedImages;
  } catch (error) {
    console.error('Error detecting unused images:', error);
    return [];
  }
}

export async function getUnusedImagesStats() {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const unusedImages = await getUnusedImages();
    
    const totalUnusedSize = unusedImages.reduce((sum, img) => sum + (img.fileSize || 0), 0);
    const unusedCount = unusedImages.length;
    
    // Calculate potential savings
    const stats = await getImageStatistics();
    const currentUsage = stats?.totalSize || 0;
    const potentialSavingsPercentage = stats ? (totalUnusedSize / stats.totalSize) * 100 : 0;
    
    return {
      unusedCount,
      totalUnusedSize,
      unusedImages,
      potentialSavingsPercentage,
      currentStorageUsage: stats?.usagePercentage || 0,
      storageAfterCleanup: stats ? ((currentUsage - totalUnusedSize) / (stats.storageLimit || 1)) * 100 : 0,
    };
  } catch (error) {
    console.error('Error calculating unused images stats:', error);
    return null;
  }
}

export async function deleteUnusedImages(imageIds: number[]) {
  const db = await getDb();
  if (!db) return { deleted: 0, failed: 0 };
  
  let deleted = 0;
  let failed = 0;
  
  for (const id of imageIds) {
    try {
      // Verify image is unused before deleting
      const image = await db.select().from(images).where(eq(images.id, id)).limit(1);
      
      if (image.length === 0) {
        failed++;
        continue;
      }
      
      const img = image[0];
      
      // Check if image is still unused
      const productsUsing = await db.select().from(products).where(
        sql`${products.image} = ${img.url}`
      );
      
      // Also check products with multiple images
      const productsWithMultipleImages = await db.select().from(products).where(
        sql`${products.images} LIKE ${"%" + img.url + "%"}`
      );
      
      const categoriesUsing = await db.select().from(categories).where(eq(categories.image, img.url));
      const bannersUsing = await db.select().from(banners).where(eq(banners.image, img.url));
      
      if (productsUsing.length === 0 && productsWithMultipleImages.length === 0 && categoriesUsing.length === 0 && bannersUsing.length === 0) {
        await db.delete(images).where(eq(images.id, id));
        deleted++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error(`Error deleting image ${id}:`, error);
      failed++;
    }
  }
  
  return { deleted, failed };
}
