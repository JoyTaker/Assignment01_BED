
const dbConfig = require("../dbConfig");
const sql = require("mssql");


async function addNote (medication_id, note_text, is_deleted = 0) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);
        
        const request = connection.request();
        request.input("medication_id", sql.Int, medication_id);
        request.input("note_text", sql.NVarChar(255), note_text);
        request.input("is_deleted", sql.Bit, is_deleted);

        const query = `
            INSERT INTO MedicationNotes (medication_id, note_text, is_deleted)
            VALUES (@medication_id, @note_text, @is_deleted)
        `;

        await request.query(query);

        return {success : true, message: "Notification added successfully"}

    } catch (err) {
        console.error( `Error adding notifications: ${err}`);
        return {success: false, message: err.message};
    }
}

async function getNote(medication_id) {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .input("medication_id", sql.Int, medication_id)
        .query(`
            SELECT medication_id, note_text FROM     
            MedicationNotes 
            WHERE medication_id = @medication_id AND is_deleted = 0
        `)
    return result.recordset;
}

async function getAutoNoteFields(id) {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            SELECT *
                FROM Medications
                WHERE repeat_times IS NOT NULL
                AND start_hour IS NOT NULL
                AND end_hour IS NOT NULL
                AND repeat_duration IS NOT NULL
                AND id = @id;
            `);
        return result.recordset;
}

module.exports = {
    addNote, 
    getNote,
    getAutoNoteFields
};