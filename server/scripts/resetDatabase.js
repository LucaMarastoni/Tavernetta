import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const databaseFile = path.resolve(projectRoot, process.env.DATABASE_FILE || 'data/tavernetta.sqlite');

if (fs.existsSync(databaseFile)) {
  fs.rmSync(databaseFile);
  console.log(`Database rimosso: ${databaseFile}`);
} else {
  console.log(`Nessun database da rimuovere: ${databaseFile}`);
}
