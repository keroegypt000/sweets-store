import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Menu, X, Search, Settings } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  cartItemsCount?: number;
  onSearchChange?: (query: string) => void;
}

export default function Header({ cartItemsCount = 0, onSearchChange }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLanguageToggle = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <a href="/" className="flex-shrink-0 font-bold text-2xl text-primary hover:opacity-80 transition-opacity">
            <span className="text-primary-yellow">Sweets</span>
            <span className="text-dark-text ml-1">Store</span>
          </a>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Admin Login Link */}
            <a href="/admin-login">
              <Button variant="outline" size="icon" title={language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}>
                <Settings className="w-5 h-5" />
              </Button>
            </a>

            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLanguageToggle}
              className="text-xs md:text-sm"
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </Button>

            {/* Cart Button */}
            <a href="/cart" className="relative">
              <Button variant="outline" size="icon">
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </a>

            {/* Mobile Menu Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
