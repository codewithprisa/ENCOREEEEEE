import db from "../config/db.js";

export const getPromos = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM promo_codes ORDER BY created_at DESC"
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getPromoById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM promo_codes WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Promo tidak ditemukan",
      });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const createPromo = async (req, res) => {
  try {
    const {
      code,
      promo_name,
      description,
      discount_type,
      discount_value,
      minimum_purchase,
      maximum_discount,
      quota,
      start_date,
      end_date,
      status,
    } = req.body;

    await db.query(
      `INSERT INTO promo_codes
      (code, promo_name, description, discount_type,
      discount_value, minimum_purchase,
      maximum_discount, quota,
      start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        promo_name,
        description,
        discount_type,
        discount_value,
        minimum_purchase,
        maximum_discount,
        quota,
        start_date,
        end_date,
        status || "active",
      ]
    );

    res.status(201).json({
      message: "Promo berhasil ditambahkan",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updatePromo = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      code,
      promo_name,
      description,
      discount_type,
      discount_value,
      minimum_purchase,
      maximum_discount,
      quota,
      used,
      start_date,
      end_date,
      status,
    } = req.body;

    const [result] = await db.query(
      `UPDATE promo_codes
      SET code = ?,
          promo_name = ?,
          description = ?,
          discount_type = ?,
          discount_value = ?,
          minimum_purchase = ?,
          maximum_discount = ?,
          quota = ?,
          used = ?,
          start_date = ?,
          end_date = ?,
          status = ?
      WHERE id = ?`,
      [
        code,
        promo_name,
        description,
        discount_type,
        discount_value,
        minimum_purchase,
        maximum_discount,
        quota,
        used,
        start_date,
        end_date,
        status,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Promo tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Promo berhasil diperbarui",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const deletePromo = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM promo_codes WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Promo tidak ditemukan",
      });
    }

    res.status(200).json({
      message: "Promo berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


