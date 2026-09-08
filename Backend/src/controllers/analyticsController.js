import db from "../config/db.js";

export const getTotalRevenue = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT SUM(total_amount) AS total_revenue
      FROM orders
      WHERE payment_status = 'paid'
    `);

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getTotalOrders = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS total_orders
      FROM orders
    `);

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getTotalTicketsSold = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT SUM(quantity) AS tickets_sold
      FROM order_items
    `);

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getBestSellingEvents = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        e.title,
        SUM(oi.quantity) AS total_ticket
      FROM order_items oi
      JOIN ticket_types tt ON oi.ticket_type_id = tt.id
      JOIN events e ON tt.event_id = e.id
      GROUP BY e.id
      ORDER BY total_ticket DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getPaymentStatistics = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        payment_status,
        COUNT(*) AS total
      FROM payments
      GROUP BY payment_status
    `);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getRefundStatistics = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        status,
        COUNT(*) AS total
      FROM refunds
      GROUP BY status
    `);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTargetSales = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT SUM(quota) AS target_sales
      FROM ticket_types
    `);

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};