

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

function indexToTimeString(index) {
  const hour = index % 12 === 0 ? 12 : index % 12;
  const ampm = index < 12 ? "AM" : "PM";
  const hour24 = index === 0 ? 0 : index < 12 ? index : index;
  return `${hour24.toString().padStart(2, '0')}:00`;
}


async function fetchMedications() {
  const date = document.getElementById("date").value;
  if (!date) {
    console.log("No date selected in calendar input");
    return;
  } 
  
  try {

    const formattedStart = indexToTimeString(startTimeIndex);
    const formattedEnd = indexToTimeString(endTimeIndex);

    const response = await fetch(`http://localhost:3000/medications?date=${date}&start=${formattedStart}&end=${formattedEnd}`);

    if (!response.ok) { 
      throw new Error('Network response was not ok in script.js');
    }

    console.log(response);
    const medications = await response.json();

    displayMedications(medications); // if medication is fine calls display medication

  } catch (error) { 
    console.error("Error fetching medications:", error);
  }
}

// Redirect to another page when clicked on the play-ringtone
document.getElementById("play-ringtone").addEventListener("click", function(){
   window.location.href = "../HTML files/ringtoneSelection.html";
});


function formatTo12HourTimeLocal(isoTimeString) {
  const date = new Date(isoTimeString); // Uses local timezone by default
  let hours = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  const minutesStr = minutes.toString().padStart(2, '0');

  return `${hours}:${minutesStr} ${ampm}`;
}



function displayMedications(medications) {
  console.log("Displaying medications:", medications);

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
    if (!med.start_hour) return;

    const baseDate = new Date(med.start_hour); // changes start hour to calculatable time 02:00:00.0000000 ISO format
    
    for (let i = 0; i <= med.repeat_times; ++i) {
      const newDate = new Date(baseDate.getTime() + i * med.repeat_duration * 60 * 60 * 1000); 
      // getTime() converts all to milliseconds, then Date converts back to 02:00:00.0000000 ISO format

      const hourKey = newDate.getHours(); // converted back to the original time for the key of the map
      const formattedTime = newDate.toISOString(); // full ISO string like "1970-01-01T10:00:00.000Z"

      if (!medicationMap[hourKey]) {
        medicationMap[hourKey] = [];
      }

      medicationMap[hourKey].push({
        id: med.id,
        name: med.name,
        start: formattedTime // Needs to be the formatted time and then converted by the formatTo12HourTimeLocal 
      });                    // function to get accurate output like 10:03am output
    }
  });

  for (let i = startTimeIndex; i <= endTimeIndex; i++) {
    const hourLabel = times[i];
    const medsAtHour = medicationMap[i]; 

    const entry = document.createElement("div");
    entry.className = "time-entry";

    if (medsAtHour && medsAtHour.length > 0) {
      entry.innerHTML = `<span>${hourLabel}</span>`;

    const medGroup = document.createElement("div");
    medGroup.className = "medication-group";

    medsAtHour.forEach(med => {
      const medBox = document.createElement("div");
      medBox.className = "med-box";
      medBox.innerHTML = `
        <input type="text" value="${med.name} (${formatTo12HourTimeLocal(med.start)})" disabled>
        <input type="checkbox" class="calendar-checkbox" data-medication-id="${med.id}">
      `;
      medGroup.appendChild(medBox);
    });

    entry.appendChild(medGroup);

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

// Detect if the dynamic checkbox is selected
document.addEventListener("change", function(event) {
  if (event.target.classList.contains("calendar-checkbox")) {
    const medId = event.target.dataset.medicationId;
    let selectedIds = JSON.parse(localStorage.getItem("selectedMedicationIds") || "[]");

    if (event.target.checked) {
       if (!selectedIds.includes(medId)) {
        selectedIds.push(medId);
      }
    } else {
        selectedIds = selectedIds.filter(id => id !== medId);
    }
    localStorage.setItem("selectedMedicationIds", JSON.stringify(selectedIds));
    console.log("Updated selected IDs:", selectedIds);
  }
});


// Select all button
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


document.getElementById("date").addEventListener("change", fetchMedications);
