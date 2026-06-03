import { Router } from 'express';
import {
  archiveAdminMenuItem,
  createAdminMenuItem,
  getAdminMenuItemFlags,
  updateAdminMenuItem,
  updateAdminMenuItemFlags,
} from '../services/adminMenuService.js';

const router = Router();

router.get('/menu-items/:id/flags', async (request, response, next) => {
  try {
    response.json({
      flags: await getAdminMenuItemFlags(request.params.id),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/menu-items', async (request, response, next) => {
  try {
    response.status(201).json({
      item: await createAdminMenuItem(request.body),
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/menu-items/:id', async (request, response, next) => {
  try {
    response.json({
      item: await updateAdminMenuItem(request.params.id, request.body),
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/menu-items/:id/flags', async (request, response, next) => {
  try {
    response.json({
      flags: await updateAdminMenuItemFlags(request.params.id, request.body),
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/menu-items/:id', async (request, response, next) => {
  try {
    response.json({
      item: await archiveAdminMenuItem(request.params.id),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
