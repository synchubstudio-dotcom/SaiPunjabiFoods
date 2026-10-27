import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';
import { signToken } from '../utils/token';
import { HTTP_STATUS } from '../constants';
import { emitMenuUpdate } from '../sockets/orderSocket';

// Seeded Categories
const initialCategories = [
  {
    _id: 'cat_tandoori',
    name: 'Tandoori Starters',
    slug: 'tandoori-starters',
    description: 'Clay-oven charred delicacies marinated with traditional Punjabi herbs and spices',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    displayOrder: 1,
    isActive: true,
  },
  {
    _id: 'cat_curries',
    name: 'Punjabi Curries',
    slug: 'punjabi-curries',
    description: 'Rich, slow-cooked gravies prepared with pure desi ghee and hand-ground spices',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
    displayOrder: 2,
    isActive: true,
  },
  {
    _id: 'cat_breads',
    name: 'Amritsari Breads & Kulchas',
    slug: 'amritsari-breads-kulchas',
    description: 'Crispy layered tandoori breads and authentic potato-onion stuffed Amritsari kulchas',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    displayOrder: 3,
    isActive: true,
  },
  {
    _id: 'cat_biryanis',
    name: 'Biryanis & Pulao',
    slug: 'biryanis-pulao',
    description: 'Fragrant aged basmati rice dum-cooked with saffron, caramelized onions and whole spices',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    displayOrder: 4,
    isActive: true,
  },
  {
    _id: 'cat_beverages',
    name: 'Beverages & Lassi',
    slug: 'beverages-lassi',
    description: 'Traditional thick churned Amritsari lassi topped with malai, and spiced refreshments',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    displayOrder: 5,
    isActive: true,
  },
];

// Seeded Products
const initialProducts = [
  {
    _id: 'prod_1',
    name: 'Amritsari Paneer Tikka',
    slug: 'amritsari-paneer-tikka',
    shortDescription: 'Cottage cheese cubes marinated in ajwain, mustard oil, and hung curd, roasted in clay tandoor',
    description: 'Fresh malai paneer cubes steeped in traditional Amritsari ajwain marinade with roasted gram flour and kachchi ghani mustard oil. Charred to smoky perfection in our live tandoor and served with mint chutney and sirka onions.',
    categoryId: {
      _id: 'cat_tandoori',
      name: 'Tandoori Starters',
      slug: 'tandoori-starters',
    },
    price: 320,
    compareAtPrice: 360,
    images: ['https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80'],
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
    averageRating: 4.9,
    totalReviews: 84,
  },
  {
    _id: 'prod_2',
    name: 'Murgh Tandoori Highway Special',
    slug: 'murgh-tandoori-highway-special',
    shortDescription: 'Whole chicken steeped in authentic Grand Trunk Road tandoori spices and smoked over coal',
    description: 'Tender chicken marinated overnight in Kashmiri chili paste, hung yogurt, ginger-garlic broth, and home-blended garam masala. Cooked in high heat tandoor for crisp skin and juicy tender meat.',
    categoryId: {
      _id: 'cat_tandoori',
      name: 'Tandoori Starters',
      slug: 'tandoori-starters',
    },
    price: 380,
    compareAtPrice: 420,
    images: ['https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80'],
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
      { name: 'Extra Lemon & Chaat Masala', price: 15 },
    ],
    averageRating: 5.0,
    totalReviews: 120,
  },
  {
    _id: 'prod_3',
    name: 'Dal Makhani Bukhara Style',
    slug: 'dal-makhani-bukhara-style',
    shortDescription: 'Black lentils slow-cooked overnight for 16 hours with cream, butter, and ripe tomatoes',
    description: 'The crowning glory of Punjabi food. Whole black urad lentils and kidney beans simmered continuously over slow embers, enriched with fresh dairy butter and cream. Incomparably silky, velvety, and deeply aromatic.',
    categoryId: {
      _id: 'cat_curries',
      name: 'Punjabi Curries',
      slug: 'punjabi-curries',
    },
    price: 290,
    compareAtPrice: 330,
    images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'],
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
    ],
    averageRating: 4.9,
    totalReviews: 215,
  },
  {
    _id: 'prod_4',
    name: 'Authentic Butter Chicken (Murgh Makhani)',
    slug: 'authentic-butter-chicken',
    shortDescription: 'Charcoal-grilled tandoori chicken cooked in a rich, buttery tomato and cashew gravy with fenugreek',
    description: 'The pride of Punjab. Boneless tandoori chicken tikka pieces finished in an aromatic, velvety tomato gravy perfumed with dried kasuri methi and green cardamom. Perfectly balanced sweetness and spice.',
    categoryId: {
      _id: 'cat_curries',
      name: 'Punjabi Curries',
      slug: 'punjabi-curries',
    },
    price: 390,
    compareAtPrice: 440,
    images: ['https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80'],
    isVegetarian: false,
    spiceLevel: 'medium',
    preparationTimeMinutes: 20,
    isAvailable: true,
    isFeatured: true,
    variants: [
      { name: 'Half (2-3 pcs)', price: 230 },
      { name: 'Full (5-6 pcs)', price: 390 },
    ],
    averageRating: 5.0,
    totalReviews: 310,
  },
  {
    _id: 'prod_5',
    name: 'Amritsari Chur Chur Kulcha with Chole',
    slug: 'amritsari-chur-chur-kulcha-with-chole',
    shortDescription: 'Crisp multilayered tandoori kulcha stuffed with spicy potato and paneer, served with dark pindi chole',
    description: 'Handcrafted dough layered with pure cow ghee and crushed anardana, baked to golden perfection inside a clay tandoor and crushed by hand with a dollop of white butter. Served with slow-simmered Amritsari dark chole and spicy tamarind chutney.',
    categoryId: {
      _id: 'cat_breads',
      name: 'Amritsari Breads & Kulchas',
      slug: 'amritsari-breads-kulchas',
    },
    price: 260,
    compareAtPrice: 300,
    images: ['https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80'],
    isVegetarian: true,
    spiceLevel: 'spicy',
    preparationTimeMinutes: 15,
    isAvailable: true,
    isFeatured: true,
    averageRating: 4.9,
    totalReviews: 178,
  },
];

