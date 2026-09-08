import db from "../config/db.js";

export const getPayments = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.*,
        o.invoice_number,
        u.name AS customer_name
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      JOIN users u ON o.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM payments WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Pembayaran tidak ditemukan",
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const createPayment = async (req, res) => {
  try {
    const {
      order_id,
      payment_method,
      transaction_code,
      amount,
      payment_status,
      payment_date,
    } = req.body;

    await db.query(
      `INSERT INTO payments
      (order_id, payment_method, transaction_code, amount, payment_status, payment_date)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        order_id,
        payment_method,
        transaction_code,
        amount,
        payment_status || "pending",
        payment_date,
      ]
    );

    res.status(201).json({
      message: "Pembayaran berhasil ditambahkan",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      payment_method,
      transaction_code,
      amount,
      payment_status,
      payment_date,
    } = req.body;

    const [result] = await db.query(
      `UPDATE payments
      SET
      payment_method = ?,
      transaction_code = ?,
      amount = ?,
      payment_status = ?,
      payment_date = ?
      WHERE id = ?`,
      [
        payment_method,
        transaction_code,
        amount,
        payment_status,
        payment_date,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Pembayaran tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Pembayaran berhasil diperbarui",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM payments WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Pembayaran tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Pembayaran berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};