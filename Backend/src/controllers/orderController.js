import db from "../config/db.js";

export const getOrders = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        o.id,
        o.invoice_number,

        u.name AS customer_name,
        u.phone AS customer_phone,

        e.title AS event_title,

        o.total_amount,

        CASE
          WHEN o.order_status = 'cancelled'
          THEN 'DIBATALKAN'
          ELSE 'TIDAK DIBATALKAN'
        END AS cancellation_status,

        o.order_status,
        o.payment_status,
        o.order_date

      FROM orders o

      JOIN users u
        ON o.user_id = u.id

      LEFT JOIN order_items oi
        ON o.id = oi.order_id

      LEFT JOIN ticket_types tt
        ON oi.ticket_type_id = tt.id

      LEFT JOIN events e
        ON tt.event_id = e.id

      ORDER BY o.order_date DESC
    `);

    res.status(200).json(rows);

  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    res.status(500).json({
      message: error.message
    });
  }
};


export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT
        o.*,
        u.name,
        u.email,
        u.phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Pesanan tidak ditemukan"
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      user_id,
      invoice_number,
      total_amount,
      payment_status,
      order_status,
      items
    } = req.body;

    // Validasi
    if (!user_id) {
      return res.status(400).json({
        message: "user_id wajib diisi"
      });
    }

    if (!invoice_number) {
      return res.status(400).json({
        message: "invoice_number wajib diisi"
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Minimal harus ada 1 tiket"
      });
    }

    await connection.beginTransaction();

    // =====================================
    // 1. BUAT ORDER
    // =====================================

    const [orderResult] = await connection.query(`
      INSERT INTO orders
      (
        user_id,
        invoice_number,
        total_amount,
        payment_status,
        order_status
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      user_id,
      invoice_number,
      total_amount,
      payment_status || "pending",
      order_status || "waiting_payment"
    ]);

    const orderId = orderResult.insertId;

    // =====================================
    // 2. MASUKKAN ORDER ITEMS
    // =====================================

    for (const item of items) {

      await connection.query(`
        INSERT INTO order_items
        (
          order_id,
          ticket_type_id,
          seat_id,
          quantity,
          price,
          ticket_status
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        item.ticket_type_id,
        item.seat_id || null,
        item.quantity || 1,
        item.price,
        "active"
      ]);

    }

    // =====================================
    // 3. SIMPAN SEMUA
    // =====================================

    await connection.commit();

    res.status(201).json({
      message: "Pesanan berhasil dibuat",
      order_id: orderId,
      invoice_number
    });

  } catch (error) {

    await connection.rollback();

    console.error("CREATE ORDER ERROR:", error);

    res.status(500).json({
      message: error.message
    });

  } finally {
    connection.release();
  }
};


export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      payment_status,
      order_status
    } = req.body;

    const [result] = await db.query(`
      UPDATE orders
      SET
      payment_status = ?,
      order_status = ?
      WHERE id = ?
    `, [
      payment_status,
      order_status,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Pesanan tidak ditemukan"
      });
    }

    res.status(200).json({
      message: "Status pesanan berhasil diperbarui"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM orders WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Pesanan tidak ditemukan"
      });
    }

    res.status(200).json({
      message: "Pesanan berhasil dihapus"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};