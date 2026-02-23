import express from "express";
import { createServer as createViteServer } from "vite";
import * as webpush from "web-push";
import bodyParser from "body-parser";
import cors from "cors";

// Initialize VAPID keys
const publicVapidKey = process.env.VITE_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:example@yourdomain.com";

if (publicVapidKey && privateVapidKey) {
  try {
    webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
    console.log("VAPID keys configured successfully");
  } catch (error) {
    console.error("Error configuring VAPID keys:", error);
  }
} else {
  console.warn("VAPID keys are missing! Push notifications will not work.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(bodyParser.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/push/generate-keys", (req, res) => {
    const vapidKeys = webpush.generateVAPIDKeys();
    res.json(vapidKeys);
  });

  app.post("/api/push/subscribe", (req, res) => {
    const subscription = req.body;
    // In a real app, save subscription to DB
    console.log("New subscription:", subscription);
    res.status(201).json({});
  });

  app.post("/api/push/send", async (req, res) => {
    const { subscription, title, body } = req.body;
    
    if (!subscription || !title || !body) {
      return res.status(400).json({ error: "Missing fields" });
    }

    try {
      const payload = JSON.stringify({ title, body });
      await webpush.sendNotification(subscription, payload);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
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
    // Production static file serving would go here
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
