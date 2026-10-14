import { Request, Response, NextFunction } from 'express';
import { RestaurantSettings } from '../models/RestaurantSettings';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../middleware/errorHandler';

// GET /api/v1/settings
export const getSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create({});
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/settings (Admin)
export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = await RestaurantSettings.create(req.body);
    } else {
      settings = await RestaurantSettings.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Restaurant settings updated successfully',
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};
