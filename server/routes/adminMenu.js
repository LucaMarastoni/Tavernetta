import { Router } from 'express';
import {
  archiveAdminMenuItem,
  createAdminMenuItem,
  getAdminExtraIngredients,
  getAdminMenuItemFlags,
  updateAdminExtraIngredientPrice,
  updateAdminMenuItem,
  updateAdminMenuItemFlags,
} from '../services/adminMenuService.js';

const router = Router();

router.get('/extra-ingredients', async (request, response, next) => {
  try {
    response.json({
      ingredients: await getAdminExtraIngredients(),
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/extra-ingredients/:id', async (request, response, next) => {
  try {
    response.json({
      ingredient: await updateAdminExtraIngredientPrice(request.params.id, request.body),
    });
  } catch (error) {
    next(error);
  }
});

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
