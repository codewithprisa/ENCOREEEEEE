import db from "../config/db.js";

export const getAllArtis = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        a.id,
        a.artist_name,
        a.genre_id,
        g.genre_name,
        a.photo,
        a.description
      FROM artists a
      JOIN genres g ON a.genre_id = g.id
      ORDER BY a.id DESC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const createArtis = async (req, res) => {
  try {
    const { artist_name, genre_id, description } = req.body;

    const photo = req.file ? req.file.filename : null;

    const [result] = await db.query(
      `
      INSERT INTO artists
      (artist_name, genre_id, photo, description)
      VALUES (?, ?, ?, ?)
      `,
      [artist_name, genre_id, photo, description]
    );

    res.status(201).json({
      success: true,
      message: "Artis berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateArtis = async (req, res) => {
  try {
    const { id } = req.params;
    const { artist_name, genre_id, description } = req.body;

    // cek data lama
    const [oldData] = await db.query(
      "SELECT photo FROM artists WHERE id = ?",
      [id]
    );

    if (oldData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Artis tidak ditemukan",
      });
    }

    // jika ada foto baru gunakan foto baru
    const photo = req.file 
      ? req.file.filename 
      : oldData[0].photo;

    await db.query(
      `
      UPDATE artists
      SET 
        artist_name = ?,
        genre_id = ?,
        photo = ?,
        description = ?
      WHERE id = ?
      `,
      [
        artist_name,
        genre_id,
        photo,
        description,
        id,
      ]
    );

    res.json({
      success: true,
      message: "Artis berhasil diupdate",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteArtis = async (req, res) => {
  try {
    const { id } = req.params;

    // cek apakah artis ada
    const [artis] = await db.query(
      "SELECT * FROM artists WHERE id = ?",
      [id]
    );

    if (artis.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Artis tidak ditemukan",
      });
    }

    await db.query(
      "DELETE FROM artists WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Artis berhasil dihapus",
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};