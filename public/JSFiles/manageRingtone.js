async function playRingtone() {
  const selectedDate = localStorage.getItem("selectedDate");
  if (!selectedDate) return;

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  console.log(`Today date: ${formattedDate}`);

  // Get current time (HH:MM)
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeSimple = `${currentHours}:${currentMinutes}`;

  // Fetch medications for selectedDate
  try {
    const response = await fetch(`http://localhost:3000/medications/by-date?date=${selectedDate}`);
    if (!response.ok) throw new Error('Network response was not ok in script.js');

    const medications = await response.json();

    medications.forEach(meds => {
      if (!meds.start_hour || !meds.schedule_date || !meds.audio_link) return;

      const medDate = new Date(meds.schedule_date).toISOString().split('T')[0];
      const medTime = new Date(meds.start_hour);
      const medHours = String(medTime.getHours()).padStart(2, '0');
      const medMinutes = String(medTime.getMinutes()).padStart(2, '0');
      const startTimeSimple = `${medHours}:${medMinutes}`;

      console.log(`Medication date: ${medDate}`);
      console.log(`Start time: ${startTimeSimple}`);
      console.log(`Current time: ${currentTimeSimple}`);

      if (formattedDate === medDate && currentTimeSimple === startTimeSimple) {
        const audio = new Audio(meds.audio_link);
        audio.play().catch(err => console.error("Audio play failed:", err));
        showMedicationPopup(meds.name);
      }
    });

  } catch (err) {
    console.error("Error fetching medications:", err);
  }
}

// Attach to DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  playRingtone(); // run once on load
  setInterval(playRingtone, 60000); // run every 1 minute
});

function showMedicationPopup(name) {
  const popup = document.createElement("div");
  popup.innerHTML = `
    <div style="position: fixed; top: 20px; right: 20px; background: #f5f5f5; padding: 20px; border: 2px solid #007bff; border-radius: 10px; z-index: 9999; font-family: sans-serif;">
      🔔 It's time to take: <strong>${name}</strong>
    </div>
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 8000);
}