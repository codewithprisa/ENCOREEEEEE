import db from "../config/db.js";

// =======================
// GET ALL TICKETS
// =======================
export const getAllTickets = (req, res) => {
    const sql = `
        SELECT
            tt.*,
            e.title AS event_title
        FROM ticket_types tt
        JOIN events e ON tt.event_id = e.id
        ORDER BY tt.id DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal mengambil data tiket",
                error: err.message,
            });
        }

        res.status(200).json({
            success: true,
            data: result,
        });
    });
};

// =======================
// GET TICKET BY ID
// =======================
export const getTicketById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT *
        FROM ticket_types
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan",
                error: err.message,
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tiket tidak ditemukan",
            });
        }

        res.status(200).json({
            success: true,
            data: result[0],
        });
    });
};

// =======================
// CREATE TICKET
// =======================
export const createTicket = (req, res) => {
    const {
        event_id,
        ticket_name,
        description,
        price,
        quota,
        sale_start,
        sale_end,
    } = req.body;

    if (
        !event_id ||
        !ticket_name ||
        !price ||
        !quota ||
        !sale_start ||
        !sale_end
    ) {
        return res.status(400).json({
            success: false,
            message: "Semua data wajib diisi",
        });
    }

    const sql = `
        INSERT INTO ticket_types
        (
            event_id,
            ticket_name,
            description,
            price,
            quota,
            sale_start,
            sale_end
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            event_id,
            ticket_name,
            description,
            price,
            quota,
            sale_start,
            sale_end,
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Gagal menambahkan tiket",
                    error: err.message,
                });
            }

            res.status(201).json({
                success: true,
                message: "Tiket berhasil ditambahkan",
                id: result.insertId,
            });
        }
    );
};

// =======================
// UPDATE TICKET
// =======================
export const updateTicket = (req, res) => {
    const { id } = req.params;

    const {
        ticket_name,
        description,
        price,
        quota,
        sold,
        sale_start,
        sale_end,
        status,
    } = req.body;

    const sql = `
        UPDATE ticket_types
        SET
            ticket_name = ?,
            description = ?,
            price = ?,
            quota = ?,
            sold = ?,
            sale_start = ?,
            sale_end = ?,
            status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            ticket_name,
            description,
            price,
            quota,
            sold,
            sale_start,
            sale_end,
            status,
            id,
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Gagal mengubah tiket",
                    error: err.message,
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Tiket tidak ditemukan",
                });
            }

            res.status(200).json({
                success: true,
                message: "Tiket berhasil diperbarui",
            });
        }
    );
};

// =======================
// DELETE TICKET
// =======================
export const deleteTicket = (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM ticket_types
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Gagal menghapus tiket",
                error: err.message,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Tiket tidak ditemukan",
            });
        }

        res.status(200).json({
            success: true,
            message: "Tiket berhasil dihapus",
        });
    });
};