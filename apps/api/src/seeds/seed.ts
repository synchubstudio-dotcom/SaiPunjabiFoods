import mongoose from 'mongoose';
import { ENV } from '../config/env';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Promotion } from '../models/Promotion';
import { RestaurantSettings } from '../models/RestaurantSettings';

export const runSeed = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('[Seed] Connected.');

    // 1. Seed or update Admin User using server-side environment variables
    console.log('[Seed] Bootstrapping Admin Account from ENV...');
    const adminEmail = ENV.ADMIN_EMAIL.toLowerCase();
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name: ENV.ADMIN_NAME,
        email: adminEmail,
        passwordHash: ENV.ADMIN_PASSWORD,
        role: 'admin',
        phone: ENV.ADMIN_PHONE,
        isActive: true,
      });
      console.log(`[Seed] Created initial Admin account: ${adminEmail}`);
    } else {
      console.log(`[Seed] Admin account ${adminEmail} already exists.`);
    }

    // 2. Seed Restaurant Settings
    console.log('[Seed] Initializing Restaurant Settings...');
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create({
        restaurantName: ENV.RESTAURANT_NAME,
        tagline: ENV.RESTAURANT_TAGLINE,
        phone: '+91 98765 43210',
        email: 'hello@saipunjabifoods.com',
        address: {
          street: 'Plot 42, Central Market, Punjabi Bagh',
          city: 'New Delhi',
          state: 'Delhi',
          postalCode: '110026',
          country: 'India',
        },
        openingHours: {
          monday: '11:00 AM - 11:00 PM',
          tuesday: '11:00 AM - 11:00 PM',
          wednesday: '11:00 AM - 11:00 PM',
          thursday: '11:00 AM - 11:00 PM',
          friday: '11:00 AM - 11:30 PM',
          saturday: '11:00 AM - 11:30 PM',
          sunday: '11:00 AM - 11:30 PM',
        },
        taxPercentage: ENV.TAX_RATE_PERCENTAGE,
        deliveryFeeDefault: ENV.DELIVERY_FEE_DEFAULT,
        freeDeliveryThreshold: ENV.FREE_DELIVERY_THRESHOLD,
        isOrderingOpen: true,
        codEnabled: ENV.CASH_ON_DELIVERY_ENABLED,
        announcementBanner: {
          enabled: true,
          text: '✨ Diwali Mahotsav: Enjoy 20% OFF on all authentic Tandoori specials! Code: DIWALI20',
          link: '/menu',
        },
      });
      console.log('[Seed] Restaurant settings created.');
    }

    // 3. Seed Categories
    console.log('[Seed] Seeding Punjabi Food Categories...');
    const categoriesData = [
      {
        name: 'Tandoori Starters',
        slug: 'tandoori-starters',
        description: 'Clay-oven charred delicacies marinated with traditional Punjabi herbs and spices',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
        displayOrder: 1,
        isActive: true,
      },
      {
        name: 'Punjabi Curries',
        slug: 'punjabi-curries',
        description: 'Rich, slow-cooked gravies prepared with pure desi ghee and hand-ground spices',
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
        displayOrder: 2,
        isActive: true,
      },
      {
        name: 'Amritsari Breads & Kulchas',
        slug: 'amritsari-breads-kulchas',
        description: 'Crispy layered tandoori breads and authentic potato-onion stuffed Amritsari kulchas',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        displayOrder: 3,
        isActive: true,
      },
      {
        name: 'Biryanis & Pulao',
        slug: 'biryanis-pulao',
        description: 'Fragrant aged basmati rice dum-cooked with saffron, caramelized onions and whole spices',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        displayOrder: 4,
        isActive: true,
      },
      {
        name: 'Beverages & Lassi',
        slug: 'beverages-lassi',
        description: 'Traditional thick churned Amritsari lassi topped with malai, and spiced refreshments',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        displayOrder: 5,
        isActive: true,
      },
      {
        name: 'Traditional Desserts',
        slug: 'traditional-desserts',
        description: 'Hot kesari gulab jamun, rabri, and Punjabi winter halwa',
        image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
        displayOrder: 6,
        isActive: true,
      },
    ];

    const categoryDocs: Record<string, any> = {};
    for (const cat of categoriesData) {
      let doc = await Category.findOne({ slug: cat.slug });
      if (!doc) {
        doc = await Category.create(cat);
      }
      categoryDocs[cat.slug] = doc;
    }
    console.log(`[Seed] Categories processed (${Object.keys(categoryDocs).length}).`);

    // 4. Seed Products
    console.log('[Seed] Seeding Signature Punjabi Dishes...');
    const productsData = [
      {
        name: 'Amritsari Paneer Tikka',
        slug: 'amritsari-paneer-tikka',
        shortDescription: 'Cottage cheese cubes marinated in ajwain, mustard oil, and hung curd, roasted in clay tandoor',
        description: 'Fresh malai paneer cubes steeped in traditional Amritsari ajwain marinade with roasted gram flour and kachchi ghani mustard oil. Charred to smoky perfection in our live tandoor and served with mint chutney and sirka onions.',
        categoryId: categoryDocs['tandoori-starters']._id,
        price: 320,
        compareAtPrice: 360,
        images: [
          'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80',
        ],
        isVegetarian: true,
        spiceLevel: 'medium',
        preparationTimeMinutes: 20,
        isAvailable: true,
        isFeatured: true,
        variants: [
          { name: 'Half (4 pcs)', price: 180 },
          { name: 'Full (8 pcs)', price: 320 },
        ],
        addOns: [
          { name: 'Extra Sirka Onions', price: 20 },
          { name: 'Extra Mint Chutney', price: 25 },
        ],
        dietaryInfo: ['Vegetarian', 'Gluten-Free'],
        allergens: ['Dairy'],
      },
      {
        name: 'Murgh Tandoori Highway Special',
        slug: 'murgh-tandoori-highway-special',
        shortDescription: 'Whole chicken steeped in authentic Grand Trunk Road tandoori spices and smoked over coal',
        description: 'Tender chicken marinated overnight in Kashmiri chili paste, hung yogurt, ginger-garlic broth, and home-blended garam masala. Cooked in high heat tandoor for crisp skin and juicy tender meat.',
        categoryId: categoryDocs['tandoori-starters']._id,
        price: 380,
        compareAtPrice: 420,
        images: [
          'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
        ],
        isVegetarian: false,
        spiceLevel: 'spicy',
        preparationTimeMinutes: 25,
        isAvailable: true,
        isFeatured: true,
        variants: [
          { name: 'Half (4 pcs)', price: 220 },
          { name: 'Full (8 pcs)', price: 380 },
        ],
        addOns: [
          { name: 'Extra Lemon Wedges & Chaat Masala', price: 15 },
          { name: 'Garlic Mayo Dip', price: 30 },
        ],
        dietaryInfo: ['Non-Vegetarian', 'High Protein'],
        allergens: ['Dairy'],
      },
      {
        name: 'Dal Makhani Bukhara Style',
        slug: 'dal-makhani-bukhara-style',
        shortDescription: 'Black lentils slow-cooked overnight for 16 hours with cream, butter, and ripe tomatoes',
        description: 'The crowning glory of Punjabi food. Whole black urad lentils and kidney beans simmered continuously over slow embers, enriched with fresh dairy butter and cream. Incomparably silky, velvety, and deeply aromatic.',
        categoryId: categoryDocs['punjabi-curries']._id,
        price: 290,
        compareAtPrice: 330,
        images: [
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        ],
        isVegetarian: true,
        spiceLevel: 'mild',
        preparationTimeMinutes: 15,
        isAvailable: true,
        isFeatured: true,
        variants: [
          { name: 'Standard (500ml)', price: 290 },
          { name: 'Family Pack (1000ml)', price: 540 },
        ],
        addOns: [
          { name: 'Extra Desi Makhan Dollop', price: 35 },
          { name: 'Garlic Tadka Topping', price: 30 },
        ],
        dietaryInfo: ['Vegetarian'],
        allergens: ['Dairy'],
      },
      {
        name: 'Authentic Butter Chicken (Murgh Makhani)',
        slug: 'authentic-butter-chicken',
        shortDescription: 'Charcoal-grilled tandoori chicken cooked in a rich, buttery tomato and cashew gravy with fenugreek',
        description: 'The pride of Punjab. Boneless tandoori chicken tikka pieces finished in an aromatic, velvety tomato gravy perfumed with dried kasuri methi and green cardamom. Perfectly balanced sweetness and spice.',
        categoryId: categoryDocs['punjabi-curries']._id,
        price: 390,
        compareAtPrice: 440,
        images: [
          'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
        ],
        isVegetarian: false,
        spiceLevel: 'medium',
        preparationTimeMinutes: 20,
        isAvailable: true,
        isFeatured: true,
        variants: [
          { name: 'Half (2-3 pcs)', price: 230 },
          { name: 'Full (5-6 pcs)', price: 390 },
        ],
        addOns: [
          { name: 'Extra Butter Topping', price: 30 },
        ],
        dietaryInfo: ['Non-Vegetarian'],
        allergens: ['Dairy', 'Nuts'],
      },
      {
        name: 'Sarson da Saag & Makki di Roti',
        slug: 'sarson-da-saag-makki-di-roti',
        shortDescription: 'Winter mustard greens tempered with garlic and ginger, served with two cornflour breads and jaggery',
        description: 'Pure village heritage. Slow-churned fresh mustard greens (sarson), bathua, and spinach simmered with makki atta and green chilies. Served with two golden Makki di Rotis, white butter, and gur (jaggery).',
        categoryId: categoryDocs['punjabi-curries']._id,
        price: 340,
        compareAtPrice: 380,
        images: [
          'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80',
        ],
        isVegetarian: true,
        spiceLevel: 'medium',
        preparationTimeMinutes: 25,
        isAvailable: true,
        isFeatured: true,
        addOns: [
          { name: 'Extra Makki di Roti (1 pc)', price: 45 },
          { name: 'Extra Desi White Butter', price: 30 },
        ],
        dietaryInfo: ['Vegetarian', 'Seasonal Specialty'],
        allergens: ['Dairy'],
      },
      {
        name: 'Amritsari Aloo Pyaaz Chur Chur Naan Thali',
        slug: 'amritsari-aloo-pyaaz-chur-chur-naan',
        shortDescription: 'Crushed flaky tandoori bread filled with spiced potatoes, served with pindi chole and raita',
        description: 'Crisp, multi-layered tandoori bread stuffed with spiced mashed potatoes, green chilies, and coriander, crushed hot with desi ghee. Served with slow-cooked Amritsari Pindi Chole, boondi raita, and sirka pyaaz.',
        categoryId: categoryDocs['amritsari-breads-kulchas']._id,
        price: 240,
        compareAtPrice: 280,
        images: [
          'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        ],
        isVegetarian: true,
        spiceLevel: 'medium',
        preparationTimeMinutes: 15,
        isAvailable: true,
        isFeatured: true,
        addOns: [
          { name: 'Extra Chur Chur Naan (1 pc)', price: 90 },
          { name: 'Extra Amritsari Chole Bowl', price: 70 },
        ],
        dietaryInfo: ['Vegetarian'],
        allergens: ['Gluten', 'Dairy'],
      },
      {
        name: 'Punjabi Dum Dum Biryani',
        slug: 'punjabi-dum-dum-biryani',
        shortDescription: 'Aged basmati rice sealed with tandoori spices, saffron milk, caramelized brown onions, and mint',
        description: 'Cooked in sealed earthen handi on slow charcoal dum. Long grain fragrant Dehradun basmati layered with marinated cottage cheese or chicken chunks, fresh mint, fried onions, and saffron essence. Accompanied by burani raita.',
        categoryId: categoryDocs['biryanis-pulao']._id,
        price: 330,
        compareAtPrice: 370,
        images: [
          'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        ],
        isVegetarian: true,
        spiceLevel: 'medium',
        preparationTimeMinutes: 25,
        isAvailable: true,
        isFeatured: true,
        variants: [
          { name: 'Paneer Tikka Dum Biryani', price: 330 },
          { name: 'Tender Murgh Dum Biryani', price: 390 },
        ],
        addOns: [
          { name: 'Extra Burani Garlic Raita', price: 40 },
          { name: 'Salan Gravy Bowl', price: 40 },
        ],
        dietaryInfo: ['Gluten-Free'],
        allergens: ['Dairy'],
      },
      {
        name: 'Patiala Shahi Sweet Malai Lassi',
        slug: 'patiala-shahi-sweet-malai-lassi',
        shortDescription: 'Thick, creamy yogurt lassi blended with kewra, garnished with saffron strands and a thick layer of malai',
        description: 'Served in an earthen kulhad. Hand-churned sweet curd sweetened with cane sugar, touched with rose and kewra water, and topped with a generous dollop of thick clotted cream and crushed pistachios.',
        categoryId: categoryDocs['beverages-lassi']._id,
        price: 110,
        compareAtPrice: 130,
        images: [
          'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
        ],
        isVegetarian: true,
        spiceLevel: 'mild',
        preparationTimeMinutes: 10,
        isAvailable: true,
        isFeatured: true,
        variants: [
          { name: 'Regular Kulhad (350ml)', price: 110 },
          { name: 'Patiala Jumbo Glass (600ml)', price: 170 },
        ],
        dietaryInfo: ['Vegetarian', 'Gluten-Free'],
        allergens: ['Dairy', 'Nuts'],
      },
      {
        name: 'Kesar Pista Hot Gulab Jamun (2 pcs)',
        slug: 'kesar-pista-hot-gulab-jamun',
        shortDescription: 'Soft mawa dumplings deep-fried in pure desi ghee and soaked in warm saffron-cardamom sugar syrup',
        description: 'Freshly prepared khoya balls fried slowly in golden cow ghee until deep mahogany, steeped in warm syrup spiked with Kashmiri saffron and crushed cardamom. Melts instantly in the mouth.',
        categoryId: categoryDocs['traditional-desserts']._id,
        price: 90,
        compareAtPrice: 110,
        images: [
          'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
        ],
        isVegetarian: true,
        spiceLevel: 'mild',
        preparationTimeMinutes: 10,
        isAvailable: true,
        isFeatured: true,
        addOns: [
          { name: 'Add Rich Rabri Dollop', price: 45 },
          { name: 'Vanilla Ice Cream Scoop', price: 40 },
        ],
        dietaryInfo: ['Vegetarian'],
        allergens: ['Dairy', 'Gluten', 'Nuts'],
      },
    ];

    for (const prod of productsData) {
      const existing = await Product.findOne({ slug: prod.slug });
      if (!existing) {
        await Product.create(prod);
      }
    }
    console.log(`[Seed] Products seeded successfully (${productsData.length} items).`);

    // 5. Seed Dynamic Festival Promotions
    console.log('[Seed] Seeding Festival Promotions & Coupons...');
    const now = new Date();
    const oneMonthAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAhead = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const promotionsData = [
      {
        name: 'Diwali Mahotsav Feast',
        slug: 'diwali-mahotsav-feast',
        description: 'Celebrate the Festival of Lights with our royal Punjabi specialties! Get 20% flat discount on orders above ₹499.',
        campaignType: 'festival',
        festivalName: 'Diwali',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 150,
        minOrderValue: 499,
        promoCode: 'DIWALI20',
        startAt: now,
        endAt: oneMonthAhead,
        isActive: true,
        usageLimit: 1000,
        perCustomerUsageLimit: 5,
        stackingPolicy: 'exclusive',
        bannerImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Baisakhi Harvest Celebration',
        slug: 'baisakhi-harvest-celebration',
        description: 'Flat ₹100 OFF on all family orders celebrating the golden harvest season.',
        campaignType: 'festival',
        festivalName: 'Baisakhi',
        discountType: 'fixed',
        discountValue: 100,
        minOrderValue: 600,
        promoCode: 'BAISAKHI100',
        startAt: now,
        endAt: twoMonthsAhead,
        isActive: true,
        usageLimit: 500,
        perCustomerUsageLimit: 3,
        stackingPolicy: 'exclusive',
        bannerImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'First Feast Welcome Offer',
        slug: 'first-feast-welcome',
        description: 'Welcome to the Sai Punjabi family! Get 15% OFF your very first online meal order.',
        campaignType: 'general',
        discountType: 'percentage',
        discountValue: 15,
        maxDiscount: 100,
        minOrderValue: 299,
        promoCode: 'WELCOME15',
        startAt: now,
        endAt: twoMonthsAhead,
        isActive: true,
        usageLimit: 5000,
        perCustomerUsageLimit: 1,
        stackingPolicy: 'exclusive',
        bannerImage: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1200&q=80',
      },
    ];

    for (const promo of promotionsData) {
      const existing = await Promotion.findOne({ slug: promo.slug });
      if (!existing) {
        await Promotion.create(promo);
      }
    }
    console.log('[Seed] Promotions seeded successfully.');

    console.log('=======================================================');
    console.log('🎉 SAI PUNJABI DATABASE SEED COMPLETED SUCCESSFULLY!');
    console.log(`👤 Admin Account: ${adminEmail}`);
    console.log(`🔑 Admin Password: [Configured via ADMIN_PASSWORD environment variable]`);
    console.log('=======================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('[Seed Error] Failed to run database seed:', error.message);
    process.exit(1);
  }
};

// If executed directly from command line
if (require.main === module) {
  runSeed();
}
