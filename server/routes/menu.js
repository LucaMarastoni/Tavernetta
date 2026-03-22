import { Router } from 'express';
import { getMenuCatalog, getMenuItemById, getMenuItemCustomization, getActiveMenuItems } from '../services/menuService.js';

const router = Router();

router.get('/menu', (request, response, next) => {
  try {
    response.json(getMenuCatalog());
  } catch (error) {
    next(error);
  }
});

router.get('/menu-items', (request, response, next) => {
  try {
    response.json({
      items: getActiveMenuItems(undefined, {
        categorySlug: request.query.category?.toString().trim() || undefined,
      }),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/menu-items/:id', (request, response, next) => {
  try {
    response.json({
      item: getMenuItemById(Number(request.params.id)),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/menu-items/:id/customization', (request, response, next) => {
  try {
    response.json(getMenuItemCustomization(Number(request.params.id)));
  } catch (error) {
    next(error);
  }
});

export default router;
