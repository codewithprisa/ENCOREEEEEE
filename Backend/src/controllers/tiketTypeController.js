import db from "../config/db.js";

export const getTicketTypes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        tt.*,
        e.title AS event_name
      FROM ticket_types tt
      JOIN events e ON tt.event_id = e.id
      ORDER BY tt.id DESC
    `);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getTicketTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM ticket_types WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Jenis tiket tidak ditemukan",
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const createTicketType = async (req, res) => {
  try {
    const {
      event_id,
      ticket_name,
      description,
      price,
      quota,
      status,
    } = req.body;

    await db.query(
      `INSERT INTO ticket_types
      (event_id, ticket_name, description, price, quota, sale_start, sale_end, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event_id,
        ticket_name,
        description,
        price,
        quota,
        sale_start,
        sale_end,
        status || "active",
      ]
    );

    res.status(201).json({
      message: "Jenis tiket berhasil ditambahkan",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateTicketType = async (req, res) => {
  try {
    const { id } = req.params;

    const {
    ticket_name,
    description,
    price,
    quota,
    sold,
    status,
    color,
    } = req.body;

const [result] = await db.query(
  `UPDATE ticket_types SET
  ticket_name = ?,
  description = ?,
  price = ?,
  quota = ?,
  sold = ?,
  status = ?,
  color = ?
  WHERE id = ?`,
  [
    ticket_name,
    description,
    price,
    quota,
    sold,
    status,
    color,
    id,
  ]
);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Jenis tiket tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Jenis tiket berhasil diperbarui",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteTicketType = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM ticket_types WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Jenis tiket tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Jenis tiket berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getTicketTypesByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [rows] = await db.query(
      `SELECT *
      FROM ticket_types
      WHERE event_id = ?
      AND status = 'active'
      ORDER BY price ASC`,
      [eventId]
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
