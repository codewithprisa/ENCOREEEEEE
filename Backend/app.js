import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

import authRoutes from "./src/routes/authRoute.js";
import userRoutes from "./src/routes/userRoute.js";
import tiketRoutes from "./src/routes/tiketRoute.js";
import venueRoute from "./src/routes/venueRoute.js";
import eventRoutes from "./src/routes/eventRoute.js";
import tiketTypeRoutes from "./src/routes/tiketTypeRoute.js";
import seatRoutes from "./src/routes/seatsRoute.js";
import promoRoutes from "./src/routes/promoRoute.js";
import orderRoutes from "./src/routes/orderRoute.js";
import paymentRoutes from "./src/routes/paymentRoute.js";
import refundRoutes from "./src/routes/refundRoute.js";
import analyticsRoutes from "./src/routes/analyticsRoute.js";
import reviewRoutes from "./src/routes/reviewRoute.js";
import notificationRoutes from "./src/routes/notificationRoute.js";
import artisRoutes from "./src/routes/artisRoutes.js";
import genreRoutes from "./src/routes/genreRoute.js";
import profileRoutes from "./src/routes/profileRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// ==================== CORS ====================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8081",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin
      // (misalnya Postman / beberapa request native)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS ditolak:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ==================== UPLOADS ====================

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "src/uploads"))
);

// ==================== ROUTES ====================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tiket", tiketRoutes);
app.use("/api/venues", venueRoute);
app.use("/api/events", eventRoutes);
app.use("/api/tiket-types", tiketTypeRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/promo", promoRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/refunds", refundRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/artis", artisRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/profile", profileRoutes);

// ==================== TEST API ====================

app.get("/", (req, res) => {
  res.json({
    msg: "API Berjalan",
  });
});

// ==================== 404 ====================

app.use((req, res) => {
  res.status(404).json({
    msg: "Endpoint tidak ditemukan",
    path: req.originalUrl,
  });
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    msg: "Terjadi error pada server",
    error: err.message,
  });
});

// ==================== START SERVER ====================

app.listen(3001, "0.0.0.0", () => {
  console.log("=================================");
  console.log("Server jalan di port 3001");
  console.log("http://localhost:3001");
  console.log("=================================");
});