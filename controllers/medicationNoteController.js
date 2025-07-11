const { addNote, getNote } = require("../models/medicationNoteModels"); // fixed file name

async function createNote(req, res) {
    const { medicationId, note_text } = req.body;

    // Use the correct variable name
    if (!medicationId || !note_text) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await addNote(medicationId, note_text); // pass medicationId

    if (result.success) {
        return res.status(201).json({ message: "Successfully added notes" });
    } else {
        return res.status(500).json({ message: result.message });
    }
}

async function retrieveNote(req, res) {
    const { medicationId } = req.query;

    if (!medicationId) {
        return res.status(400).json({ message: "Missing medicationId in query" });
    }

    try {
        const notes = await getNote(medicationId);
        res.status(200).json(notes);
    } catch (err) {
        console.error("Error fetching notes:", err);
        res.status(500).json({ message: "Server error" });
    }
}




module.exports = {
    createNote,
    retrieveNote
};
