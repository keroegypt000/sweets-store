import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerProps {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image: string;
  backgroundColor?: string;
  backgroundGradient?: string;
  link?: string;
  order: number;
  isActive: boolean;
}

interface BannerSliderProps {
  banners: BannerProps[];
  autoPlay?: boolean;
  interval?: number;
  language?: 'ar' | 'en';
}

export default function BannerSlider({
  banners,
  autoPlay = true,
  interval = 5000,
  language = 'en',
}: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);

  useEffect(() => {
    if (!isAutoPlay || banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoPlay, banners.length, interval]);

  if (banners.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No banners available</p>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];
  const bgStyle = currentBanner.backgroundColor
    ? { backgroundColor: currentBanner.backgroundColor }
    : currentBanner.backgroundGradient
    ? { backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }
    : {};

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlay(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setIsAutoPlay(false);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  return (
    <div
      className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden group"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(autoPlay)}
    >
      {/* Banner Image */}
      <img
        src={currentBanner.image}
        alt={language === 'ar' ? currentBanner.titleAr : currentBanner.titleEn}
        className="w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
          {language === 'ar' ? currentBanner.titleAr : currentBanner.titleEn}
        </h2>
        {(language === 'ar' ? currentBanner.descriptionAr : currentBanner.descriptionEn) && (
          <p className="text-sm md:text-base text-gray-100 mb-4">
            {language === 'ar' ? currentBanner.descriptionAr : currentBanner.descriptionEn}
          </p>
        )}
        {currentBanner.link && (
          <a
            href={currentBanner.link}
            className="inline-block bg-primary-yellow text-dark-text px-6 py-2 rounded-lg font-semibold hover:bg-accent-yellow transition-colors w-fit"
          >
            {language === 'ar' ? 'اعرف أكثر' : 'Learn More'}
          </a>
        )}
      </div>

      {/* Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-dark-text p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-dark-text p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
