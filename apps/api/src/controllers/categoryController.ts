import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
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

// GET /api/v1/categories
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { includeInactive } = req.query;
    const filter: any = {};

    if (includeInactive !== 'true' || req.user?.role !== 'admin') {
      filter.isActive = true;
    }

    const categories = await Category.find(filter).sort({ displayOrder: 1, name: 1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/categories/:slug
export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });

    if (!category) {
      throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
    }

    const products = await Product.find({
      categoryId: category._id,
      isAvailable: true,
    }).sort({ isFeatured: -1, name: 1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        category,
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/categories (Admin)
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, image, isActive, displayOrder, seoTitle, seoDescription } = req.body;
    let slug = req.body.slug ? slugify(req.body.slug) : slugify(name);

    // Ensure unique slug
    let existing = await Category.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
      seoTitle,
      seoDescription,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/categories/:id (Admin)
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.name && !updates.slug) {
      updates.slug = slugify(updates.name);
    }

    const category = await Category.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/categories/:id (Admin)
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productCount = await Product.countDocuments({ categoryId: id });
    if (productCount > 0) {
      throw new AppError(
        `Cannot delete category: ${productCount} dish(es) are still associated with it. Please reassign or delete them first.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
