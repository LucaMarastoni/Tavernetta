import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { getDatabaseFile, initializeDatabase } from './db/database.js';
import { findCustomerByPhone, upsertCustomer } from './services/customerService.js';
import { getPublicMenuCatalog } from './services/menuService.js';
import { createGuestOrder } from './services/orderService.js';
import { HttpError } from './utils/httpError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(projectRoot, 'dist');
const port = Number(process.env.PORT || 3001);

initializeDatabase();

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (request, response) => {
  response.json({
    status: 'ok',
    databaseFile: getDatabaseFile(),
  });
});

app.get('/api/menu', (request, response, next) => {
  try {
    response.json(getPublicMenuCatalog());
  } catch (error) {
    next(error);
  }
});

app.get('/api/customers/lookup', (request, response, next) => {
  try {
    const phone = request.query.phone?.toString() || '';

    if (!phone.trim()) {
      throw new HttpError(400, 'INVALID_PHONE', 'Inserisci un numero di telefono valido.');
    }

    response.json({
      customer: findCustomerByPhone(phone),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/customers', (request, response, next) => {
  try {
    response.status(201).json({
      customer: upsertCustomer(request.body || {}),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/orders', (request, response, next) => {
  try {
    response.status(201).json(createGuestOrder(request.body || {}));
  } catch (error) {
    next(error);
  }
});

if (fs.existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (request, response) => {
    response.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use((error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const status = error instanceof HttpError ? error.status : 500;
  const code = error instanceof HttpError ? error.code : 'INTERNAL_ERROR';
  const message = error?.message || 'Errore interno del server.';

  if (status >= 500) {
    console.error(error);
  }

  response.status(status).json({
    error: {
      code,
      message,
      details: error instanceof HttpError ? error.details : null,
    },
  });
});

app.listen(port, () => {
  console.log(`Tavernetta server attivo su http://localhost:${port}`);
  console.log(`Database SQLite: ${getDatabaseFile()}`);
});
