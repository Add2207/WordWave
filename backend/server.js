require('dotenv').config();
const express = require("express");
const cors = require("cors");
const Database = require("./db");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database instance
let db = null;

app.use(cors());
app.use(express.json());

async function getRequester(requester_id) {
  if (!requester_id) return null;
  return await db.db.get(
    `SELECT id, is_admin, is_superadmin FROM users WHERE id = ?`,
    [requester_id]
  );
}

// Health endpoint - includes database status
app.get("/api/health", async (req, res) => {
  try {
    let dbStatus = "disconnected";

    // Check if database is connected and working
    if (db && db.db) {
      try {
        await db.db.get("SELECT 1");
        dbStatus = "connected";
      } catch (error) {
        dbStatus = "error";
      }
    }

    res.json({
      status: "OK",
      message: "User Management API is running",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: "ERROR",
        message: "Username and password are required",
      });
    }

    const user = await db.db.get(
      `SELECT id, username, password, is_active, is_admin, is_superadmin FROM users WHERE username = ? AND deleted_at IS NULL`,
      [username]
    );

    if (!user) {
      return res
        .status(401)
        .json({ status: "ERROR", message: "Invalid username or password" });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Account is inactive",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Update last login
    await db.db.run(
      `
            UPDATE users 
            SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
      [user.id]
    );

    const { password: _, ...userWithoutPassword } = user; // Exclude password from response

    res.json({
      status: "OK",
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await db.db.all(
      "SELECT id, username, email, first_name, last_name, is_active, is_admin, is_superadmin, created_at, updated_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC"
    );

    res.json({
      status: "OK",
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    console.log("Initializing database...");
    db = new Database();
    await db.init();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

app.post('/api/users', async (req, res) => {
  try {
    const {
      username,
      password,
      first_name,
      last_name,
      email,
      is_admin,
      requester_id  // optional
    } = req.body;

    if (!username || !password) {
      return res.status(400).json({ status: 'ERROR', message: 'Username and password are required' });
    }

    // Check if there are any users in the DB yet
    const countRow = await db.db.get(`SELECT COUNT(*) as count FROM users`);
    const totalUsers = countRow.count;

    if (totalUsers === 0) {
      // 🚀 No users exist yet — allow bootstrap superadmin
      console.log('No users found, creating first superadmin...');
    } else {
      // Users exist — enforce requester check
      if (!requester_id) {
        return res.status(403).json({ status: 'ERROR', message: 'Requester ID required' });
      }

      const requester = await db.db.get(`SELECT * FROM users WHERE id = ?`, [requester_id]);
      if (!requester) {
        return res.status(403).json({ status: 'ERROR', message: 'Unauthorized' });
      }

      // Only superadmin can add other admins
      if (is_admin && !requester.is_superadmin) {
        return res.status(403).json({ status: 'ERROR', message: 'Only superadmin can add admins' });
      }

      // Only admin or superadmin can add regular users
      if (!is_admin && !requester.is_admin && !requester.is_superadmin) {
        return res.status(403).json({ status: 'ERROR', message: 'Only admins can add users' });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.db.run(`
      INSERT INTO users (
        username,
        password,
        first_name,
        last_name,
        email,
        is_active,
        is_admin,
        is_superadmin,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, 1, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    [
      username,
      hashedPassword,
      first_name,
      last_name,
      email,
      is_admin ? 1 : 0,
      totalUsers === 0 ? 1 : 0  // First user: make superadmin automatically
    ]);

    res.json({
      status: 'OK',
      message: totalUsers === 0
        ? 'First superadmin created successfully'
        : 'User created successfully'
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal server error', error: error.message });
  }
});


app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, username, requester_id } = req.body;

    const requester = await getRequester(requester_id);
    if (!requester || (!requester.is_admin && !requester.is_superadmin)) {
      return res
        .status(403)
        .json({ status: "ERROR", message: "Permission denied: Admins only" });
    }

    await db.db.run(
      `UPDATE users SET first_name = ?, last_name = ?, username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL`,
      [first_name, last_name, username, id]
    );

    res.json({ status: "OK", message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({
        status: "ERROR",
        message: "Internal server error",
        error: error.message,
      });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { requester_id } = req.body;

    const requester = await getRequester(requester_id);
    if (!requester || (!requester.is_admin && !requester.is_superadmin)) {
      return res
        .status(403)
        .json({ status: "ERROR", message: "Permission denied: Admins only" });
    }

    await db.db.run(
      `UPDATE users SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    res.json({ status: "OK", message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({
        status: "ERROR",
        message: "Internal server error",
        error: error.message,
      });
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  try {
    if (db) {
      await db.close();
    }
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM, shutting down gracefully...");
  try {
    if (db) {
      await db.close();
    }
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
