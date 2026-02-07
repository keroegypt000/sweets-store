import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, CheckCircle, Clock, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export function UnusedImagesCleanup() {
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: unusedStats, isLoading: statsLoading, refetch: refetchStats } = trpc.images.unusedImagesStats.useQuery();
  const { data: unusedImages, isLoading: imagesLoading, refetch: refetchImages } = trpc.images.unusedImages.useQuery();
  const deleteUnusedMutation = trpc.images.deleteUnused.useMutation();

  const handleSelectAll = () => {
    if (selectedImages.length === unusedImages?.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(unusedImages?.map(img => img.id) || []);
    }
  };

  const handleSelectImage = (id: number) => {
    setSelectedImages(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedImages.length === 0) {
      toast.error('Please select at least one image to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedImages.length} unused image(s)? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteUnusedMutation.mutateAsync({ imageIds: selectedImages });
      
      toast.success(`Deleted ${result.deleted} images successfully`);

      setSelectedImages([]);
      await refetchImages();
      await refetchStats();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (statsLoading || imagesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Clock className="w-6 h-6 animate-spin text-yellow-500" />
        <span className="ml-2">جاري التحميل...</span>
      </div>
    );
  }

  if (!unusedStats || !unusedImages) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>لم يتمكن من تحميل بيانات الصور غير المستخدمة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">صور غير مستخدمة</p>
              <p className="text-2xl font-bold text-red-700 mt-1">{unusedStats.unusedCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">مساحة قابلة للتحرير</p>
              <p className="text-2xl font-bold text-orange-700 mt-1">{formatBytes(unusedStats.totalUnusedSize)}</p>
            </div>
            <HardDrive className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">نسبة الصور غير المستخدمة</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{unusedStats.potentialSavingsPercentage.toFixed(1)}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">المساحة بعد الحذف</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{unusedStats.storageAfterCleanup.toFixed(1)}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Warning Alert */}
      {unusedStats.unusedCount > 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200 border-l-4 border-l-yellow-500">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">صور غير مستخدمة متاحة للحذف</h3>
              <p className="text-sm text-yellow-800 mt-1">
                تم العثور على {unusedStats.unusedCount} صورة لم تُستخدم في أي منتج أو فئة أو بنر. يمكنك حذفها لتوفير {formatBytes(unusedStats.totalUnusedSize)} من مساحة التخزين.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Images List */}
      {unusedImages.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">الصور غير المستخدمة</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              {selectedImages.length === unusedImages.length ? 'إلغاء التحديد' : 'تحديد الكل'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unusedImages.map((image: any) => (
              <Card
                key={image.id}
                className={`overflow-hidden cursor-pointer transition-all ${
                  selectedImages.includes(image.id)
                    ? 'ring-2 ring-red-500 bg-red-50'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleSelectImage(image.id)}
              >
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.fileName}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                  {selectedImages.includes(image.id) && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-red-600" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{image.fileName}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatBytes(image.fileSize || 0)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(image.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Delete Button */}
          <div className="flex gap-3 justify-end mt-6">
            <Button
              variant="outline"
              onClick={() => setSelectedImages([])}
              disabled={selectedImages.length === 0 || isDeleting}
            >
              إلغاء التحديد
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={selectedImages.length === 0 || isDeleting}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              حذف {selectedImages.length > 0 ? `(${selectedImages.length})` : ''}
            </Button>
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center bg-green-50 border-green-200">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-900">لا توجد صور غير مستخدمة</h3>
          <p className="text-sm text-green-700 mt-2">جميع الصور في النظام قيد الاستخدام</p>
        </Card>
      )}
    </div>
  );
}
