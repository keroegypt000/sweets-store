import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/').pop() || 'sweets_store',
});

try {
  // Sample banners from Home.tsx
  const banners = [
    {
      titleAr: 'متجر الحلويات',
      titleEn: 'Sweets Store',
      descriptionAr: 'أفضل الحلويات والمعجنات',
      descriptionEn: 'Best sweets and pastries',
      image: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd64e90?w=800&h=400&fit=crop',
      link: '/',
      order: 0,
      isActive: 1,
    },
    {
      titleAr: 'عروض خاصة',
      titleEn: 'Special Offers',
      descriptionAr: 'خصومات تصل إلى 50%',
      descriptionEn: 'Discounts up to 50%',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=400&fit=crop',
      link: '/',
      order: 1,
      isActive: 1,
    },
  ];

  // Check if banners already exist
  const [existingBanners] = await connection.query('SELECT COUNT(*) as count FROM banners');
  
  if (existingBanners[0].count === 0) {
    // Insert banners
    for (const banner of banners) {
      await connection.query(
        'INSERT INTO banners (titleAr, titleEn, descriptionAr, descriptionEn, image, link, `order`, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [banner.titleAr, banner.titleEn, banner.descriptionAr, banner.descriptionEn, banner.image, banner.link, banner.order, banner.isActive]
      );
    }
    console.log('✅ Sample banners migrated successfully');
  } else {
    console.log('⚠️ Banners already exist in database');
  }

  await connection.end();
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
