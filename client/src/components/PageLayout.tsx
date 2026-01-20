import Header from './Header';
import Footer from './Footer';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
