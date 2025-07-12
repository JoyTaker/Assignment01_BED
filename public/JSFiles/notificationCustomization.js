
const savedDate = localStorage.getItem("selectedDate");

document.getElementById("back-button").addEventListener("click", function() {
    window.location.href = "../HTML files/expandedCalendar.html";
    savedDate.remove();
});

function displayDate() {
    const dateDiv = document.createElement("div");
    dateDiv.className = "date-display"
    const dateContainer = document.getElementById("date-display");
    
    dateContainer.innerHTML = ""; // Clear previous content
    const date = savedDate ? savedDate : "No date selected";
    dateDiv.textContent = date;
    dateContainer.appendChild(dateDiv);
}

async function fetchAndDisplayNotifications() {
    if (!savedDate) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/medications?date=${savedDate}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const medication = await response.json();
        const savedNotification = document.getElementById("saved-notification");
        savedNotification.innerHTML = ""; // Clear previous content

        if(medication.length === 0) {
            savedNotification.textContent = "No notifications saved for this date.";
        }
        medication.forEach(med => {
            const createDiv = document.createElement("div");
            createDiv.className = "notification-item";
            item.innerHTML = `
                <span class="medication-name">${med.name}</span>
                <span class="schedule-hour">${med.schedule_hour}</span>
                <span class="schedule-minute">${med.schedule_minute}</span>
                <span class="dosage">${med.dosage}</span>
            `;
        });  
        savedNotification.appendChild(createDiv);
    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
}

document.addEventListener("DOMContentLoaded", fetchAndDisplayNotifications);

async function addMedicationContainer () {
    document.getElementById('add-container-button').addEventListener('click', function(event) {
        event.preventDefault();

        let addBoxContainer = document.querySelector('.add-box-container');

        if (!addBoxContainer) {
            addBoxContainer = document.createElement("div");
            addBoxContainer.className = 'add-box-container';
            addBoxContainer.style.display = 'none';
            addBoxContainer.innerHTML = `
                <div class="title">
                    <button type="button" id="close-add-window">X</button>
                    <h3>Add Features</h3>
                </div>
                <div class="add-features" id="add-features">
                    <h3>To do item</h3>
                    <input type="text" placeholder="To do item" id="to-do-item" class="general-info">
                    <h3>Day on repeat</h3>
                    <div class="day-on-repeat">
                        <input type="text" placeholder="Repeat a day count" id="repeat-times" class="general-info">
                        <span class="arrow">→</span>
                        <input type="text" placeholder="Duration" id="duration-of-reminder" class="general-info">
                    </div>
                    <h3>Hour range</h3>
                    <div class="hour-range-container">
                        <input type="time" id="first-hour-range" class="general-info">
                        <span class="arrow">→</span>
                        <input type="time" id="second-hour-range" class="general-info">
                    </div>
                    <h3>Repeat</h3>
                    <div class="routine_option-and-schedule">
                        <select class="general-info" id="repeat-select">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        <button type="submit" id="submit-add-info">Submit</button>
                    </div>
                </div>
            `;
            const mainContainer = document.querySelector('.main-container');
            mainContainer.appendChild(addBoxContainer);

            addBoxContainer.querySelector('#close-add-window').addEventListener('click', () => {
                addBoxContainer.style.display = 'none';
            });

            addBoxContainer.querySelector('#submit-add-info').addEventListener('click', async function(event) {
                event.preventDefault();

                const item = document.getElementById("to-do-item").value;
                const day_on_repeat = document.getElementById("repeat-times");
                const duration_of_reminder = document.getElementById("duration-of-reminder");
                const startHour = parseInt(document.getElementById('first-hour-range').value.split(":")[0]);
                const endHour = parseInt(document.getElementById('second-hour-range').value.split(":")[0]);
                const repeatSelect = parseInt(document.getElementById('repeat-select').value);
                
                const medicationData = {
                    name: item,
                    repeat_times: day_on_repeat, // int
                    repeat_duration: duration_of_reminder, // int
                    start_hour: startHour, // int
                    end_hour: endHour, // int
                    frequency_type: repeatSelect, // var-char
                    schedule_date: savedDate // date
                };

            try {
                const response = await fetch('http://localhost:3000/medications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(medicationData)
                });

                const result = await response.json();

                if (response.ok) {
                alert("Medication added!");
                addBoxContainer.style.display = 'none';
                appendMedicationContainer(); // Refresh list
                } else {
                alert(result.message || "Failed to add medication.");
                }
            } catch (err) {
                console.error("Error adding medication:", err);
                alert("Server error. Could not add medication.");
            }
            });

        }
        addBoxContainer.style.display = (addBoxContainer.style.display === 'none') ? 'flex' : 'none';
        console.log("Final medicationData before insert:", medicationData);
    });
}

