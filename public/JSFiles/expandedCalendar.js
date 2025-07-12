
const times = [
  "12am", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am",
  "9am", "10am", "11am",
  "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"
];

let startTimeIndex = times.indexOf("9am");
let endTimeIndex = times.indexOf("9pm");

function increaseStart() {
  if (startTimeIndex < times.length - 1) {
    startTimeIndex++;
    document.getElementById("start-time").innerText = times[startTimeIndex];
    fetchMedications();
  }
}

function decreaseStart() {
  if (startTimeIndex > 0) {
    startTimeIndex--;
    document.getElementById("start-time").innerText = times[startTimeIndex];
    fetchMedications();
  }
}

function increaseEnd() {
  if (endTimeIndex < times.length - 1) {
    endTimeIndex++;
    document.getElementById("end-time").innerText = times[endTimeIndex];
    fetchMedications();
  }
}

function decreaseEnd() {
  if (endTimeIndex > 0) {
    endTimeIndex--;
    document.getElementById("end-time").innerText = times[endTimeIndex];
    fetchMedications();
  }
}


async function fetchMedications() {
  const date = document.getElementById("date").value;
  if (!date) {
    console.log("⛔ No date selected in calendar input");
    return;
  }

  console.log("📅 Selected date:", date);
  console.log("🕘 Start index:", startTimeIndex, "End index:", endTimeIndex);

  try {
    const response = await fetch(`http://localhost:3000/medications?date=${date}&start=${startTimeIndex}&end=${endTimeIndex}`);
    
    if (!response.ok) {
      throw new Error('❌ Network response was not ok in script.js');
    }

    const medications = await response.json();

    console.log("✅ Medications fetched from server:", medications); // 🔍 Add this line

    displayMedications(medications);
  } catch (error) { 
    console.error("🚨 Error fetching medications:", error);
  }
}


function displayMedications(medications) {
  console.log("📦 Displaying medications:", medications);

  const scheduleDiv = document.querySelector(".schedule");

  // Reset with the Select All section
  scheduleDiv.innerHTML = `
    <div class="select-all">
      <input type="checkbox" id="selectAll" onclick="toggleAll()">
      <label for="selectAll">Select all</label>
    </div>
  `;

  const medicationMap = {};

  medications.forEach(med => {
    if (!medicationMap[med.schedule_hour]) {
      medicationMap[med.schedule_hour] = [];
    }
    medicationMap[med.schedule_hour].push(med.name);
  });


  // Render all hours in selected range
// Render all hours in selected range
for (let i = startTimeIndex; i <= endTimeIndex; i++) {
  const hourLabel = times[i];
  const medsAtHour = medicationMap[i]; // Array or undefined

  const entry = document.createElement("div");
  entry.className = "time-entry";

  if (medsAtHour && medsAtHour.length > 0) {
    const medNames = medsAtHour.join(", "); // join names
    entry.innerHTML = `
      <span>${hourLabel}</span>
      <input type="text" value="${medNames}" disabled>
      <input type="checkbox">
    `;
  } else {
    // Just show the time label, leave blank
    entry.innerHTML = `
      <span>${hourLabel}</span>
      <input type="text" value="" disabled>
    `;
  }

  scheduleDiv.appendChild(entry);
}
}


function toggleAll() {
    const selectAllCheckbox = document.getElementById("selectAll");
    const checkboxes = document.querySelectorAll(".schedule input[type='checkbox']");

    checkboxes.forEach((checkbox) => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

document.getElementById("notification-page").addEventListener("click", function() {
    window.location.href = "../HTML files/notificationCustomization.html";
});

document.getElementById("notification-page").addEventListener("click", function () {
  const selectedDate = document.getElementById("date").value;
  if (!selectedDate) {
      localStorage.removeItem("selectedDate"); // overwrite local storage when no date is selected
  }

  localStorage.setItem("selectedDate", selectedDate); // Store in localStorage
    window.location.href = "../HTML files/notificationCustomization.html";
  
});
