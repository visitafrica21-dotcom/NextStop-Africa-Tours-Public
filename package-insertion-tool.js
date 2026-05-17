const utils = window.ItineraryUtils;

let editingId = null;

document.addEventListener("DOMContentLoaded", async () => {
    await utils.initItineraries();
    utils.refreshCountryDatalist();
    initializeForm();
    document.getElementById("cancel-edit-btn").addEventListener("click", (e) => {
        e.preventDefault();
        cancelEdit();
    });
    renderSavedPackagesList();
});

function initializeForm() {
    document.getElementById("add-day-btn").addEventListener("click", (e) => {
        e.preventDefault();
        addDay();
    });
    resetDays();
}

function resetDays() {
    document.getElementById("days-container").innerHTML = "";
    addDay();
    addDay();
}

function addDay(dayData) {
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

    if (dayData) {
        dayItem.querySelector(".day-title").value = dayData.title || "";
        dayItem.querySelector(".day-description").value = dayData.description || "";
    }

    dayItem.querySelector(".remove-day").addEventListener("click", (e) => {
        e.preventDefault();
        dayItem.remove();
        updateDayNumbers();
    });

    daysContainer.appendChild(dayItem);
}

function updateDayNumbers() {
    document.querySelectorAll(".day-item").forEach((item, index) => {
        const title = item.querySelector(".day-title");
        const desc = item.querySelector(".day-description");
        title.placeholder = title.placeholder.replace(/Day \d+/, `Day ${index + 1}`);
        desc.placeholder = desc.placeholder.replace(/Day \d+/, `Day ${index + 1}`);
    });
}

function setEditMode(id) {
    editingId = id;
    document.getElementById("editing-id").value = id || "";
    document.getElementById("submit-btn").textContent = id ? "Update Package" : "Add Package";
    document.getElementById("cancel-edit-btn").style.display = id ? "inline-block" : "none";
    document.querySelector(".form-section h2").textContent = id ? "Edit Package" : "Itinerary Details";
}

function cancelEdit() {
    setEditMode(null);
    document.getElementById("itinerary-form").reset();
    document.getElementById("nights").value = "";
    document.getElementById("days").value = "";
    document.getElementById("preview-area").innerHTML =
        "<p>Fill in the form and click Preview to see how your itinerary will look</p>";
    resetDays();
}

function loadPackageIntoForm(itinerary) {
    setEditMode(itinerary.id);
    document.getElementById("country").value = itinerary.country;
    document.getElementById("package-name").value = itinerary.packageName;
    document.getElementById("display-title").value = itinerary.displayTitle || "";
    document.getElementById("package-desc").value = itinerary.packageDesc;
    document.getElementById("nights").value = itinerary.nights;
    document.getElementById("days").value = itinerary.days;

    const daysContainer = document.getElementById("days-container");
    daysContainer.innerHTML = "";
    itinerary.dayByDay.forEach((day) => addDay(day));
    if (itinerary.dayByDay.length === 0) {
        addDay();
        addDay();
    }

    document.getElementById("preview-area").scrollIntoView({ behavior: "smooth", block: "nearest" });
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderSavedPackagesList() {
    const listEl = document.getElementById("saved-packages-list");
    if (!listEl) return;

    let itineraries = utils.sortItineraries(
        utils.ensurePackageNumbers(utils.getBrochurePackages(utils.getAllItineraries()))
    );
    utils.saveAllItineraries(itineraries);

    if (itineraries.length === 0) {
        listEl.innerHTML = '<p class="empty-packages-msg">No packages found.</p>';
        return;
    }

    listEl.innerHTML = itineraries
        .map((it) => {
            const badgeClass = it.builtin ? "builtin" : "custom";
            const badgeLabel = it.builtin ? "Portfolio" : "Added";
            return `
        <div class="saved-package-item" data-id="${it.id}">
            <div class="saved-package-info">
                <strong>${utils.escapeHtml(it.country)} · ${utils.escapeHtml(it.nights)} nights / ${utils.escapeHtml(it.days)} days</strong>
                <span class="package-title-line">${utils.escapeHtml(utils.formatPackageLabel(it))}
                    <span class="package-source-badge ${badgeClass}">${badgeLabel}</span>
                </span>
            </div>
            <div class="package-actions">
                <button type="button" class="edit-package-btn" data-id="${it.id}">Edit</button>
                <button type="button" class="delete-package-btn" data-id="${it.id}">Delete</button>
            </div>
        </div>`;
        })
        .join("");

    listEl.querySelectorAll(".edit-package-btn").forEach((btn) => {
        btn.addEventListener("click", () => editPackage(btn.dataset.id));
    });
    listEl.querySelectorAll(".delete-package-btn").forEach((btn) => {
        btn.addEventListener("click", () => deletePackage(btn.dataset.id));
    });

    utils.refreshCountryDatalist();
}

function editPackage(id) {
    const itinerary = utils.getAllItineraries().find((it) => it.id === id);
    if (!itinerary) return;
    loadPackageIntoForm(itinerary);
}

function deletePackage(id) {
    let itineraries = utils.getAllItineraries();
    const target = itineraries.find((it) => it.id === id);
    if (!target) return;

    const label = utils.formatPackageLabel(target);
    if (!confirm(`Delete "${label}" from the brochure? This cannot be undone.`)) return;

    itineraries = itineraries.filter((it) => it.id !== id);
    itineraries = utils.ensurePackageNumbers(itineraries);
    utils.saveAllItineraries(itineraries);

    if (editingId === id) cancelEdit();
    renderSavedPackagesList();

    const successMsg = document.getElementById("success-message");
    successMsg.classList.add("show");
    successMsg.innerHTML = `✔ "${label}" has been deleted. <a href="${utils.resolveSitePath('brochure.html')}" target="_blank" style="color: #155724; text-decoration: underline; font-weight: 600;">View brochure</a>`;
    setTimeout(() => successMsg.classList.remove("show"), 4000);
}

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

    for (const item of dayItems) {
        const title = item.querySelector(".day-title").value.trim();
        const desc = item.querySelector(".day-description").value.trim();
        if (!title || !desc) {
            alert("Please fill in all day titles and descriptions");
            return false;
        }
    }

    return true;
}

