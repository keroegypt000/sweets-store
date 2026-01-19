import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { products } from './drizzle/schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = mysql.createPool(DATABASE_URL);
const db = drizzle(pool);

const newProducts = [
  {
    categoryId: 5,
    nameAr: 'شوكولاتة بيضاء فاخرة',
    nameEn: 'Premium White Chocolate',
    descriptionAr: 'شوكولاتة بيضاء عالية الجودة من أفضل الماركات العالمية',
    descriptionEn: 'Premium quality white chocolate from top international brands',
    price: '3.00',
    originalPrice: '3.75',
    stock: 45,
    slug: 'white-chocolate-premium',
    image: '/images/products/gRxapZiUrqDP.jpg',
    isFeatured: true,
  },
  {
    categoryId: 15,
    nameAr: 'رقائق الذرة المحمصة',
    nameEn: 'Roasted Corn Chips',
    descriptionAr: 'رقائق ذرة مقرمشة محمصة بالملح الطبيعي',
    descriptionEn: 'Crispy roasted corn chips with natural salt',
    price: '1.75',
    originalPrice: '2.25',
    stock: 80,
    slug: 'roasted-corn-chips',
    image: '/images/products/6jkqQAzZM3Ks.jpg',
    isFeatured: true,
  },
  {
    categoryId: 17,
    nameAr: 'بسكويت الشاي بالزبدة',
    nameEn: 'Butter Tea Biscuits',
    descriptionAr: 'بسكويت الشاي الفاخر بطعم الزبدة الحقيقية',
    descriptionEn: 'Premium tea biscuits with real butter flavor',
    price: '2.00',
    originalPrice: '2.50',
    stock: 70,
    slug: 'butter-tea-biscuits',
    image: '/images/products/kCptXXbTMxJi.jpg',
    isFeatured: true,
  },
  {
    categoryId: 26,
    nameAr: 'قهوة تركية أصلية',
    nameEn: 'Original Turkish Coffee',
    descriptionAr: 'قهوة تركية أصلية مطحونة ناعماً',
    descriptionEn: 'Original Turkish coffee finely ground',
    price: '4.50',
    originalPrice: '5.50',
    stock: 35,
    slug: 'turkish-coffee-original',
    image: '/images/products/D5NRnVbNPXza.jpg',
    isFeatured: true,
  },
  {
    categoryId: 28,
    nameAr: 'فستق محمص مملح',
    nameEn: 'Salted Roasted Pistachios',
    descriptionAr: 'فستق طازج محمص ومملح بشكل مثالي',
    descriptionEn: 'Fresh roasted pistachios with perfect salt balance',
    price: '5.00',
    originalPrice: '6.50',
    stock: 25,
    slug: 'salted-pistachios',
    image: '/images/products/Aqiq5E1ozMr0.jpg',
    isFeatured: true,
  },
  {
    categoryId: 19,
    nameAr: 'حلوى الفراولة والكريمة',
    nameEn: 'Strawberry Cream Candy',
    descriptionAr: 'حلوى لذيذة بنكهة الفراولة والكريمة',
    descriptionEn: 'Delicious candy with strawberry and cream flavor',
    price: '1.50',
    originalPrice: '2.00',
    stock: 60,
    slug: 'strawberry-cream-candy',
    image: '/images/products/M3RJluGxJuMG.jpg',
    isFeatured: false,
  },
  {
    categoryId: 14,
    nameAr: 'آيس كريم الشوكولاتة',
    nameEn: 'Chocolate Ice Cream',
    descriptionAr: 'آيس كريم بنكهة الشوكولاتة الغنية',
    descriptionEn: 'Ice cream with rich chocolate flavor',
    price: '3.25',
    originalPrice: '4.00',
    stock: 40,
    slug: 'chocolate-ice-cream',
    image: '/images/products/NUt1XELQ6rpv.jpg',
    isFeatured: true,
  },
  {
    categoryId: 13,
    nameAr: 'مشمش مجفف فاخر',
    nameEn: 'Premium Dried Apricots',
    descriptionAr: 'مشمش مجفف من أفضل الأصناف',
    descriptionEn: 'Premium dried apricots from the best varieties',
    price: '3.75',
    originalPrice: '4.75',
    stock: 50,
    slug: 'premium-dried-apricots',
    image: '/images/products/D5NRnVbNPXza.jpg',
    isFeatured: false,
  },
  {
    categoryId: 32,
    nameAr: 'عصير التفاح الطبيعي',
    nameEn: 'Natural Apple Juice',
    descriptionAr: 'عصير تفاح طبيعي 100% بدون إضافات',
    descriptionEn: '100% natural apple juice with no additives',
    price: '2.00',
    originalPrice: '2.50',
    stock: 75,
    slug: 'natural-apple-juice',
    image: '/images/products/gBgeSScj44J3.jpg',
    isFeatured: false,
  },
  {
    categoryId: 21,
    nameAr: 'مصاصات الفواكه الملونة',
    nameEn: 'Colorful Fruit Lollipops',
    descriptionAr: 'مصاصات بنكهات فواكه متنوعة وملونة',
    descriptionEn: 'Lollipops with various colorful fruit flavors',
    price: '0.75',
    originalPrice: '1.25',
    stock: 100,
    slug: 'fruit-lollipops',
    image: '/images/products/M3RJluGxJuMG.jpg',
    isFeatured: true,
  },
];

async function addProducts() {
  try {
    console.log('Starting to add new products...');

    for (const prod of newProducts) {
      await db.insert(products).values({
        ...prod,
        isActive: true,
        isPromotion: false,
        images: null,
        sku: null,
      });
      console.log(`✓ Added ${prod.nameEn}`);
    }

    console.log(`✓ Successfully added ${newProducts.length} new products!`);
    process.exit(0);
  } catch (error) {
    console.error('Error adding products:', error);
    process.exit(1);
  }
}

addProducts();
