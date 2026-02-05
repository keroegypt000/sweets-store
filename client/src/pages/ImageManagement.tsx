'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Trash2, Copy, Check, Search, X, Edit2, AlertCircle, HardDrive } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface Image {
  id: number;
  fileName: string;
  url: string;
  fileKey: string;
  mimeType: string;
  fileSize?: number;
  altText?: string;
  description?: string;
  usageType: string;
  createdAt: Date;
}

interface Banner {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image: string;
  link?: string;
  order: number;
  isActive: boolean;
}

interface ImageStatistics {
  totalImages: number;
  totalSize: number;
  countByType: {
    product: number;
    category: number;
    banner: number;
    general: number;
  };
  sizeByType: {
    product: number;
    category: number;
    banner: number;
    general: number;
  };
  storageLimit: number;
  usagePercentage: number;
}

type Tab = 'gallery' | 'banners' | 'statistics';

export default function ImageManagement() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('gallery');
  const [images, setImages] = useState<Image[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [statistics, setStatistics] = useState<ImageStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const uploadMutation = trpc.images.upload.useMutation();
  const deleteMutation = trpc.images.delete.useMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const [selectedImageForBanner, setSelectedImageForBanner] = useState<Image | null>(null);
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [bannerForm, setBannerForm] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    link: '',
    order: '0',
  });

  const t = {
    ar: {
      title: 'إدارة الصور والبنرات',
      uploadImage: 'رفع صورة',
      gallery: 'معرض الصور',
      banners: 'إدارة البنرات',
      statistics: 'الإحصائيات',
      search: 'ابحث عن الصور...',
      filter: 'فلتر حسب النوع',
      all: 'الكل',
      product: 'منتج',
      category: 'فئة',
      banner: 'بانر',
      general: 'عام',
      fileName: 'اسم الملف',
      fileSize: 'حجم الملف',
      uploadedDate: 'تاريخ الرفع',
      imageUrl: 'رابط الصورة',
      copyUrl: 'نسخ الرابط',
      delete: 'حذف',
      noImages: 'لا توجد صور',
      uploadSuccess: 'تم رفع الصورة بنجاح',
      deleteSuccess: 'تم حذف الصورة بنجاح',
      error: 'حدث خطأ',
      selectImage: 'اختر صورة',
      altText: 'النص البديل',
      description: 'الوصف',
      usageType: 'نوع الاستخدام',
      copied: 'تم النسخ',
      deleteConfirm: 'هل أنت متأكد من حذف هذه الصورة؟',
      noBanners: 'لا توجد بنرات',
      bannerTitle: 'عنوان البنر',
      bannerDescription: 'وصف البنر',
      bannerLink: 'رابط البنر',
      bannerOrder: 'ترتيب البنر',
      selectBannerImage: 'اختر صورة للبنر',
      addBanner: 'إضافة بنر',
      editBanner: 'تعديل البنر',
      saveBanner: 'حفظ البنر',
      cancelEdit: 'إلغاء',
      previewImage: 'معاينة الصورة',
      usedIn: 'مستخدمة في',
      usageInfo: 'معلومات الاستخدام',
      selectImageForBanner: 'اختر صورة من المعرض لاستخدامها في البنر',
      imageSelected: 'تم اختيار الصورة بنجاح',
      titleAr: 'العنوان بالعربية',
      titleEn: 'العنوان بالإنجليزية',
      descriptionAr: 'الوصف بالعربية',
      descriptionEn: 'الوصف بالإنجليزية',
      totalImages: 'إجمالي الصور',
      totalStorage: 'إجمالي التخزين المستخدم',
      storageUsage: 'نسبة استخدام التخزين',
      storageLimit: 'حد التخزين الأقصى',
      imagesCount: 'عدد الصور',
      storageUsed: 'التخزين المستخدم',
      warning: 'تحذير',
      storageAlmostFull: 'التخزين قريب من الامتلاء!',
      storageWarning: 'لقد استخدمت أكثر من 80% من مساحة التخزين المتاحة',
      storageCritical: 'التخزين ممتلئ تقريباً!',
      storageCriticalWarning: 'لقد استخدمت أكثر من 95% من مساحة التخزين المتاحة',
    },
    en: {
      title: 'Image & Banner Management',
      uploadImage: 'Upload Image',
      gallery: 'Image Gallery',
      banners: 'Banner Management',
      statistics: 'Statistics',
      search: 'Search images...',
      filter: 'Filter by type',
      all: 'All',
      product: 'Product',
      category: 'Category',
      banner: 'Banner',
      general: 'General',
      fileName: 'File Name',
      fileSize: 'File Size',
      uploadedDate: 'Upload Date',
      imageUrl: 'Image URL',
      copyUrl: 'Copy URL',
      delete: 'Delete',
      noImages: 'No images',
      uploadSuccess: 'Image uploaded successfully',
      deleteSuccess: 'Image deleted successfully',
      error: 'An error occurred',
      selectImage: 'Select an image',
      altText: 'Alt Text',
      description: 'Description',
      usageType: 'Usage Type',
      copied: 'Copied',
      deleteConfirm: 'Are you sure you want to delete this image?',
      noBanners: 'No banners',
      bannerTitle: 'Banner Title',
      bannerDescription: 'Banner Description',
      bannerLink: 'Banner Link',
      bannerOrder: 'Banner Order',
      selectBannerImage: 'Select image for banner',
      addBanner: 'Add Banner',
      editBanner: 'Edit Banner',
      saveBanner: 'Save Banner',
      cancelEdit: 'Cancel',
      previewImage: 'Preview Image',
      usedIn: 'Used in',
      usageInfo: 'Usage Information',
      selectImageForBanner: 'Select an image from gallery to use in banner',
      imageSelected: 'Image selected successfully',
      titleAr: 'Title (Arabic)',
      titleEn: 'Title (English)',
      descriptionAr: 'Description (Arabic)',
      descriptionEn: 'Description (English)',
      totalImages: 'Total Images',
      totalStorage: 'Total Storage Used',
      storageUsage: 'Storage Usage',
      storageLimit: 'Storage Limit',
      imagesCount: 'Images Count',
      storageUsed: 'Storage Used',
      warning: 'Warning',
      storageAlmostFull: 'Storage Almost Full!',
      storageWarning: 'You have used more than 80% of available storage',
      storageCritical: 'Storage Almost Full!',
      storageCriticalWarning: 'You have used more than 95% of available storage',
    },
  };

  const currentT = t[language as keyof typeof t];

  // Fetch images
  const { data: imagesList, isLoading: isLoadingImages } = trpc.images.list.useQuery();
  const { data: bannersList, isLoading: isLoadingBanners } = trpc.banners.allBanners.useQuery();
  const { data: statisticsData, isLoading: isLoadingStatistics } = trpc.images.statistics.useQuery();

  useEffect(() => {
    if (imagesList) {
      setImages(imagesList as Image[]);
    }
  }, [imagesList]);

  useEffect(() => {
    if (bannersList) {
      setBanners(bannersList as Banner[]);
    }
  }, [bannersList]);

  useEffect(() => {
    if (statisticsData) {
      setStatistics(statisticsData as ImageStatistics);
    }
  }, [statisticsData]);

  useEffect(() => {
    setLoading(isLoadingImages || isLoadingBanners || isLoadingStatistics);
  }, [isLoadingImages, isLoadingBanners, isLoadingStatistics]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(currentT.error);
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(',')[1];

        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64Data,
          mimeType: file.type,
          usageType: 'general',
        });

        if (result) {
          toast.success(currentT.uploadSuccess);
          setImages([result as Image, ...images]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          utils.images.list.invalidate();
          utils.images.statistics.invalidate();
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(currentT.error);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  // Delete mutation
  const deleteMutationBanner = trpc.banners.delete.useMutation();
  const updateBannerMutation = trpc.banners.update.useMutation();
  const createBannerMutation = trpc.banners.create.useMutation();

  // Handle delete image
  const handleDeleteImage = async (id: number) => {
    if (!confirm(currentT.deleteConfirm)) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success(currentT.deleteSuccess);
      setImages(images.filter((img) => img.id !== id));
      utils.images.list.invalidate();
      utils.images.statistics.invalidate();
    } catch (error) {
      toast.error(currentT.error);
      console.error('Delete error:', error);
    }
  };

  // Handle copy URL
  const handleCopyUrl = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success(currentT.copied);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle select image for banner
  const handleSelectImageForBanner = (image: Image) => {
    setSelectedImageForBanner(image);
    toast.success(currentT.imageSelected);
  };

  // Handle save banner
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImageForBanner) {
      toast.error(currentT.selectBannerImage);
      return;
    }

    try {
      if (editingBannerId) {
        await updateBannerMutation.mutateAsync({
          id: editingBannerId,
          titleAr: bannerForm.titleAr,
          titleEn: bannerForm.titleEn,
          descriptionAr: bannerForm.descriptionAr || undefined,
          descriptionEn: bannerForm.descriptionEn || undefined,
          image: selectedImageForBanner.url,
          link: bannerForm.link || undefined,
          order: parseInt(bannerForm.order) || 0,
        });
        toast.success(currentT.uploadSuccess);
      } else {
        await createBannerMutation.mutateAsync({
          titleAr: bannerForm.titleAr,
          titleEn: bannerForm.titleEn,
          descriptionAr: bannerForm.descriptionAr || undefined,
          descriptionEn: bannerForm.descriptionEn || undefined,
          image: selectedImageForBanner.url,
          link: bannerForm.link || undefined,
          order: parseInt(bannerForm.order) || 0,
        });
        toast.success(currentT.uploadSuccess);
      }

      setBannerForm({
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
        descriptionEn: '',
        link: '',
        order: '0',
      });
      setSelectedImageForBanner(null);
      setEditingBannerId(null);
      utils.banners.allBanners.invalidate();
    } catch (error) {
      toast.error(currentT.error);
      console.error('Save banner error:', error);
    }
  };

  // Handle edit banner
  const handleEditBanner = (banner: Banner) => {
    setEditingBannerId(banner.id);
    setBannerForm({
      titleAr: banner.titleAr,
      titleEn: banner.titleEn,
      descriptionAr: banner.descriptionAr || '',
      descriptionEn: banner.descriptionEn || '',
      link: banner.link || '',
      order: banner.order.toString(),
    });
    const bannerImage = images.find((img) => img.url === banner.image);
    setSelectedImageForBanner(bannerImage || null);
  };

  // Handle delete banner
  const handleDeleteBanner = async (id: number) => {
    if (!confirm(currentT.deleteConfirm)) return;

    try {
      await deleteMutationBanner.mutateAsync({ id });
      toast.success(currentT.deleteSuccess);
      setBanners(banners.filter((b) => b.id !== id));
      utils.banners.allBanners.invalidate();
    } catch (error) {
      toast.error(currentT.error);
      console.error('Delete banner error:', error);
    }
  };

  // Filter images
  const filteredImages = images.filter((img) => {
    const matchesSearch =
      img.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || img.usageType === filterType;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
  };

  const getStorageStatusColor = (percentage: number) => {
    if (percentage >= 95) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStorageBarColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`p-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-6">{currentT.title}</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            {currentT.gallery}
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'banners'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            {currentT.banners}
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap ${
              activeTab === 'statistics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            {currentT.statistics}
          </button>
        </div>

        {/* STATISTICS TAB */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : statistics ? (
              <>
                {/* Storage Alerts */}
                {statistics.usagePercentage >= 80 && (
                  <div className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded ${statistics.usagePercentage >= 95 ? 'bg-red-50 border-red-400' : ''}`}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`w-5 h-5 mt-0.5 ${statistics.usagePercentage >= 95 ? 'text-red-600' : 'text-yellow-600'}`} />
                      <div>
                        <h3 className={`font-bold ${statistics.usagePercentage >= 95 ? 'text-red-800' : 'text-yellow-800'}`}>
                          {statistics.usagePercentage >= 95 ? currentT.storageCritical : currentT.storageAlmostFull}
                        </h3>
                        <p className={`text-sm ${statistics.usagePercentage >= 95 ? 'text-red-700' : 'text-yellow-700'}`}>
                          {statistics.usagePercentage >= 95 ? currentT.storageCriticalWarning : currentT.storageWarning}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Images */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">{currentT.totalImages}</h3>
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalImages}</p>
                  </div>

                  {/* Total Storage */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">{currentT.totalStorage}</h3>
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <HardDrive className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatFileSize(statistics.totalSize)}</p>
                  </div>

                  {/* Storage Usage Percentage */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">{currentT.storageUsage}</h3>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStorageBarColor(statistics.usagePercentage).replace('bg-', 'bg-opacity-20 ')}`}>
                        <span className={`text-lg font-bold ${getStorageStatusColor(statistics.usagePercentage)}`}>
                          {statistics.usagePercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getStorageBarColor(statistics.usagePercentage)}`}
                        style={{ width: `${Math.min(statistics.usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Storage Limit */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">{currentT.storageLimit}</h3>
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <HardDrive className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatFileSize(statistics.storageLimit)}</p>
                  </div>
                </div>

                {/* Images by Type */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold mb-6">{currentT.imagesCount}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { type: 'product', label: currentT.product, color: 'blue' },
                      { type: 'category', label: currentT.category, color: 'purple' },
                      { type: 'banner', label: currentT.banner, color: 'green' },
                      { type: 'general', label: currentT.general, color: 'yellow' },
                    ].map((item) => (
                      <div key={item.type} className={`bg-${item.color}-50 rounded-lg p-4 border border-${item.color}-200`}>
                        <p className={`text-sm font-medium text-${item.color}-600 mb-2`}>{item.label}</p>
                        <p className={`text-2xl font-bold text-${item.color}-900`}>
                          {statistics.countByType[item.type as keyof typeof statistics.countByType]}
                        </p>
                        <p className={`text-xs text-${item.color}-500 mt-2`}>
                          {formatFileSize(statistics.sizeByType[item.type as keyof typeof statistics.sizeByType])}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-gray-500">
                {currentT.error}
              </div>
            )}
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <>
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {currentT.uploadImage}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {currentT.uploadImage}
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500">{currentT.selectImage}</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={currentT.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${language === 'ar' ? 'pr-10 text-right' : 'pl-10'}`}
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{currentT.all}</option>
                  <option value="product">{currentT.product}</option>
                  <option value="category">{currentT.category}</option>
                  <option value="banner">{currentT.banner}</option>
                  <option value="general">{currentT.general}</option>
                </select>
              </div>
            </div>

            {/* Gallery */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  {currentT.noImages}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                          {currentT.fileName}
                        </th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                          {currentT.usageType}
                        </th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                          {currentT.fileSize}
                        </th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                          {currentT.uploadedDate}
                        </th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                          {currentT.imageUrl}
                        </th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                          {currentT.usedIn}
                        </th>
                        <th className={`px-6 py-3 text-left text-sm font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : ''}`}>
                          {currentT.delete}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredImages.map((image) => {
                        const usedInBanners = banners.filter((b) => b.image === image.url);
                        return (
                          <tr key={image.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm text-gray-700">
                              <div className="flex items-center gap-3">
                                <img
                                  src={image.url}
                                  alt={image.fileName}
                                  className="w-10 h-10 rounded object-cover"
                                />
                                <span className="truncate">{image.fileName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {image.usageType}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {formatFileSize(image.fileSize)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {formatDate(image.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyUrl(image.url, image.id)}
                                className="flex items-center gap-2"
                              >
                                {copiedId === image.id ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    {currentT.copied}
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    {currentT.copyUrl}
                                  </>
                                )}
                              </Button>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {usedInBanners.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {usedInBanners.map((b) => (
                                    <span key={b.id} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                      {language === 'ar' ? b.titleAr : b.titleEn}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">{currentT.noImages}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteImage(image.id)}
                                className="flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                {currentT.delete}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* BANNERS TAB */}
        {activeTab === 'banners' && (
          <>
            {/* Banner Form */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">
                {editingBannerId ? currentT.editBanner : currentT.addBanner}
              </h2>

              <form onSubmit={handleSaveBanner} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{currentT.titleAr}</label>
                    <Input
                      value={bannerForm.titleAr}
                      onChange={(e) => setBannerForm({ ...bannerForm, titleAr: e.target.value })}
                      placeholder={currentT.titleAr}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{currentT.titleEn}</label>
                    <Input
                      value={bannerForm.titleEn}
                      onChange={(e) => setBannerForm({ ...bannerForm, titleEn: e.target.value })}
                      placeholder={currentT.titleEn}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{currentT.descriptionAr}</label>
                    <Input
                      value={bannerForm.descriptionAr}
                      onChange={(e) => setBannerForm({ ...bannerForm, descriptionAr: e.target.value })}
                      placeholder={currentT.descriptionAr}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{currentT.descriptionEn}</label>
                    <Input
                      value={bannerForm.descriptionEn}
                      onChange={(e) => setBannerForm({ ...bannerForm, descriptionEn: e.target.value })}
                      placeholder={currentT.descriptionEn}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{currentT.bannerLink}</label>
                    <Input
                      value={bannerForm.link}
                      onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                      placeholder={currentT.bannerLink}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{currentT.bannerOrder}</label>
                    <Input
                      type="number"
                      value={bannerForm.order}
                      onChange={(e) => setBannerForm({ ...bannerForm, order: e.target.value })}
                      placeholder={currentT.bannerOrder}
                    />
                  </div>
                </div>

                {/* Image Selection */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {selectedImageForBanner ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{currentT.previewImage}</h3>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedImageForBanner(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <img
                        src={selectedImageForBanner.url}
                        alt={selectedImageForBanner.fileName}
                        className="w-full h-48 object-cover rounded"
                      />
                      <p className="text-sm text-gray-600">{selectedImageForBanner.fileName}</p>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">{currentT.selectImageForBanner}</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    {currentT.saveBanner}
                  </Button>
                  {editingBannerId && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditingBannerId(null);
                        setBannerForm({
                          titleAr: '',
                          titleEn: '',
                          descriptionAr: '',
                          descriptionEn: '',
                          link: '',
                          order: '0',
                        });
                        setSelectedImageForBanner(null);
                      }}
                    >
                      {currentT.cancelEdit}
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Image Gallery for Banner Selection */}
            {!editingBannerId && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">{currentT.gallery}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      onClick={() => handleSelectImageForBanner(image)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition ${
                        selectedImageForBanner?.id === image.id
                          ? 'border-blue-500 ring-2 ring-blue-300'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.fileName}
                        className="w-full h-24 object-cover"
                      />
                      {selectedImageForBanner?.id === image.id && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Banners List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold">{currentT.banners}</h3>
              </div>

              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : banners.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  {currentT.noBanners}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {banners.map((banner) => (
                    <div key={banner.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                      <img
                        src={banner.image}
                        alt={banner.titleAr}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-sm">{language === 'ar' ? banner.titleAr : banner.titleEn}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {language === 'ar' ? banner.descriptionAr : banner.descriptionEn}
                        </p>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBanner(banner)}
                            className="flex-1 flex items-center justify-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            {currentT.editBanner}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="flex-1 flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            {currentT.delete}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
