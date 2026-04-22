const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drive_file_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      song_name TEXT,
      venue TEXT,
      type TEXT,
      partial INTEGER DEFAULT 0
    )
  `);
  
  db.run(`ALTER TABLE videos ADD COLUMN partial INTEGER DEFAULT 0`, (err) => {
    // Ignore error if column already exists
  });
});

module.exports = db;
