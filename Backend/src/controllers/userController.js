import db from "../config/db.js";

// READ - profil sendiri
export const getProfile = (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT id, name, email, role, profile_picture FROM users WHERE id = ?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0) return res.status(404).json({ msg: "User tidak ditemukan" });
      res.json(result[0]);
    }
  );
};

// READ - semua user (admin only)
export const getAllUsers = (req, res) => {
  db.query(
    "SELECT id, name, email, role, profile_picture FROM users",
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
};

// UPDATE - edit user
export const editUser = (req, res) => {
  const { id } = req.params;
  const { name, email, phone, password } = req.body;

  if (req.user.role !== "admin" && req.user.id !== parseInt(id)) {
    return res.status(403).json({ msg: "Kamu tidak boleh mengedit user lain" });
  }

  if (!name || !email) {
    return res.status(400).json({ msg: "Name dan email wajib diisi" });
  }

  let sql;
  let values;

  if (password && password.trim() !== "") {
    sql = "UPDATE users SET name = ?, email = ?, phone = ?, password = ? WHERE id = ?";
    values = [name, email, phone, password, id];
  } else {
    sql = "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?";
    values = [name, email, phone, id];
  }

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "User berhasil diupdate" });
  });
};

// DELETE - hapus user (admin only)
export const deleteUser = (req, res) => {
  const { id } = req.params;

  if (req.user.id === parseInt(id)) {
    return res.status(400).json({ msg: "Tidak bisa menghapus akun sendiri" });
  }

  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ msg: "User tidak ditemukan" });
    res.json({ msg: "User berhasil dihapus" });
  });
};

// PROMOTE - jadikan admin (admin only)
export const promoteUser = (req, res) => {
  const { id } = req.params;

  db.query("UPDATE users SET role = 'admin' WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0) return res.status(404).json({ msg: "User tidak ditemukan" });
    res.json({ msg: "User berhasil dijadikan admin" });
  });
};

// UPDATE PASSWORD
export const updatePassword = (req, res) => {
  const { old_password, new_password } = req.body;
  const userId = req.user.id;

  db.query("SELECT password FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) return res.status(500).json(err);

    const user = result[0];

    if (old_password !== user.password) {
      return res.status(400).json({ msg: "Password lama salah" });
    }

    db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [new_password, userId],
      (err2) => {
        if (err2) return res.status(500).json(err2);
        res.json({ msg: "Password berhasil diubah" });
      }
    );
  });
};