import db from "../config/db.js";
import fs from "fs";
import path from "path";

// ===============================
// GET ALL EVENTS
// ===============================
export const getEvents = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        e.*,

        u.name AS admin_name,

        v.venue_name,
        v.city,
        a.photo AS artist_photo,
        a.genre_id,
        g.genre_name AS artist_genre,

        COALESCE(SUM(t.sold),0) AS total_sold,
        COALESCE(SUM(t.quota),0) AS total_quota,
        MIN(t.price) AS min_price,
        MAX(t.price) AS max_price

        FROM events e
        JOIN users u ON e.admin_id = u.id

        LEFT JOIN venues v ON e.venue_id = v.id
        LEFT JOIN artists a ON e.artist_id = a.id
        LEFT JOIN genres g ON e.genre_id = g.id
        LEFT JOIN ticket_types t ON t.event_id = e.id

      GROUP BY
        e.id,
        u.name,
        v.venue_name,
        v.city,
        a.id,
        a.artist_name,
        a.photo,
        a.genre_id,
        g.genre_name

      ORDER BY e.event_date ASC
    `);
const eventsWithPoster = rows.map((event) => {
  if (!event.poster) {
    return event;
  }

  const posterPath = path.join(
    process.cwd(),
    "src",
    "uploads",
    "poster",
    event.poster
  );

  try {
    const imageBuffer = fs.readFileSync(posterPath);

    const ext = path.extname(event.poster).toLowerCase();

    let mimeType = "image/jpeg";

    if (ext === ".png") {
      mimeType = "image/png";
    }

    if (ext === ".webp") {
      mimeType = "image/webp";
    }

    return {
      ...event,
      poster: `data:${mimeType};base64,${imageBuffer.toString("base64")}`,
    };
  } catch (error) {
    console.error("Gagal membaca poster:", posterPath);

    return {
      ...event,
      poster: null,
    };
  }
});

res.json(eventsWithPoster);
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// GET FEATURED EVENTS
// Event terbaru, maksimal 2 hari
// ===============================
export const getFeaturedEvents = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        e.*,

        u.name AS admin_name,

        v.venue_name,
        v.city,

        a.artist_name,
        a.photo AS artist_photo,

        g.genre_name,

        COALESCE(SUM(t.sold), 0) AS total_sold,
        COALESCE(SUM(t.quota), 0) AS total_quota,
        MIN(t.price) AS min_price,
        MAX(t.price) AS max_price

      FROM events e

      JOIN users u
        ON e.admin_id = u.id

      LEFT JOIN venues v
        ON e.venue_id = v.id

      LEFT JOIN artists a
        ON e.artist_id = a.id

      LEFT JOIN genres g
        ON e.genre_id = g.id

      LEFT JOIN ticket_types t
        ON t.event_id = e.id

      WHERE e.status = 'published'

      GROUP BY
        e.id,
        u.name,
        v.venue_name,
        v.city,
        a.id,
        a.artist_name,
        a.photo,
        g.genre_name

      ORDER BY e.created_at DESC

      LIMIT 5
    `);

    const eventsWithPoster = rows.map((event) => {
      console.log("FEATURED ROWS:", rows);
console.log("JUMLAH FEATURED:", rows.length);
      if (!event.poster) {
        return event;
      }

      const posterPath = path.join(
        process.cwd(),
        "src",
        "uploads",
        "poster",
        event.poster
      );

      try {
        const imageBuffer = fs.readFileSync(posterPath);

        const ext = path.extname(event.poster).toLowerCase();

        let mimeType = "image/jpeg";

        if (ext === ".png") {
          mimeType = "image/png";
        }

        if (ext === ".webp") {
          mimeType = "image/webp";
        }

        return {
          ...event,
          poster: `data:${mimeType};base64,${imageBuffer.toString("base64")}`,
        };
      } catch (error) {
        console.error("Gagal membaca poster:", posterPath);

        return {
          ...event,
          poster: null,
        };
      }
    });

    res.json(eventsWithPoster);

  } catch (error) {
    console.error("GET FEATURED EVENTS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// GET EVENT BY ID
// ===============================
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        e.*,

        u.name AS admin_name,

        v.venue_name,
        v.address,
        v.city,

        a.id AS artist_id,
        a.artist_name,
        a.photo AS artist_photo,
        a.genre_id,
        g.genre_name AS artist_genre,

        COALESCE(SUM(t.sold),0) AS total_sold,
        COALESCE(SUM(t.quota),0) AS total_quota,
        MIN(t.price) AS min_price,
        MAX(t.price) AS max_price

        FROM events e
        JOIN users u ON e.admin_id = u.id

        LEFT JOIN artists a ON e.artist_id = a.id
        LEFT JOIN genres g ON e.genre_id = g.id
        LEFT JOIN venues v ON e.venue_id = v.id
        LEFT JOIN ticket_types t ON t.event_id = e.id

      WHERE e.id = ?

      GROUP BY
        e.id,
        u.name,
        v.venue_name,
        v.address,
        v.city,
        a.id,
        a.artist_name,
        a.photo,
        a.genre_id,
        g.genre_name
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Event tidak ditemukan",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("GET EVENT DETAIL ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// CREATE EVENT
// ===============================
export const createEvent = async (req, res) => {
  try {
    const {
      admin_id,
      genre_id,
      title,
      description,
      event_date,
      ticket_open,
      ticket_close,
      terms_conditions,
      refund_policy,
      status,
    } = req.body;

    const artists = JSON.parse(req.body.artists || "[]");

    const venue_id = null;
    const artist_id =
      artists.length > 0 && artists[0].id
        ? Number(artists[0].id)
        : null;

    const poster = req.file ? req.file.filename : null;
    console.log("BODY:", req.body);

console.log("ARTISTS:", artists);

console.log("ARTIST ID:", artist_id);
console.log(req.body);

    const [result] = await db.query(
      `
      INSERT INTO events (
        admin_id,
        venue_id,
        title,
        description,
        artist_id,
        genre_id,
        event_date,
        ticket_open,
        ticket_close,
        poster,
        terms_conditions,
        refund_policy,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        admin_id,
        venue_id,
        title,
        description,
        artist_id,
        genre_id ? Number(genre_id) : null,
        event_date || null,
        ticket_open || null,
        ticket_close || null,
        poster,
        terms_conditions || null,
        refund_policy || null,
        status || "draft",
      ]
    );

    res.status(201).json({
      message: "Event berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// UPDATE EVENT
// ===============================
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
const {
  genre_id,
  title,
  description,
  event_date,
  ticket_open,
  ticket_close,
  terms_conditions,
  refund_policy,
  status,
} = req.body;

const artists = JSON.parse(req.body.artists || "[]");

const artist_id =
  artists.length > 0 && artists[0].id
    ? Number(artists[0].id)
    : null;

    const venue_id = null;

    const [event] = await db.query(
      "SELECT poster FROM events WHERE id = ?",
      [id]
    );

    if (event.length === 0) {
      return res.status(404).json({
        message: "Event tidak ditemukan",
      });
    }

    const poster = req.file
      ? req.file.filename
      : event[0].poster;
      console.log(req.body);

    await db.query(
      `
        UPDATE events SET
        artist_id=?,
        genre_id=?,
        venue_id=?,
        title=?,
        description=?,
        event_date=?,
        ticket_open=?,
        ticket_close=?,
        poster=?,
        terms_conditions=?,
        refund_policy=?,
        status=?
        WHERE id=?
      `,
      [
        artist_id,
        genre_id,
        venue_id,
        title,
        description,
        event_date,
        ticket_open,
        ticket_close,
        poster,
        terms_conditions,
        refund_policy,
        status,
        id,
      ]
    );

    res.json({
      message: "Event berhasil diupdate",
    });
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// DELETE EVENT
// ===============================
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM events WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Event tidak ditemukan",
      });
    }

    res.json({
      message: "Event berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};


// ===============================
// SAVE SEATMAP
// ===============================
export const saveSeatmap = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;
    const { hargaBase, rows } = req.body;

    if (!id) {
      return res.status(400).json({
        msg: "Event ID wajib diisi",
      });
    }

    if (!Array.isArray(rows)) {
      return res.status(400).json({
        msg: "Data rows tidak valid",
      });
    }

    // Cek event
    const [events] = await connection.query(
      "SELECT id FROM events WHERE id = ?",
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        msg: "Event tidak ditemukan",
      });
    }

    // Ambil tipe tiket event
    const [ticketTypes] = await connection.query(
      `
      SELECT id, ticket_name
      FROM ticket_types
      WHERE event_id = ?
      ORDER BY id ASC
      `,
      [id]
    );

    if (ticketTypes.length === 0) {
      return res.status(400).json({
        msg: "Event belum memiliki tipe tiket",
      });
    }

    // Mapping nama kategori ke ticket_type_id
    await connection.beginTransaction();

    // Hapus denah lama event ini
    await connection.query(
      "DELETE FROM seats WHERE event_id = ?",
      [id]
    );

    // Simpan semua kursi
    for (const row of rows) {
      for (const seat of row.seats) {
        // Lewati bagian lorong/kosong
        if (seat.nomor === null || seat.kind === "kosong") {
          continue;
        }

        const ticketTypeId = seat.ticketTypeId;

        if (!ticketTypeId) {
          throw new Error(
            `Kursi ${row.label}-${seat.nomor} belum memiliki tipe tiket`
          );
        }

        let status = "available";

        if (seat.terjual) {
          status = "sold";
        }

        await connection.query(
          `
          INSERT INTO seats (
            event_id,
            ticket_type_id,
            section,
            row_name,
            seat_number,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            id,
            ticketTypeId,
            seat.kind,
            row.label,
            String(seat.nomor),
            status,
          ]
        );
      }
    }

    await connection.commit();

    res.json({
      message: "Denah kursi berhasil disimpan",
    });
  } catch (error) {
    await connection.rollback();

    console.error("SAVE SEATMAP ERROR:", error);

    res.status(500).json({
      msg: error.message,
    });
  } finally {
    connection.release();
  }
};