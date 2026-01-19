import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getCategories, getProducts, getProductsByCategory, getProductBySlug, getFeaturedProducts, getPromotionalProducts, getCartItems, addToCart, getUserOrders, createOrder, createProduct, updateProduct, deleteProduct, getProductById, getAllProducts, createCategory, updateCategory, deleteCategory, getCategoryById, getAllCategories, createBanner, updateBanner, deleteBanner, getBanners, getAllBanners, getAllOrders, updateOrderStatus, getOrderWithItems } from "./db";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";

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
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return getCartItems(ctx.user.id);
      }),
    add: protectedProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().default(1) }))
      .mutation(async ({ ctx, input }) => {
        return addToCart(ctx.user.id, input.productId, input.quantity);
      }),
  }),

  orders: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return getUserOrders(ctx.user.id);
      }),
    create: protectedProcedure
      .input(z.object({ totalAmount: z.string(), shippingAddress: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const result = await createOrder(ctx.user.id, input.totalAmount, input.shippingAddress);
        await notifyOwner({
          title: 'New Order Received',
          content: `New order from ${ctx.user.name || 'Customer'} for ${input.totalAmount} KWD. Shipping address: ${input.shippingAddress}`,
        });
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



