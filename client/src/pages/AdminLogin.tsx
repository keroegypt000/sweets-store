import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, LogIn } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function AdminLogin() {
  const { language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        // Store admin token in localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        
        toast.success(language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
        setLocation('/admin-dashboard');
      }
    },
    onError: (error) => {
      toast.error(error.message || (language === 'ar' ? 'بيانات دخول غير صحيحة' : 'Invalid credentials'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-yellow to-accent-yellow flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-dark-text mb-2">
            <span className="text-dark-text">Sweets</span>
            <span className="text-white ml-2">Store</span>
          </h1>
          <p className="text-dark-text text-sm">
            {language === 'ar' ? 'لوحة التحكم الإدارية' : 'Admin Dashboard'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-dark-text mb-6 text-center">
            {language === 'ar' ? 'تسجيل الدخول' : 'Admin Login'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                {language === 'ar' ? 'اسم المستخدم' : 'Username'}
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل اسم المستخدم' : 'Enter username'}
                disabled={loginMutation.isPending}
                className="w-full"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                disabled={loginMutation.isPending}
                className="w-full"
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-primary-yellow text-dark-text hover:bg-accent-yellow font-semibold py-2"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'ar' ? 'جاري الدخول...' : 'Logging in...'}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'دخول' : 'Login'}
                </>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-2">
              {language === 'ar' ? 'بيانات التجربة:' : 'Demo Credentials:'}
            </p>
            <p className="text-xs text-dark-text text-center">
              <strong>{language === 'ar' ? 'المستخدم:' : 'Username:'}</strong> admin
            </p>
            <p className="text-xs text-dark-text text-center">
              <strong>{language === 'ar' ? 'كلمة المرور:' : 'Password:'}</strong> admin123
            </p>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="text-center mt-6">
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="text-white hover:text-dark-text transition font-medium"
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>

        {/* Back to Store */}
        <div className="text-center mt-4">
          <a
            href="/"
            className="text-white hover:text-dark-text transition text-sm"
          >
            {language === 'ar' ? '← العودة إلى المتجر' : '← Back to Store'}
          </a>
        </div>
      </div>
    </div>
  );
}
