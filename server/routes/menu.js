import { Router } from 'express';
import { getMenuCatalog, getMenuItemById, getMenuItemCustomization, getActiveMenuItems } from '../services/menuService.js';

const router = Router();

router.get('/menu', async (request, response, next) => {
  try {
    response.json(await getMenuCatalog());
  } catch (error) {
    next(error);
  }
});

router.get('/menu-items', async (request, response, next) => {
  try {
    response.json({
      items: await getActiveMenuItems({
        categorySlug: request.query.category?.toString().trim() || undefined,
      }),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/menu-items/:id', async (request, response, next) => {
  try {
    response.json({
      item: await getMenuItemById(request.params.id?.toString().trim()),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/menu-items/:id/customization', async (request, response, next) => {
  try {
    response.json(await getMenuItemCustomization(request.params.id?.toString().trim()));
  } catch (error) {
    next(error);
  }
});

export default router;
