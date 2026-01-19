import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getCategories, getProducts, getProductsByCategory, getProductBySlug, getFeaturedProducts, getPromotionalProducts, getCartItems, addToCart, getUserOrders, createOrder, createProduct, updateProduct, deleteProduct, getProductById, getAllProducts } from "./db";
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
        // Notify owner about new order
        await notifyOwner({
          title: 'New Order Received',
          content: `New order from ${ctx.user.name || 'Customer'} for ${input.totalAmount} KWD. Shipping address: ${input.shippingAddress}`,
        });
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