// Offline In-Memory Singleton Store
class OfflineStore {
  public categories = [...initialCategories];
  public products = [...initialProducts];
  public adminUser = {
    _id: 'admin_master_1',
    name: ENV.ADMIN_NAME,
    email: ENV.ADMIN_EMAIL.toLowerCase(),
    role: 'admin',
    phone: ENV.ADMIN_PHONE,
    isActive: true,
    addresses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  public settings = {
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
    taxPercentage: ENV.TAX_RATE_PERCENTAGE,
    deliveryFeeDefault: ENV.DELIVERY_FEE_DEFAULT,
    freeDeliveryThreshold: ENV.FREE_DELIVERY_THRESHOLD,
    isOrderingOpen: true,
    codEnabled: true,
  };
}

export const offlineStore = new OfflineStore();

// Slugify helper
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

/**
 * Express middleware to handle requests in offline in-memory development mode
 * when local MongoDB is not running.
 */
export const handleOfflineRequest = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;
  const method = req.method;

  // 1. Auth Login: POST /auth/login
  if (method === 'POST' && path === '/auth/login') {
    const { email } = req.body;
    // Accept admin login in offline mode
    const token = signToken({
      userId: offlineStore.adminUser._id,
      role: 'admin',
      email: email || offlineStore.adminUser.email,
    });

    res.cookie(ENV.COOKIE_NAME, token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login successful (Offline Development Mode)',
      data: {
        user: offlineStore.adminUser,
        token,
      },
    });
  }

  // 2. Auth Current User: GET /auth/me
  if (method === 'GET' && path === '/auth/me') {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { user: offlineStore.adminUser },
    });
  }

  // 3. Auth Logout: POST /auth/logout
  if (method === 'POST' && path === '/auth/logout') {
    res.clearCookie(ENV.COOKIE_NAME);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  // 4. Categories: GET /categories
  if (method === 'GET' && path === '/categories') {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { categories: offlineStore.categories },
    });
  }

  // 5. Featured Products: GET /products/featured
  if (method === 'GET' && path === '/products/featured') {
    const featured = offlineStore.products.filter((p) => p.isFeatured && p.isAvailable);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { products: featured },
    });
  }

  // 6. Single Product by Slug/ID: GET /products/:slug
  if (method === 'GET' && path.startsWith('/products/') && path.split('/').length === 3) {
    const slug = path.split('/')[2];
    const product = offlineStore.products.find((p) => p.slug === slug || p._id === slug);
    if (!product) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Dish not found in menu',
      });
    }
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { product },
    });
  }

  // 7. Toggle Product Availability: PATCH /products/:id/toggle-availability
  if (method === 'PATCH' && path.includes('/toggle-availability')) {
    const parts = path.split('/');
    const id = parts[2];
    const product = offlineStore.products.find((p) => p._id === id);
    if (product) {
      product.isAvailable = !product.isAvailable;
      emitMenuUpdate('update', product);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Product is now ${product.isAvailable ? 'available' : 'unavailable'}`,
        data: { product },
      });
    }
  }

  // 8. Delete Product: DELETE /products/:id
  if (method === 'DELETE' && path.startsWith('/products/')) {
    const id = path.split('/')[2];
    offlineStore.products = offlineStore.products.filter((p) => p._id !== id);
    emitMenuUpdate('delete', { _id: id });
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Product deleted successfully',
    });
  }

  // 9. Add Product: POST /products
  if (method === 'POST' && path === '/products') {
    const body = req.body;
    let category = offlineStore.categories.find(
      (c) => c._id === body.categoryId || c.slug === body.categoryId
    );

    if (!category) {
      category = offlineStore.categories[0];
    }

    let slug = body.slug ? slugify(body.slug) : slugify(body.name);
    if (!slug) slug = `dish-${Date.now().toString().slice(-6)}`;

    const newProduct: any = {
      _id: `dish_${Date.now()}`,
      name: body.name,
      slug,
      shortDescription: body.shortDescription || body.description?.slice(0, 80),
      description: body.description,
      categoryId: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
      },
      price: Number(body.price),
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : [initialProducts[0].images[0]],
      isVegetarian: body.isVegetarian !== undefined ? Boolean(body.isVegetarian) : true,
      spiceLevel: body.spiceLevel || 'medium',
      preparationTimeMinutes: Number(body.preparationTimeMinutes) || 20,
      isAvailable: body.isAvailable !== undefined ? Boolean(body.isAvailable) : true,
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : false,
      variants: body.variants || [],
      addOns: body.addOns || [],
      averageRating: 5.0,
      totalReviews: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Prepend so it shows immediately at the top
    offlineStore.products.unshift(newProduct);

    // Broadcast real-time Socket event
    emitMenuUpdate('create', newProduct);

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Product created successfully',
      data: { product: newProduct },
    });
  }

  // 10. List Products: GET /products
  if (method === 'GET' && path === '/products') {
    const { search, category, vegetarian, spiceLevel, sort } = req.query;
    let list = [...offlineStore.products];

    if (category) {
      list = list.filter((p) => {
        const cat = p.categoryId as any;
        return cat._id === category || cat.slug === category;
      });
    }

    if (vegetarian !== undefined && vegetarian !== '') {
      list = list.filter((p) => String(p.isVegetarian) === String(vegetarian));
    }

    if (spiceLevel) {
      list = list.filter((p) => p.spiceLevel === spiceLevel);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q)
      );
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        products: list,
        pagination: {
          total: list.length,
          page: 1,
          limit: 100,
          pages: 1,
        },
      },
    });
  }

  // 11. Admin Dashboard Stats: GET /admin/dashboard-stats
  if (method === 'GET' && path === '/admin/dashboard-stats') {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalRevenue: 148500,
        pendingOrders: 3,
        completedOrders: 58,
        activePromotionsCount: 2,
        popularDishes: offlineStore.products.slice(0, 4).map((p, i) => ({
          name: p.name,
          totalQuantity: 40 - i * 8,
        })),
      },
    });
  }

  // 12. Settings: GET /settings
  if (method === 'GET' && path === '/settings') {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { settings: offlineStore.settings },
    });
  }

  // 13. Promotions: GET /promotions or /promotions/active
  if (method === 'GET' && path.startsWith('/promotions')) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        promotions: [
          {
            _id: 'promo_diwali',
            name: 'Diwali Mahotsav Feast',
            slug: 'diwali-mahotsav',
            description: 'Flat 20% OFF on all authentic Tandoori & Biryani feasts with pure desi ghee',
            promoCode: 'DIWALI20',
            discountType: 'percentage',
            discountValue: 20,
            minOrderValue: 499,
            isActive: true,
            startAt: new Date(Date.now() - 86400000).toISOString(),
            endAt: new Date(Date.now() + 86400000 * 15).toISOString(),
          },
        ],
      },
    });
  }

  // 14. Orders: GET /orders
  if (method === 'GET' && path === '/orders') {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { orders: [] },
    });
  }

  // 15. Reviews: GET /reviews or /reviews/admin
  if (method === 'GET' && path.startsWith('/reviews')) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { reviews: [] },
    });
  }

  // 16. Customers: GET /admin/customers
  if (method === 'GET' && path === '/admin/customers') {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { customers: [] },
    });
  }

  return next();
};

