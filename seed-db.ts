import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { categories, products } from './drizzle/schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = mysql.createPool(DATABASE_URL);
const db = drizzle(pool);

const categoriesData = [
  { nameAr: 'تم إضافته مؤخراً', nameEn: 'Recently Added', slug: 'recently-added', order: 1 },
  { nameAr: 'الأكثر مبيعاً', nameEn: 'Most Selling', slug: 'most-selling', order: 2 },
  { nameAr: 'العروض الترويجية', nameEn: 'Promotions', slug: 'promotions', order: 3 },
  { nameAr: 'الجملة', nameEn: 'Wholesale', slug: 'wholesale', order: 4 },
  { nameAr: 'الشوكولاتة', nameEn: 'Chocolates', slug: 'chocolates', order: 5 },
  { nameAr: 'الاتجاهات', nameEn: 'Trending', slug: 'trending', order: 6 },
  { nameAr: 'المنتجات التركية', nameEn: 'Turkish Products', slug: 'turkish-products', order: 7 },
  { nameAr: 'المعكرونة', nameEn: 'Noodles', slug: 'noodles', order: 8 },
  { nameAr: 'الألعاب', nameEn: 'Toys', slug: 'toys', order: 9 },
  { nameAr: 'الهدايا', nameEn: 'Gifts', slug: 'gifts', order: 10 },
  { nameAr: 'المستوردة', nameEn: 'Imported', slug: 'imported', order: 11 },
  { nameAr: 'صنع في الكويت', nameEn: 'Made in Kuwait', slug: 'made-in-kuwait', order: 12 },
  { nameAr: 'الفواكه الجافة', nameEn: 'Dry Fruit', slug: 'dry-fruit', order: 13 },
  { nameAr: 'الآيس كريم', nameEn: 'Ice Cream', slug: 'ice-cream', order: 14 },
  { nameAr: 'الرقائق والوجبات الخفيفة', nameEn: 'Chips & Snacks', slug: 'chips-snacks', order: 15 },
  { nameAr: 'الويفر', nameEn: 'Wafer', slug: 'wafer', order: 16 },
  { nameAr: 'البسكويت والكوكيز', nameEn: 'Biscuit & Cookies', slug: 'biscuit-cookies', order: 17 },
  { nameAr: 'الكعك', nameEn: 'Cake', slug: 'cake', order: 18 },
  { nameAr: 'الحلويات والتوفي', nameEn: 'Candy & Toffee', slug: 'candy-toffee', order: 19 },
  { nameAr: 'الهلام', nameEn: 'Jelly', slug: 'jelly', order: 20 },
  { nameAr: 'المصاصات', nameEn: 'Lollipop', slug: 'lollipop', order: 21 },
  { nameAr: 'الذرة والقطن', nameEn: 'Corn & Cotton', slug: 'corn-cotton', order: 22 },
  { nameAr: 'المارشميلو', nameEn: 'Marshmallow', slug: 'marshmallow', order: 23 },
  { nameAr: 'العلكة', nameEn: 'Gum', slug: 'gum', order: 24 },
  { nameAr: 'الفرش', nameEn: 'Spread', slug: 'spread', order: 25 },
  { nameAr: 'القهوة والشاي', nameEn: 'Coffee & Tea', slug: 'coffee-tea', order: 26 },
  { nameAr: 'البروتين', nameEn: 'Protein', slug: 'protein', order: 27 },
  { nameAr: 'المكسرات', nameEn: 'Nuts', slug: 'nuts', order: 28 },
  { nameAr: 'الحبوب', nameEn: 'Cereal', slug: 'cereal', order: 29 },
  { nameAr: 'المشروبات الغازية', nameEn: 'Soft Drinks', slug: 'soft-drinks', order: 30 },
  { nameAr: 'الماء', nameEn: 'Water', slug: 'water', order: 31 },
  { nameAr: 'العصير والحليب', nameEn: 'Juice & Milk', slug: 'juice-milk', order: 32 },
  { nameAr: 'مشروبات الطاقة', nameEn: 'Energy Drinks', slug: 'energy-drinks', order: 33 },
];

const productsData = [
  { categorySlug: 'chocolates', nameAr: 'شوكولاتة داكنة', nameEn: 'Dark Chocolate', price: '2.50', stock: 50, slug: 'dark-chocolate', isFeatured: true },
  { categorySlug: 'chocolates', nameAr: 'شوكولاتة بالحليب', nameEn: 'Milk Chocolate', price: '2.00', stock: 60, slug: 'milk-chocolate', isFeatured: true },
  { categorySlug: 'chips-snacks', nameAr: 'رقائق البطاطس', nameEn: 'Potato Chips', price: '1.50', stock: 100, slug: 'potato-chips' },
  { categorySlug: 'biscuit-cookies', nameAr: 'بسكويت الشوكولاتة', nameEn: 'Chocolate Biscuits', price: '1.75', stock: 80, slug: 'chocolate-biscuits' },
  { categorySlug: 'coffee-tea', nameAr: 'قهوة عربية', nameEn: 'Arabic Coffee', price: '3.50', stock: 40, slug: 'arabic-coffee' },
  { categorySlug: 'nuts', nameAr: 'لوز محمص', nameEn: 'Roasted Almonds', price: '4.00', stock: 30, slug: 'roasted-almonds' },
  { categorySlug: 'candy-toffee', nameAr: 'حلوى التوفي', nameEn: 'Toffee Candy', price: '1.25', stock: 70, slug: 'toffee-candy' },
  { categorySlug: 'ice-cream', nameAr: 'آيس كريم فانيليا', nameEn: 'Vanilla Ice Cream', price: '2.75', stock: 45, slug: 'vanilla-ice-cream' },
  { categorySlug: 'dry-fruit', nameAr: 'تمر مجفف', nameEn: 'Dried Dates', price: '3.25', stock: 55, slug: 'dried-dates' },
  { categorySlug: 'juice-milk', nameAr: 'عصير برتقال', nameEn: 'Orange Juice', price: '1.50', stock: 90, slug: 'orange-juice' },
];

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Insert categories
    console.log('Inserting categories...');
    for (const cat of categoriesData) {
      await db.insert(categories).values({
        ...cat,
        isActive: true,
        descriptionAr: null,
        descriptionEn: null,
        icon: null,
        image: null,
      });
    }
    console.log(`✓ Inserted ${categoriesData.length} categories`);

    // Get categories for product insertion
    const insertedCategories = await db.select().from(categories);
    const categoryMap = new Map(insertedCategories.map(c => [c.slug, c.id]));

    // Insert products
    console.log('Inserting products...');
    for (const prod of productsData) {
      const categoryId = categoryMap.get(prod.categorySlug) || 1;
      const { categorySlug, ...prodData } = prod;
      await db.insert(products).values({
        ...prodData,
        categoryId,
        descriptionAr: null,
        descriptionEn: null,
        originalPrice: null,
        image: 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(prodData.nameEn),
        images: null,
        sku: null,
        isActive: true,
        isPromotion: false,
      });
    }
    console.log(`✓ Inserted ${productsData.length} products`);

    console.log('✓ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
