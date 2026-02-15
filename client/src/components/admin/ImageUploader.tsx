import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (imageUrl: string) => void;
  currentImage?: string;
  folder: 'products' | 'categories' | 'banners';
  label?: string;
}

export function ImageUploader({ onImageSelect, currentImage, folder, label = 'اختر صورة' }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || '');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('فشل رفع الصورة');
      }

      const data = await response.json();
      const imageUrl = data.url || data.path;
      
      if (imageUrl) {
        onImageSelect(imageUrl);
        toast.success('تم رفع الصورة بنجاح');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('خطأ في رفع الصورة');
      setPreview(currentImage || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview('');
    onImageSelect('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      
      {preview && (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded border" />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            disabled={isUploading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <Input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        disabled={isUploading}
        className="cursor-pointer"
      />
      
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          جاري رفع الصورة...
        </div>
      )}
    </div>
  );
}
