import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { users, goals } from "./src/db/schema";
import crypto from "crypto";

const sqlUrl = process.env.SQL_HOST ? {
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DB_NAME,
} : undefined;

const sql = sqlUrl ? postgres(sqlUrl) : null;
const db = sql ? drizzle(sql) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // Dummy auth middleware for demo purposes since Firebase was declined
  const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // In this basic demo, the token is simply the base64 encoded email
    const token = authHeader.split('Bearer ')[1];
    try {
      const email = Buffer.from(token, 'base64').toString('utf-8');
      if (!email || !email.includes('@')) throw new Error("Invalid token");
      (req as any).user = { email };
      next();
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // Login / Register endpoint
  app.post("/api/auth/login", async (req: express.Request, res: express.Response) => {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const { email, password } = req.body;
    
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });
    
    try {
      let dbUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (dbUser.length === 0) {
        // Very basic register (store password in settings for this demo, not secure for production)
        const newDbUser = await db.insert(users).values({
          email,
          profile: {
            name: email.split('@')[0],
            photoUrl: "",
            currency: "BRL"
          },
          settings: {
            theme: "system",
            passwordHash: crypto.createHash('sha256').update(password).digest('hex')
          }
        }).returning();
        dbUser = newDbUser;
      } else {
        const storedHash = (dbUser[0].settings as any)?.passwordHash;
        const inputHash = crypto.createHash('sha256').update(password).digest('hex');
        if (storedHash && storedHash !== inputHash) {
          return res.status(401).json({ error: "Invalid password" });
        }
      }
      
      const token = Buffer.from(email).toString('base64');
      res.json({ token, email });
    } catch (error) {
      console.error("Auth error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Sync endpoint (load data)
  app.get("/api/sync", authMiddleware, async (req: express.Request, res: express.Response) => {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const user = (req as any).user;
    
    try {
      const dbUser = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
      if (dbUser.length === 0) return res.status(404).json({ error: "User not found" });
      
      const userGoals = await db.select().from(goals).where(eq(goals.userId, user.email));
      
      res.json({
        email: dbUser[0].email,
        profile: dbUser[0].profile,
        settings: dbUser[0].settings,
        goals: userGoals.map(g => g.data),
        createdAt: dbUser[0].createdAt
      });
    } catch (error) {
      console.error("Sync error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Update profile
  app.post("/api/profile", authMiddleware, async (req: express.Request, res: express.Response) => {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const user = (req as any).user;
    
    try {
      await db.update(users)
        .set({ profile: req.body.profile })
        .where(eq(users.email, user.email));
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Update settings
  app.post("/api/settings", authMiddleware, async (req: express.Request, res: express.Response) => {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const user = (req as any).user;
    
    try {
      // Preserve password hash
      const dbUser = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
      const newSettings = { ...req.body.settings };
      if (dbUser[0] && (dbUser[0].settings as any)?.passwordHash) {
        newSettings.passwordHash = (dbUser[0].settings as any).passwordHash;
      }
      
      await db.update(users)
        .set({ settings: newSettings })
        .where(eq(users.email, user.email));
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Save multiple goals (sync)
  app.post("/api/goals/sync", authMiddleware, async (req: express.Request, res: express.Response) => {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const user = (req as any).user;
    const { goals: clientGoals } = req.body;
    
    try {
      await db.delete(goals).where(eq(goals.userId, user.email));
      
      if (clientGoals && clientGoals.length > 0) {
        await db.insert(goals).values(
          clientGoals.map((g: any) => ({
            userId: user.email,
            goalId: g.id,
            data: g
          }))
        );
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
