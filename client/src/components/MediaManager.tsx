import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Trash2, X, Search, Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface MediaImage {
  id: number;
  fileName: string;
  url: string;
  fileKey: string;
  mimeType: string;
  fileSize?: number;
  createdAt: Date;
}

interface MediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (image: MediaImage) => void;
  title?: string;
  allowUpload?: boolean;
}

export default function MediaManager({
  isOpen,
  onClose,
  onSelectImage,
  title,
  allowUpload = true,
}: MediaManagerProps) {
  const { language } = useLanguage();
  const [images, setImages] = useState<MediaImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<MediaImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const uploadMutation = trpc.images.upload.useMutation();
  const deleteMutation = trpc.images.delete.useMutation();
  const utils = trpc.useUtils();

  // Fetch images on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/images');
      if (response.ok) {
        const data = await response.json();
        setImages(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
      toast.error(language === 'ar' ? 'فشل تحميل الصور' : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(language === 'ar' ? 'صيغة الملف غير مدعومة' : 'File format not supported');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'ar' ? 'حجم الملف كبير جداً' : 'File size too large');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const newImage: MediaImage = {
          id: Date.now(),
          fileName: file.name,
          url: result.url,
          fileKey: result.key,
          mimeType: file.type,
          fileSize: file.size,
          createdAt: new Date(),
        };
        setImages([newImage, ...images]);
        toast.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
      } else {
        toast.error(language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(language === 'ar' ? 'خطأ في الرفع' : 'Upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.add('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.remove('border-blue-500', 'bg-blue-50');
    }
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDeleteImage = async (image: MediaImage) => {
    if (!confirm(language === 'ar' ? 'هل تريد حذف هذه الصورة؟' : 'Delete this image?')) {
      return;
    }

    try {
      await fetch(`/api/images/${image.id}`, { method: 'DELETE' });
      setImages(images.filter((img) => img.id !== image.id));
      if (selectedImage?.id === image.id) {
        setSelectedImage(null);
      }
      toast.success(language === 'ar' ? 'تم حذف الصورة' : 'Image deleted');
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل حذف الصورة' : 'Failed to delete image');
    }
  };

  const handleSelectImage = () => {
    if (!selectedImage) {
      toast.error(language === 'ar' ? 'اختر صورة أولاً' : 'Select an image first');
      return;
    }
    onSelectImage(selectedImage);
    onClose();
  };

  const filteredImages = images.filter((img) =>
    img.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">
            {title || (language === 'ar' ? 'مدير الوسائط' : 'Media Manager')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Upload Section */}
            {allowUpload && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {language === 'ar' ? 'رفع صورة جديدة' : 'Upload New Image'}
                </h3>

                {/* Drag & Drop Area */}
                <div
                  ref={dragRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {language === 'ar'
                      ? 'اسحب الصور هنا أو انقر للتحديد'
                      : 'Drag images here or click to select'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {language === 'ar'
                      ? 'JPG, PNG, WEBP - حد أقصى 5MB'
                      : 'JPG, PNG, WEBP - Max 5MB'}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mt-4"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {language === 'ar' ? 'اختر صورة' : 'Choose Image'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Search Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {language === 'ar' ? 'المكتبة' : 'Library'}
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={language === 'ar' ? 'ابحث عن صورة...' : 'Search images...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Gallery Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p>{language === 'ar' ? 'لا توجد صور' : 'No images found'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    onClick={() => setSelectedImage(image)}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition ${
                      selectedImage?.id === image.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.fileName}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      {selectedImage?.id === image.id && (
                        <div className="text-white text-center">
                          <div className="text-sm font-semibold">
                            {language === 'ar' ? 'مختار' : 'Selected'}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Image Info */}
            {selectedImage && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">{language === 'ar' ? 'الاسم: ' : 'Name: '}</span>
                  {selectedImage.fileName}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">{language === 'ar' ? 'الحجم: ' : 'Size: '}</span>
                  {selectedImage.fileSize ? `${(selectedImage.fileSize / 1024).toFixed(2)} KB` : 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">{language === 'ar' ? 'الرابط: ' : 'URL: '}</span>
                  <code className="text-xs bg-white p-1 rounded break-all">{selectedImage.url}</code>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSelectImage}
            disabled={!selectedImage}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {language === 'ar' ? 'استخدم الصورة' : 'Use Image'}
          </Button>
        </div>
      </div>
    </div>
  );
}
