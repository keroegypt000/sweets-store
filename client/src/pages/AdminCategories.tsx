import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function AdminCategories() {
  const { language } = useLanguage();
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    image: '',
    slug: '',
    order: 0,
  });

  // Fetch data
  const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = trpc.categories.allCategories.useQuery();

  // Mutations
  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم إضافة الفئة بنجاح' : 'Category added successfully');
      resetForm();
      refetchCategories();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error occurred'));
    },
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم تحديث الفئة بنجاح' : 'Category updated successfully');
      resetForm();
      refetchCategories();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error occurred'));
    },
  });

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم حذف الفئة بنجاح' : 'Category deleted successfully');
      refetchCategories();
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ' : 'Error occurred'));
    },
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      setLocation('/');
    }
  }, [user, loading, setLocation]);

  const resetForm = () => {
    setFormData({
      nameAr: '',
      nameEn: '',
      descriptionAr: '',
      descriptionEn: '',
      image: '',
      slug: '',
      order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (category: any) => {
    setFormData({
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      descriptionAr: category.descriptionAr || '',
      descriptionEn: category.descriptionEn || '',
      image: category.image || '',
      slug: category.slug,
      order: category.order || 0,
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameAr || !formData.nameEn || !formData.slug) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg">
        <Header />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-light-bg">
      <Header />

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation('/admin')}
              className="flex items-center gap-2 text-primary-yellow hover:text-accent-yellow transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{language === 'ar' ? 'العودة' : 'Back'}</span>
            </button>
            <h1 className="text-3xl font-bold text-dark-text">
              {language === 'ar' ? 'إدارة الفئات' : 'Manage Categories'}
            </h1>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-primary-yellow text-dark-text hover:bg-accent-yellow"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'إضافة فئة جديدة' : 'Add New Category'}
          </Button>
        </div>

        {/* Form Section */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-dark-text">
              {editingId ? (language === 'ar' ? 'تعديل الفئة' : 'Edit Category') : (language === 'ar' ? 'إضافة فئة جديدة' : 'Add New Category')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Arabic Name & English Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    {language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'} *
                  </label>
                  <Input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder={language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    {language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'} *
                  </label>
                  <Input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder={language === 'ar' ? 'الاسم بالإنجليزية' : 'English Name'}
                    required
                  />
                </div>
              </div>

              {/* Arabic Description & English Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    {language === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'}
                  </label>
                  <textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder={language === 'ar' ? 'الوصف بالعربية' : 'Arabic Description'}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    {language === 'ar' ? 'الوصف بالإنجليزية' : 'English Description'}
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder={language === 'ar' ? 'الوصف بالإنجليزية' : 'English Description'}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
                  />
                </div>
              </div>

              {/* Slug & Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Slug *
                  </label>
                  <Input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="category-slug"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    {language === 'ar' ? 'ترتيب العرض' : 'Display Order'}
                  </label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  {language === 'ar' ? 'رابط الصورة' : 'Image URL'}
                </label>
                <Input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-yellow text-dark-text hover:bg-accent-yellow"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    language === 'ar' ? 'حفظ' : 'Save'
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-dark-text">
              {language === 'ar' ? 'قائمة الفئات' : 'Categories List'} ({categories.length})
            </h2>
          </div>

          {categoriesLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-yellow" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {language === 'ar' ? 'لا توجد فئات' : 'No categories'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'الاسم' : 'Name'}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'الوصف' : 'Description'}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'الترتيب' : 'Order'}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-dark-text">
                      {language === 'ar' ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category: any) => (
                    <tr key={category.id} className="border-b border-border hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-dark-text font-medium">
                        {language === 'ar' ? category.nameAr : category.nameEn}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-text">
                        {language === 'ar' ? (category.descriptionAr || '-') : (category.descriptionEn || '-')}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-text">
                        {category.order || 0}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الفئة؟' : 'Are you sure you want to delete this category?')) {
                              deleteMutation.mutate({ id: category.id });
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
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
