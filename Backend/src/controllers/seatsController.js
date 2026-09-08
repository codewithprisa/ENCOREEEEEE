import db from "../config/db.js";

export const getSeats = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        s.*,
        e.title AS event_name,
        tt.ticket_name
      FROM seats s
      JOIN events e ON s.event_id = e.id
      JOIN ticket_types tt ON s.ticket_type_id = tt.id
      ORDER BY s.section, s.row_name, s.seat_number
    `);

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSeatById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM seats WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Kursi tidak ditemukan",
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const createSeat = async (req, res) => {
  try {
    const {
      event_id,
      ticket_type_id,
      section,
      row_name,
      seat_number,
      status,
    } = req.body;

    await db.query(
      `INSERT INTO seats
      (event_id, ticket_type_id, section, row_name, seat_number, status)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        event_id,
        ticket_type_id,
        section,
        row_name,
        seat_number,
        status || "available",
      ]
    );

    res.status(201).json({
      message: "Kursi berhasil ditambahkan",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateSeat = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      section,
      row_name,
      seat_number,
      status,
    } = req.body;

    const [result] = await db.query(
      `UPDATE seats
      SET section = ?,
          row_name = ?,
          seat_number = ?,
          status = ?
      WHERE id = ?`,
      [
        section,
        row_name,
        seat_number,
        status,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Kursi tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Kursi berhasil diperbarui",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteSeat = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM seats WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Kursi tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Kursi berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getSeatsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [rows] = await db.query(
      `SELECT *
       FROM seats
       WHERE event_id = ?
       ORDER BY section, row_name, seat_number`,
      [eventId]
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};