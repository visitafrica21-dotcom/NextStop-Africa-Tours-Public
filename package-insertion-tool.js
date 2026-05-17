// Initialize the form with default days
document.addEventListener("DOMContentLoaded", () => {
    initializeForm();
    addDay();
    addDay();
});

// Initialize form
function initializeForm() {
    const daysContainer = document.getElementById("days-container");
    daysContainer.innerHTML = "";
    
    document.getElementById("add-day-btn").addEventListener("click", (e) => {
        e.preventDefault();
        addDay();
    });
}

// Add a new day input
function addDay() {
    const daysContainer = document.getElementById("days-container");
    const dayNumber = daysContainer.children.length + 1;
    
    const dayItem = document.createElement("div");
    dayItem.className = "day-item";
    dayItem.innerHTML = `
        <div class="day-controls">
            <input type="text" placeholder="Day ${dayNumber} Title (e.g., Tour of Kampala)" class="day-title" required>
            <button type="button" class="remove-day">Remove</button>
        </div>
        <textarea placeholder="Day ${dayNumber} Description" class="day-description" required></textarea>
    `;
    
    const removeBtn = dayItem.querySelector(".remove-day");
    removeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        dayItem.remove();
        updateDayNumbers();
    });
    
    daysContainer.appendChild(dayItem);
}

// Update day numbers after removal
function updateDayNumbers() {
    const dayItems = document.querySelectorAll(".day-item");
    dayItems.forEach((item, index) => {
        const title = item.querySelector(".day-title");
        const desc = item.querySelector(".day-description");
        const currentTitle = title.placeholder;
        const currentDesc = desc.placeholder;
        
        // Update placeholder numbers
        title.placeholder = currentTitle.replace(/Day \d+/, `Day ${index + 1}`);
        desc.placeholder = currentDesc.replace(/Day \d+/, `Day ${index + 1}`);
    });
}

// Validate form
function validateForm() {
    const country = document.getElementById("country").value.trim();
    const packageName = document.getElementById("package-name").value.trim();
    const packageDesc = document.getElementById("package-desc").value.trim();
    const nights = document.getElementById("nights").value.trim();
    const days = document.getElementById("days").value.trim();
    
    if (!country || !packageName || !packageDesc || !nights || !days) {
        alert("Please fill in all required fields marked with *");
        return false;
    }
    
    const dayItems = document.querySelectorAll(".day-item");
    if (dayItems.length === 0) {
        alert("Please add at least one day to your itinerary");
        return false;
    }
    
    for (let item of dayItems) {
        const title = item.querySelector(".day-title").value.trim();
        const desc = item.querySelector(".day-description").value.trim();
        if (!title || !desc) {
            alert("Please fill in all day titles and descriptions");
            return false;
        }
    }
    
    return true;
}

// Collect itinerary data
function getItineraryData() {
    const dayItems = document.querySelectorAll(".day-item");
    const days = [];
    
    dayItems.forEach((item, index) => {
        days.push({
            dayNumber: index + 1,
            title: item.querySelector(".day-title").value.trim(),
            description: item.querySelector(".day-description").value.trim()
        });
    });
    
    return {
        country: document.getElementById("country").value.trim(),
        packageName: document.getElementById("package-name").value.trim(),
        packageDesc: document.getElementById("package-desc").value.trim(),
        nights: document.getElementById("nights").value.trim(),
        days: document.getElementById("days").value.trim(),
        dayByDay: days
    };
}

// Generate preview
document.getElementById("preview-btn").addEventListener("click", () => {
    if (!validateForm()) return;
    
    const data = getItineraryData();
    const previewArea = document.getElementById("preview-area");
    
    const daysHTML = data.dayByDay.map(day => `
        <div style="display: flex; margin-bottom: 24px;">
            <div style="display: flex; flex-direction: column; align-items: center; margin-right: 24px;">
                <div style="width: 48px; height: 48px; background: #c84b31; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600;">
                    ${day.dayNumber}
                </div>
                ${day.dayNumber < data.dayByDay.length ? '<div style="width: 2px; height: 40px; background: #ddd; margin-top: 8px;"></div>' : ''}
            </div>
            <div style="flex: 1;">
                <h4 style="font-family: 'Playfair Display', serif; font-size: 16px; color: #1d3d2b; margin-bottom: 8px; font-weight: 600;">${day.title}</h4>
                <p style="color: #777; font-size: 14px; line-height: 1.6;">${day.description}</p>
            </div>
        </div>
    `).join("");
    
    previewArea.innerHTML = `
        <style>
            .preview-itinerary {
                background: #faf8f5;
                padding: 32px;
                border-radius: 12px;
                width: 100%;
                text-align: left;
            }
            
            .preview-itinerary h3 {
                font-family: 'Playfair Display', serif;
                font-size: 24px;
                color: #1d3d2b;
                margin-bottom: 8px;
                font-weight: 600;
            }
            
            .preview-itinerary p {
                color: #777;
                font-size: 14px;
                margin-bottom: 24px;
            }
            
            .days-timeline {
                position: relative;
            }
        </style>
        <div class="preview-itinerary">
            <h3>${data.packageName}</h3>
            <p>${data.nights} Nights / ${data.days} Days · ${data.packageDesc}</p>
            <div class="days-timeline">
                ${daysHTML}
            </div>
        </div>
    `;
});

// Handle form submission
document.getElementById("itinerary-form").addEventListener("submit", (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const data = getItineraryData();
    console.log("Itinerary Data:", data);
    
    // Show success message
    const successMsg = document.getElementById("success-message");
    successMsg.classList.add("show");
    
    // Reset form
    document.getElementById("itinerary-form").reset();
    document.getElementById("nights").value = "";
    document.getElementById("days").value = "";
    
    // Reset preview
    document.getElementById("preview-area").innerHTML = `<p>Fill in the form and click Preview to see how your itinerary will look</p>`;
    
    // Reinitialize days
    initializeForm();
    addDay();
    addDay();
    
    // Hide success message after 3 seconds
    setTimeout(() => {
        successMsg.classList.remove("show");
    }, 3000);
    
    // TODO: Send data to brochure.html or backend
    console.log("Ready to insert itinerary into brochure.html");
});