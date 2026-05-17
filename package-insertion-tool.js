// Validate form fields
function validateForm() {
    const country = document.getElementById("country").value.trim();
    const tier = document.getElementById("tier").value.trim();
    const name = document.getElementById("name").value.trim();
    const price = document.getElementById("price").value.trim();
    const features = document.getElementById("features").value.trim();

    if (!country || !tier || !name || !price || !features) {
        alert("Please fill in all required fields marked with *");
        return false;
    }
    return true;
}

// Generate preview
document.getElementById("preview-btn").addEventListener("click", () => {
    if (!validateForm()) return;

    const country = document.getElementById("country").value.trim();
    const tier = document.getElementById("tier").value.trim();
    const name = document.getElementById("name").value.trim();
    const tagline = document.getElementById("tagline").value.trim();
    const price = document.getElementById("price").value.trim();
    const priceNote = document.getElementById("price-note").value.trim();
    const features = document.getElementById("features").value
        .split(",")
        .map(f => f.trim())
        .filter(f => f);

    const previewArea = document.getElementById("preview-area");
    const isFeatured = tier.toLowerCase() === 'luxury';

    previewArea.innerHTML = `
        <style>
            .pkg-card-preview {
                background: #fff;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 4px 32px rgba(0, 0, 0, 0.04);
                border: 1px solid rgba(0, 0, 0, 0.04);
                width: 100%;
                transition: all 0.5s cubic-bezier(.25, .46, .45, .94);
            }

            .pkg-card-preview.featured {
                border: 2px solid #c84b31;
                box-shadow: 0 8px 40px rgba(200, 75, 49, 0.12);
            }

            .pkg-header-preview {
                padding: 32px 32px 24px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.04);
            }

            .pkg-tier-preview {
                font-size: 9px;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: #c84b31;
                margin-bottom: 8px;
                font-weight: 700;
            }

            .pkg-name-preview {
                font-family: 'Playfair Display', serif;
                font-size: 26px;
                color: #1d3d2b;
                margin-bottom: 6px;
                font-weight: 500;
            }

            .pkg-tagline-preview {
                font-size: 13px;
                color: #aaa;
                font-weight: 300;
            }

            .pkg-price-preview {
                padding: 20px 32px;
                background: #1d3d2b;
            }

            .pkg-card-preview.featured .pkg-price-preview {
                background: #c84b31;
            }

            .price-label-preview {
                font-size: 9px;
                letter-spacing: 2.5px;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.5);
                margin-bottom: 4px;
            }

            .pkg-card-preview.featured .price-label-preview {
                color: rgba(255, 255, 255, 0.6);
            }

            .price-range-preview {
                font-family: 'Playfair Display', serif;
                font-size: 22px;
                color: #fff;
                font-weight: 600;
            }

            .pkg-card-preview.featured .price-range-preview {
                color: #fff;
            }

            .price-note-preview {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.4);
                font-weight: 300;
                margin-top: 4px;
            }

            .pkg-card-preview.featured .price-note-preview {
                color: rgba(255, 255, 255, 0.6);
            }

            .pkg-body-preview {
                padding: 28px 32px;
            }

            .pkg-includes-preview {
                list-style: none;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .pkg-includes-preview li {
                font-size: 13px;
                color: #777;
                display: flex;
                align-items: flex-start;
                gap: 10px;
                line-height: 1.5;
            }

            .pkg-includes-preview li .check {
                color: #c84b31;
                font-weight: 700;
                flex-shrink: 0;
            }
        </style>
        <div class="pkg-card-preview ${isFeatured ? 'featured' : ''}">
            <div class="pkg-header-preview">
                <div class="pkg-tier-preview">${tier}</div>
                <h3 class="pkg-name-preview">${name}</h3>
                <p class="pkg-tagline-preview">${tagline}</p>
            </div>
            <div class="pkg-price-preview">
                <div class="price-label-preview">Price</div>
                <div class="price-range-preview">${price}</div>
                ${priceNote ? `<p class="price-note-preview">${priceNote}</p>` : ''}
            </div>
            <div class="pkg-body-preview">
                <ul class="pkg-includes-preview">
                    ${features.map(feature => `<li><span class="check">✔</span>${feature}</li>`).join("")}
                </ul>
            </div>
        </div>
    `;
});

// Handle form submission
document.getElementById("package-form").addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const country = document.getElementById("country").value.trim();
    const tier = document.getElementById("tier").value.trim();
    const name = document.getElementById("name").value.trim();
    const tagline = document.getElementById("tagline").value.trim();
    const price = document.getElementById("price").value.trim();
    const priceNote = document.getElementById("price-note").value.trim();
    const features = document.getElementById("features").value
        .split(",")
        .map(f => f.trim())
        .filter(f => f);

    const packageData = {
        country,
        tier,
        name,
        tagline,
        price,
        priceNote,
        features
    };

    console.log("Package Data:", packageData);

    // Show success message
    const successMsg = document.getElementById("success-message");
    successMsg.classList.add("show");

    // Reset form
    document.getElementById("package-form").reset();
    document.getElementById("preview-area").innerHTML = `<p>Fill in the form and click Preview to see how your package will look</p>`;

    // Hide success message after 3 seconds
    setTimeout(() => {
        successMsg.classList.remove("show");
    }, 3000);

    // TODO: Send data to brochure.html or backend
    console.log("Ready to insert package into brochure.html");
});