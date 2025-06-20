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
            const createTable = `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                is_superadmin BOOLEAN DEFAULT 0,
                last_login DATETIME DEFAULT NULL,
                password_reset_token VARCHAR(255) DEFAULT NULL,
                password_reset_expires DATETIME DEFAULT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                deleted_at DATETIME DEFAULT NULL
            )`;
            
            await this.db.run(createTable);
            console.log('User table created successfully');

            // Check if table is empty and insert sample data
            const result = await this.db.get('SELECT COUNT(*) as count FROM users');
            if (result.count === 0) {
                await this.insertSampleUsers();
            }
        } catch (error) {
            console.error('Error creating user table:', error);
            throw error;
        }
    }

    async insertSampleUsers() {
        try {
            const saltRounds = 10;
            const adminPassword = await bcrypt.hash('admin123', saltRounds);
            const userPassword = await bcrypt.hash('user123', saltRounds);

            const sampleUsers = [
                ['admin', 'admin@example.com', adminPassword, 'Admin', 'User', 1],
                ['johndoe', 'john@example.com', userPassword, 'John', 'Doe', 0],
                ['janedoe', 'jane@example.com', userPassword, 'Jane', 'Doe', 0]
            ];

            const insertSQL = `INSERT INTO users (username, email, password, first_name, last_name, is_superadmin) 
                              VALUES (?, ?, ?, ?, ?, ?)`;

            for (const user of sampleUsers) {
                await this.db.run(insertSQL, user);
            }

            console.log('Sample users inserted successfully');
            console.log('Default login credentials:');
            console.log('Admin: admin / admin123');
            console.log('Users: johndoe or janedoe / user123');

        } catch (error) {
            console.error('Error inserting sample users:', error);
            throw error;
        }
    }

    // Add method to close database connection
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