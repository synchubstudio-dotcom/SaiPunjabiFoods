import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateRequest = (schema: {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateBody = (schema: z.ZodTypeAny) => validateRequest({ body: schema });
export const validateQuery = (schema: z.ZodTypeAny) => validateRequest({ query: schema });
export const validateParams = (schema: z.ZodTypeAny) => validateRequest({ params: schema });
