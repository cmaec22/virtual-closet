import { getDatabase } from './db';
import type Database from 'better-sqlite3';

export interface Migration {
  version: number;
  name: string;
  up: (db: Database.Database) => void;
}

// Migration tracking table
function ensureMigrationsTable(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function getCurrentVersion(db: Database.Database): number {
  ensureMigrationsTable(db);
  const result = db.prepare('SELECT MAX(version) as version FROM migrations').get() as { version: number | null };
  return result.version ?? 0;
}

function recordMigration(db: Database.Database, migration: Migration) {
  db.prepare('INSERT INTO migrations (version, name) VALUES (?, ?)').run(migration.version, migration.name);
}

export function runMigrations(migrations: Migration[]) {
  const db = getDatabase();
  const currentVersion = getCurrentVersion(db);

  const pendingMigrations = migrations
    .filter(m => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  if (pendingMigrations.length === 0) {
    console.log('No pending migrations');
    return;
  }

  console.log(`Running ${pendingMigrations.length} migration(s)...`);

  for (const migration of pendingMigrations) {
    console.log(`Applying migration ${migration.version}: ${migration.name}`);

    const transaction = db.transaction(() => {
      migration.up(db);
      recordMigration(db, migration);
    });

    transaction();
  }

  console.log('All migrations completed successfully');
}

// Future migrations can be added here
export const migrations: Migration[] = [
  // Example future migration:
  // {
  //   version: 2,
  //   name: 'add_favorite_column_to_clothing_items',
  //   up: (db) => {
  //     db.exec('ALTER TABLE clothing_items ADD COLUMN is_favorite INTEGER DEFAULT 0');
  //   }
  // }
];
