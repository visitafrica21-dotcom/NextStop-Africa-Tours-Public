document.getElementById("preview-btn").addEventListener("click", () => {
    const country = document.getElementById("country").value;
    const tier = document.getElementById("tier").value;
    const name = document.getElementById("name").value;
    const tagline = document.getElementById("tagline").value;
    const price = document.getElementById("price").value;
    const priceNote = document.getElementById("price-note").value;
    const features = document.getElementById("features").value.split(",");

    const previewArea = document.getElementById("preview-area");
    previewArea.innerHTML = `
        <div class="package-card ${tier.toLowerCase() === 'luxury' ? 'featured' : ''}">
            <div class="pkg-header">
                <div class="pkg-tier">${tier}</div>
                <h3 class="pkg-name">${name}</h3>
                <p class="pkg-tagline">${tagline}</p>
            </div>
            <div class="pkg-price">
                <div class="price-label">Price</div>
                <div class="price-range">${price}</div>
                <p class="price-note">${priceNote}</p>
            </div>
            <div class="pkg-body">
                <ul class="pkg-includes">
                    ${features.map(feature => `<li><span class="check">✔</span>${feature.trim()}</li>`).join("")}
                </ul>
            </div>
        </div>
    `;
});

document.getElementById("package-form").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Package submitted! Integration with brochure.html is pending.");
});