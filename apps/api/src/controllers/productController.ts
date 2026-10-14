import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../middleware/errorHandler';

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

// GET /api/v1/products
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      category,
      vegetarian,
      spiceLevel,
      featured,
      minPrice,
      maxPrice,
      sort,
      page = '1',
      limit = '20',
      includeUnavailable,
    } = req.query;

    const query: any = {};

    // Filter available unless admin requests unavailable items
    if (includeUnavailable !== 'true' || req.user?.role !== 'admin') {
      query.isAvailable = true;
    }

    // Category filter (support slug or ObjectId)
    if (category) {
      if (category.toString().match(/^[0-9a-fA-F]{24}$/)) {
        query.categoryId = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          query.categoryId = cat._id;
        } else {
          // If category not found, return empty list
          return res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { products: [], pagination: { total: 0, page: 1, limit: Number(limit), pages: 0 } },
          });
        }
      }
    }

    // Vegetarian filter
    if (vegetarian !== undefined && vegetarian !== '') {
      query.isVegetarian = vegetarian === 'true';
    }

    // Spice level filter
    if (spiceLevel) {
      query.spiceLevel = spiceLevel;
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Text search
    if (search && typeof search === 'string' && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { shortDescription: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Sorting
    let sortOption: any = { isFeatured: -1, createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating_desc') sortOption = { averageRating: -1, totalReviews: -1 };
    else if (sort === 'popular') sortOption = { totalReviews: -1, averageRating: -1 };
    else if (sort === 'name_asc') sortOption = { name: 1 };

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/products/featured
export const getFeaturedProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({ isFeatured: true, isAvailable: true })
      .populate('categoryId', 'name slug')
      .limit(8);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/products/:slug
export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    let product;

    // Check if slug is MongoDB ObjectId
    if (slug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(slug).populate('categoryId', 'name slug');
    } else {
      product = await Product.findOne({ slug }).populate('categoryId', 'name slug');
    }

    if (!product) {
      throw new AppError('Dish not found in menu', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/products (Admin)
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, categoryId } = req.body;

    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      throw new AppError('The specified category does not exist', HTTP_STATUS.BAD_REQUEST);
    }

    let slug = req.body.slug ? slugify(req.body.slug) : slugify(name);
    const existing = await Product.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const product = await Product.create({
      ...req.body,
      slug,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/products/:id (Admin)
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.categoryId) {
      const categoryExists = await Category.findById(updates.categoryId);
      if (!categoryExists) {
        throw new AppError('The specified category does not exist', HTTP_STATUS.BAD_REQUEST);
      }
    }

    if (updates.name && !updates.slug) {
      updates.slug = slugify(updates.name);
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate('categoryId', 'name slug');

    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/products/:id (Admin)
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/products/:id/toggle-availability (Admin)
export const toggleProductAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      throw new AppError('Product not found', HTTP_STATUS.NOT_FOUND);
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Product is now ${product.isAvailable ? 'available' : 'unavailable'}`,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};
