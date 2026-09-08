import db from "../config/db.js";

export const getNotifications = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        n.*,
        u.name
      FROM notifications n
      JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Notifikasi tidak ditemukan",
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      `SELECT *
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const createNotification = async (req, res) => {
  try {
    const {
      user_id,
      title,
      message,
      type,
    } = req.body;

    await db.query(
      `INSERT INTO notifications
      (user_id, title, message, type)
      VALUES (?, ?, ?, ?)`,
      [
        user_id,
        title,
        message,
        type,
      ]
    );

    res.status(201).json({
      message: "Notifikasi berhasil dikirim",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const readNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Notifikasi tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Notifikasi telah dibaca",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM notifications WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Notifikasi tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Notifikasi berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

