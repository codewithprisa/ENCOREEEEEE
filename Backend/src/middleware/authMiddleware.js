import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/config.js";

// Cek apakah request punya token yang valid
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Token tidak ada" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ msg: "Token tidak valid" });
    }

    req.user = decoded; // simpan data user dari token, bisa dipakai di controller
    next(); // lanjut ke controller berikutnya
  });
};

// Cek apakah user yang login role-nya admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Akses ditolak, khusus admin" });
  }
  next();
};