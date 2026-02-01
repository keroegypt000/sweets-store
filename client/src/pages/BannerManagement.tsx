import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface Banner {
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

export default function BannerManagement() {
  const { language } = useLanguage();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Banner>>({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    backgroundColor: '#FCD34D',
    backgroundGradient: 'from-yellow-400 via-yellow-300 to-orange-300',
    link: '',
    order: 0,
    isActive: true,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) {
      toast.error(language === 'ar' ? 'اختر صورة أولاً' : 'Please select an image first');
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, you would upload to storage here
      // For now, we'll use the preview URL
      toast.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
      setSelectedImage(null);
    } catch (error) {
      toast.error(language === 'ar' ? 'خطأ في رفع الصورة' : 'Error uploading image');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBanner = async () => {
    if (!formData.titleAr || !formData.titleEn || !previewUrl) {
      toast.error(language === 'ar' ? 'ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const bannerData: Banner = {
        id: editingId || Date.now(),
        titleAr: formData.titleAr,
        titleEn: formData.titleEn,
        descriptionAr: formData.descriptionAr || '',
        descriptionEn: formData.descriptionEn || '',
        image: previewUrl,
        backgroundColor: formData.backgroundColor || '#FCD34D',
        backgroundGradient: formData.backgroundGradient || 'from-yellow-400 via-yellow-300 to-orange-300',
        link: formData.link || '',
        order: formData.order || 0,
        isActive: formData.isActive !== false,
      };

      if (editingId) {
        // Update banner
        setBanners(banners.map(b => b.id === editingId ? bannerData : b));
        toast.success(language === 'ar' ? 'تم تحديث البنر' : 'Banner updated successfully');
      } else {
        // Create new banner
        setBanners([...banners, bannerData]);
        toast.success(language === 'ar' ? 'تم إنشاء البنر' : 'Banner created successfully');
      }
      
      resetForm();
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setFormData(banner);
    setEditingId(banner.id);
    setPreviewUrl(banner.image);
  };

  const handleDeleteBanner = (id: number) => {
    setBanners(banners.filter(b => b.id !== id));
    toast.success(language === 'ar' ? 'تم حذف البنر' : 'Banner deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      titleAr: '',
      titleEn: '',
      descriptionAr: '',
      descriptionEn: '',
      backgroundColor: '#FCD34D',
      backgroundGradient: 'from-yellow-400 via-yellow-300 to-orange-300',
      link: '',
      order: 0,
      isActive: true,
    });
    setEditingId(null);
    setSelectedImage(null);
    setPreviewUrl('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-dark-text">
        {language === 'ar' ? 'إدارة البنرات' : 'Banner Management'}
      </h1>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? (language === 'ar' ? 'تعديل البنر' : 'Edit Banner') : (language === 'ar' ? 'إنشاء بنر جديد' : 'Create New Banner')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'ar' ? 'صورة البنر' : 'Banner Image'}
            </label>
            {previewUrl && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden mb-2">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setPreviewUrl('');
                    setSelectedImage(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="flex-1 px-3 py-2 border border-border rounded-lg"
              />
              <Button
                onClick={handleUploadImage}
                disabled={!selectedImage || isLoading}
                className="bg-primary-yellow text-dark-text hover:bg-accent-yellow"
              >
                <Upload className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'رفع' : 'Upload'}
              </Button>
            </div>
          </div>

          {/* Title Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
              </label>
              <input
                type="text"
                value={formData.titleAr || ''}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg"
                placeholder="العنوان بالعربية"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
              </label>
              <input
                type="text"
                value={formData.titleEn || ''}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg"
                placeholder="Title in English"
              />
            </div>
          </div>

          {/* Description Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
              </label>
              <textarea
                value={formData.descriptionAr || ''}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg"
                rows={3}
                placeholder="الوصف بالعربية"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
              </label>
              <textarea
                value={formData.descriptionEn || ''}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg"
                rows={3}
                placeholder="Description in English"
              />
            </div>
          </div>

          {/* Color Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">
                {language === 'ar' ? 'لون الخلفية' : 'Background Color'}
              </label>
              <input
                type="color"
                value={formData.backgroundColor || '#FCD34D'}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                className="w-full h-10 border border-border rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {language === 'ar' ? 'التدرج' : 'Gradient'}
              </label>
              <input
                type="text"
                value={formData.backgroundGradient || ''}
                onChange={(e) => setFormData({ ...formData, backgroundGradient: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg"
                placeholder="from-yellow-400 via-yellow-300 to-orange-300"
              />
            </div>
          </div>

          {/* Link Field */}
          <div>
            <label className="text-sm font-medium">
              {language === 'ar' ? 'الرابط' : 'Link'}
            </label>
            <input
              type="url"
              value={formData.link || ''}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg"
              placeholder="https://example.com"
            />
          </div>

          {/* Order Field */}
          <div>
            <label className="text-sm font-medium">
              {language === 'ar' ? 'الترتيب' : 'Order'}
            </label>
            <input
              type="number"
              value={formData.order || 0}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-border rounded-lg"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive !== false}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">
              {language === 'ar' ? 'نشط' : 'Active'}
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSaveBanner}
              disabled={isLoading}
              className="flex-1 bg-primary-yellow text-dark-text hover:bg-accent-yellow"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                language === 'ar' ? 'حفظ البنر' : 'Save Banner'
              )}
            </Button>
            {editingId && (
              <Button
                onClick={resetForm}
                variant="outline"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Banners List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-dark-text">
          {language === 'ar' ? 'البنرات الموجودة' : 'Existing Banners'}
        </h2>
        {banners.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                {language === 'ar' ? 'لا توجد بنرات' : 'No banners yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner) => (
              <Card key={banner.id} className="overflow-hidden">
                <div className="relative h-40 overflow-hidden bg-gray-200">
                  <img
                    src={banner.image}
                    alt={banner.titleAr}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4 space-y-2">
                  <div>
                    <p className="font-bold text-dark-text">{banner.titleAr}</p>
                    <p className="text-sm text-muted-foreground">{banner.titleEn}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditBanner(banner)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      {language === 'ar' ? 'تعديل' : 'Edit'}
                    </Button>
                    <Button
                      onClick={() => handleDeleteBanner(banner.id)}
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {language === 'ar' ? 'حذف' : 'Delete'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
