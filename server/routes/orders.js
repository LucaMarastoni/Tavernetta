import { Router } from 'express';
import { createOrder } from '../services/orderService.js';

const router = Router();

router.post('/', (request, response, next) => {
  try {
    response.status(201).json(createOrder(request.body || {}));
  } catch (error) {
    next(error);
  }
});

export default router;