function getItineraryData() {
    const dayItems = document.querySelectorAll(".day-item");
    const days = [];

    dayItems.forEach((item, index) => {
        days.push({
            dayNumber: index + 1,
            title: item.querySelector(".day-title").value.trim(),
            description: item.querySelector(".day-description").value.trim(),
        });
    });

    const displayTitle = document.getElementById("display-title").value.trim();

    return {
        country: document.getElementById("country").value.trim(),
        packageName: document.getElementById("package-name").value.trim(),
        displayTitle: displayTitle || undefined,
        packageDesc: document.getElementById("package-desc").value.trim(),
        nights: document.getElementById("nights").value.trim(),
        days: document.getElementById("days").value.trim(),
        dayByDay: days,
    };
}

document.getElementById("preview-btn").addEventListener("click", () => {
    if (!validateForm()) return;

    const data = getItineraryData();
    const previewArea = document.getElementById("preview-area");
    let itineraries = utils.ensurePackageNumbers(utils.getAllItineraries());
    const packageNumber = editingId
        ? itineraries.find((i) => i.id === editingId)?.packageNumber
        : utils.nextPackageNumber(data.country, itineraries);
    const previewLabel = `Package ${packageNumber}: ${data.packageName}`;
    const headerTitle = data.displayTitle || data.packageName;

    const daysHTML = data.dayByDay
        .map(
            (day) => `
        <div class="preview-day-item">
            <div class="preview-day-badge">Day ${day.dayNumber}</div>
            <h4>${day.title}</h4>
            <p>${day.description}</p>
        </div>`
        )
        .join("");

    previewArea.innerHTML = `
        <div style="width: 100%; text-align: left;">
            <div class="preview-itin-header">
                <h3>${headerTitle}</h3>
                <p>${data.nights} Nights / ${data.days} Days · ${data.packageDesc}</p>
            </div>
            <div class="preview-days-timeline">${daysHTML}</div>
        </div>`;
});

document.getElementById("itinerary-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = getItineraryData();
    let itineraries = utils.ensurePackageNumbers(utils.getAllItineraries());

    if (editingId) {
        const index = itineraries.findIndex((it) => it.id === editingId);
        if (index === -1) {
            alert("Package not found. It may have been deleted.");
            cancelEdit();
            return;
        }
        const existing = itineraries[index];
        itineraries[index] = {
            ...existing,
            country: data.country,
            packageName: data.packageName,
            displayTitle: data.displayTitle,
            packageDesc: data.packageDesc,
            nights: data.nights,
            days: data.days,
            dayByDay: data.dayByDay,
            timestamp: new Date().toISOString(),
        };
    } else {
        const itineraryId = `itin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        itineraries.push({
            id: itineraryId,
            country: data.country,
            packageName: data.packageName,
            displayTitle: data.displayTitle,
            packageDesc: data.packageDesc,
            nights: data.nights,
            days: data.days,
            dayByDay: data.dayByDay,
            packageNumber: utils.nextPackageNumber(data.country, itineraries),
            timestamp: new Date().toISOString(),
            builtin: false,
        });
    }

    itineraries = utils.ensurePackageNumbers(itineraries);
    utils.saveAllItineraries(itineraries);
    renderSavedPackagesList();

    const saved = editingId
        ? itineraries.find((i) => i.id === editingId)
        : itineraries[itineraries.length - 1];
    const label = utils.formatPackageLabel(saved);
    const action = editingId ? "updated" : "added";

    const successMsg = document.getElementById("success-message");
    successMsg.classList.add("show");
    successMsg.innerHTML = `✔ "${label}" ${action} successfully! <a href="${utils.resolveSitePath('brochure.html')}" target="_blank" style="color: #155724; text-decoration: underline; font-weight: 600;">View on the brochure</a>`;

    cancelEdit();

    setTimeout(() => successMsg.classList.remove("show"), 5000);
});
