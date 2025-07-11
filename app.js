const express = require('express');
const cors = require('cors'); 
const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

const {
    getFilteredMedications,
    getMedicationById,
    getAllMedicationByDate,
    deleteMedicationById
} = require('./controllers/medicationController');

const notificationController = require("./controllers/medicationNoteController");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Medication routes
app.get('/medications', getFilteredMedications);
app.get('/medications/by-date', getAllMedicationByDate);
app.get('/medications/:id', getMedicationById);
app.delete('/medications/:id', deleteMedicationById);

// Medication notes routes
app.post('/medication-notes', notificationController.createNote);
app.get('/medication-notes', notificationController.retrieveNote);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});
