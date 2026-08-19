import { Router } from 'express';
import { getOrderingStatus } from '../services/orderingSettingsService.js';

const router = Router();

router.get('/', async (request, response, next) => {
  try {
    response.json(await getOrderingStatus({ allowMissing: true }));
  } catch (error) {
    next(error);
  }
});

export default router;
