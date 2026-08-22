require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const statsRoutes = require("./routes/statsRoutes");
const { structuredLog, errorLog } = require("./middlewares/logger");
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
  })
);
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// NOTE: local disk storage does not persist on Vercel's serverless runtime.
// This works for local/dev and any host with a persistent filesystem, but in
// production on Vercel, swap multer's disk storage for an object store
// (e.g. Vercel Blob, S3, Cloudinary) before relying on image upload.
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(structuredLog);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/stats", statsRoutes);

app.get("/", (req, res) => res.json({ status: "API running" }));

// Dedicated health-check endpoint for uptime monitoring (UptimeRobot etc).
// Kept fast and side-effect free; checks that both databases are reachable.
app.get("/api/health", async (req, res) => {
  const prisma = require("./config/prisma");
  const mongoose = require("mongoose");

  const checks = { postgres: "unknown", mongo: "unknown" };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = "ok";
  } catch {
    checks.postgres = "error";
  }

  checks.mongo = mongoose.connection.readyState === 1 ? "ok" : "error";

  const healthy = checks.postgres === "ok" && checks.mongo === "ok";
  res.status(healthy ? 200 : 503).json({ status: healthy ? "ok" : "degraded", checks });
});


app.use(errorLog);

module.exports = app;