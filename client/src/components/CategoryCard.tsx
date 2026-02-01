import { ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image?: string;
  slug: string;
  order: number;
  isActive: boolean;
}

interface CategoryCardProps {
  category: Category;
  productCount?: number;
  onClick?: () => void;
  variant?: 'grid' | 'list';
}

export default function CategoryCard({
  category,
  productCount = 0,
  onClick,
  variant = 'grid',
}: CategoryCardProps) {
  const { language } = useLanguage();

  const name = language === 'ar' ? category.nameAr : category.nameEn;
  const description = language === 'ar' ? category.descriptionAr : category.descriptionEn;

  if (variant === 'list') {
    return (
      <div
        onClick={onClick}
        className="relative cursor-pointer transition-all duration-300 transform hover:scale-105 border-b border-yellow-200 last:border-b-0 overflow-hidden group h-24 sm:h-28"
      >
        {category.image && (
          <img
            src={category.image}
            alt={name}
            className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center p-3 sm:p-4">
          <h3 className="text-lg sm:text-xl font-bold text-white">{name}</h3>
          <p className="text-xs sm:text-sm text-gray-200">
            {productCount} {language === 'ar' ? 'منتج' : 'product'}
            {productCount !== 1 && (language === 'ar' ? '' : 's')}
          </p>
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 flex flex-col h-full"
    >
      {/* Category Image */}
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        {category.image && (
          <img
            src={category.image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>

      {/* Category Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-dark-text group-hover:text-primary-yellow transition-colors duration-300">
            {name}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500">
            {productCount} {language === 'ar' ? 'منتج' : 'product'}
            {productCount !== 1 && (language === 'ar' ? '' : 's')}
          </span>
          <ChevronRight className="w-4 h-4 text-primary-yellow group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );
}
