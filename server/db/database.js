import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const databaseFile = path.resolve(projectRoot, process.env.DATABASE_FILE || 'data/tavernetta.sqlite');
const schemaFile = path.resolve(projectRoot, 'database/schema.sql');
const seedFile = path.resolve(projectRoot, 'database/seed.sql');

let databaseInstance = null;

export function getDatabaseFile() {
  return databaseFile;
}

export function initializeDatabase() {
  if (databaseInstance) {
    return databaseInstance;
  }

  fs.mkdirSync(path.dirname(databaseFile), { recursive: true });

  const database = new Database(databaseFile);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');
  database.pragma('busy_timeout = 5000');

  database.exec(fs.readFileSync(schemaFile, 'utf8'));

  const categoryCount = database.prepare('select count(*) as count from categories').get().count;
  const menuItemCount = database.prepare('select count(*) as count from menu_items').get().count;

  if (categoryCount === 0 || menuItemCount === 0) {
    database.exec(fs.readFileSync(seedFile, 'utf8'));
  }

  databaseInstance = database;
  return databaseInstance;
}

export function getDatabase() {
  return databaseInstance ?? initializeDatabase();
}
