import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Trash2, X, Search } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface MediaImage {
  id: number;
  fileName: string;
  url: string;
  fileKey: string;
  mimeType: string | null;
  fileSize: number | null;
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
  const [selectedImage, setSelectedImage] = useState<MediaImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const imagesQuery = trpc.images.list.useQuery();
  const uploadMutation = trpc.images.upload.useMutation({
    onSuccess: () => {
      utils.images.list.invalidate();
      toast.success(language === 'ar' ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
    },
    onError: (error) => {
      toast.error(language === 'ar' ? 'فشل رفع الصورة' : 'Failed to upload image');
    },
  });
  const deleteMutation = trpc.images.delete.useMutation({
    onSuccess: () => {
      utils.images.list.invalidate();
      toast.success(language === 'ar' ? 'تم حذف الصورة بنجاح' : 'Image deleted successfully');
    },
    onError: () => {
      toast.error(language === 'ar' ? 'فشل حذف الصورة' : 'Failed to delete image');
    },
  });

  // Fetch images when modal opens
  useEffect(() => {
    if (isOpen) {
      imagesQuery.refetch();
    }
  }, [isOpen, imagesQuery]);

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
      toast.error(language === 'ar' ? 'حجم الملف كبير جداً (الحد الأقصى 5MB)' : 'File size too large (max 5MB)');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = (e.target?.result as string).split(',')[1];
        await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: fileData,
          mimeType: file.type,
          usageType: 'general',
        });
      };
      reader.readAsDataURL(file);
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

  const handleSelectImage = (image: MediaImage) => {
    setSelectedImage(image);
  };

  const handleConfirmSelection = () => {
    if (selectedImage) {
      onSelectImage(selectedImage);
      onClose();
      setSelectedImage(null);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الصورة؟' : 'Are you sure you want to delete this image?')) {
      await deleteMutation.mutateAsync({ id: imageId });
    }
  };

  const filteredImages = (imagesQuery.data || []).filter(img =>
    img.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {title || (language === 'ar' ? 'مدير الوسائط' : 'Media Manager')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

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
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition"
              >
                <Upload className="mx-auto mb-4 text-gray-400" size={32} />
                <p className="text-gray-600 mb-2">
                  {language === 'ar' ? 'اسحب الصور هنا أو انقر للاختيار' : 'Drag images here or click to select'}
                </p>
                <p className="text-sm text-gray-500">
                  {language === 'ar' ? 'الحد الأقصى 5MB - JPG, PNG, WEBP' : 'Max 5MB - JPG, PNG, WEBP'}
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
                  {uploading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                  {language === 'ar' ? 'اختر صورة' : 'Select Image'}
                </Button>
              </div>
            </div>
          )}

          {/* Search Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {language === 'ar' ? 'مكتبة الصور' : 'Image Library'}
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <Input
                placeholder={language === 'ar' ? 'ابحث عن صورة...' : 'Search images...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Images Grid */}
          {imagesQuery.isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {language === 'ar' ? 'لا توجد صور' : 'No images found'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition ${
                    selectedImage?.id === image.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectImage(image)}
                >
                  <div className="w-full h-32 bg-gray-50 flex items-center justify-center relative">
                    <img
                      src={image.url}
                      alt={image.fileName}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'text-gray-400 text-xs text-center';
                          errorDiv.textContent = 'Failed to load';
                          parent.appendChild(errorDiv);
                        }
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition flex items-center justify-center pointer-events-none">
                    {selectedImage?.id === image.id && (
                      <div className="text-white text-2xl drop-shadow-lg">✓</div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image.id);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition z-10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleConfirmSelection}
              disabled={!selectedImage}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {language === 'ar' ? 'استخدم الصورة' : 'Use Image'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
