import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getCategories, getProducts, getProductsByCategory, getProductBySlug, getFeaturedProducts, getPromotionalProducts, getCartItems, addToCart, getUserOrders, createOrder, createProduct, updateProduct, deleteProduct, getProductById, getAllProducts, createCategory, updateCategory, deleteCategory, getCategoryById, getAllCategories, createBanner, updateBanner, deleteBanner, getBanners, getAllBanners, getAllOrders, updateOrderStatus, updateOrder, getOrderWithItems, getDb, createImage, getImages, getImagesByUsageType, getImageById, deleteImage, updateImage, getImageStatistics, getImagesByType } from "./db";
import { cartItems } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  products: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        return getProducts(input?.limit || 20, input?.offset || 0);
      }),
    featured: publicProcedure
      .input(z.object({ limit: z.number().default(10) }).optional())
      .query(async ({ input }) => {
        return getFeaturedProducts(input?.limit || 10);
      }),
    promotions: publicProcedure
      .input(z.object({ limit: z.number().default(10) }).optional())
      .query(async ({ input }) => {
        return getPromotionalProducts(input?.limit || 10);
      }),
    byCategory: publicProcedure
      .input(z.object({ categoryId: z.number(), limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return getProductsByCategory(input.categoryId, input.limit, input.offset);
      }),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getProductBySlug(input.slug);
      }),
    allProducts: protectedProcedure
      .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return getAllProducts(input?.limit || 100, input?.offset || 0);
      }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return getProductById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
        nameAr: z.string().min(1),
        nameEn: z.string().min(1),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        price: z.string().min(1),
        originalPrice: z.string().optional(),
        stock: z.number().default(0),
        image: z.string().optional(),
        sku: z.string().optional(),
        slug: z.string().min(1),
        isFeatured: z.boolean().default(false),
        isPromotion: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return createProduct(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        categoryId: z.number().optional(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        price: z.string().optional(),
        originalPrice: z.string().optional(),
        stock: z.number().optional(),
        image: z.string().optional(),
        sku: z.string().optional(),
        slug: z.string().optional(),
        isFeatured: z.boolean().optional(),
        isPromotion: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        const { id, ...data } = input;
        return updateProduct(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return deleteProduct(input.id);
      }),
  }),

  categories: router({
    list: publicProcedure
      .query(async () => {
        return getCategories();
      }),
    allCategories: protectedProcedure
      .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return getAllCategories(input?.limit || 100, input?.offset || 0);
      }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return getCategoryById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        nameAr: z.string().min(1),
        nameEn: z.string().min(1),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        image: z.string().optional(),
        slug: z.string().min(1),
        order: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return createCategory(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nameAr: z.string().optional(),
        nameEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        image: z.string().optional(),
        slug: z.string().optional(),
        order: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        const { id, ...data } = input;
        return updateCategory(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return deleteCategory(input.id);
      }),
  }),

  cart: router({
    list: publicProcedure
      .input(z.object({ userId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const userId = input?.userId || ctx.user?.id || 1;
        return getCartItems(userId);
      }),
    add: publicProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().default(1), userId: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        const userId = input.userId || ctx.user?.id || 1;
        return addToCart(userId, input.productId, input.quantity);
      }),
    delete: publicProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        await db.delete(cartItems).where(eq(cartItems.id, input.cartItemId));
        return { success: true };
      }),
    update: publicProcedure
      .input(z.object({ cartItemId: z.number(), quantity: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        if (input.quantity <= 0) {
          await db.delete(cartItems).where(eq(cartItems.id, input.cartItemId));
        } else {
          await db.update(cartItems).set({ quantity: input.quantity }).where(eq(cartItems.id, input.cartItemId));
        }
        return { success: true };
      }),
  }),

  orders: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return getUserOrders(ctx.user.id);
      }),
    create: publicProcedure
      .input(z.object({ totalAmount: z.string(), shippingAddress: z.string(), userId: z.number().optional(), customerName: z.string().optional(), customerEmail: z.string().optional(), customerPhone: z.string().optional(), items: z.array(z.object({ productId: z.number(), quantity: z.number(), price: z.string() })).optional() }))
      .mutation(async ({ ctx, input }) => {
        const userId = input.userId || ctx.user?.id || 1;
        const result = await createOrder(userId, input.totalAmount, input.shippingAddress, input.customerName, input.customerEmail, input.customerPhone, input.items);
        await notifyOwner({
          title: 'New Order Received',
          content: `New order from ${ctx.user?.name || 'Guest Customer'} for ${input.totalAmount} KWD. Shipping address: ${input.shippingAddress}`,
        });
        // Send email notification to customer
        if (input.customerEmail) {
          const { sendOrderConfirmationEmail } = await import('./_core/emailService');
          sendOrderConfirmationEmail(
            input.customerEmail,
            input.customerName || 'Customer',
            result?.orderNumber || 'N/A',
            input.totalAmount,
            []
          ).catch((err: any) => console.error('Email sending failed:', err));
        }
        return result;
      }),
    allOrders: protectedProcedure
      .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return getAllOrders(input?.limit || 100, input?.offset || 0);
      }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return getOrderWithItems(input.id);
      }),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return updateOrderStatus(input.id, input.status);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        customerName: z.string().optional(),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().optional(),
        shippingAddress: z.string().optional(),
        status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return updateOrder(input.id, {
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          shippingAddress: input.shippingAddress,
          status: input.status,
          notes: input.notes,
        });
      }),
    sendStatusEmail: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        customerEmail: z.string().email(),
        customerName: z.string(),
        status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        const { sendOrderStatusUpdateEmail } = await import('./_core/emailService');
        const orderNumber = `ORD-${input.orderId}`;
        await sendOrderStatusUpdateEmail(
          input.customerEmail,
          input.customerName,
          orderNumber,
          input.status,
          input.status
        );
        return { success: true };
      }),
  }),

  banners: router({
    list: publicProcedure
      .query(async () => {
        return getBanners();
      }),
    allBanners: protectedProcedure
      .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return getAllBanners(input?.limit || 100, input?.offset || 0);
      }),
    create: protectedProcedure
      .input(z.object({
        titleAr: z.string().min(1),
        titleEn: z.string().min(1),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        image: z.string().min(1),
        link: z.string().optional(),
        order: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return createBanner(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        titleAr: z.string().optional(),
        titleEn: z.string().optional(),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        image: z.string().optional(),
        link: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        const { id, ...data } = input;
        return updateBanner(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return deleteBanner(input.id);
      }),
  }),

  images: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return getImages(input?.limit || 100, input?.offset || 0);
      }),
    byUsageType: protectedProcedure
      .input(z.object({ usageType: z.string(), limit: z.number().default(100), offset: z.number().default(0) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return getImagesByUsageType(input.usageType, input.limit, input.offset);
      }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return getImageById(input.id);
      }),
    upload: protectedProcedure
      .input(z.object({
        fileName: z.string().min(1),
        fileData: z.string(),
        mimeType: z.string().default('image/jpeg'),
        altText: z.string().optional(),
        description: z.string().optional(),
        usageType: z.enum(['product', 'category', 'banner', 'general']).default('general'),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        
        try {
          const timestamp = Date.now();
          const randomStr = Math.random().toString(36).substring(2, 9);
          const fileKey = `images/${input.usageType}/${timestamp}-${randomStr}-${input.fileName}`;
          
          const buffer = Buffer.from(input.fileData, 'base64');
          const { url } = await storagePut(fileKey, buffer, input.mimeType);
          
          const image = await createImage({
            fileName: input.fileName,
            fileKey: fileKey,
            url: url,
            mimeType: input.mimeType,
            fileSize: buffer.length,
            altText: input.altText,
            description: input.description,
            usageType: input.usageType,
            uploadedBy: ctx.user.id,
          });
          
          return image;
        } catch (error) {
          console.error('Image upload error:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to upload image',
          });
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return deleteImage(input.id);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        altText: z.string().optional(),
        description: z.string().optional(),
        usageType: z.enum(['product', 'category', 'banner', 'general']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        const { id, ...data } = input;
        return updateImage(id, data);
      }),
    statistics: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return getImageStatistics();
      }),
    byType: protectedProcedure
      .input(z.object({ usageType: z.string() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        return getImagesByType(input.usageType);
      }),
    unusedImages: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        const { getUnusedImages } = await import('./db');
        return getUnusedImages();
      }),
    unusedImagesStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        const { getUnusedImagesStats } = await import('./db');
        return getUnusedImagesStats();
      }),
    deleteUnused: protectedProcedure
      .input(z.object({ imageIds: z.array(z.number()).min(1) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
        const { deleteUnusedImages } = await import('./db');
        return deleteUnusedImages(input.imageIds);
      }),
  }),

  admin: router({
    login: publicProcedure
      .input(z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // Simple admin credentials (in production, use proper hashing and database)
        const ADMIN_USERNAME = 'admin';
        const ADMIN_PASSWORD = 'admin123'; // Change this in production!

        // Debug: Log the input
        console.log('Login attempt:', { username: input.username, password: input.password });
        console.log('Expected:', { username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
        
        if (input.username === ADMIN_USERNAME && input.password === ADMIN_PASSWORD) {
          // Create admin session
          const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          
          // Store session in a simple way (in production, use database)
          // For now, we'll return the token to the client
          return {
            success: true,
            token: sessionToken,
            admin: {
              id: 1,
              username: ADMIN_USERNAME,
              role: 'admin',
            },
          };
        }

        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials (username: admin, password: admin123)',
        });
      }),
    logout: publicProcedure
      .mutation(async ({ ctx }) => {
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;




    // Placeholder - will be replaced with actual procedures
