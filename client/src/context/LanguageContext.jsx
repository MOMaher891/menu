import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    searchPlaceholder: "Search delicious dishes...",
    tableHeader: "Table",
    specialOffer: "SPECIAL OFFER",
    price: "Price",
    currency: "EGP ",
    categoryAll: "All",
    back: "Back",
    addToCart: "Add to Order",
    items: "items",
    cartTitle: "Your Table Order",
    cartEmpty: "No items added yet",
    cartPlaceOrder: "Place Order",
    orderSuccess: "Order sent to the kitchen! 🍳",
    viewDetails: "Customize",
    available: "Available",
    unavailable: "Sold Out",
    adminLogin: "Gourmet Portal",
    username: "Username",
    password: "Password",
    loginBtn: "Sign In",
    loginError: "Invalid login credentials",
    dashboard: "Admin Console",
    categories: "Categories",
    itemsLabel: "Menu Items",
    offersLabel: "Promotional Offers",
    logout: "Sign Out",
    addCategory: "Add Category",
    addItem: "Add Menu Item",
    addOffer: "Schedule Promotion",
    edit: "Edit",
    delete: "Delete",
    save: "Save Changes",
    cancel: "Cancel",
    nameEn: "Name (English)",
    nameAr: "Name (Arabic)",
    descEn: "Description (English)",
    descAr: "Description (Arabic)",
    orderIndex: "Display Order",
    status: "Status",
    actions: "Actions",
    active: "Active",
    inactive: "Inactive",
    titleEn: "Offer Title (English)",
    titleAr: "Offer Title (Arabic)",
    startDate: "Start Date & Time",
    endDate: "End Date & Time",
    discountPercentage: "Discount %",
    discountedPrice: "Discounted Price",
    optionsLabel: "Item Options (Sizes, Extras)",
    addOptionGroup: "Add Option Group (e.g. Size, Add-ons)",
    optionTitleEn: "Option Group Title (English)",
    optionTitleAr: "Option Group Title (Arabic)",
    optionType: "Selection Type",
    choiceNameEn: "Choice (English)",
    choiceNameAr: "Choice (Arabic)",
    priceModifier: "Price Modifier",
    addChoice: "Add Choice",
    removeOption: "Remove Group",
    uploadImage: "Image (File upload or URL)",
    dragUpload: "Click to upload food photo",
    confirmDelete: "Are you sure you want to delete this? This action is irreversible.",
    totalItems: "Total Items",
    activeOffers: "Active Offers",
    categoriesCount: "Categories",
    statsTitle: "Dashboard Summary",
    quickView: "Scan Menu QR Code",
    tableSelection: "Table Number",
    selectCategory: "Select Category",
    selectItem: "Select Item",
    allTables: "All Tables",
    required: "Required",
    optional: "Optional",
    radio: "Single Selection (Radio)",
    checkbox: "Multiple Selection (Checkbox)",
    imagePreview: "Image Preview",
    noImage: "No image uploaded",
    menuLink: "Go to Menu",
    submitting: "Saving...",
    savingSuccess: "Successfully saved!",
    deleteSuccess: "Successfully deleted!",
    settingsLabel: "Settings",
    restaurantNameEn: "Restaurant Name (English)",
    restaurantNameAr: "Restaurant Name (Arabic)",
    restaurantLogo: "Restaurant Logo"
  },
  ar: {
    searchPlaceholder: "البحث عن أطباق لذيذة...",
    tableHeader: "طاولة",
    specialOffer: "عرض خاص",
    price: "السعر",
    currency: "ج.م ",
    categoryAll: "الكل",
    back: "رجوع",
    addToCart: "أضف للطلب",
    items: "أطباق",
    cartTitle: "طلب الطاولة الخاص بك",
    cartEmpty: "لم يتم إضافة أي أطباق بعد",
    cartPlaceOrder: "إرسال الطلب",
    orderSuccess: "تم إرسال طلبك للمطبخ! 🍳",
    viewDetails: "تخصيص",
    available: "متوفر",
    unavailable: "غير متوفر",
    adminLogin: "بوابة الإدارة",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    loginBtn: "تسجيل الدخول",
    loginError: "بيانات الدخول غير صحيحة",
    dashboard: "لوحة التحكم",
    categories: "التصنيفات",
    itemsLabel: "قائمة الأطباق",
    offersLabel: "العروض الترويجية",
    logout: "تسجيل الخروج",
    addCategory: "إضافة تصنيف",
    addItem: "إضافة طبق جديد",
    addOffer: "جدولة عرض ترويجي",
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ التغييرات",
    cancel: "إلغاء",
    nameEn: "الاسم (بالإنجليزي)",
    nameAr: "الاسم (بالعربي)",
    descEn: "الوصف (بالإنجليزي)",
    descAr: "الوصف (بالعربي)",
    orderIndex: "ترتيب العرض",
    status: "الحالة",
    actions: "الإجراءات",
    active: "نشط",
    inactive: "غير نشط",
    titleEn: "عنوان العرض (بالإنجليزي)",
    titleAr: "عنوان العرض (بالعربي)",
    startDate: "تاريخ ووقت البدء",
    endDate: "تاريخ ووقت الانتهاء",
    discountPercentage: "نسبة الخصم %",
    discountedPrice: "السعر بعد الخصم",
    optionsLabel: "خيارات الطبق (الأحجام، الإضافات)",
    addOptionGroup: "إضافة مجموعة خيارات (مثال: الحجم، الإضافات)",
    optionTitleEn: "عنوان مجموعة الخيارات (بالإنجليزي)",
    optionTitleAr: "عنوان مجموعة الخيارات (بالعربي)",
    optionType: "نوع الاختيار",
    choiceNameEn: "الخيار (بالإنجليزي)",
    choiceNameAr: "الخيار (بالعربي)",
    priceModifier: "تعديل السعر (+/-)",
    addChoice: "إضافة خيار فرعي",
    removeOption: "إزالة المجموعة",
    uploadImage: "الصورة (تحميل ملف أو رابط)",
    dragUpload: "اضغط هنا لتحميل صورة للطبق",
    confirmDelete: "هل أنت متأكد من عملية الحذف؟ لا يمكن التراجع عن هذا الإجراء.",
    totalItems: "إجمالي الأطباق",
    activeOffers: "العروض النشطة",
    categoriesCount: "التصنيفات",
    statsTitle: "ملخص لوحة التحكم",
    quickView: "مسح رمز القائمة (QR)",
    tableSelection: "رقم الطاولة",
    selectCategory: "اختر التصنيف",
    selectItem: "اختر الطبق",
    allTables: "كل الطاولات",
    required: "مطلوب",
    optional: "اختياري",
    radio: "اختيار واحد (دائري)",
    checkbox: "خيارات متعددة (مربع)",
    imagePreview: "معاينة الصورة",
    noImage: "لا توجد صورة محملة",
    menuLink: "الذهاب إلى القائمة",
    submitting: "جاري الحفظ...",
    savingSuccess: "تم الحفظ بنجاح!",
    deleteSuccess: "تم الحذف بنجاح!",
    settingsLabel: "الإعدادات",
    restaurantNameEn: "اسم المطعم (بالإنجليزي)",
    restaurantNameAr: "اسم المطعم (بالعربي)",
    restaurantLogo: "شعار المطعم"
  },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('qr_menu_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('qr_menu_lang', lang);
    // Adjust HTML attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key) => {
    return translations[lang][key] || key;
  };

  // Helper to resolve localized database properties e.g. name: { en: 'x', ar: 'y' }
  const getLocalized = (field) => {
    if (!field) return '';
    return field[lang] || field['en'] || '';
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, getLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
