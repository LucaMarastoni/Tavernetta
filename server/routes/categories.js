import { Router } from 'express';
import { getActiveCategories } from '../services/menuService.js';

const router = Router();

router.get('/', async (request, response, next) => {
  try {
    response.json({
      categories: await getActiveCategories(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
