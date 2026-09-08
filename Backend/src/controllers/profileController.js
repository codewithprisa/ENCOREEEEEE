import db from "../config/db.js";


// ======================================================
// GET PROFILE
// GET /api/profile
// ======================================================
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        photo
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });

  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data profile",
    });
  }
};


// ======================================================
// UPDATE PROFILE
// PUT /api/profile
// ======================================================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      photo,
      currentPassword,
      newPassword,
    } = req.body;


    // ==================================================
    // VALIDASI NAMA
    // ==================================================

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nama wajib diisi",
      });
    }


    // ==================================================
    // CARI USER
    // ==================================================

    const [users] = await db.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        password,
        photo
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const user = users[0];


    // ==================================================
    // UPDATE NAMA + FOTO
    // ==================================================

    await db.query(
      `
      UPDATE users
      SET
        name = ?,
        photo = ?
      WHERE id = ?
      `,
      [
        name.trim(),
        photo || user.photo || null,
        userId,
      ]
    );


    // ==================================================
    // GANTI PASSWORD
    // ==================================================

    if (currentPassword || newPassword) {

      // Dua-duanya wajib diisi
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Kata sandi saat ini dan kata sandi baru wajib diisi",
        });
      }


      // Password minimal 6 karakter
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Kata sandi baru minimal 6 karakter",
        });
      }


      // Cek password lama
      if (currentPassword !== user.password) {
        return res.status(400).json({
          success: false,
          message:
            "Kata sandi saat ini salah",
        });
      }


      // Update password
      await db.query(
        `
        UPDATE users
        SET password = ?
        WHERE id = ?
        `,
        [
          newPassword,
          userId,
        ]
      );
    }


    // ==================================================
    // AMBIL DATA TERBARU
    // ==================================================

    const [updatedRows] = await db.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        photo
      FROM users
      WHERE id = ?
      `,
      [userId]
    );


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,
      message: "Profile berhasil diperbarui",
      data: updatedRows[0],
    });

} catch (error) {
  console.error("=================================");
  console.error("UPDATE PROFILE ERROR");
  console.error("MESSAGE:", error.message);
  console.error("CODE:", error.code);
  console.error("SQL:", error.sql);
  console.error("=================================");

  return res.status(500).json({
    success: false,
    message: "Gagal memperbarui profile",
    error: error.message,
  });
}
};