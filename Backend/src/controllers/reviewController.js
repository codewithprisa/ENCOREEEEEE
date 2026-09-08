import db from "../config/db.js";

export const createReview = async (req, res) => {
  try {
    const { user_id, event_id, rating, review } = req.body;

    await db.query(
      `INSERT INTO reviews
      (user_id,event_id,rating,review)
      VALUES (?,?,?,?)`,
      [user_id, event_id, rating, review]
    );

    res.status(201).json({
      message: "Review berhasil ditambahkan",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


export const getReviewByEvent = async (req, res) => {
  try {

    const { eventId } = req.params;

    const [rows] = await db.query(
      `
      SELECT
      r.id,
      r.rating,
      r.review,
      r.created_at,

      u.id user_id,
      u.name,
      u.profile_picture

      FROM reviews r

      JOIN users u
      ON r.user_id=u.id

      WHERE r.event_id=?
      AND r.status='visible'

      ORDER BY r.created_at DESC
      `,
      [eventId]
    );

    res.json(rows);

  } catch (err) {

    res.status(500).json({
      message: err.message,
    });

  }
};

export const getReviewSummary = async (req, res) => {

    const { eventId } = req.params;

    const [rows] = await db.query(`
        SELECT

        COUNT(*) total_review,

        ROUND(AVG(rating),1) average_rating

        FROM reviews

        WHERE event_id=?
        AND status='visible'
    `,[eventId]);

    res.json(rows[0]);

}

