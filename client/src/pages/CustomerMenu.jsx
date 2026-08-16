import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  Percent, 
  Compass, 
  Globe, 
  Moon, 
  Sun, 
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CustomerMenu() {
  const { lang, toggleLanguage, t, getLocalized } = useLanguage();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  // State for menu data
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({ restaurantName: { en: 'Gourmet Bistro', ar: 'مطعم غورميه' }, logo: '' });

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Table handler state
  const [tableNumber, setTableNumber] = useState(null);

  // Cart states
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Item Drawer state
  const [activeDrawerItem, setActiveDrawerItem] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({}); // { [optionGroupId]: [choiceNames] }

  // Dark mode side-effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Read table parameter
  useEffect(() => {
    const parseTable = () => {
      // Check window.location.search or split hash for parameter
      const query = window.location.search || window.location.hash.split('?')[1] || '';
      const params = new URLSearchParams(query);
      const table = params.get('table');
      
      if (table) {
        setTableNumber(table);
        localStorage.setItem('qr_table_number', table);
      } else {
        const cachedTable = localStorage.getItem('qr_table_number');
        if (cachedTable) {
          setTableNumber(cachedTable);
        }
      }
    };
    parseTable();
  }, []);

  // Fetch Menu from API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const query = tableNumber ? `?table=${tableNumber}` : '';
        const res = await fetch(`/api/menu${query}`);
        const result = await res.json();
        
        if (result.success) {
          setCategories(result.categories);
          setItems(result.items);
          if (result.settings) {
            setSettings(result.settings);
          }
        } else {
          setError(result.message || 'Failed to load menu data');
        }
      } catch (err) {
        console.error(err);
        setError('Connection to server failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [tableNumber]);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const itemEnName = item.name.en.toLowerCase();
    const itemArName = item.name.ar;
    const query = searchQuery.toLowerCase();
    const matchesSearch = itemEnName.includes(query) || itemArName.includes(query);
    return matchesCategory && matchesSearch;
  });

  // Drawer handlers
  const handleOpenDrawer = (item) => {
    if (!item.isAvailable) return;
    setActiveDrawerItem(item);
    
    // Initialize options with defaults
    const initialOptions = {};
    item.options.forEach(opt => {
      if (opt.required && opt.choices.length > 0) {
        initialOptions[opt._id] = [opt.choices[0]]; // select first by default for radio
      } else {
        initialOptions[opt._id] = [];
      }
    });
    setSelectedOptions(initialOptions);
  };

  const handleOptionSelect = (optionGroup, choice, isMulti = false) => {
    setSelectedOptions(prev => {
      const currentChoices = prev[optionGroup._id] || [];
      
      if (!isMulti) {
        // Radio: replace list with selected choice
        return { ...prev, [optionGroup._id]: [choice] };
      } else {
        // Checkbox: toggle choice
        const exists = currentChoices.find(c => c._id === choice._id);
        const updated = exists 
          ? currentChoices.filter(c => c._id !== choice._id)
          : [...currentChoices, choice];
        return { ...prev, [optionGroup._id]: updated };
      }
    });
  };

  // Calculate dynamic item price for Drawer
  const calculateDrawerPrice = () => {
    if (!activeDrawerItem) return 0;
    
    // Get base price
    let basePrice = activeDrawerItem.offer 
      ? activeDrawerItem.offer.discountedPrice 
      : activeDrawerItem.price;

    // Sum options modifiers
    let optionsExtra = 0;
    Object.values(selectedOptions).forEach(choicesList => {
      choicesList.forEach(choice => {
        optionsExtra += choice.priceModifier;
      });
    });

    return parseFloat((basePrice + optionsExtra).toFixed(2));
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (!activeDrawerItem) return;

    // Check if required options are selected
    for (const opt of activeDrawerItem.options) {
      if (opt.required && (!selectedOptions[opt._id] || selectedOptions[opt._id].length === 0)) {
        alert(lang === 'ar' ? `يرجى تحديد: ${opt.title.ar}` : `Please select required: ${opt.title.en}`);
        return;
      }
    }

    const cartItem = {
      cartId: Date.now() + Math.random().toString(36).substring(7),
      id: activeDrawerItem._id,
      name: activeDrawerItem.name,
      basePrice: activeDrawerItem.offer ? activeDrawerItem.offer.discountedPrice : activeDrawerItem.price,
      selectedChoices: selectedOptions,
      finalItemPrice: calculateDrawerPrice(),
      quantity: 1
    };

    setCart(prev => [...prev, cartItem]);
    setActiveDrawerItem(null);

    // Micro-animation for cart trigger
    confetti({
      particleCount: 15,
      spread: 40,
      origin: { y: 0.9 }
    });
  };

  // Cart operations
  const updateCartQty = (cartId, increment) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        const newQty = increment ? item.quantity + 1 : item.quantity - 1;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const getCartTotal = () => {
    return parseFloat(cart.reduce((total, item) => total + (item.finalItemPrice * item.quantity), 0).toFixed(2));
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    
    // Place order mockup
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    setCart([]);
    setIsCartOpen(false);
    alert(t('orderSuccess'));
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-stone-900/75 backdrop-blur-md border-b border-stone-200/50 dark:border-stone-800/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white glow-brand font-bold text-xl overflow-hidden">
            {settings.logo ? (
              <img src={settings.logo} alt="" className="w-full h-full object-cover" />
            ) : (
              (getLocalized(settings.restaurantName) || 'G').charAt(0)
            )}
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight leading-none">
              {getLocalized(settings.restaurantName) || 'Gourmet Bistro'}
            </h1>
            <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">
              {lang === 'ar' ? 'منيو طاولتك' : 'Table Menu'}
            </span>
          </div>
        </div>

        {/* Table Badge and Controls */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {tableNumber && (
            <div className="px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center space-x-1 rtl:space-x-reverse border border-brand-100 dark:border-brand-900/40">
              <span>{t('tableHeader')}</span>
              <span className="bg-brand-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">{tableNumber}</span>
            </div>
          )}

          {/* Translation Toggle */}
          <button 
            id="lang-toggle"
            onClick={toggleLanguage}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors tap-highlight"
            title="Switch Language"
          >
            <Globe className="w-4 h-4 text-stone-600 dark:text-stone-300" />
          </button>

          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors tap-highlight"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-4 pb-24">
        
        {/* Search */}
        <div className="relative mb-5">
          <div className="absolute inset-y-0 left-3 rtl:left-auto rtl:right-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400 dark:text-stone-500" />
          </div>
          <input
            id="search-input"
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm text-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 rtl:right-auto rtl:left-3 flex items-center text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="relative mb-6 overflow-hidden">
          <div className="flex overflow-x-auto no-scrollbar space-x-2.5 rtl:space-x-reverse py-1.5 scroll-smooth">
            <button
              id="category-tab-all"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200/60 dark:border-stone-800/80 hover:bg-stone-50'
              }`}
            >
              {t('categoryAll')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                id={`category-tab-${cat._id}`}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat._id
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200/60 dark:border-stone-800/80 hover:bg-stone-50'
                }`}
              >
                {getLocalized(cat.name)}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200/40 dark:border-stone-800/50 flex space-x-3 rtl:space-x-reverse animate-pulse">
                <div className="w-24 h-24 bg-stone-200 dark:bg-stone-800 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-full" />
                  <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-5/6" />
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-1/4 pt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error handler */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 p-4 rounded-2xl flex items-center space-x-3 rtl:space-x-reverse shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-medium">{error}</span>
          </div>
        )}

        {/* Item Cards List */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item) => {
              const activeOffer = item.offer;
              
              return (
                <div
                  key={item._id}
                  id={`item-card-${item._id}`}
                  onClick={() => handleOpenDrawer(item)}
                  className={`bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200/40 dark:border-stone-800/50 flex space-x-3.5 rtl:space-x-reverse shadow-sm cursor-pointer hover:shadow-md hover:border-brand-500/10 dark:hover:border-brand-500/10 active:scale-[0.99] transition-all duration-300 relative overflow-hidden ${
                    !item.isAvailable ? 'opacity-65 select-none' : ''
                  }`}
                >
                  {/* Food Image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0 relative">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={getLocalized(item.name)} 
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-stone-700">
                        <Compass className="w-8 h-8 stroke-[1.5]" />
                      </div>
                    )}

                    {/* Sold out overlay */}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold uppercase tracking-wider bg-stone-850 px-2 py-0.5 rounded">
                          {t('unavailable')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Item Text & Price */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-sm tracking-tight text-stone-900 dark:text-stone-100">
                          {getLocalized(item.name)}
                        </h3>
                        
                        {/* Offer Tag */}
                        {activeOffer && item.isAvailable && (
                          <span className="bg-brand-500 text-white font-extrabold text-[8px] tracking-wider px-2 py-0.5 rounded-full uppercase shadow-sm flex items-center space-x-0.5 rtl:space-x-reverse animate-pulse">
                            <Percent className="w-2 h-2" />
                            <span>{getLocalized(activeOffer.badge)}</span>
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-stone-400 dark:text-stone-500 line-clamp-2 mt-1 leading-snug font-medium">
                        {getLocalized(item.description)}
                      </p>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                      <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                        {activeOffer && item.isAvailable ? (
                          <>
                            <span className="text-base font-extrabold text-brand-600 dark:text-brand-400">
                              {t('currency')}{activeOffer.discountedPrice.toFixed(2)}
                            </span>
                            <span className="text-xs text-stone-400 dark:text-stone-600 line-through">
                              {t('currency')}{activeOffer.originalPrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                            {t('currency')}{item.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {item.isAvailable && (
                        <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-brand-500 dark:hover:bg-brand-600 hover:text-white flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors shadow-sm duration-300">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 border border-stone-200/40 dark:border-stone-800/40 rounded-2xl">
                <Compass className="w-12 h-12 stroke-[1.2] text-stone-300 dark:text-stone-700 mx-auto mb-3" />
                <h4 className="font-bold text-sm">{lang === 'ar' ? 'لا توجد أطباق مطابقة' : 'No items matched your search'}</h4>
                <p className="text-xs text-stone-400 mt-1">{lang === 'ar' ? 'حاول تغيير معايير البحث أو اختيار تصنيف آخر' : 'Try expanding your query or category selection'}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-brand-500 text-white font-extrabold px-5 py-4 rounded-2xl shadow-xl hover:bg-brand-600 active:scale-[0.98] transition-all flex items-center justify-between glow-brand tap-highlight"
          >
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="text-left rtl:text-right">
                <span className="text-[10px] opacity-75 block leading-none">{t('cartTitle')}</span>
                <span className="text-sm font-black">{cart.length} {t('items')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-base font-black">{t('currency')}{getCartTotal()}</span>
              {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </button>
        </div>
      )}

      {/* ITEM DETAIL CUSTOMIZATION DRAWER */}
      {activeDrawerItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          {/* Drawer backdrop hit area */}
          <div className="absolute inset-0" onClick={() => setActiveDrawerItem(null)} />
          
          <div 
            id="customization-drawer"
            className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-slide-up z-10 border-t border-stone-200/50 dark:border-stone-800"
          >
            {/* Top Close Button */}
            <button
              onClick={() => setActiveDrawerItem(null)}
              className="absolute top-4 right-4 rtl:left-4 rtl:right-auto z-10 w-9 h-9 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-colors tap-highlight"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable details */}
            <div className="overflow-y-auto flex-1">
              {/* Cover Photo */}
              <div className="h-52 bg-stone-100 dark:bg-stone-800 relative">
                {activeDrawerItem.image ? (
                  <img 
                    src={activeDrawerItem.image} 
                    alt={getLocalized(activeDrawerItem.name)} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-stone-700">
                    <Compass className="w-16 h-16 stroke-[1]" />
                  </div>
                )}
                {activeDrawerItem.offer && (
                  <div className="absolute bottom-4 left-4 bg-brand-500 text-white text-xs font-black px-3 py-1 rounded-full shadow flex items-center space-x-1 rtl:space-x-reverse">
                    <Percent className="w-3 h-3" />
                    <span>{getLocalized(activeDrawerItem.offer.badge)}</span>
                  </div>
                )}
              </div>

              {/* Title & Desc */}
              <div className="p-5 border-b border-stone-100 dark:border-stone-800">
                <h2 className="text-xl font-extrabold text-stone-950 dark:text-stone-50">
                  {getLocalized(activeDrawerItem.name)}
                </h2>
                
                {/* Price Display */}
                <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                  {activeDrawerItem.offer ? (
                    <>
                      <span className="text-lg font-black text-brand-600 dark:text-brand-400">
                        {t('currency')}{activeDrawerItem.offer.discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-stone-400 dark:text-stone-600 line-through">
                        {t('currency')}{activeDrawerItem.offer.originalPrice.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-base font-black text-stone-950 dark:text-stone-50">
                      {t('currency')}{activeDrawerItem.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {activeDrawerItem.description && (
                  <p className="text-xs font-medium leading-relaxed text-stone-500 dark:text-stone-400 mt-2.5">
                    {getLocalized(activeDrawerItem.description)}
                  </p>
                )}
              </div>

              {/* Options Sections */}
              <div className="p-5 space-y-6 pb-12">
                {activeDrawerItem.options.map((opt) => (
                  <div key={opt._id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                        {getLocalized(opt.title)}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        opt.required 
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                          : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400'
                      }`}>
                        {opt.required ? t('required') : t('optional')}
                      </span>
                    </div>

                    {/* Choice List */}
                    <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200/50 dark:border-stone-800 rounded-2xl overflow-hidden divide-y divide-stone-200/30 dark:divide-stone-800">
                      {opt.choices.map((choice) => {
                        const isSelected = (selectedOptions[opt._id] || []).some(c => c._id === choice._id);
                        const isMulti = opt.type === 'checkbox';

                        return (
                          <label
                            key={choice._id}
                            onClick={() => handleOptionSelect(opt, choice, isMulti)}
                            className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-stone-100/50 dark:hover:bg-stone-900/50 tap-highlight transition-colors"
                          >
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                              {/* Selection indicators */}
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'bg-brand-500 border-brand-500 text-white' 
                                  : 'border-stone-300 dark:border-stone-750'
                              } ${!isMulti ? 'rounded-full' : 'rounded-md'}`}>
                                {isSelected && (
                                  <div className={`w-1.5 h-1.5 bg-white ${!isMulti ? 'rounded-full' : 'rounded-sm'}`} />
                                )}
                              </div>

                              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                                {getLocalized(choice.name)}
                              </span>
                            </div>

                            {choice.priceModifier > 0 && (
                              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                                +{t('currency')}{choice.priceModifier.toFixed(2)}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Add to Order Bar */}
            <div className="p-4 bg-white/70 dark:bg-stone-900/75 backdrop-blur border-t border-stone-200/50 dark:border-stone-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 block leading-none font-bold mb-0.5">{t('price')}</span>
                <span className="text-lg font-black text-brand-600 dark:text-brand-400">
                  {t('currency')}{calculateDrawerPrice()}
                </span>
              </div>
              <button
                onClick={handleAddToCart}
                className="bg-brand-500 text-white font-extrabold px-6 py-3 rounded-xl hover:bg-brand-600 transition-all text-xs flex items-center space-x-2 rtl:space-x-reverse shadow-md shadow-brand-500/20"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('addToCart')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART OVERLAY SHEET */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          {/* Backdrop hit area to close */}
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-t-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-slide-up z-10 border-t border-stone-200/50 dark:border-stone-800">
            {/* Cart Header */}
            <div className="p-4 border-b border-stone-200/50 dark:border-stone-800/50 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
              <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
                <ShoppingCart className="w-5 h-5 text-brand-500" />
                <h3 className="font-extrabold text-base">{t('cartTitle')}</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors tap-highlight"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Cart Scroll Items */}
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {cart.map((cartItem) => (
                <div key={cartItem.cartId} className="flex justify-between items-start space-x-3.5 rtl:space-x-reverse bg-stone-50 dark:bg-stone-950 p-3 rounded-2xl border border-stone-200/40 dark:border-stone-800">
                  <div className="flex-1">
                    <h4 className="font-bold text-xs">{getLocalized(cartItem.name)}</h4>
                    
                    {/* Render selected options */}
                    <div className="mt-1 space-y-0.5">
                      {Object.entries(cartItem.selectedChoices).map(([optId, choices]) => {
                        if (choices.length === 0) return null;
                        return (
                          <div key={optId} className="text-[10px] text-stone-400 dark:text-stone-500 flex flex-wrap gap-1 font-medium">
                            {choices.map(c => (
                              <span key={c._id}>
                                • {getLocalized(c.name)} {c.priceModifier > 0 && `(+${t('currency')}${c.priceModifier})`}
                              </span>
                            ))}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-xs font-extrabold text-stone-600 dark:text-brand-400 mt-2">
                      {t('currency')}{(cartItem.finalItemPrice).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity modifiers */}
                  <div className="flex items-center space-x-2 rtl:space-x-reverse bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800 rounded-lg p-1.5 flex-shrink-0">
                    <button
                      onClick={() => updateCartQty(cartItem.cartId, false)}
                      className="w-6 h-6 rounded-md hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black text-stone-800 dark:text-stone-150 px-1">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQty(cartItem.cartId, true)}
                      className="w-6 h-6 rounded-md hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-12 text-stone-400 dark:text-stone-600">
                  <ShoppingCart className="w-12 h-12 stroke-[1.2] mx-auto mb-2 text-stone-300 dark:text-stone-700" />
                  <p className="text-xs font-medium">{t('cartEmpty')}</p>
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-stone-200/50 dark:border-stone-800/80 space-y-4">
                <div className="flex items-center justify-between text-sm font-extrabold">
                  <span>{lang === 'ar' ? 'إجمالي الطلب' : 'Grand Total'}</span>
                  <span className="text-lg font-black text-brand-600 dark:text-brand-400">{t('currency')}{getCartTotal()}</span>
                </div>
                <button
                  id="place-order-btn"
                  onClick={handlePlaceOrder}
                  className="w-full bg-brand-500 text-white font-extrabold py-3.5 rounded-xl hover:bg-brand-600 transition-all text-xs flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-md shadow-brand-500/20 tap-highlight"
                >
                  <span>{t('cartPlaceOrder')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
