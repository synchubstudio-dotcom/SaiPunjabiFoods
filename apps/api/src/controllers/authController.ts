import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { signToken, sendTokenCookie, clearTokenCookie } from '../utils/token';
import { HTTP_STATUS } from '../constants';
import { AppError } from '../middleware/errorHandler';

// POST /api/v1/auth/signup
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('An account with this email already exists', HTTP_STATUS.CONFLICT);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: password,
      phone,
      role: 'customer',
      isActive: true,
    });

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    sendTokenCookie(res, token);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Registration successful! Welcome to Sai Punjabi.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Must explicitly select passwordHash since it is hidden by default
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!user.isActive) {
      throw new AppError(
        'Your account has been deactivated. Please contact support.',
        HTTP_STATUS.FORBIDDEN
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    sendTokenCookie(res, token);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/logout
export const logout = async (_req: Request, res: Response) => {
  clearTokenCookie(res);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// GET /api/v1/auth/me
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!._id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/auth/profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { name, phone },
      { new: true, runValidators: true }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/auth/address
export const addAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const address = req.body;
    const user = await User.findById(req.user!._id);
    if (!user) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    // If marked as default, unset other defaults
    if (address.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    } else if (user.addresses.length === 0) {
      address.isDefault = true;
    }

    user.addresses.push(address);
    await user.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Address added successfully',
      data: { addresses: user.addresses },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/auth/address/:addressId
export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user!._id);
    if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

    user.addresses = user.addresses.filter(
      (a: any) => a._id?.toString() !== addressId
    );
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Address removed successfully',
      data: { addresses: user.addresses },
    });
  } catch (error) {
    next(error);
  }
};
