import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const databaseFile = path.resolve(projectRoot, process.env.DATABASE_FILE || 'data/tavernetta.sqlite');

const filesToRemove = [databaseFile, `${databaseFile}-wal`, `${databaseFile}-shm`];
let removedAny = false;

filesToRemove.forEach((filePath) => {
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath);
    removedAny = true;
    console.log(`Rimosso: ${filePath}`);
  }
});

if (!removedAny) {
  console.log(`Nessun database da rimuovere: ${databaseFile}`);
}
