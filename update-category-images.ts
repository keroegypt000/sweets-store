import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { categories } from './drizzle/schema';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = mysql.createPool(DATABASE_URL);
const db = drizzle(pool);

const categoryImages = [
  { slug: 'chocolates', image: '/images/categories/chocolate.jpg' },
  { slug: 'candy-toffee', image: '/images/categories/candy.jpg' },
  { slug: 'coffee-tea', image: '/images/categories/coffee-tea.jpg' },
  { slug: 'chips-snacks', image: '/images/products/6jkqQAzZM3Ks.jpg' },
  { slug: 'biscuit-cookies', image: '/images/products/kCptXXbTMxJi.jpg' },
  { slug: 'dry-fruit', image: '/images/products/Aqiq5E1ozMr0.jpg' },
  { slug: 'ice-cream', image: '/images/products/NUt1XELQ6rpv.jpg' },
  { slug: 'juice-milk', image: '/images/products/gBgeSScj44J3.jpg' },
];

async function updateCategoryImages() {
  try {
    console.log('Starting category image update...');

    for (const item of categoryImages) {
      await db.update(categories)
        .set({ image: item.image })
        .where(eq(categories.slug, item.slug));
      console.log(`✓ Updated ${item.slug}`);
    }

    console.log('✓ Category images updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating category images:', error);
    process.exit(1);
  }
}

updateCategoryImages();
