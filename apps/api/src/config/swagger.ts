import swaggerJsdoc from 'swagger-jsdoc';
import { ENV } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sai Punjabi Restaurant API',
      version: '1.0.0',
      description:
        'Production REST API for Sai Punjabi Restaurant - Orders, Menu, Payments, Reviews & Festival Offers.',
      contact: {
        name: 'Sai Punjabi Tech Team',
        email: 'hello@saipunjabifoods.com',
      },
    },
    servers: [
      {
        url: `${ENV.API_BASE_URL}/api/v1`,
        description: `${ENV.NODE_ENV} server`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: ENV.COOKIE_NAME,
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
