import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  FolderKanban,
  Pizza as PizzaIcon,
  TicketPercent,
  Plus,
  Edit2,
  Trash2,
  Globe,
  Moon,
  Sun,
  LogOut,
  Upload,
  Calendar,
  Layers,
  Settings,
  Eye,
  Check,
  X,
  PlusCircle,
  MinusCircle,
  HelpCircle,
  CheckSquare,
  Square
} from 'lucide-react';

export default function AdminDashboard() {
  const { lang, toggleLanguage, t, getLocalized } = useLanguage();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // Active tab: 'categories' | 'items' | 'offers'
  const [activeTab, setActiveTab] = useState('categories');

  // Shared UI loaders / errors
  const [globalLoading, setGlobalLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' }); // type: 'success' | 'error'

  // Data lists
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [settings, setSettings] = useState({ restaurantName: { en: 'Gourmet Bistro', ar: 'مطعم غورميه' }, logo: '' });

  // Modals visibility
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // Edit IDs
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingOfferId, setEditingOfferId] = useState(null);

  // --- FORM STATES ---
  // Category Form
  const [categoryForm, setCategoryForm] = useState({
    nameEn: '',
    nameAr: '',
    icon: 'Utensils',
    orderIndex: 0,
    isActive: true,
  });

  // Item Form
  const [itemForm, setItemForm] = useState({
    nameEn: '',
    nameAr: '',
    descEn: '',
    descAr: '',
    price: 0,
    image: '',
    categoryId: '',
    isAvailable: true,
    options: [], // Array of options groups
  });

  // Offer Form
  const [offerForm, setOfferForm] = useState({
    titleEn: '',
    titleAr: '',
    discountPercentage: 0,
    discountedPrice: '',
    itemId: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  // Auth & Theme syncing
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    if (!token || !user) {
      navigate('/admin');
    } else {
      setAdminUser(JSON.parse(user));
    }
  }, [navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch Dashboard Data
  const fetchData = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    setGlobalLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [catRes, itemRes, offerRes, settingsRes] = await Promise.all([
        fetch('/api/admin/categories', { headers }),
        fetch('/api/admin/items', { headers }),
        fetch('/api/admin/offers', { headers }),
        fetch('/api/admin/settings', { headers }),
      ]);

      // Guard 401 Unauthorized
      if (catRes.status === 401 || itemRes.status === 401 || offerRes.status === 401 || settingsRes.status === 401) {
        handleLogout();
        return;
      }

      const catData = await catRes.json();
      const itemData = await itemRes.json();
      const offerData = await offerRes.json();
      const settingsData = await settingsRes.json();

      if (catData.success) setCategories(catData.data);
      if (itemData.success) setItems(itemData.data);
      if (offerData.success) setOffers(offerData.data);
      if (settingsData.success && settingsData.data) setSettings(settingsData.data);

    } catch (err) {
      console.error(err);
      triggerFeedback('error', lang === 'ar' ? 'حدث خطأ أثناء جلب البيانات.' : 'Error loading dashboard data.');
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lang]);

  // Trigger Notification
  const triggerFeedback = (type, text) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg({ type: '', text: '' });
    }, 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin');
  };

  // Generic fetch wrapper for modifications
  const fetchModify = async (url, method, body) => {
    const token = localStorage.getItem('admin_token');
    return await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  };

  // Image File Uploader (Multer integration)
  const handleImageUpload = async (e, setUrlCallback) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('image', file);

    try {
      setGlobalLoading(true);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUrlCallback(data.url);
        triggerFeedback('success', lang === 'ar' ? 'تم رفع الصورة بنجاح!' : 'Image uploaded successfully!');
      } else {
        triggerFeedback('error', data.message || 'Image upload failed');
      }
    } catch (err) {
      console.error(err);
      triggerFeedback('error', 'Network upload error');
    } finally {
      setGlobalLoading(false);
    }
  };

  // ==========================================
  // CATEGORIES CRUD
  // ==========================================
  const handleOpenCategoryCreate = () => {
    setEditingCategoryId(null);
    setCategoryForm({
      nameEn: '',
      nameAr: '',
      icon: 'Utensils',
      orderIndex: categories.length,
      isActive: true,
    });
    setShowCategoryModal(true);
  };

  const handleOpenCategoryEdit = (cat) => {
    setEditingCategoryId(cat._id);
    setCategoryForm({
      nameEn: cat.name.en,
      nameAr: cat.name.ar,
      icon: cat.icon || 'Utensils',
      orderIndex: cat.orderIndex,
      isActive: cat.isActive,
    });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: { en: categoryForm.nameEn, ar: categoryForm.nameAr },
      icon: categoryForm.icon,
      orderIndex: Number(categoryForm.orderIndex),
      isActive: categoryForm.isActive,
    };

    try {
      let res;
      if (editingCategoryId) {
        res = await fetchModify(`/api/admin/categories/${editingCategoryId}`, 'PUT', payload);
      } else {
        res = await fetchModify('/api/admin/categories', 'POST', payload);
      }
      
      const result = await res.json();
      if (result.success) {
        triggerFeedback('success', t('savingSuccess'));
        setShowCategoryModal(false);
        fetchData();
      } else {
        triggerFeedback('error', result.message || 'Error occurred');
      }
    } catch (err) {
      console.error(err);
      triggerFeedback('error', 'Request failed');
    }
  };

  const handleCategoryDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      const res = await fetchModify(`/api/admin/categories/${id}`, 'DELETE');
      const result = await res.json();
      if (result.success) {
        triggerFeedback('success', t('deleteSuccess'));
        fetchData();
      } else {
        triggerFeedback('error', result.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // ITEMS CRUD
  // ==========================================
  const handleOpenItemCreate = () => {
    setEditingItemId(null);
    setItemForm({
      nameEn: '',
      nameAr: '',
      descEn: '',
      descAr: '',
      price: '',
      image: '',
      categoryId: categories[0]?._id || '',
      isAvailable: true,
      options: [],
    });
    setShowItemModal(true);
  };

  const handleOpenItemEdit = (item) => {
    setEditingItemId(item._id);
    setItemForm({
      nameEn: item.name.en,
      nameAr: item.name.ar,
      descEn: item.description?.en || '',
      descAr: item.description?.ar || '',
      price: item.price,
      image: item.image || '',
      categoryId: item.categoryId._id || item.categoryId,
      isAvailable: item.isAvailable,
      options: item.options || [],
    });
    setShowItemModal(true);
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: { en: itemForm.nameEn, ar: itemForm.nameAr },
      description: { en: itemForm.descEn, ar: itemForm.descAr },
      price: Number(itemForm.price),
      image: itemForm.image,
      categoryId: itemForm.categoryId,
      isAvailable: itemForm.isAvailable,
      options: itemForm.options,
    };

    try {
      let res;
      if (editingItemId) {
        res = await fetchModify(`/api/admin/items/${editingItemId}`, 'PUT', payload);
      } else {
        res = await fetchModify('/api/admin/items', 'POST', payload);
      }
      
      const result = await res.json();
      if (result.success) {
        triggerFeedback('success', t('savingSuccess'));
        setShowItemModal(false);
        fetchData();
      } else {
        triggerFeedback('error', result.message || 'Error occurred');
      }
    } catch (err) {
      console.error(err);
      triggerFeedback('error', 'Request failed');
    }
  };

  const handleItemDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      const res = await fetchModify(`/api/admin/items/${id}`, 'DELETE');
      const result = await res.json();
      if (result.success) {
        triggerFeedback('success', t('deleteSuccess'));
        fetchData();
      } else {
        triggerFeedback('error', result.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Nested Options Helpers inside Item Form
  const addOptionGroup = () => {
    const newGroup = {
      title: { en: '', ar: '' },
      type: 'radio',
      required: false,
      choices: [],
    };
    setItemForm(prev => ({ ...prev, options: [...prev.options, newGroup] }));
  };

  const removeOptionGroup = (index) => {
    setItemForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const updateOptionGroupField = (groupIndex, field, langKey, val) => {
    setItemForm(prev => {
      const updated = [...prev.options];
      if (langKey) {
        updated[groupIndex][field][langKey] = val;
      } else {
        updated[groupIndex][field] = val;
      }
      return { ...prev, options: updated };
    });
  };

  const addChoiceToGroup = (groupIndex) => {
    const newChoice = {
      name: { en: '', ar: '' },
      priceModifier: 0,
    };
    setItemForm(prev => {
      const updated = [...prev.options];
      updated[groupIndex].choices.push(newChoice);
      return { ...prev, options: updated };
    });
  };

  const removeChoiceFromGroup = (groupIndex, choiceIndex) => {
    setItemForm(prev => {
      const updated = [...prev.options];
      updated[groupIndex].choices = updated[groupIndex].choices.filter((_, i) => i !== choiceIndex);
      return { ...prev, options: updated };
    });
  };

  const updateChoiceField = (groupIndex, choiceIndex, field, langKey, val) => {
    setItemForm(prev => {
      const updated = [...prev.options];
      if (langKey) {
        updated[groupIndex].choices[choiceIndex][field][langKey] = val;
      } else {
        // Price modifier
        updated[groupIndex].choices[choiceIndex][field] = Number(val);
      }
      return { ...prev, options: updated };
    });
  };

  // ==========================================
  // OFFERS CRUD
  // ==========================================
  const handleOpenOfferCreate = () => {
    setEditingOfferId(null);
    setOfferForm({
      titleEn: '',
      titleAr: '',
      discountPercentage: 0,
      discountedPrice: '',
      itemId: items[0]?._id || '',
      startDate: '',
      endDate: '',
      isActive: true,
    });
    setShowOfferModal(true);
  };

  // Utility to convert Date object to datetime-local string
  const formatDatetimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const handleOpenOfferEdit = (offer) => {
    setEditingOfferId(offer._id);
    setOfferForm({
      titleEn: offer.title.en,
      titleAr: offer.title.ar,
      discountPercentage: offer.discountPercentage,
      discountedPrice: offer.discountedPrice || '',
      itemId: offer.itemId._id || offer.itemId,
      startDate: formatDatetimeLocal(offer.startDate),
      endDate: formatDatetimeLocal(offer.endDate),
      isActive: offer.isActive,
    });
    setShowOfferModal(true);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: { en: offerForm.titleEn, ar: offerForm.titleAr },
      discountPercentage: Number(offerForm.discountPercentage),
      discountedPrice: offerForm.discountedPrice !== '' ? Number(offerForm.discountedPrice) : undefined,
      itemId: offerForm.itemId,
      startDate: offerForm.startDate,
      endDate: offerForm.endDate,
      isActive: offerForm.isActive,
    };

    try {
      let res;
      if (editingOfferId) {
        res = await fetchModify(`/api/admin/offers/${editingOfferId}`, 'PUT', payload);
      } else {
        res = await fetchModify('/api/admin/offers', 'POST', payload);
      }
      
      const result = await res.json();
      if (result.success) {
        triggerFeedback('success', t('savingSuccess'));
        setShowOfferModal(false);
        fetchData();
      } else {
        triggerFeedback('error', result.message || 'Error occurred');
      }
    } catch (err) {
      console.error(err);
      triggerFeedback('error', 'Request failed');
    }
  };

  const handleOfferDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      const res = await fetchModify(`/api/admin/offers/${id}`, 'DELETE');
      const result = await res.json();
      if (result.success) {
        triggerFeedback('success', t('deleteSuccess'));
        fetchData();
      } else {
        triggerFeedback('error', result.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchModify('/api/admin/settings', 'PUT', settings);
      const result = await res.json();
      if (result.success) {
        setSettings(result.data);
        triggerFeedback('success', t('savingSuccess'));
      } else {
        triggerFeedback('error', result.message || 'Error occurred');
      }
    } catch (err) {
      console.error(err);
      triggerFeedback('error', 'Request failed');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar for desktop, top bar for mobile */}
      <aside className="w-full md:w-64 bg-white dark:bg-stone-900 border-b md:border-b-0 md:border-r border-stone-200/60 dark:border-stone-800/80 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          {/* Admin Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white glow-brand font-bold overflow-hidden">
                {settings.logo ? (
                  <img src={settings.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  (getLocalized(settings.restaurantName) || 'G').charAt(0)
                )}
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight leading-none truncate max-w-[120px]">
                  {getLocalized(settings.restaurantName) || 'Console'}
                </h1>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">@{adminUser?.username || 'admin'}</span>
              </div>
            </div>
            
            {/* Quick mobile controls */}
            <div className="flex items-center space-x-1 rtl:space-x-reverse md:hidden">
              <button 
                onClick={toggleLanguage}
                className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-850 flex items-center justify-center hover:bg-stone-200"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleLogout}
                className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-850 flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-950/20 text-rose-500"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1.5 pt-2">
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'categories'
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-850'
              }`}
            >
              <FolderKanban className="w-4.5 h-4.5" />
              <span>{t('categories')}</span>
              <span className="ml-auto rtl:mr-auto bg-stone-200/50 dark:bg-stone-800 rounded-full px-2 py-0.5 text-[9px] font-black">{categories.length}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('items')}
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'items'
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-850'
              }`}
            >
              <PizzaIcon className="w-4.5 h-4.5" />
              <span>{t('itemsLabel')}</span>
              <span className="ml-auto rtl:mr-auto bg-stone-200/50 dark:bg-stone-800 rounded-full px-2 py-0.5 text-[9px] font-black">{items.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('offers')}
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'offers'
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-850'
              }`}
            >
              <TicketPercent className="w-4.5 h-4.5" />
              <span>{t('offersLabel')}</span>
              <span className="ml-auto rtl:mr-auto bg-stone-200/50 dark:bg-stone-800 rounded-full px-2 py-0.5 text-[9px] font-black">{offers.length}</span>
            </button>

            <button
              id="settings-tab-btn"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400'
                  : 'text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-850'
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
              <span>{t('settingsLabel')}</span>
            </button>
          </nav>
        </div>

        {/* Bottom controls desktop */}
        <div className="hidden md:block pt-6 border-t border-stone-200/50 dark:border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={toggleLanguage}
              className="flex items-center space-x-2 rtl:space-x-reverse text-xs font-bold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
            >
              <Globe className="w-4 h-4 text-stone-400" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-850 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-850"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <a 
            href="#/?table=1" 
            target="_blank" 
            rel="noreferrer"
            className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 text-stone-700 dark:text-stone-300 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>{t('menuLink')}</span>
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-450 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main dashboard content container */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Dynamic global loader / notification alert banner */}
        {feedbackMsg.text && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center space-x-2.5 rtl:space-x-reverse text-xs font-extrabold max-w-sm border transition-all duration-350 ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450 border-emerald-200 dark:border-emerald-900/40' 
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-450 border-rose-200 dark:border-rose-900/40'
          }`}>
            {feedbackMsg.type === 'success' ? <Check className="w-4.5 h-4.5" /> : <X className="w-4.5 h-4.5" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Top metrics card summary */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">{t('categoriesCount')}</span>
              <h3 className="text-2xl font-black">{categories.length}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <FolderKanban className="w-5.5 h-5.5" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">{t('totalItems')}</span>
              <h3 className="text-2xl font-black">{items.length}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <PizzaIcon className="w-5.5 h-5.5" />
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider">{t('activeOffers')}</span>
              <h3 className="text-2xl font-black">{offers.filter(o => o.isActive).length}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <TicketPercent className="w-5.5 h-5.5" />
            </div>
          </div>
        </section>

        {/* TABLE LISTS FOR CURRENT TAB */}

        {/* Tab 1: Categories CRUD */}
        {activeTab === 'categories' && (
          <section className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-stone-100 dark:border-stone-800/60 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">{t('categories')}</h3>
                <p className="text-[10px] text-stone-400 mt-0.5">{lang === 'ar' ? 'إنشاء وتعديل تصنيفات قائمة الطعام الفرعية' : 'Create and organize your restaurant category groups'}</p>
              </div>
              <button
                onClick={handleOpenCategoryCreate}
                className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold px-4.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 rtl:space-x-reverse shadow-md shadow-brand-500/10 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addCategory')}</span>
              </button>
            </div>

            {/* Category Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="bg-stone-50/50 dark:bg-stone-950/30 text-stone-400 border-b border-stone-100 dark:border-stone-800/65 text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-4">{lang === 'ar' ? 'أيقونة' : 'Icon'}</th>
                    <th className="p-4">{t('nameEn')}</th>
                    <th className="p-4">{t('nameAr')}</th>
                    <th className="p-4 text-center">{t('orderIndex')}</th>
                    <th className="p-4">{t('status')}</th>
                    <th className="p-4 text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-xs font-semibold">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-stone-50/40 dark:hover:bg-stone-900/50 transition-colors">
                      <td className="p-4 font-bold text-stone-400">
                        <span className="bg-stone-100 dark:bg-stone-850 px-2 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-wide">{cat.icon || 'Utensils'}</span>
                      </td>
                      <td className="p-4 font-bold">{cat.name.en}</td>
                      <td className="p-4">{cat.name.ar}</td>
                      <td className="p-4 text-center font-bold text-stone-400">{cat.orderIndex}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black ${
                          cat.isActive 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450' 
                            : 'bg-stone-150 text-stone-500 dark:bg-stone-800 dark:text-stone-550'
                        }`}>
                          {cat.isActive ? t('active') : t('inactive')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2.5 rtl:space-x-reverse">
                          <button
                            onClick={() => handleOpenCategoryEdit(cat)}
                            className="text-stone-400 hover:text-brand-500 hover:scale-105 transition-all"
                            title={t('edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCategoryDelete(cat._id)}
                            className="text-stone-400 hover:text-rose-500 hover:scale-105 transition-all"
                            title={t('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-stone-400">
                        {lang === 'ar' ? 'لا توجد تصنيفات بعد.' : 'No categories found. Click Add Category to start.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tab 2: Items CRUD */}
        {activeTab === 'items' && (
          <section className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-stone-100 dark:border-stone-800/60 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">{t('itemsLabel')}</h3>
                <p className="text-[10px] text-stone-400 mt-0.5">{lang === 'ar' ? 'تعديل وتحديث الأطباق وأسعارها وتوفرها' : 'Edit, toggle availability, and configure options for food items'}</p>
              </div>
              <button
                onClick={handleOpenItemCreate}
                disabled={categories.length === 0}
                className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed text-white font-extrabold px-4.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 rtl:space-x-reverse shadow-md shadow-brand-500/10 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addItem')}</span>
              </button>
            </div>

            {/* Items Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="bg-stone-50/50 dark:bg-stone-950/30 text-stone-400 border-b border-stone-100 dark:border-stone-800/65 text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-4">{lang === 'ar' ? 'صورة' : 'Photo'}</th>
                    <th className="p-4">{t('nameEn')}</th>
                    <th className="p-4">{t('nameAr')}</th>
                    <th className="p-4">{t('categoriesCount')}</th>
                    <th className="p-4">{t('price')}</th>
                    <th className="p-4">{t('status')}</th>
                    <th className="p-4 text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-xs font-semibold">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-stone-50/40 dark:hover:bg-stone-900/50 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-lg bg-stone-100 dark:bg-stone-800 overflow-hidden relative border border-stone-200/20">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300"><Layers className="w-5 h-5 stroke-[1.5]" /></div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold">{item.name.en}</td>
                      <td className="p-4">{item.name.ar}</td>
                      <td className="p-4 text-stone-500 dark:text-stone-400">
                        {item.categoryId ? getLocalized(item.categoryId.name) : '-'}
                      </td>
                      <td className="p-4 font-extrabold text-brand-600 dark:text-brand-400">
                        {t('currency')}{item.price.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black ${
                          item.isAvailable 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450' 
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-955/20 dark:text-rose-400'
                        }`}>
                          {item.isAvailable ? t('available') : t('unavailable')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-2.5 rtl:space-x-reverse">
                          <button
                            onClick={() => handleOpenItemEdit(item)}
                            className="text-stone-400 hover:text-brand-500 hover:scale-105 transition-all"
                            title={t('edit')}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleItemDelete(item._id)}
                            className="text-stone-400 hover:text-rose-500 hover:scale-105 transition-all"
                            title={t('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-stone-400">
                        {lang === 'ar' ? 'لا توجد أطباق بعد.' : 'No menu items found. Click Add Menu Item.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tab 3: Offers CRUD */}
        {activeTab === 'offers' && (
          <section className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-stone-100 dark:border-stone-800/60 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm">{t('offersLabel')}</h3>
                <p className="text-[10px] text-stone-400 mt-0.5">{lang === 'ar' ? 'جدولة العروض والخصومات المؤقتة للأطباق' : 'Configure scheduled percentages or fixed-price deductions on food items'}</p>
              </div>
              <button
                onClick={handleOpenOfferCreate}
                disabled={items.length === 0}
                className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed text-white font-extrabold px-4.5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 rtl:space-x-reverse shadow-md shadow-brand-500/10 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addOffer')}</span>
              </button>
            </div>

            {/* Offers Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead>
                  <tr className="bg-stone-50/50 dark:bg-stone-950/30 text-stone-400 border-b border-stone-100 dark:border-stone-800/65 text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-4">{t('titleEn')}</th>
                    <th className="p-4">{t('titleAr')}</th>
                    <th className="p-4">{lang === 'ar' ? 'الطبق المستهدف' : 'Linked Item'}</th>
                    <th className="p-4">{t('discountPercentage')}</th>
                    <th className="p-4">{t('discountedPrice')}</th>
                    <th className="p-4">{lang === 'ar' ? 'الجدول الزمني' : 'Schedule Timeline'}</th>
                    <th className="p-4">{t('status')}</th>
                    <th className="p-4 text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-xs font-semibold">
                  {offers.map((offer) => {
                    const now = new Date();
                    const start = new Date(offer.startDate);
                    const end = new Date(offer.endDate);
                    const isScheduleActive = now >= start && now <= end && offer.isActive;

                    return (
                      <tr key={offer._id} className="hover:bg-stone-50/40 dark:hover:bg-stone-900/50 transition-colors">
                        <td className="p-4 font-bold">{offer.title.en}</td>
                        <td className="p-4">{offer.title.ar}</td>
                        <td className="p-4 text-stone-500 dark:text-stone-400">
                          {offer.itemId ? getLocalized(offer.itemId.name) : '-'}
                        </td>
                        <td className="p-4 font-extrabold text-brand-600 dark:text-brand-400">
                          {offer.discountPercentage > 0 ? `${offer.discountPercentage}%` : '-'}
                        </td>
                        <td className="p-4 font-extrabold text-brand-600 dark:text-brand-400">
                          {offer.discountedPrice ? `${t('currency')}${offer.discountedPrice.toFixed(2)}` : '-'}
                        </td>
                        <td className="p-4 text-stone-450 dark:text-stone-500">
                          <div className="flex flex-col space-y-0.5 font-medium text-[10px]">
                            <span>🟢 {new Date(offer.startDate).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                            <span>🔴 {new Date(offer.endDate).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-black flex items-center space-x-1 w-max ${
                            isScheduleActive 
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450' 
                              : 'bg-stone-150 text-stone-500 dark:bg-stone-800 dark:text-stone-550'
                          }`}>
                            <span>{isScheduleActive ? t('active') : t('inactive')}</span>
                            {!offer.isActive && <span className="text-[8px] opacity-75">({lang === 'ar' ? 'يدوي' : 'Manual'})</span>}
                            {offer.isActive && (now < start) && <span className="text-[8px] opacity-75">({lang === 'ar' ? 'مجدول' : 'Scheduled'})</span>}
                            {offer.isActive && (now > end) && <span className="text-[8px] opacity-75">({lang === 'ar' ? 'منتهي' : 'Expired'})</span>}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center space-x-2.5 rtl:space-x-reverse">
                            <button
                              onClick={() => handleOpenOfferEdit(offer)}
                              className="text-stone-400 hover:text-brand-500 hover:scale-105 transition-all"
                              title={t('edit')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOfferDelete(offer._id)}
                              className="text-stone-400 hover:text-rose-500 hover:scale-105 transition-all"
                              title={t('delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {offers.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-stone-400">
                        {lang === 'ar' ? 'لا توجد عروض ترويجية مجدولة بعد.' : 'No offers scheduled. Click Schedule Promotion to start.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tab 4: Settings Manager */}
        {activeTab === 'settings' && (
          <section className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850 rounded-2xl shadow-sm overflow-hidden p-6 flex flex-col space-y-6">
            <div>
              <h3 className="font-extrabold text-sm">{t('settingsLabel')}</h3>
              <p className="text-[10px] text-stone-400 mt-0.5">{lang === 'ar' ? 'تحديث وتخصيص العلامة التجارية للمطعم' : 'Configure your restaurant brand identity details'}</p>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-5 max-w-lg text-xs">
              {/* Bilingual Restaurant Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-500 uppercase tracking-wider">{t('restaurantNameEn')}</label>
                  <input
                    type="text"
                    required
                    value={settings.restaurantName?.en || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      restaurantName: { ...settings.restaurantName, en: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-500 uppercase tracking-wider">{t('restaurantNameAr')}</label>
                  <input
                    type="text"
                    required
                    value={settings.restaurantName?.ar || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      restaurantName: { ...settings.restaurantName, ar: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                  />
                </div>
              </div>

              {/* Logo Uploader */}
              <div className="space-y-2 border-t border-stone-100 dark:border-stone-850 pt-4">
                <label className="font-bold text-stone-500 uppercase tracking-wider block">{t('restaurantLogo')}</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* File Upload Selector */}
                  <div className="md:col-span-2 relative border border-dashed border-stone-300 dark:border-stone-800 rounded-xl p-4 flex flex-col items-center justify-center bg-stone-50/50 dark:bg-stone-950/20 hover:bg-stone-100/50 dark:hover:bg-stone-950/40 transition-colors">
                    <Upload className="w-8 h-8 text-stone-400 mb-2" />
                    <span className="text-[10px] text-stone-400 font-bold mb-2">{t('dragUpload')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, (url) => setSettings(prev => ({ ...prev, logo: url })))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Manual URL & Preview */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Or paste logo image URL"
                      value={settings.logo || ''}
                      onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                    />
                    {settings.logo ? (
                      <div className="h-20 w-full rounded-lg overflow-hidden border border-stone-200/50 dark:border-stone-800 relative bg-stone-100 flex items-center justify-center">
                        <img src={settings.logo} alt="" className="h-full object-contain max-w-full" />
                        <button 
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, logo: '' }))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-full rounded-lg border border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-center text-[10px] text-stone-400">
                        {t('noImage')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-100 dark:border-stone-850 flex items-center justify-end">
                <button
                  type="submit"
                  className="bg-brand-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </section>
        )}

      </main>

      {/* ==========================================
          MODALS & FORMS
         ========================================== */}

      {/* 1. Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up border border-stone-200/50 dark:border-stone-800">
            <div className="p-5 border-b border-stone-150 dark:border-stone-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm">{editingCategoryId ? t('edit') : t('addCategory')}</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('nameEn')}</label>
                <input
                  type="text"
                  required
                  value={categoryForm.nameEn}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameEn: e.target.value })}
                  placeholder="e.g. Burgers"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('nameAr')}</label>
                <input
                  type="text"
                  required
                  value={categoryForm.nameAr}
                  onChange={(e) => setCategoryForm({ ...categoryForm, nameAr: e.target.value })}
                  placeholder="مثال: برجر"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{lang === 'ar' ? 'رمز / أيقونة' : 'Icon Slug'}</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    placeholder="e.g. ChefHat, Pizza"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('orderIndex')}</label>
                  <input
                    type="number"
                    required
                    value={categoryForm.orderIndex}
                    onChange={(e) => setCategoryForm({ ...categoryForm, orderIndex: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2.5 rtl:space-x-reverse pt-2">
                <input
                  type="checkbox"
                  id="category-active"
                  checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                  className="w-4 h-4 accent-brand-500"
                />
                <label htmlFor="category-active" className="text-xs font-bold text-stone-750 dark:text-stone-300">
                  {t('active')}
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-2.5 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 text-xs font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-xl shadow-2xl my-8 animate-slide-up border border-stone-200/50 dark:border-stone-800 flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-stone-150 dark:border-stone-800 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-sm">{editingItemId ? t('edit') : t('addItem')}</h3>
              <button onClick={() => setShowItemModal(false)} className="text-stone-400 hover:text-stone-750">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Scrollable Form Body */}
            <form onSubmit={handleItemSubmit} className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
              
              {/* Bilingual Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-500">{t('nameEn')}</label>
                  <input
                    type="text"
                    required
                    value={itemForm.nameEn}
                    onChange={(e) => setItemForm({ ...itemForm, nameEn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-500">{t('nameAr')}</label>
                  <input
                    type="text"
                    required
                    value={itemForm.nameAr}
                    onChange={(e) => setItemForm({ ...itemForm, nameAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                  />
                </div>
              </div>

              {/* Bilingual Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-500">{t('descEn')}</label>
                  <textarea
                    rows="2"
                    value={itemForm.descEn}
                    onChange={(e) => setItemForm({ ...itemForm, descEn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-500">{t('descAr')}</label>
                  <textarea
                    rows="2"
                    value={itemForm.descAr}
                    onChange={(e) => setItemForm({ ...itemForm, descAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                  />
                </div>
              </div>

              {/* Price, Category & Available */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-500">{t('price')} ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-500">{t('selectCategory')}</label>
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{getLocalized(c.name)}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2.5 rtl:space-x-reverse pt-5">
                  <input
                    type="checkbox"
                    id="item-available"
                    checked={itemForm.isAvailable}
                    onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                    className="w-4 h-4 accent-brand-500"
                  />
                  <label htmlFor="item-available" className="font-bold text-stone-750">
                    {t('available')}
                  </label>
                </div>
              </div>

              {/* Image Upload Input */}
              <div className="space-y-2 border-t border-stone-100 dark:border-stone-850 pt-3.5">
                <label className="font-bold text-stone-500 block">{t('uploadImage')}</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* File Selector */}
                  <div className="md:col-span-2 relative border border-dashed border-stone-300 dark:border-stone-800 rounded-xl p-4 flex flex-col items-center justify-center bg-stone-50/50 dark:bg-stone-950/20 hover:bg-stone-100/50 dark:hover:bg-stone-950/40 transition-colors">
                    <Upload className="w-8 h-8 text-stone-400 mb-2" />
                    <span className="text-[10px] text-stone-400 font-bold mb-2">{t('dragUpload')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, (url) => setItemForm(prev => ({ ...prev, image: url })))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Manual URL Input & Preview */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Or paste image URL"
                      value={itemForm.image}
                      onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                    />
                    
                    {itemForm.image ? (
                      <div className="h-20 w-full rounded-lg overflow-hidden border border-stone-200/50 dark:border-stone-800 relative bg-stone-100">
                        <img src={itemForm.image} alt="" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setItemForm(prev => ({ ...prev, image: '' }))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-full rounded-lg border border-dashed border-stone-200 dark:border-stone-800 flex items-center justify-center text-[10px] text-stone-400">
                        {t('noImage')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Options Customization Config */}
              <div className="border-t border-stone-100 dark:border-stone-850 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm">{t('optionsLabel')}</h4>
                  <button
                    type="button"
                    onClick={addOptionGroup}
                    className="text-brand-500 hover:text-brand-600 font-bold flex items-center space-x-1 rtl:space-x-reverse"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{t('addOptionGroup')}</span>
                  </button>
                </div>

                {itemForm.options.map((group, groupIdx) => (
                  <div key={groupIdx} className="bg-stone-50/50 dark:bg-stone-950/20 border border-stone-200 dark:border-stone-850 p-4 rounded-2xl space-y-3.5 relative">
                    
                    {/* Remove Group Button */}
                    <button
                      type="button"
                      onClick={() => removeOptionGroup(groupIdx)}
                      className="absolute top-3 right-3 rtl:left-3 rtl:right-auto text-rose-500 hover:text-rose-600"
                      title={t('removeOption')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Group Title Config */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <label className="font-bold text-stone-500">{t('optionTitleEn')}</label>
                        <input
                          type="text"
                          required
                          value={group.title.en}
                          onChange={(e) => updateOptionGroupField(groupIdx, 'title', 'en', e.target.value)}
                          placeholder="e.g. Extra toppings"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-stone-500">{t('optionTitleAr')}</label>
                        <input
                          type="text"
                          required
                          value={group.title.ar}
                          onChange={(e) => updateOptionGroupField(groupIdx, 'title', 'ar', e.target.value)}
                          placeholder="مثال: إضافات اختيارية"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
                        />
                      </div>
                    </div>

                    {/* Group Type & Required */}
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="font-bold text-stone-500">{t('optionType')}:</span>
                        <select
                          value={group.type}
                          onChange={(e) => updateOptionGroupField(groupIdx, 'type', null, e.target.value)}
                          className="px-2 py-1 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
                        >
                          <option value="radio">{t('radio')}</option>
                          <option value="checkbox">{t('checkbox')}</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                        <input
                          type="checkbox"
                          id={`required-${groupIdx}`}
                          checked={group.required}
                          onChange={(e) => updateOptionGroupField(groupIdx, 'required', null, e.target.checked)}
                          className="w-4 h-4 accent-brand-500"
                        />
                        <label htmlFor={`required-${groupIdx}`} className="font-bold text-stone-750">{t('required')}</label>
                      </div>
                    </div>

                    {/* Group Choices Setup */}
                    <div className="border-t border-stone-200/50 dark:border-stone-800/80 pt-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] text-stone-400 uppercase tracking-wider">{lang === 'ar' ? 'الخيارات الفرعية' : 'Sub Choices'}</span>
                        <button
                          type="button"
                          onClick={() => addChoiceToGroup(groupIdx)}
                          className="text-brand-500 hover:text-brand-600 font-bold flex items-center space-x-0.5 rtl:space-x-reverse text-[10px]"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>{t('addChoice')}</span>
                        </button>
                      </div>

                      {/* Choice items inputs */}
                      <div className="space-y-2">
                        {group.choices.map((choice, choiceIdx) => (
                          <div key={choiceIdx} className="flex items-center space-x-2.5 rtl:space-x-reverse bg-white dark:bg-stone-900 border border-stone-200/40 dark:border-stone-800 p-2.5 rounded-xl">
                            
                            {/* Choice English name */}
                            <input
                              type="text"
                              required
                              placeholder={t('choiceNameEn')}
                              value={choice.name.en}
                              onChange={(e) => updateChoiceField(groupIdx, choiceIdx, 'name', 'en', e.target.value)}
                              className="flex-1 min-w-0 px-2 py-1 text-[11px] rounded bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800"
                            />
                            {/* Choice Arabic name */}
                            <input
                              type="text"
                              required
                              placeholder={t('choiceNameAr')}
                              value={choice.name.ar}
                              onChange={(e) => updateChoiceField(groupIdx, choiceIdx, 'name', 'ar', e.target.value)}
                              className="flex-1 min-w-0 px-2 py-1 text-[11px] rounded bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800"
                            />
                            {/* Price modifier */}
                            <input
                              type="number"
                              step="0.1"
                              placeholder={t('priceModifier')}
                              value={choice.priceModifier}
                              onChange={(e) => updateChoiceField(groupIdx, choiceIdx, 'priceModifier', null, e.target.value)}
                              className="w-16 px-2 py-1 text-[11px] rounded bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 font-bold text-brand-500"
                            />

                            {/* Remove Choice */}
                            <button
                              type="button"
                              onClick={() => removeChoiceFromGroup(groupIdx, choiceIdx)}
                              className="text-stone-400 hover:text-rose-500"
                            >
                              <MinusCircle className="w-4.5 h-4.5" />
                            </button>

                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Action buttons */}
              <div className="pt-5 border-t border-stone-100 dark:border-stone-850 shrink-0 flex items-center justify-end space-x-2.5 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 text-xs font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs"
                >
                  {t('save')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 3. Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up border border-stone-200/50 dark:border-stone-800">
            <div className="p-5 border-b border-stone-150 dark:border-stone-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm">{editingOfferId ? t('edit') : t('addOffer')}</h3>
              <button onClick={() => setShowOfferModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleOfferSubmit} className="p-5 space-y-4 text-xs">
              
              {/* Title Bilingual */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-500">{t('titleEn')}</label>
                <input
                  type="text"
                  required
                  value={offerForm.titleEn}
                  onChange={(e) => setOfferForm({ ...offerForm, titleEn: e.target.value })}
                  placeholder="e.g. 20% off Pizzas"
                  className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-500">{t('titleAr')}</label>
                <input
                  type="text"
                  required
                  value={offerForm.titleAr}
                  onChange={(e) => setOfferForm({ ...offerForm, titleAr: e.target.value })}
                  placeholder="مثال: خصم ٢٠٪ على البيتزا"
                  className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                />
              </div>

              {/* Target Item Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-stone-500">{t('selectItem')}</label>
                <select
                  value={offerForm.itemId}
                  onChange={(e) => setOfferForm({ ...offerForm, itemId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                >
                  {items.map((it) => (
                    <option key={it._id} value={it._id}>{getLocalized(it.name)}</option>
                  ))}
                </select>
              </div>

              {/* Discount Percentage or Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-500">{t('discountPercentage')} (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={offerForm.discountPercentage}
                    onChange={(e) => setOfferForm({ ...offerForm, discountPercentage: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-500">{t('discountedPrice')} ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={offerForm.discountedPrice}
                    placeholder="Auto-calculated if blank"
                    onChange={(e) => setOfferForm({ ...offerForm, discountedPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                  />
                </div>
              </div>

              {/* Timeline Datetime Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-500">{t('startDate')}</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      required
                      value={offerForm.startDate}
                      onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-500">{t('endDate')}</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      required
                      value={offerForm.endDate}
                      onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850"
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center space-x-2.5 rtl:space-x-reverse pt-2">
                <input
                  type="checkbox"
                  id="offer-active"
                  checked={offerForm.isActive}
                  onChange={(e) => setOfferForm({ ...offerForm, isActive: e.target.checked })}
                  className="w-4 h-4 accent-brand-500"
                />
                <label htmlFor="offer-active" className="font-bold text-stone-750">
                  {t('active')}
                </label>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-stone-100 dark:border-stone-850 flex items-center justify-end space-x-2.5 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 text-xs font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
