import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_konser",
});

// opsional: cek koneksi saat server start
(async () => {
  try {
    const conn = await db.getConnection();
    console.log("DB Connected");
    conn.release();
  } catch (err) {
    console.error("DB ERROR:", err.message);
  }
})();

export default db;