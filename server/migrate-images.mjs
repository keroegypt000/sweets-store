import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { products, categories, banners, images } from "../drizzle/schema.ts";
import { eq, not, isNull } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function migrateImages() {
  let connection;
  try {
    // Create connection
    const pool = await mysql.createPool({
      uri: DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const db = drizzle(pool);

    console.log("Starting image migration...");

    // Migrate product images
    console.log("\n📦 Migrating product images...");
    const productList = await db.select().from(products);
    let productImageCount = 0;

    for (const product of productList) {
      if (product.image) {
        try {
          // Check if image already exists
          const existing = await db
            .select()
            .from(images)
            .where(eq(images.url, product.image))
            .limit(1);

          if (existing.length === 0) {
            // Extract filename from URL
            const fileName = product.image.split("/").pop() || `product-${product.id}.jpg`;

            await db.insert(images).values({
              fileName: fileName,
              fileKey: `products/${product.id}-${fileName}`,
              url: product.image,
              mimeType: "image/jpeg",
              usageType: "product",
              description: `Product image for ${product.nameAr}`,
            });

            productImageCount++;
          }
        } catch (error) {
          console.error(`Error migrating product image ${product.id}:`, error.message);
        }
      }

      // Migrate multiple product images if they exist
      if (product.images) {
        try {
          const imageUrls = JSON.parse(product.images);
          if (Array.isArray(imageUrls)) {
            for (const imageUrl of imageUrls) {
              const existing = await db
                .select()
                .from(images)
                .where(eq(images.url, imageUrl))
                .limit(1);

              if (existing.length === 0) {
                const fileName = imageUrl.split("/").pop() || `product-${product.id}-${Date.now()}.jpg`;

                await db.insert(images).values({
                  fileName: fileName,
                  fileKey: `products/${product.id}-${Date.now()}-${fileName}`,
                  url: imageUrl,
                  mimeType: "image/jpeg",
                  usageType: "product",
                  description: `Product image for ${product.nameAr}`,
                });

                productImageCount++;
              }
            }
          }
        } catch (error) {
          console.error(`Error parsing product images for ${product.id}:`, error.message);
        }
      }
    }
    console.log(`✅ Migrated ${productImageCount} product images`);

    // Migrate category images
    console.log("\n📁 Migrating category images...");
    const categoryList = await db.select().from(categories);
    let categoryImageCount = 0;

    for (const category of categoryList) {
      if (category.image) {
        try {
          const existing = await db
            .select()
            .from(images)
            .where(eq(images.url, category.image))
            .limit(1);

          if (existing.length === 0) {
            const fileName = category.image.split("/").pop() || `category-${category.id}.jpg`;

            await db.insert(images).values({
              fileName: fileName,
              fileKey: `categories/${category.id}-${fileName}`,
              url: category.image,
              mimeType: "image/jpeg",
              usageType: "category",
              description: `Category image for ${category.nameAr}`,
            });

            categoryImageCount++;
          }
        } catch (error) {
          console.error(`Error migrating category image ${category.id}:`, error.message);
        }
      }
    }
    console.log(`✅ Migrated ${categoryImageCount} category images`);

    // Migrate banner images
    console.log("\n🎨 Migrating banner images...");
    const bannerList = await db.select().from(banners);
    let bannerImageCount = 0;

    for (const banner of bannerList) {
      if (banner.image) {
        try {
          const existing = await db
            .select()
            .from(images)
            .where(eq(images.url, banner.image))
            .limit(1);

          if (existing.length === 0) {
            const fileName = banner.image.split("/").pop() || `banner-${banner.id}.jpg`;

            await db.insert(images).values({
              fileName: fileName,
              fileKey: `banners/${banner.id}-${fileName}`,
              url: banner.image,
              mimeType: "image/jpeg",
              usageType: "banner",
              description: `Banner image for ${banner.titleAr}`,
            });

            bannerImageCount++;
          }
        } catch (error) {
          console.error(`Error migrating banner image ${banner.id}:`, error.message);
        }
      }
    }
    console.log(`✅ Migrated ${bannerImageCount} banner images`);

    // Summary
    console.log("\n📊 Migration Summary:");
    console.log(`   Products: ${productImageCount} images`);
    console.log(`   Categories: ${categoryImageCount} images`);
    console.log(`   Banners: ${bannerImageCount} images`);
    console.log(`   Total: ${productImageCount + categoryImageCount + bannerImageCount} images`);

    const totalImages = await db.select().from(images);
    console.log(`\n✨ Total images in database: ${totalImages.length}`);

    await pool.end();
    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateImages();
