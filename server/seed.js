const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('./models/Admin');
const Category = require('./models/Category');
const Item = require('./models/Item');
const Offer = require('./models/Offer');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedDB = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Admin.deleteMany({});
    await Category.deleteMany({});
    await Item.deleteMany({});
    await Offer.deleteMany({});
    console.log('Cleared existing database entries.');

    // 1. Create Default Admin
    const admin = await Admin.create({
      username: 'admin',
      password: 'admin123', // Will be hashed automatically by pre-save hook
      role: 'admin',
    });
    console.log('Admin account created: admin / admin123');

    // 2. Create Categories
    const categoriesData = [
      {
        name: { en: 'Burgers & Sandwiches', ar: 'البرجر والسندويشات' },
        icon: 'ChefHat',
        orderIndex: 0,
        isActive: true,
      },
      {
        name: { en: 'Wood Fired Pizzas', ar: 'بيتزا الحطب' },
        icon: 'Pizza',
        orderIndex: 1,
        isActive: true,
      },
      {
        name: { en: 'Decadent Desserts', ar: 'الحلويات الفاخرة' },
        icon: 'Cake',
        orderIndex: 2,
        isActive: true,
      },
      {
        name: { en: 'Refreshing Drinks', ar: 'المشروبات المنعشة' },
        icon: 'CupSoda',
        orderIndex: 3,
        isActive: true,
      },
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log(`Seeded ${categories.length} categories.`);

    const burgerCatId = categories[0]._id;
    const pizzaCatId = categories[1]._id;
    const dessertCatId = categories[2]._id;
    const drinkCatId = categories[3]._id;

    // 3. Create Items
    const itemsData = [
      // Burgers
      {
        name: { en: 'Classic Cheeseburger', ar: 'تشيز برجر كلاسيك' },
        description: {
          en: 'Flame-grilled Angus beef patty with cheddar cheese, fresh lettuce, tomato, and house burger sauce on a toasted brioche bun.',
          ar: 'شريحة لحم أنجوس مشوية على اللهب مع جبن الشيدر، الخس الطازج، الطماطم، وصلصة البرجر الخاصة في خبز البريوش المحمص.',
        },
        price: 9.99,
        image: '/uploads/burger.jpg',
        categoryId: burgerCatId,
        isAvailable: true,
        options: [
          {
            title: { en: 'Size', ar: 'الحجم' },
            type: 'radio',
            required: true,
            choices: [
              { name: { en: 'Single Patty', ar: 'شريحة واحدة' }, priceModifier: 0 },
              { name: { en: 'Double Patty', ar: 'شريحتين' }, priceModifier: 3.5 },
            ],
          },
          {
            title: { en: 'Add-ons', ar: 'الإضافات' },
            type: 'checkbox',
            required: false,
            choices: [
              { name: { en: 'Extra Melted Cheddar', ar: 'جبن شيدر إضافي ذائب' }, priceModifier: 1.0 },
              { name: { en: 'Crispy Beef Bacon', ar: 'شرائح لحم بقري مقدد مقرمش' }, priceModifier: 1.5 },
            ],
          },
        ],
      },
      {
        name: { en: 'Spicy Zinger Chicken', ar: 'برجر دجاج زينجر الحار' },
        description: {
          en: 'Crispy deep-fried chicken breast dipped in hot glaze, topped with spicy coleslaw, jalapenos, and sriracha mayo.',
          ar: 'صدر دجاج مقرمش مقلي ومغموس بالصلصة الحارة، يعلوه سلطة الكرنب الحارة، الهالبينو، ومايونيز السريراتشا.',
        },
        price: 10.99,
        image: '/uploads/zinger.jpg',
        categoryId: burgerCatId,
        isAvailable: true,
        options: [
          {
            title: { en: 'Spice Level', ar: 'مستوى الحرارة' },
            type: 'radio',
            required: true,
            choices: [
              { name: { en: 'Medium Hot', ar: 'حار متوسط' }, priceModifier: 0 },
              { name: { en: 'Extra Hot (Spicy)', ar: 'حار جداً' }, priceModifier: 0 },
            ],
          },
        ],
      },

      // Pizzas
      {
        name: { en: 'Neapolitan Margherita Pizza', ar: 'بيتزا مارجريتا نابوليتان' },
        description: {
          en: 'San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil leaves, and a drizzle of extra virgin olive oil.',
          ar: 'صلصة طماطم سان مارزانو، جبن موزاريلا بوفالو الطازج، أوراق الريحان الطازجة، ورشة من زيت الزيتون البكر الممتاز.',
        },
        price: 12.99,
        image: '/uploads/pizza.jpg',
        categoryId: pizzaCatId,
        isAvailable: true,
        options: [
          {
            title: { en: 'Crust Type', ar: 'نوع العجينة' },
            type: 'radio',
            required: true,
            choices: [
              { name: { en: 'Classic Thin Crust', ar: 'عجينة رقيقة كلاسيكية' }, priceModifier: 0 },
              { name: { en: 'Gluten-Free Crust', ar: 'عجينة خالية من الجلوتين' }, priceModifier: 2.5 },
            ],
          },
          {
            title: { en: 'Extra Toppings', ar: 'مكونات إضافية' },
            type: 'checkbox',
            required: false,
            choices: [
              { name: { en: 'Wild Mushrooms', ar: 'فطر بري' }, priceModifier: 1.2 },
              { name: { en: 'Black Olives', ar: 'زيتون أسود' }, priceModifier: 0.8 },
            ],
          },
        ],
      },
      {
        name: { en: 'Loaded Pepperoni Pizza', ar: 'بيتزا بيبيروني غنية' },
        description: {
          en: 'Zesty marinara sauce, mozzarella cheese, loaded with premium beef pepperoni, and dried Italian oregano.',
          ar: 'صلصة المارينارا اللذيذة، جبن الموزاريلا، محشوة بالبيبروني البقري الفاخر، والزعتر الإيطالي المجفف.',
        },
        price: 14.99,
        image: '/uploads/pepperoni.jpg',
        categoryId: pizzaCatId,
        isAvailable: true,
        options: [
          {
            title: { en: 'Size', ar: 'الحجم' },
            type: 'radio',
            required: true,
            choices: [
              { name: { en: 'Medium 10"', ar: 'وسط ١٠ بوصة' }, priceModifier: 0 },
              { name: { en: 'Large 14"', ar: 'كبير ١٤ بوصة' }, priceModifier: 4.0 },
            ],
          },
        ],
      },

      // Desserts
      {
        name: { en: 'Warm Chocolate Lava Cake', ar: 'كعكة الحمم الشوكولاتة الدافئة' },
        description: {
          en: 'Rich chocolate cake with a molten chocolate center, served warm with a scoop of vanilla bean gelato.',
          ar: 'كعكة الشوكولاتة الغنية بقلب شوكولاتة سائل ذائب، تقدم دافئة مع مغرفة من جيلاتو الفانيليا.',
        },
        price: 6.99,
        image: '/uploads/dessert.jpg',
        categoryId: dessertCatId,
        isAvailable: true,
        options: [
          {
            title: { en: 'Extra Scoop', ar: 'مغرفة إضافية' },
            type: 'checkbox',
            required: false,
            choices: [
              { name: { en: 'Extra Vanilla Gelato', ar: 'جيلاتو فانيليا إضافي' }, priceModifier: 1.5 },
            ],
          },
        ],
      },

      // Drinks
      {
        name: { en: 'Fresh Pressed Orange Juice', ar: 'عصير برتقال طازج معصور' },
        description: {
          en: '100% natural cold pressed orange juice, made fresh daily. No added sugar.',
          ar: 'عصير برتقال طبيعي ١٠٠٪ معصور على البارد، يحضر طازجاً يومياً. بدون سكر مضاف.',
        },
        price: 4.5,
        image: '/uploads/drinks.jpg',
        categoryId: drinkCatId,
        isAvailable: true,
        options: [],
      },
    ];

    const items = await Item.insertMany(itemsData);
    console.log(`Seeded ${items.length} menu items.`);

    // 4. Create Scheduled Offers
    const now = new Date();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    const lastMonth = new Date(now);
    lastMonth.setDate(now.getDate() - 30);

    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);

    const inTwoDays = new Date(now);
    inTwoDays.setDate(now.getDate() + 2);

    const inNineDays = new Date(now);
    inNineDays.setDate(now.getDate() + 9);

    // Get item IDs
    const cheeseburgerId = items[0]._id;
    const spicyZingerId = items[1]._id;
    const margheritaId = items[2]._id;
    const pepperoniId = items[3]._id;
    const lavaCakeId = items[4]._id;

    const offersData = [
      // Active Offer 1: Neapolitan Pizza 20% discount
      {
        title: { en: 'Midweek Pizza Special - 20% Off', ar: 'عرض منتصف الأسبوع للبيتزا - خصم ٢٠٪' },
        discountPercentage: 20,
        discountedPrice: parseFloat((12.99 * 0.8).toFixed(2)), // $10.39
        itemId: margheritaId,
        startDate: yesterday,
        endDate: nextWeek,
        isActive: true,
      },
      // Active Offer 2: Chocolate Lava Cake $2 discount
      {
        title: { en: 'Sweet Tooth Deal - Save $2', ar: 'عرض محبي الحلويات - وفر ٢ دولار' },
        discountPercentage: 0,
        discountedPrice: 4.99, // $6.99 -> $4.99
        itemId: lavaCakeId,
        startDate: yesterday,
        endDate: nextWeek,
        isActive: true,
      },
      // Expired Offer: Spicy Zinger Burger (Should not compute/display)
      {
        title: { en: 'Weekend Zinger Treat', ar: 'وجبة زينجر في عطلة نهاية الأسبوع' },
        discountPercentage: 15,
        discountedPrice: parseFloat((10.99 * 0.85).toFixed(2)),
        itemId: spicyZingerId,
        startDate: lastMonth,
        endDate: lastWeek,
        isActive: true, // Mark active but date is expired
      },
      // Future Scheduled Offer: Pepperoni Pizza (Should not compute/display yet)
      {
        title: { en: 'Upcoming Pepperoni Fest', ar: 'مهرجان البيبروني القادم' },
        discountPercentage: 10,
        discountedPrice: parseFloat((14.99 * 0.9).toFixed(2)),
        itemId: pepperoniId,
        startDate: inTwoDays,
        endDate: inNineDays,
        isActive: true,
      },
    ];

    const offers = await Offer.insertMany(offersData);
    console.log(`Seeded ${offers.length} promotional schedules (2 active, 1 expired, 1 future).`);

    console.log('Database seeding process completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();
