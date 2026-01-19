import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("cart operations", () => {
  it("should fetch empty cart for new user", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const cartItems = await caller.cart.list();

    expect(cartItems).toBeDefined();
    expect(Array.isArray(cartItems)).toBe(true);
  });

  it("should add item to cart", async () => {
    const ctx = createAuthContext(2);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cart.add({
      productId: 1,
      quantity: 2,
    });

    expect(result).toBeDefined();
  });
});

describe("order operations", () => {
  it("should create order with valid data", async () => {
    const ctx = createAuthContext(3);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.create({
      totalAmount: "25.50",
      shippingAddress: "123 Main Street, Kuwait City",
    });

    expect(result).toBeDefined();
    if (result) {
      expect(result.id).toBeDefined();
      expect(result.userId).toBe(3);
    }
  });

  it("should list user orders", async () => {
    const ctx = createAuthContext(4);
    const caller = appRouter.createCaller(ctx);

    const orders = await caller.orders.list();

    expect(orders).toBeDefined();
    expect(Array.isArray(orders)).toBe(true);
  });
});

describe("product operations", () => {
  it("should fetch all products", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list({ limit: 10, offset: 0 });

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
  });

  it("should fetch featured products", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.featured({ limit: 10 });

    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
  });

  it("should fetch product by slug", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const product = await caller.products.bySlug({ slug: "dark-chocolate" });

    expect(product).toBeDefined();
    if (product) {
      expect(product.slug).toBe("dark-chocolate");
    }
  });
});

describe("category operations", () => {
  it("should fetch all categories", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.categories.list();

    expect(categories).toBeDefined();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  it("should have correct category names", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.categories.list();

    const chocolateCategory = categories.find((c) => c.slug === "chocolates");
    expect(chocolateCategory).toBeDefined();
    if (chocolateCategory) {
      expect(chocolateCategory.nameAr).toBe("الشوكولاتة");
      expect(chocolateCategory.nameEn).toBe("Chocolates");
    }
  });
});
