import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

// Database file path
const dbPath = join(process.cwd(), 'virtual-closet.db');

// Initialize database connection
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Run migrations on first connection
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(database: Database.Database) {
  const schemaPath = join(process.cwd(), 'src', 'lib', 'db', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');

  // Execute schema
  database.exec(schema);

  console.log('Database initialized successfully');
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Graceful shutdown
process.on('exit', closeDatabase);
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});