document.addEventListener('DOMContentLoaded', addMedicationContainer);

// Add container based on notifications
async function appendMedicationContainer() {
    if (!savedDate) return;

    try {
        const response = await fetch(`http://localhost:3000/medications/by-date?date=${savedDate}`);
        const medications = await response.json(); // Retrieve the medication json

        const parentContainer = document.getElementById("saved-notification-container");
        parentContainer.innerHTML = "";

        for (const med of medications) { // iterate the medication list of json 
            const mainDiv = document.createElement('div');
            mainDiv.className = 'saved-notification-container';

            const deleteNotificationContainer = document.createElement("button");
            deleteNotificationContainer.textContent = 'X';
            deleteNotificationContainer.type = 'button';
            deleteNotificationContainer.className = 'delete-notification-container';

            // Layer 1: Medication Name + Edit Button
            const layer1 = document.createElement("div");
            layer1.className = 'layer1-container';

            // Add the notification container
            const medName = document.createElement('div');
            medName.className = 'medicine-name';
            medName.textContent = med.name; // Add a specific column of the Json "name"

            const editButton = document.createElement("button");
            editButton.type = 'button';
            editButton.className = 'edit-button';
            editButton.textContent = 'Edit';

            layer1.appendChild(medName);
            layer1.appendChild(editButton);

            const hr = document.createElement("hr");
            hr.style.cssText = "width: 100%; height: 0; margin: 0; padding: 0";

            // Layer 2: Notes and Add Button
            const layer2 = document.createElement("div");
            layer2.className = 'layer2-container';

            const addButton = document.createElement("button");
            addButton.type = 'button';
            addButton.className = 'add-button';
            addButton.textContent = '+';

            layer2.appendChild(addButton);

            // Load existing notes for this medication
            try {
                const noteRes = await fetch(`http://localhost:3000/medication-notes?medicationId=${med.id}`);
                const notes = await noteRes.json();

                notes.forEach(n => {
                    const noteDiv = document.createElement('div');
                    noteDiv.className = 'prompt-info';
                    noteDiv.textContent = n.note_text;
                    layer2.insertBefore(noteDiv, addButton);
                });
            } catch (err) {
                console.error(`Failed to load notes for med ${med.id}`, err);
            }

            // Add new note
            addButton.addEventListener('click', () => {
                let inputBox = layer2.querySelector('input.prompt-info');
                if (!inputBox) {
                    inputBox = document.createElement("input");
                    inputBox.className = 'prompt-info';
                    layer2.insertBefore(inputBox, addButton);
                    inputBox.focus();

                    let entered = false;

                    inputBox.addEventListener('keydown', async function (e) {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const value = inputBox.value.trim();
                            if (value === '') {
                                inputBox.remove();
                            } else {
                                entered = true;
                                await postNotes(med.id, value); 
                                const textBox = document.createElement('div');
                                textBox.className = 'prompt-info';
                                textBox.textContent = value;
                                inputBox.replaceWith(textBox);
                            }
                        }
                    });

                    inputBox.addEventListener('blur', async function () {
                        const value = inputBox.value.trim();
                        if (!entered && value === '') {
                            inputBox.remove();
                        } else if (!entered && value !== '') {
                            entered = true;
                            await postNotes(med.id, value);
                            const textBox = document.createElement('div');
                            textBox.className = 'prompt-info';
                            textBox.textContent = value;
                            inputBox.replaceWith(textBox);
                        }
                    });
                }
            });


            // Edit Box
            const editBoxContainer = document.createElement("div");
            editBoxContainer.className = 'edit-box-container';
            editBoxContainer.style.display = 'none';
            editBoxContainer.innerHTML = `
                <div class="title">
                    <button type="button" class="close-edit-window">X</button>
                    <h3>Edit Notification</h3>
                </div>
                <div class="edit-features">
                    <h3>To do item</h3>
                    <input type="text" placeholder="To do item" class="general-info to-do-item">
                    <h3>Day on repeat</h3>
                    <div class="day-on-repeat">
                        <input type="text" placeholder="Every_hour" class="general-info every-hour-item">
                        <span class="arrow">→</span>
                        <input type="text" placeholder="Duration" class="general-info frequency-item">
                    </div>
                    <h3>Hour range</h3>
                    <div class="hour-range-container">
                        <input type="time" class="general-info first-hour-range">
                        <span class="arrow">→</span>
                        <input type="time" class="general-info second-hour-range">
                    </div>
                    <h3>Repeat</h3>
                    <div class="routine_option-and-schedule">
                        <select class="general-info" id="general-info">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        <button type="submit" class="submit-edit-info">Save</button>
                    </div>
                </div>
            `;

            // Add object Container

            // Edit object Container

            // Delete object Container
          deleteNotificationContainer.addEventListener("click", async function() {
            try {
                const response = await fetch(`http://localhost:3000/medications/${med.id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (response.ok) {
                    mainDiv.remove();
                } else {
                    console.err("Failed to delete: ", result.message);
                }
            } catch (err) {
                console.error("Error deleting medication:", err);
            }
        });

            // Append everything
            mainDiv.appendChild(deleteNotificationContainer);
            mainDiv.appendChild(layer1);
            mainDiv.appendChild(hr);
            mainDiv.appendChild(layer2);
            parentContainer.appendChild(mainDiv);
            parentContainer.appendChild(editBoxContainer);

            // Edit button click
            editButton.addEventListener('click', () => {
                document.querySelectorAll(".saved-notification-container").forEach(container => {
                    if (container !== mainDiv) {
                        container.style.display = 'none';
                    }
                });
                if (editBoxContainer.style.display == 'none') { // If edit container is not open make it open
                    editBoxContainer.style.display = 'flex';
                } else if (editBoxContainer.style.display == 'flex') { // If edit container is close open it again
                    editBoxContainer.style.display = 'none';
                    document.querySelectorAll(".saved-notification-container").forEach(container => { 
                    container.style.display = 'flex';
                });
                }

            });

            // Close button click
            const closeBtn = editBoxContainer.querySelector('.close-edit-window');
            closeBtn.addEventListener('click', () => {
                editBoxContainer.style.display = 'none';
                document.querySelectorAll(".saved-notification-container").forEach(container => {
                    container.style.display = 'flex';
                });
            });
        }
    } catch (err) {
        console.error("Error loading medications:", err);
    }
}

document.addEventListener('DOMContentLoaded', appendMedicationContainer);

// Post notes into the sql


async function postNotes(medicationId, value) {

    try {
        const response = await fetch("http://localhost:3000/medication-notes", {
            method: 'POST',
            headers: {
                'Content-type' : 'application/json'
            },
            body: JSON.stringify({
                medicationId: medicationId,
                note_text: value
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Note saved to DB", result.message);
        } else {
            console.error("Failed to save note", result.message);
        }
    } catch (err) {
        console.error("Error during fetch", err);
    }
}


window.addEventListener("DOMContentLoaded", displayDate);