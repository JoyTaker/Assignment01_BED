const sql = require('mssql');
const dbConfig = require('../dbConfig');



function toSqlTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0); // hours, minutes, seconds, milliseconds
  return d;
}



async function getMedicationsByDateAndTime(date) {
  const pool = await sql.connect(dbConfig);

  const result = await pool.request()
    .input('date', sql.Date, date)
    .query(`
      SELECT * FROM Medications
      WHERE schedule_date = @date
        AND is_deleted = 0
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

async function addMedication(medicationData) {
  const pool = await sql.connect(dbConfig);

  try {
    const result = await pool.request()
      .input('name', sql.VarChar(255), medicationData.name)
      .input('schedule_date', sql.Date, medicationData.schedule_date)
      .input('frequency_type', sql.VarChar(50), medicationData.frequency_type)
      .input('repeat_times', sql.Int, medicationData.repeat_times)
      .input('repeat_duration', sql.Int, medicationData.repeat_duration)
      .input('start_hour', sql.Time, toSqlTime(medicationData.start_hour))
      .input('end_hour', sql.Time, toSqlTime(medicationData.end_hour))
      .input('repeat_pattern', sql.VarChar(50), medicationData.repeat_pattern || 'Daily')
      .input('schedule_hour', sql.Int, medicationData.schedule_hour)
      .input('is_deleted', sql.Bit, 0)
      .query(`
        INSERT INTO Medications (
          name, schedule_date, frequency_type, repeat_times,
          repeat_duration, start_hour, end_hour, repeat_pattern, is_deleted, schedule_hour
        )
        VALUES (
          @name, @schedule_date, @frequency_type, @repeat_times,
          @repeat_duration, @start_hour, @end_hour, @repeat_pattern, @is_deleted, @schedule_hour
        )
      `);

    if (result.rowsAffected[0] > 0) {
      return { success: true, message: "Medication added successfully" };
    } else {
      return { success: false, message: "No medication was added" };
    }

  } catch (err) {
    console.error("Error adding medication:", err);
    return { success: false, message: "Error adding medication" };
  }
}


async function updateMedication(id, medicationData) {
  const pool = await sql.connect(dbConfig);


  try {
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.VarChar(255), medicationData.name)
      .input('schedule_date', sql.Date, medicationData.schedule_date)
      .input('frequency_type', sql.VarChar(50), medicationData.frequency_type)
      .input('repeat_times', sql.Int, medicationData.repeat_times)
      .input('repeat_duration', sql.Int, medicationData.repeat_duration)
      .input('start_hour', sql.Time, toSqlTime(medicationData.start_hour))
      .input('end_hour', sql.Time, toSqlTime(medicationData.end_hour))
      .input('repeat_pattern', sql.VarChar(50), medicationData.repeat_pattern || 'Daily')
      .query(`
        UPDATE Medications SET
          name = @name,
          schedule_date = @schedule_date,
          frequency_type = @frequency_type,
          repeat_times = @repeat_times,
          repeat_duration = @repeat_duration,
          start_hour = @start_hour,
          end_hour = @end_hour,
          repeat_pattern = @repeat_pattern
        WHERE id = @id
      `);

    if (result.rowsAffected[0] > 0) {
      return { success: true };
    } else {
      return { success: false, message: "No medication updated" };
    }
  } catch (err) {
    console.error("Error updating medication:", err);
    return { success: false, message: "Error updating medication" };
  }
}



module.exports = {
  getMedicationsByDateAndTime,
  getMedicationById,
  getAllMedicationsByDate, 
  deleteMedicationById,
  addMedication, 
  updateMedication
};