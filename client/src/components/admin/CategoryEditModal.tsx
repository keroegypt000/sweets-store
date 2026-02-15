import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Category {
  id: number;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image?: string;
  slug: string;
  order: number;
  isActive: boolean;
}

interface CategoryEditModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (category: Category) => Promise<void>;
}

export function CategoryEditModal({ isOpen, category, onClose, onSave }: CategoryEditModalProps) {
  const [formData, setFormData] = useState<Category | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData(category);
      setImagePreview(category.image || '');
    }
  }, [category, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImagePreview(base64);
        if (formData) {
          setFormData({ ...formData, image: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: keyof Category, value: any) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    // Validate required fields
    if (!formData.nameAr || !formData.nameEn || !formData.slug) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success('تم حفظ الفئة بنجاح');
      onClose();
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ الفئة');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل الفئة</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">صورة الفئة</label>
            {imagePreview && (
              <div className="mb-2">
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded" />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
          </div>

          {/* Arabic Name */}
          <div>
            <label className="block text-sm font-medium mb-1">الاسم بالعربية</label>
            <Input
              value={formData.nameAr}
              onChange={(e) => handleInputChange('nameAr', e.target.value)}
              placeholder="الاسم بالعربية"
              required
            />
          </div>

          {/* English Name */}
          <div>
            <label className="block text-sm font-medium mb-1">الاسم بالإنجليزية</label>
            <Input
              value={formData.nameEn}
              onChange={(e) => handleInputChange('nameEn', e.target.value)}
              placeholder="English Name"
              required
            />
          </div>

          {/* Arabic Description */}
          <div>
            <label className="block text-sm font-medium mb-1">الوصف بالعربية</label>
            <Input
              value={formData.descriptionAr || ''}
              onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
              placeholder="الوصف بالعربية"
            />
          </div>

          {/* English Description */}
          <div>
            <label className="block text-sm font-medium mb-1">الوصف بالإنجليزية</label>
            <Input
              value={formData.descriptionEn || ''}
              onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
              placeholder="English Description"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <Input
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              placeholder="slug"
              required
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium mb-1">الترتيب</label>
            <Input
              type="number"
              value={formData.order}
              onChange={(e) => handleInputChange('order', parseInt(e.target.value))}
              placeholder="0"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
