import db from "../config/db.js";

// ======================================================
// GET ALL REFUNDS
// ======================================================
export const getRefunds = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        r.id AS refund_id,

        u.id AS user_id,
        u.name AS customer_name,

        o.id AS order_id,
        o.invoice_number,

        e.id AS event_id,
        e.title AS event_title,
        e.event_date,

        r.refund_amount,
        r.reason,
        r.status,
        r.admin_notes,
        r.requested_at,
        r.processed_at

      FROM refunds r

      JOIN orders o
        ON r.order_id = o.id

      JOIN users u
        ON o.user_id = u.id

      JOIN order_items oi
        ON o.id = oi.order_id

      JOIN ticket_types tt
        ON oi.ticket_type_id = tt.id

      JOIN events e
        ON tt.event_id = e.id

      ORDER BY r.requested_at DESC
    `);

    res.status(200).json(rows);

  } catch (error) {
    console.error("GET REFUNDS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ======================================================
// GET REFUND BY ID
// ======================================================
export const getRefundById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        r.*,
        o.invoice_number,
        u.name AS customer_name
      FROM refunds r
      JOIN orders o
        ON r.order_id = o.id
      JOIN users u
        ON o.user_id = u.id
      WHERE r.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Refund tidak ditemukan",
      });
    }

    res.status(200).json(rows[0]);

  } catch (error) {
    console.error("GET REFUND BY ID ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ======================================================
// CREATE REFUND
// ======================================================
export const createRefund = async (req, res) => {
  try {
    const {
      order_id,
      reason,
      refund_amount,
      status,
      admin_notes,
    } = req.body;

    await db.query(
      `
      INSERT INTO refunds
      (
        order_id,
        reason,
        refund_amount,
        status,
        admin_notes
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        order_id,
        reason,
        refund_amount,
        status || "pending",
        admin_notes || null,
      ]
    );

    res.status(201).json({
      message: "Permintaan refund berhasil dibuat",
    });

  } catch (error) {
    console.error("CREATE REFUND ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ======================================================
// PROCESS REFUND
// ADMIN: APPROVED / REJECTED
// ======================================================
export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status harus approved atau rejected",
      });
    }

    const [result] = await db.query(
      `
      UPDATE refunds
      SET
        status = ?,
        admin_notes = ?,
        processed_at = NOW()
      WHERE id = ?
        AND status = 'pending'
      `,
      [
        status,
        admin_notes || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Refund tidak ditemukan atau sudah diproses",
      });
    }

    res.status(200).json({
      message:
        status === "approved"
          ? "Refund berhasil diterima"
          : "Refund berhasil ditolak",
    });

  } catch (error) {
    console.error("PROCESS REFUND ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ======================================================
// UPDATE REFUND
// ======================================================
export const updateRefund = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      reason,
      refund_amount,
      status,
      admin_notes,
      processed_at,
    } = req.body;

    const [result] = await db.query(
      `
      UPDATE refunds
      SET
        reason = ?,
        refund_amount = ?,
        status = ?,
        admin_notes = ?,
        processed_at = ?
      WHERE id = ?
      `,
      [
        reason,
        refund_amount,
        status,
        admin_notes,
        processed_at,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Refund tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Refund berhasil diperbarui",
    });

  } catch (error) {
    console.error("UPDATE REFUND ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ======================================================
// DELETE REFUND
// ======================================================
export const deleteRefund = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM refunds WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Refund tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Refund berhasil dihapus",
    });

  } catch (error) {
    console.error("DELETE REFUND ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};