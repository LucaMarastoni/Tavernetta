import { Router } from 'express';
import { createOrder } from '../services/orderService.js';

const router = Router();

router.post('/', async (request, response, next) => {
  try {
    response.status(201).json(await createOrder(request.body || {}));
  } catch (error) {
    next(error);
  }
});

export default router;
