require('dotenv').config();
const express = require("express");
const cors = require("cors");
const Database = require("./db");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;

// Database instance
let db = null;

app.use(cors());
app.use(express.json());

// ✅ JWT Helpers
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin,
      is_superadmin: user.is_superadmin
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log("❌ No Authorization header or token missing");
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log("❌ JWT Error:", err.name, "-", err.message);
      if (err.name === "TokenExpiredError") {
        return res.status(401).send("Token expired");
      }
      return res.status(403).send("Invalid token");
    }
    req.user = user;
    next();
  });
}


function authorizeSuperadmin(req, res, next) {
  if (req.user.is_superadmin) return next();
  return res.sendStatus(403);
}

function authorizeAdmin(req, res, next) {
  if (req.user.is_admin || req.user.is_superadmin) return next();
  return res.sendStatus(403);
}

async function getRequester(requester_id) {
  if (!requester_id) return null;
  return await db.db.get(`SELECT id, is_admin, is_superadmin FROM users WHERE id = ?`, [requester_id]);
}

// ✅ Health check
app.get("/api/health", async (req, res) => {
  try {
    let dbStatus = "disconnected";
    if (db && db.db) {
      try {
        await db.db.get("SELECT 1");
        dbStatus = "connected";
      } catch {
        dbStatus = "error";
      }
    }
    res.json({
      status: "OK",
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: "ERROR", message: "Health check failed", error: error.message });
  }
});

// ✅ Login - returns JWT
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ status: "ERROR", message: "Username and password are required" });
    }

    const user = await db.db.get(
      `SELECT id, username, password, is_active, is_admin, is_superadmin FROM users WHERE username = ? AND deleted_at IS NULL`,
      [username]
    );

    if (!user) {
      return res.status(401).json({ status: "ERROR", message: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(401).json({ status: "ERROR", message: "Account is inactive" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ status: "ERROR", message: "Invalid credentials" });
    }

    await db.db.run(`UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [user.id]);

    const token = generateToken(user);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      status: "OK",
      message: "Login successful",
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: "ERROR", message: "Internal server error", error: error.message });
  }
});

// ✅ Get all users (protected)
app.get("/api/users", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const users = await db.db.all(
      "SELECT id, username, email, first_name, last_name, is_active, is_admin, is_superadmin, created_at, updated_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC"
    );
    res.json({ status: "OK", users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ status: "ERROR", error: error.message });
  }
});

// ✅ Create user (protected)
app.post("/api/users", authenticateToken, async (req, res) => {
  try {
    const { username, password, first_name, last_name, email, is_admin } = req.body;

    if (!username || !password) {
      return res.status(400).json({ status: "ERROR", message: "Username and password required" });
    }

    const requester = req.user;

    // Only superadmin can create admins
    if (is_admin && !requester.is_superadmin) {
      return res.status(403).json({ status: "ERROR", message: "Only superadmin can create admins" });
    }

    // Admins or superadmins can create normal users
    if (!is_admin && !requester.is_admin && !requester.is_superadmin) {
      return res.status(403).json({ status: "ERROR", message: "Only admin or superadmin can create users" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.db.run(`
      INSERT INTO users (username, password, first_name, last_name, email, is_active, is_admin, is_superadmin, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [username, hashedPassword, first_name, last_name, email, is_admin ? 1 : 0]);

    res.json({ status: "OK", message: "User created successfully" });

  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ status: "ERROR", error: error.message });
  }
});

// ✅ Update user (protected)
app.put("/api/users/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, username } = req.body;

    await db.db.run(
      `UPDATE users SET first_name = ?, last_name = ?, username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL`,
      [first_name, last_name, username, id]
    );

    res.json({ status: "OK", message: "User updated" });

  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ status: "ERROR", error: error.message });
  }
});

// ✅ Delete user (protected)
app.delete("/api/users/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await db.db.run(
      `UPDATE users SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );

    res.json({ status: "OK", message: "User deleted" });

  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ status: "ERROR", error: error.message });
  }
});

// ✅ Start server
async function startServer() {
  try {
    console.log("Initializing DB...");
    db = new Database();
    await db.init();
    app.listen(PORT, () => {
      console.log(`✅ Server ready on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// ✅ Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nGracefully shutting down...");
  if (db) await db.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM, shutting down...");
  if (db) await db.close();
  process.exit(0);
});

if (require.main === module) startServer();

module.exports = app;
