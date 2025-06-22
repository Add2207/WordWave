require('dotenv').config();
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    try {
      const dbPath = path.join(__dirname, 'users.db');
      this.db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      await this.createUserTable();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async createUserTable() {
    try {
      const createTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          is_active BOOLEAN DEFAULT 1,
          is_superadmin BOOLEAN DEFAULT 0,
          is_admin BOOLEAN DEFAULT 0,
          last_login DATETIME DEFAULT NULL,
          password_reset_token VARCHAR(255) DEFAULT NULL,
          password_reset_expires DATETIME DEFAULT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME DEFAULT NULL
        )
      `;

      await this.db.run(createTable);
      console.log('User table created successfully');

      // If empty, insert YOU as the first superadmin
      const result = await this.db.get('SELECT COUNT(*) as count FROM users');
      if (result.count === 0) {
        await this.insertInitialSuperadmin();
      }
    } catch (error) {
      console.error('Error creating user table:', error);
      throw error;
    }
  }

  async insertInitialSuperadmin() {
    try {
      const saltRounds = 10;
      const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, saltRounds);

      const superadmin = [
        'aaditya',                  // username
        'aaditya@example.com',      // email
        adminPassword,               // hashed password
        'Aaditya',                  // first name
        'Ardhapurkar',              // last name
        1,                          // is_superadmin
        1                           // is_admin
      ];

      const insertSQL = `
        INSERT INTO users 
          (username, email, password, first_name, last_name, is_superadmin, is_admin)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await this.db.run(insertSQL, superadmin);

      console.log('Your superadmin account has been created:');
      console.log('Username: aaditya');
    } catch (error) {
      console.error('Error inserting initial superadmin:', error);
      throw error;
    }
  }

  async close() {
    try {
      if (this.db) {
        await this.db.close();
        console.log('Database connection closed');
      }
    } catch (error) {
      console.error('Error closing database:', error);
      throw error;
    }
  }
}

module.exports = Database;
