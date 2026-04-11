import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { getDatabaseFile, initializeDatabase } from './db/database.js';
import { hasSupabaseConfig } from './lib/supabase.js';
import categoriesRouter from './routes/categories.js';
import mediaRouter from './routes/media.js';
import menuRouter from './routes/menu.js';
import ordersRouter from './routes/orders.js';
import { HttpError } from './utils/httpError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(projectRoot, 'dist');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 3001);
const usesSupabase = hasSupabaseConfig();

if (!usesSupabase) {
  initializeDatabase();
}

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (request, response) => {
  response.json({
    status: 'ok',
    dataSource: usesSupabase ? 'supabase' : 'sqlite',
    databaseFile: usesSupabase ? null : getDatabaseFile(),
  });
});

app.use('/api/categories', categoriesRouter);
app.use('/api/media', mediaRouter);
app.use('/api', menuRouter);
app.use('/api/orders', ordersRouter);

if (fs.existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (request, response) => {
    response.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use((request, response, next) => {
  next(new HttpError(404, 'NOT_FOUND', 'La risorsa richiesta non esiste.'));
});

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

const server = app.listen(port, host, () => {
  console.log(`Tavernetta server attivo su http://${host}:${port}`);
  console.log(usesSupabase ? 'Datasource: Supabase' : `Database SQLite: ${getDatabaseFile()}`);
});

server.once('error', (error) => {
  console.error(`Impossibile avviare il server su ${host}:${port}`);
  console.error(error);
  process.exitCode = 1;
});

server.once('close', () => {
  console.log('Server HTTP arrestato.');
});

await new Promise((resolve) => {
  server.once('close', resolve);
  server.once('error', resolve);
});
