import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  ar: {
    'home': 'الرئيسية',
    'products': 'المنتجات',
    'categories': 'الفئات',
    'cart': 'سلة التسوق',
    'search': 'بحث',
    'add_to_cart': 'أضف إلى السلة',
    'price': 'السعر',
    'quantity': 'الكمية',
    'total': 'الإجمالي',
    'checkout': 'الدفع',
    'continue_shopping': 'متابعة التسوق',
    'empty_cart': 'سلة التسوق فارغة',
    'recently_added': 'تم إضافته مؤخراً',
    'most_selling': 'الأكثر مبيعاً',
    'promotions': 'العروض الترويجية',
    'wholesale': 'الجملة',
    'chocolates': 'الشوكولاتة',
    'trending': 'الاتجاهات',
    'turkish_products': 'المنتجات التركية',
    'noodles': 'المعكرونة',
    'toys': 'الألعاب',
    'gift': 'الهدايا',
    'imported': 'المستوردة',
    'made_in_kuwait': 'صنع في الكويت',
    'dry_fruit': 'الفواكه الجافة',
    'ice_cream': 'الآيس كريم',
    'chips_snacks': 'الرقائق والوجبات الخفيفة',
    'wafer': 'الويفر',
    'biscuit_cookies': 'البسكويت والكوكيز',
    'cake': 'الكعك',
    'candy_toffee': 'الحلويات والتوفي',
    'jelly': 'الهلام',
    'lollipop': 'المصاصات',
    'corn_cotton': 'الذرة والقطن',
    'marshmallow': 'المارشميلو',
    'gum': 'العلكة',
    'spread': 'الفرش',
    'coffee_tea': 'القهوة والشاي',
    'protein': 'البروتين',
    'nuts': 'المكسرات',
    'cereal': 'الحبوب',
    'soft_drinks': 'المشروبات الغازية',
    'water': 'الماء',
    'juice_milk': 'العصير والحليب',
    'energy_drinks': 'مشروبات الطاقة',
    'language': 'اللغة',
    'english': 'English',
    'arabic': 'العربية',
    'welcome': 'مرحباً بك في متجر الحلويات',
    'best_sweets': 'أفضل الحلويات والوجبات الخفيفة',
  },
  en: {
    'home': 'Home',
    'products': 'Products',
    'categories': 'Categories',
    'cart': 'Shopping Cart',
    'search': 'Search',
    'add_to_cart': 'Add to Cart',
    'price': 'Price',
    'quantity': 'Quantity',
    'total': 'Total',
    'checkout': 'Checkout',
    'continue_shopping': 'Continue Shopping',
    'empty_cart': 'Your cart is empty',
    'recently_added': 'Recently Added',
    'most_selling': 'Most Selling',
    'promotions': 'Promotions',
    'wholesale': 'Wholesale',
    'chocolates': 'Chocolates',
    'trending': 'Trending',
    'turkish_products': 'Turkish Products',
    'noodles': 'Noodles',
    'toys': 'Toys',
    'gift': 'Gifts',
    'imported': 'Imported',
    'made_in_kuwait': 'Made in Kuwait',
    'dry_fruit': 'Dry Fruit',
    'ice_cream': 'Ice Cream',
    'chips_snacks': 'Chips & Snacks',
    'wafer': 'Wafer',
    'biscuit_cookies': 'Biscuit & Cookies',
    'cake': 'Cake',
    'candy_toffee': 'Candy & Toffee',
    'jelly': 'Jelly',
    'lollipop': 'Lollipop',
    'corn_cotton': 'Corn & Cotton',
    'marshmallow': 'Marshmallow',
    'gum': 'Gum',
    'spread': 'Spread',
    'coffee_tea': 'Coffee & Tea',
    'protein': 'Protein',
    'nuts': 'Nuts',
    'cereal': 'Cereal',
    'soft_drinks': 'Soft Drinks',
    'water': 'Water',
    'juice_milk': 'Juice & Milk',
    'energy_drinks': 'Energy Drinks',
    'language': 'Language',
    'english': 'English',
    'arabic': 'Arabic',
    'welcome': 'Welcome to Sweets Store',
    'best_sweets': 'Best Sweets and Snacks',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language | null;
    if (savedLang) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
