import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-dark-bg text-white py-8 border-t border-primary-yellow">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary-yellow">
              {language === 'ar' ? 'عن المتجر' : 'About Store'}
            </h3>
            <p className="text-sm text-gray-300">
              {language === 'ar' 
                ? 'متجر الحلويات - أفضل مكان للحلويات الطازجة والمميزة'
                : 'Sweets Store - Best place for fresh and special sweets'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary-yellow">
              {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-primary-yellow transition">{language === 'ar' ? 'الرئيسية' : 'Home'}</a></li>
              <li><a href="/cart" className="hover:text-primary-yellow transition">{language === 'ar' ? 'السلة' : 'Cart'}</a></li>
              <li><a href="/order-tracking" className="hover:text-primary-yellow transition">{language === 'ar' ? 'تتبع الطلب' : 'Track Order'}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-primary-yellow">
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h3>
            <p className="text-sm text-gray-300">
              {language === 'ar' ? 'البريد الإلكتروني: info@sweets.com' : 'Email: info@sweets.com'}
            </p>
            <p className="text-sm text-gray-300">
              {language === 'ar' ? 'الهاتف: +965 1234 5678' : 'Phone: +965 1234 5678'}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 {language === 'ar' ? 'متجر الحلويات' : 'Sweets Store'}. {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</p>
        </div>
      </div>
    </footer>
  );
}
