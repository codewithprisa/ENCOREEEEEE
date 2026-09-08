import db from "../config/db.js";

// CREATE - Tambah venue baru
export const createVenue = async (req, res) => {
  try {
    const {
      venue_name,
      address,
      city,
      capacity,
      seat_type,
      latitude,
      longitude,
      google_maps_link,
    } = req.body;

    if (!venue_name || !address || !city || !capacity || !seat_type) {
      return res.status(400).json({
        msg: "Venue name, address, city, capacity, dan seat_type wajib diisi",
      });
    }

    if (seat_type !== "seated" && seat_type !== "festival") {
      return res.status(400).json({
        msg: "seat_type harus 'seated' atau 'festival'",
      });
    }

    const [result] = await db.query(
      `INSERT INTO venues 
      (venue_name, address, city, capacity, seat_type, latitude, longitude, google_maps_link) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        venue_name,
        address,
        city,
        capacity,
        seat_type,
        latitude || null,
        longitude || null,
        google_maps_link || null,
      ]
    );

    res.json({
      msg: "Venue berhasil ditambahkan",
      id: result.insertId,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// READ - Ambil semua venue
export const getVenues = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM venues ORDER BY created_at DESC"
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// READ - Ambil satu venue
export const getVenueById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM venues WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        msg: "Venue tidak ditemukan",
      });
    }

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// UPDATE - Ubah venue
export const updateVenue = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      venue_name,
      address,
      city,
      capacity,
      seat_type,
      latitude,
      longitude,
      google_maps_link,
    } = req.body;


    if (!venue_name || !address || !city || !capacity || !seat_type) {
      return res.status(400).json({
        msg: "Venue name, address, city, capacity, dan seat_type wajib diisi",
      });
    }


    const [result] = await db.query(
      `UPDATE venues SET
      venue_name=?,
      address=?,
      city=?,
      capacity=?,
      seat_type=?,
      latitude=?,
      longitude=?,
      google_maps_link=?
      WHERE id=?`,
      [
        venue_name,
        address,
        city,
        capacity,
        seat_type,
        latitude || null,
        longitude || null,
        google_maps_link || null,
        id,
      ]
    );


    if (result.affectedRows === 0) {
      return res.status(404).json({
        msg:"Venue tidak ditemukan",
      });
    }


    res.json({
      msg:"Venue berhasil diperbarui",
    });


  } catch(err){
    res.status(500).json({
      message:err.message,
    });
  }
};


// DELETE - Hapus venue
export const deleteVenue = async (req,res)=>{
  try{

    const {id}=req.params;


    const [result]=await db.query(
      "DELETE FROM venues WHERE id=?",
      [id]
    );


    if(result.affectedRows===0){
      return res.status(404).json({
        msg:"Venue tidak ditemukan",
      });
    }


    res.json({
      msg:"Venue berhasil dihapus",
    });


  }catch(err){

    res.status(500).json({
      message:err.message,
    });

  }
};