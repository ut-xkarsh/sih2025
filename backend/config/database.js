const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, '..', 'data', 'internest.db');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    // Create preferences table
    const createPreferencesTable = `
      CREATE TABLE IF NOT EXISTS preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        user_ip TEXT,
        education_level TEXT,
        skills TEXT,
        sector TEXT,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create internships table (for future use)
    const createInternshipsTable = `
      CREATE TABLE IF NOT EXISTS internships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        description TEXT,
        location TEXT,
        sector TEXT,
        education_requirements TEXT,
        skills_required TEXT,
        duration TEXT,
        stipend TEXT,
        application_deadline DATE,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create search_logs table
    const createSearchLogsTable = `
      CREATE TABLE IF NOT EXISTS search_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        user_ip TEXT,
        search_params TEXT,
        results_count INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Execute table creation queries
    db.serialize(() => {
      db.run(createPreferencesTable, (err) => {
        if (err) {
          console.error('Error creating preferences table:', err.message);
          reject(err);
        } else {
          console.log('Preferences table created/verified successfully.');
        }
      });

      db.run(createInternshipsTable, (err) => {
        if (err) {
          console.error('Error creating internships table:', err.message);
          reject(err);
        } else {
          console.log('Internships table created/verified successfully.');
        }
      });

      db.run(createSearchLogsTable, (err) => {
        if (err) {
          console.error('Error creating search_logs table:', err.message);
          reject(err);
        } else {
          console.log('Search logs table created/verified successfully.');
          resolve();
        }
      });
    });
  });
};

// Database query helpers
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

module.exports = {
  db,
  initializeDatabase,
  runQuery,
  getQuery,
  allQuery
};