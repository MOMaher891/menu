import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Lock, User, Globe, Moon, Sun, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Already logged in? Redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    try {
      setLoading(true);
      setError('');
      
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        navigate('/admin/dashboard');
      } else {
        setError(data.message || t('loginError'));
      }
    } catch (err) {
      console.error(err);
      setError(lang === 'ar' ? 'حدث خطأ في الاتصال بالخادم.' : 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300 relative overflow-hidden">
      
      {/* Decorative background objects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-600/10 blur-3xl" />

      {/* Header controls */}
      <div className="w-full max-w-md mx-auto px-6 pt-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white glow-brand font-bold text-base">
            G
          </div>
          <span className="font-extrabold text-sm tracking-tight">Gourmet Bistro</span>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="w-8 h-8 rounded-full bg-white dark:bg-stone-950 border border-stone-250/20 shadow-sm flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors tap-highlight"
            title="Switch Language"
          >
            <Globe className="w-4 h-4 text-stone-600 dark:text-stone-300" />
          </button>

          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-8 h-8 rounded-full bg-white dark:bg-stone-950 border border-stone-250/20 shadow-sm flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors tap-highlight"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md mx-auto px-6 py-12 flex-1 flex items-center justify-center z-10">
        <div className="w-full glass rounded-3xl p-6 md:p-8 shadow-xl border border-stone-200/55 dark:border-stone-800/60 relative">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-50">
              {t('adminLogin')}
            </h2>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5 font-medium">
              {lang === 'ar' ? 'يرجى تسجيل الدخول لإدارة القائمة والطلبات' : 'Sign in to access restaurant controls'}
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-450 p-3.5 rounded-2xl flex items-center space-x-2.5 rtl:space-x-reverse text-xs font-semibold shadow-sm">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 dark:text-stone-400">
                {t('username')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 rtl:left-auto rtl:right-3 flex items-center pointer-events-none text-stone-400 dark:text-stone-600">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  id="username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={lang === 'ar' ? 'اسم المستخدم' : 'Enter username'}
                  className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-xl bg-white/50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 dark:text-stone-400">
                {t('password')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 rtl:left-auto rtl:right-3 flex items-center pointer-events-none text-stone-400 dark:text-stone-600">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang === 'ar' ? 'كلمة المرور' : '••••••••'}
                  className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-xl bg-white/50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Login button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 disabled:cursor-not-allowed text-white font-extrabold py-3 rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-xs tracking-wide z-10"
            >
              {loading ? (lang === 'ar' ? 'تسجيل الدخول...' : 'Signing in...') : t('loginBtn')}
            </button>
          </form>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="w-full py-6 text-center text-[10px] text-stone-400 z-10">
        © 2026 Gourmet QR System. {lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved.'}
      </footer>

    </div>
  );
}
