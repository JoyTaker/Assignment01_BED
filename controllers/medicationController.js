const medicationModel = require('../models/medicationModels');

async function getFilteredMedications(req, res) {
  const { date, start, end } = req.query;
  console.log("Incoming query:", date, start, end);
  try {
    const medications = await medicationModel.getMedicationsByDateAndTime(date, parseInt(start), parseInt(end));
    res.status(200).json(medications);
  } catch (err) {
    console.error("Error in getFilteredMedications:", err);
    res.status(500).send('Server error');
  }
}

async function getAllMedicationByDate (req, res) {
    const { date } = req.query;
    console.log("Incoming query", date);

    try {
      const medications = await medicationModel.getAllMedicationsByDate(date);
      res.status(200).json(medications);
    } catch (err) {
      console.error("Error in getAllMedicationsByDate: ", err);
      res.status(500).send('Server error');
    }
}

async function getMedicationById(req, res) {
  const { id } = req.params;
  try {
    const medication = await medicationModel.getMedicationById(id);
    if (medication) {
      res.status(200).json(medication);
    } else {
      res.status(404).send('Medication not found');
    }
  } catch (err) {
    console.error("Error in getMedicationById:", err);
    res.status(500).send('Server error');
  }
}

async function deleteMedicationById(req, res) {
  const { id } = req.params;  // Get the medication ID from the request params

  if (!id) {
    return res.status(400).json({ message: "Medication ID is required" });  // Ensure an ID is provided
  }

  try {
    const result = await medicationModel.deleteMedicationById(id);  // Call the model function to delete medication

    if (result.success) {
      return res.status(200).json({ message: "Medication and associated notes deleted successfully" });
    } else {
      return res.status(404).json({ message: result.message || "Medication not found" });
    }
  } catch (err) {
    console.error("Error in deleteMedicationById controller:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


module.exports = {
  getFilteredMedications,
  getMedicationById,
  getAllMedicationByDate, 
  deleteMedicationById
};
