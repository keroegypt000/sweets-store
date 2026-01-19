import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';

interface CategorySidebarProps {
  selectedCategoryId?: number;
  onSelectCategory?: (categoryId: number) => void;
}

export default function CategorySidebar({ selectedCategoryId, onSelectCategory }: CategorySidebarProps) {
  const { language } = useLanguage();
  const { data: categories, isLoading } = trpc.categories.list.useQuery();
  const [isExpanded, setIsExpanded] = useState(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-lg shadow-sm">
      <div className="p-4 border-b border-border">
        <h2 className="font-bold text-lg text-dark-text">
          {language === 'ar' ? 'الفئات' : 'Categories'}
        </h2>
      </div>
      
      <ScrollArea className="h-[600px]">
        <div className="p-4 space-y-2">
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategoryId === category.id ? 'default' : 'ghost'}
              className={`w-full justify-start text-left h-auto py-3 px-4 rounded-lg transition-all ${
                selectedCategoryId === category.id
                  ? 'bg-primary-yellow text-dark-text hover:bg-accent-yellow'
                  : 'hover:bg-light-bg text-dark-text'
              }`}
              onClick={() => onSelectCategory?.(category.id)}
            >
              <div className="flex items-center gap-3 w-full">
                {category.icon && (
                  <span className="text-xl">{category.icon}</span>
                )}
                <span className="flex-1 font-medium">
                  {language === 'ar' ? category.nameAr : category.nameEn}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
