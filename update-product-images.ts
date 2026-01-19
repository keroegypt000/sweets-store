import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { products } from './drizzle/schema';
import { eq } from 'drizzle-orm';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = mysql.createPool(DATABASE_URL);
const db = drizzle(pool);

const productImages = [
  { slug: 'dark-chocolate', image: '/images/products/gRxapZiUrqDP.jpg' },
  { slug: 'milk-chocolate', image: '/images/products/gBgeSScj44J3.jpg' },
  { slug: 'potato-chips', image: '/images/products/6jkqQAzZM3Ks.jpg' },
  { slug: 'chocolate-biscuits', image: '/images/products/kCptXXbTMxJi.jpg' },
  { slug: 'arabic-coffee', image: '/images/products/D5NRnVbNPXza.jpg' },
  { slug: 'roasted-almonds', image: '/images/products/Aqiq5E1ozMr0.jpg' },
  { slug: 'toffee-candy', image: '/images/products/M3RJluGxJuMG.jpg' },
  { slug: 'vanilla-ice-cream', image: '/images/products/NUt1XELQ6rpv.jpg' },
  { slug: 'dried-dates', image: '/images/products/D5NRnVbNPXza.jpg' },
  { slug: 'orange-juice', image: '/images/products/gBgeSScj44J3.jpg' },
];

async function updateImages() {
  try {
    console.log('Starting product image update...');

    for (const item of productImages) {
      await db.update(products)
        .set({ image: item.image })
        .where(eq(products.slug, item.slug));
      console.log(`✓ Updated ${item.slug}`);
    }

    console.log('✓ Product images updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating images:', error);
    process.exit(1);
  }
}

updateImages();
