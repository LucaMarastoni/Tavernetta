import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const SCHEMA_VERSION = 3;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const databaseFile = path.resolve(projectRoot, process.env.DATABASE_FILE || 'data/tavernetta.sqlite');
const schemaFile = path.resolve(projectRoot, 'database/schema.sql');
const seedFile = path.resolve(projectRoot, 'database/seed.sql');

let databaseInstance = null;

function removeSidecarFiles() {
  [`${databaseFile}-wal`, `${databaseFile}-shm`].forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath);
    }
  });
}

function runSchema(database) {
  const schemaSql = fs.readFileSync(schemaFile, 'utf8');
  database.exec(schemaSql);
  database.pragma(`user_version = ${SCHEMA_VERSION}`);
}

function seedDatabase(database) {
  const seedSql = fs.readFileSync(seedFile, 'utf8');
  database.exec(seedSql);
}

function rebuildDatabase(database) {
  database.exec(`
    drop table if exists order_items;
    drop table if exists orders;
    drop table if exists product_options;
    drop table if exists menu_item_allowed_extras;
    drop table if exists extra_ingredients;
    drop table if exists menu_item_ingredients;
    drop table if exists ingredients;
    drop table if exists menu_items;
    drop table if exists categories;
  `);

  runSchema(database);
  seedDatabase(database);
}

function hasExpectedSchema(database) {
  const userVersion = database.pragma('user_version', { simple: true });

  if (userVersion !== SCHEMA_VERSION) {
    return false;
  }

  const tables = database
    .prepare(
      `
        select name
        from sqlite_master
        where type = 'table'
      `,
    )
    .all()
    .map((row) => row.name);

  return ['categories', 'menu_items', 'ingredients', 'menu_item_ingredients', 'extra_ingredients', 'menu_item_allowed_extras', 'product_options', 'orders', 'order_items'].every(
    (table) => tables.includes(table),
  );
}

export function getDatabaseFile() {
  return databaseFile;
}

export function initializeDatabase() {
  if (databaseInstance) {
    return databaseInstance;
  }

  fs.mkdirSync(path.dirname(databaseFile), { recursive: true });

  if (!fs.existsSync(databaseFile)) {
    removeSidecarFiles();
  }

  const database = new Database(databaseFile);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');
  database.pragma('busy_timeout = 5000');

  if (!hasExpectedSchema(database)) {
    rebuildDatabase(database);
  } else {
    runSchema(database);

    const categoryCount = database.prepare('select count(*) as count from categories').get().count;
    const itemCount = database.prepare('select count(*) as count from menu_items').get().count;

    if (categoryCount === 0 || itemCount === 0) {
      seedDatabase(database);
    }
  }

  databaseInstance = database;
  return databaseInstance;
}

export function getDatabase() {
  return databaseInstance ?? initializeDatabase();
}
