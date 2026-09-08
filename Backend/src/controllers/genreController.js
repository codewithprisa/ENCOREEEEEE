import db from "../config/db.js";

export const getAllGenres = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, genre_name, color_bg, color_text, color_swatch
      FROM genres
      ORDER BY genre_name ASC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// UPDATE GENRE
export const updateGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const { genre_name, color_bg, color_text, color_swatch } = req.body;

    const [genre] = await db.query(
      "SELECT * FROM genres WHERE id = ?",
      [id]
    );

    if (genre.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Genre tidak ditemukan",
      });
    }

    await db.query(
      `
      UPDATE genres
      SET genre_name = ?, color_bg = ?, color_text = ?, color_swatch = ?
      WHERE id = ?
      `,
      [genre_name, color_bg, color_text, color_swatch, id]
    );

    res.json({
      success: true,
      message: "Genre berhasil diupdate",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE GENRE — tidak berubah
export const deleteGenre = async (req, res) => {
  try {
    const { id } = req.params;

    const [genre] = await db.query(
      "SELECT * FROM genres WHERE id = ?",
      [id]
    );

    if (genre.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Genre tidak ditemukan",
      });
    }

    await db.query("DELETE FROM genres WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Genre berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const createGenre = async (req, res) => {
  try {
    const { genre_name, color_bg, color_text, color_swatch } = req.body;

    const [result] = await db.query(
      `
      INSERT INTO genres (genre_name, color_bg, color_text, color_swatch)
      VALUES (?, ?, ?, ?)
      `,
      [genre_name, color_bg, color_text, color_swatch]
    );

    res.status(201).json({
      id: result.insertId,
      message: "Genre berhasil ditambahkan",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};