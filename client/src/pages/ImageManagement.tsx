'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Trash2, Copy, Check, Search } from 'lucide-react';
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

export default function ImageManagement() {
  const { language } = useLanguage();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const uploadMutation = trpc.images.upload.useMutation();
  const deleteMutation = trpc.images.delete.useMutation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const t = {
    ar: {
      title: 'إدارة الصور',
      uploadImage: 'رفع صورة',
      gallery: 'معرض الصور',
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
    },
    en: {
      title: 'Image Management',
      uploadImage: 'Upload Image',
      gallery: 'Image Gallery',
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
    },
  };

  const currentT = t[language as keyof typeof t];

  // Fetch images
  const { data: imagesList, isLoading: isLoadingImages } = trpc.images.list.useQuery();
  
  useEffect(() => {
    if (imagesList) {
      setImages(imagesList as Image[]);
    }
  }, [imagesList]);
  
  useEffect(() => {
    setLoading(isLoadingImages);
  }, [isLoadingImages]);



  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(currentT.error);
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix

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

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm(currentT.deleteConfirm)) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success(currentT.deleteSuccess);
      setImages(images.filter((img) => img.id !== id));
      utils.images.list.invalidate();
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

  return (
    <div className={`p-6 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">{currentT.title}</h1>

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
                      {currentT.delete}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredImages.map((image) => (
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
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(image.id)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          {currentT.delete}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
