const sql = require('mssql');
const dbConfig = require('../dbConfig');

async function getMedicationsByDateAndTime(date, startHour, endHour) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('date', sql.Date, date)
    .input('startHour', sql.Int, startHour)
    .input('endHour', sql.Int, endHour)
    .query(`
     SELECT * FROM Medications
     WHERE schedule_date = @date AND is_deleted = 0
     ORDER BY schedule_hour
    `);
  return result.recordset;
}

async function getAllMedicationsByDate(date) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('date', sql.Date, date)
    .query(`
     SELECT * FROM Medications
     WHERE schedule_date = @date 
     AND is_deleted = 0
     ORDER BY id;
    `);
  return result.recordset;
}


async function getMedicationById(id) {
  const pool = await sql.connect(dbConfig);
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT * FROM Medications
      WHERE id = @id
    `);
  return result.recordset[0] || null;
}

async function deleteMedicationById(id) {
  const pool = await sql.connect(dbConfig);

  try {
    const medication_id = parseInt(id);
    if (isNaN(medication_id)) {
      throw new Error("Invalid medication ID");
    }

    await pool.request()
      .input('medication_id', sql.Int, medication_id)
      .query(`DELETE FROM MedicationNotes WHERE medication_id = @medication_id`);

    const result = await pool.request()
      .input('id', sql.Int, medication_id)  // Use medication_id here
      .query(`DELETE FROM Medications WHERE id = @id`);

    if (result.rowsAffected[0] > 0) {
      return { success: true };
    } else {
      return { success: false, message: "Medication not found" };
    }
  } catch (err) {
    console.error("Error executing query:", err);
    throw new Error("Error deleting medication");
  }
}


module.exports = {
  getMedicationsByDateAndTime,
  getMedicationById,
  getAllMedicationsByDate, 
  deleteMedicationById
};
