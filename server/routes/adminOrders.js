import { Router } from 'express';
import { listAdminOrders, updateAdminOrderStatus } from '../services/adminOrdersService.js';

const router = Router();

router.get('/', async (request, response, next) => {
  try {
    response.json({
      orders: await listAdminOrders(),
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (request, response, next) => {
  try {
    response.json({
      order: await updateAdminOrderStatus(request.params.id, request.body?.status),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
