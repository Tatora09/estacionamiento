import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";

dotenv.config();

import { 
  getSpaces, 
  updateSpace, 
  getLogs, 
  addLog, 
  clearAllLogs, 
  getReservations, 
  addReservation, 
  updateReservationStatus,
  initializeLocalState,
  isConnected
} from "./src/db/mysql.ts";

async function runApplication() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/db-status", (req, res) => {
    res.json({
      connected: isConnected(),
      mode: isConnected() ? "MySQL Producción" : "Simulada (Sandbox)"
    });
  });

  app.get("/api/spaces", async (req, res) => {
    try {
      const data = await getSpaces();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/spaces/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;
    try {
      const success = await updateSpace(id, updates);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/logs", async (req, res) => {
    try {
      const data = await getLogs();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/logs", async (req, res) => {
    const newLog = req.body;
    try {
      const success = await addLog(newLog);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/logs", async (req, res) => {
    try {
      const success = await clearAllLogs();
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reservations", async (req, res) => {
    try {
      const data = await getReservations();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reservations", async (req, res) => {
    const newReservation = req.body;
    try {
      const success = await addReservation(newReservation);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reservations/:id/status", async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    try {
      const success = await updateReservationStatus(id, status);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite Integration for Asset Serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

runApplication().catch((err) => {
  console.error("Startup error:", err);
});
