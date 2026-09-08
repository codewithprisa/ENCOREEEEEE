import db from "../config/db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { JWT_SECRET, JWT_EXPIRES } from "../config/config.js";

// ==================== REGISTER ====================
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        msg: "Name, email, password, dan phone wajib diisi",
      });
    }

    await db.query(
      "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
      [name, email, password, phone]
    );

    return res.json({
      msg: "Register berhasil",
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        msg: "Email sudah digunakan",
      });
    }

    console.error(err);
    return res.status(500).json(err);
  }
};

// ==================== LOGIN ====================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        msg: "Email dan password wajib diisi",
      });
    }

    const [result] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (result.length === 0) {
      return res.status(401).json({
        msg: "Email atau password salah",
      });
    }

    const user = result[0];

    if (password !== user.password) {
      return res.status(401).json({
        msg: "Email atau password salah",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES,
      }
    );

    delete user.password;

    return res.json({
      msg: "Login berhasil",
      token,
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
};

// ==================== FORGOT PASSWORD ====================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        msg: "Email wajib diisi",
      });
    }

    const [result] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (result.length === 0) {
      return res.json({
        msg: "Jika email terdaftar, link reset akan dikirim",
      });
    }

    const user = result[0];

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
      [token, expires, user.id]
    );

    console.log(
      `Reset link: http://localhost:3000/reset-password?token=${token}`
    );

    return res.json({
      msg: "Jika email terdaftar, link reset akan dikirim",
      devToken: token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
};

// ==================== RESET PASSWORD ====================
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        msg: "Token dan password baru wajib diisi",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        msg: "Password minimal 8 karakter",
      });
    }

    const [result] = await db.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
      [token]
    );

    if (result.length === 0) {
      return res.status(400).json({
        msg: "Token tidak valid atau sudah kedaluwarsa",
      });
    }

    const user = result[0];

    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
      [password, user.id]
    );

    return res.json({
      msg: "Password berhasil diubah",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
};

// ==================== GET ME (profil user yang login) ====================
export const getMe = async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    return res.json(result[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
};