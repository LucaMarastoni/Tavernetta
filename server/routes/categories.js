import { Router } from 'express';
import { getActiveCategories } from '../services/menuService.js';

const router = Router();

router.get('/', (request, response, next) => {
  try {
    response.json({
      categories: getActiveCategories(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
