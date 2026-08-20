(function () {
  const STORAGE_KEY = 'itineraries';
  const LEGACY_KEY = 'newItineraries';
  const INIT_FLAG = 'itinerariesSeeded';

  const BUILTIN_COUNTRIES = {
    uganda: { groupId: 'itin-uganda', label: 'Uganda, The Pearl of Africa', order: 1 },
    algeria: { groupId: 'itin-algeria', label: 'Algeria, Sahara\'s Best Kept Secret', order: 2 },
    benin: { groupId: 'itin-benin', label: 'Benin, Cradle of African Spirituality', order: 3 },
    rwanda: { groupId: 'itin-rwanda', label: 'Rwanda, Land of a Thousand Hills', order: 4 },
  };

  const COUNTRY_ORDER = ['uganda', 'algeria', 'benin', 'rwanda'];

  function getCountryKey(country) {
    const c = (country || '').toLowerCase();
    if (c.includes('uganda')) return 'uganda';
    if (c.includes('algeria')) return 'algeria';
    if (c.includes('benin')) return 'benin';
    if (c.includes('rwanda')) return 'rwanda';
    return c.replace(/[,\s]/g, '');
  }

  function getCountryGroupId(country) {
    const key = getCountryKey(country);
    return BUILTIN_COUNTRIES[key]?.groupId || `itin-${key}`;
  }

  async function getWorkerUrl() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8787';
    }
    return 'https://nextstop-africa-tours-public.visitafrica21.workers.dev';
  }

  async function fetchItinerariesFromWorker() {
    try {
      const url = await getWorkerUrl();
      const response = await fetch(`${url}/api/itineraries`);
      if (!response.ok) throw new Error('Failed to fetch from worker');
      return await response.json();
    } catch (err) {
      console.warn('Worker fetch failed, falling back to localStorage:', err);
      return getAllItinerariesSync();
    }
  }

  async function saveItinerariesToWorker(list) {
    try {
      const url = await getWorkerUrl();
      const response = await fetch(`${url}/api/itineraries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list)
      });
      if (!response.ok) throw new Error('Failed to save to worker');
      saveAllItineraries(list);
      return await response.json();
    } catch (err) {
      console.warn('Worker save failed, falling back to localStorage:', err);
      saveAllItineraries(list);
      return list;
    }
  }

  function getSavedItineraries() {
    return getAllItinerariesSync();
  }

  function getAllItinerariesSync() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  async function getAllItineraries() {
    return await fetchItinerariesFromWorker();
  }

  function saveItineraries(list) {
    saveAllItineraries(list);
  }

  function saveAllItineraries(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  async function saveItinerariesAsync(list) {
    return await saveItinerariesToWorker(list);
  }

  function ensurePackageNumbers(itineraries) {
    const byCountry = {};
    itineraries.forEach((it) => {
      const key = getCountryKey(it.country);
      if (!byCountry[key]) byCountry[key] = [];
      byCountry[key].push(it);
    });

    Object.keys(byCountry).forEach((key) => {
      const group = byCountry[key].sort((a, b) => {
        if (a.packageNumber && b.packageNumber) return a.packageNumber - b.packageNumber;
        return new Date(a.timestamp || 0) - new Date(b.timestamp || 0);
      });
      group.forEach((it, idx) => {
        it.packageNumber = idx + 1;
      });
    });

    return itineraries;
  }

  function nextPackageNumber(country, itineraries) {
    const key = getCountryKey(country);
    const forCountry = itineraries.filter((i) => getCountryKey(i.country) === key);
    if (forCountry.length === 0) return 1;
    return Math.max(...forCountry.map((i) => i.packageNumber || 0)) + 1;
  }

  function formatPackageLabel(itinerary) {
    const num = itinerary.packageNumber || '?';
    return `Package ${num}: ${itinerary.packageName}`;
  }

  function getDisplayTitle(itinerary) {
    return itinerary.displayTitle || itinerary.packageName;
  }

  function sortItineraries(itineraries) {
    return [...itineraries].sort((a, b) => {
      const orderA = COUNTRY_ORDER.indexOf(getCountryKey(a.country));
      const orderB = COUNTRY_ORDER.indexOf(getCountryKey(b.country));
      const oa = orderA === -1 ? 999 : orderA;
      const ob = orderB === -1 ? 999 : orderB;
      if (oa !== ob) return oa - ob;
      const countryCmp = getCountryKey(a.country).localeCompare(getCountryKey(b.country));
      if (countryCmp !== 0) return countryCmp;
      return (a.packageNumber || 0) - (b.packageNumber || 0);
    });
  }

  function groupByCountry(itineraries) {
    const groups = new Map();
    itineraries.forEach((it) => {
      const key = getCountryKey(it.country);
      if (!groups.has(key)) groups.set(key, { country: it.country, key, items: [] });
      groups.get(key).items.push(it);
    });
    groups.forEach((g) => {
      g.items.sort((a, b) => (a.packageNumber || 0) - (b.packageNumber || 0));
    });
    return groups;
  }

  /** Site root path (works from /admin and from pages in repo root or project subpaths). */
  function getSiteBase() {
    const path = window.location.pathname;
    const adminMatch = path.match(/^(.*)\/admin\/?$/);
    if (adminMatch) {
      const base = adminMatch[1];
      return (base ? base : '') + '/';
    }
    if (path.includes('/')) {
      return path.slice(0, path.lastIndexOf('/') + 1);
    }
    return '/';
  }

  function resolveSitePath(relativePath) {
    const clean = String(relativePath).replace(/^\//, '');
    const base = getSiteBase();
    if (base === '/') return '/' + clean;
    return base + clean;
  }

  async function fetchBuiltinSeed() {
    const res = await fetch(resolveSitePath('data/built-in-itineraries.json'));
    if (!res.ok) throw new Error('Failed to load built-in itineraries');
    return res.json();
  }

  async function initItineraries() {
    let list = await getAllItineraries();
    let legacy = [];

    try {
      legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]');
      if (!Array.isArray(legacy)) legacy = [];
    } catch {
      legacy = [];
    }

    const localData = getAllItinerariesSync();
    if (list.length === 0 && localData.length > 0) {
      list = localData;
      await saveItinerariesAsync(list);
    }

    if (localStorage.getItem(INIT_FLAG) !== 'true') {
      let seed = [];
      try {
        seed = await fetchBuiltinSeed();
      } catch (err) {
        console.warn('Could not load built-in itineraries:', err);
      }

      if (list.length === 0 && legacy.length === 0 && seed.length > 0) {
        list = seed;
      } else if (seed.length > 0) {
        const merged = [...seed];
        [...list, ...legacy].forEach((item) => {
          if (!merged.find((x) => x.id === item.id)) merged.push(item);
        });
        list = merged;
      } else {
        list = [...list, ...legacy.filter((item) => !list.find((x) => x.id === item.id))];
      }

      localStorage.setItem(INIT_FLAG, 'true');
      await saveItinerariesAsync(list);
    }

    if (legacy.length > 0) {
      legacy.forEach((item) => {
        if (!list.find((x) => x.id === item.id)) list.push(item);
      });
      localStorage.removeItem(LEGACY_KEY);
      await saveItinerariesAsync(list);
    }

    list = ensurePackageNumbers(list.filter(isBrochurePackage));
    await saveItinerariesAsync(list);
    return list;
  }

  /** A package that is actually shown on the brochure (tabs + day-by-day content). */
  function isBrochurePackage(it) {
    return Boolean(
      it &&
      it.country &&
      String(it.country).trim() &&
      it.packageName &&
      String(it.packageName).trim() &&
      Array.isArray(it.dayByDay) &&
      it.dayByDay.length > 0
    );
  }

  function getBrochurePackages(itineraries) {
    const list = itineraries || getAllItinerariesSync();
    return list.filter(isBrochurePackage);
  }

  /** Countries that currently have at least one brochure package (ground truth for the datalist). */
  function getBrochureCountries(itineraries) {
    const countries = new Set();
    getBrochurePackages(itineraries).forEach((it) => {
      countries.add(String(it.country).trim());
    });
    return [...countries].sort((a, b) => a.localeCompare(b));
  }

  function refreshCountryDatalist() {
    const datalist = document.getElementById('countries-list');
    if (!datalist) return;
    const countries = getBrochureCountries();
    while (datalist.firstChild) {
      datalist.removeChild(datalist.firstChild);
    }
    countries.forEach((country) => {
      const option = document.createElement('option');
      option.value = country;
      datalist.appendChild(option);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildDaysHtml(itinerary) {
    return itinerary.dayByDay.map((day) => {
      const footnote = day.footnote
        ? `<div class="other">${escapeHtml(day.footnote)}</div>`
        : '';
      return `
        <div class="day-item">
          <div class="day-badge">Day ${day.dayNumber}</div>
          <h4>${escapeHtml(day.title)}</h4>
          <p>${escapeHtml(day.description)}</p>
          ${footnote}
        </div>`;
    }).join('');
  }

  function buildPanelHtml(itinerary) {
    const note = itinerary.note
      ? `<div class="itin-note">${escapeHtml(itinerary.note)}</div>`
      : '';
    return `
      <div class="itin-header">
        <h3>${escapeHtml(getDisplayTitle(itinerary))}</h3>
        <p>${escapeHtml(itinerary.nights)} Nights / ${escapeHtml(itinerary.days)} Days · ${escapeHtml(itinerary.packageDesc)}</p>
      </div>
      <div class="days-timeline">
        ${buildDaysHtml(itinerary)}
      </div>
      ${note}`;
  }

  function clearCountryGroup(countryGroup) {
    const grid = countryGroup.querySelector('.itin-card-grid');
    if (grid) grid.innerHTML = '';
  }

  function getOrCreateCountryGroup(itinerarySection, country, insertBefore) {
    const groupId = getCountryGroupId(country);
    let countryGroup = document.getElementById(groupId);

    if (!countryGroup) {
      countryGroup = document.createElement('div');
      countryGroup.className = 'itin-country-group';
      countryGroup.id = groupId;
      countryGroup.innerHTML = `
        <div class="itin-country-label">${escapeHtml(country)}</div>
        <div class="itin-card-grid"></div>`;
      if (insertBefore) {
        itinerarySection.insertBefore(countryGroup, insertBefore);
      } else {
        itinerarySection.appendChild(countryGroup);
      }
    }

    return countryGroup;
  }

  /* ---------- Pricing helpers ---------- */

  function parseFirstPrice(text) {
    if (!text) return null;
    const cleaned = String(text).replace(/,/g, '');
    const match = cleaned.match(/(\d+(?:\.\d+)?)/);
    return match ? Math.round(parseFloat(match[1])) : null;
  }

  /** Per-person "from" price for a package: always the country's published
   *  budget-tier starting price from the pricing summary table on the page. */
  function getFromPrice(itinerary) {
    const key = getCountryKey(itinerary.country);
    const row = document.getElementById('pricing-' + key);
    if (!row) return null;
    const cell = row.querySelector('.budget-price');
    if (!cell) return null;
    return parseFirstPrice(cell.textContent);
  }

  function formatEUR(n) {
    return '€' + n.toLocaleString('en-US');
  }

  /* ---------- Card rendering ---------- */

  function buildCardHtml(itinerary) {
    const price = getFromPrice(itinerary);
    const priceHtml = price
      ? `<div class="itin-card-price"><span class="from-label">From</span>${formatEUR(price)}<span class="pp-label"> / person</span></div>`
      : `<div class="itin-card-price itin-card-price-quote">Custom Quote</div>`;
    const hasImage = Boolean(itinerary.image);
    const coverStyle = hasImage ? ` style="background-image:url('${escapeHtml(itinerary.image)}')"` : '';
    const coverClass = 'itin-card-cover' + (hasImage ? ' has-image' : '');
    return `
      <div class="itin-card">
        <div class="${coverClass}"${coverStyle}>
          <span class="itin-card-badge">Package ${escapeHtml(itinerary.packageNumber || '?')}</span>
        </div>
        <div class="itin-card-body">
          <h4 class="itin-card-title">${escapeHtml(getDisplayTitle(itinerary))}</h4>
          <div class="itin-card-meta">${escapeHtml(itinerary.nights)} Nights · ${escapeHtml(itinerary.days)} Days</div>
          ${priceHtml}
          <div class="itin-card-actions">
            <button type="button" class="btn-see-trip" onclick="window.ItineraryUtils.openTripModal('${itinerary.id}')">See trip</button>
            <button type="button" class="btn-book" onclick="window.ItineraryUtils.openBookingModal('${itinerary.id}')">Book</button>
          </div>
        </div>
      </div>`;
  }

  function renderBrochureItineraries() {
    const itineraries = sortItineraries(
      ensurePackageNumbers(getBrochurePackages(getAllItinerariesSync()))
    );
    const itinerarySection = document.querySelector('.itinerary-inner');
    if (!itinerarySection) return;

    itineraryIndex = {};
    itineraries.forEach((it) => { itineraryIndex[it.id] = it; });

    const insertBefore = document.getElementById('itin-kenya-tanzania-morocco');
    const grouped = groupByCountry(itineraries);

    const sortedKeys = [...grouped.keys()].sort((a, b) => {
      const orderA = COUNTRY_ORDER.indexOf(a);
      const orderB = COUNTRY_ORDER.indexOf(b);
      const oa = orderA === -1 ? 999 : orderA;
      const ob = orderB === -1 ? 999 : orderB;
      if (oa !== ob) return oa - ob;
      return a.localeCompare(b);
    });

    sortedKeys.forEach((key) => {
      const { country, items } = grouped.get(key);
      const countryGroup = getOrCreateCountryGroup(itinerarySection, country, insertBefore);
      clearCountryGroup(countryGroup);

      let gridContainer = countryGroup.querySelector('.itin-card-grid');
      if (!gridContainer) {
        gridContainer = document.createElement('div');
        gridContainer.className = 'itin-card-grid';
        countryGroup.appendChild(gridContainer);
      }

      gridContainer.innerHTML = items.map((itinerary) => buildCardHtml(itinerary)).join('');
    });

    itinerarySection.querySelectorAll('.itin-country-group').forEach((group) => {
      if (group.id === 'itin-kenya-tanzania-morocco' || group.id === 'itin-other') return;
      group.style.display = group.querySelector('.itin-card') ? '' : 'none';
    });
  }

  /* ---------- Trip detail modal ("See trip") ---------- */

  let itineraryIndex = {};
  let currentBookingId = null;

  function lockScroll() { document.body.style.overflow = 'hidden'; }
  function unlockScroll() { document.body.style.overflow = ''; }

  function openModalEl(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.classList.add('active');
    lockScroll();
  }

  function closeModal(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.classList.remove('active');
    unlockScroll();
  }

  function buildTripDetailHtml(itinerary) {
    const note = itinerary.note
      ? `<div class="itin-note">${escapeHtml(itinerary.note)}</div>`
      : '';
    const price = getFromPrice(itinerary);
    const priceLine = price
      ? `From ${formatEUR(price)} per person`
      : 'Custom Quote — contact us for pricing';
    return `
      <div class="itin-header">
        <h3>${escapeHtml(getDisplayTitle(itinerary))}</h3>
        <p>${escapeHtml(itinerary.nights)} Nights / ${escapeHtml(itinerary.days)} Days · ${escapeHtml(itinerary.packageDesc || '')}</p>
        <p style="color:var(--rust);font-weight:600;margin-top:8px;">${priceLine}</p>
      </div>
      <div class="days-timeline">
        ${buildDaysHtml(itinerary)}
      </div>
      ${note}
      <button type="button" class="btn-book full-width" onclick="window.ItineraryUtils.closeModal('trip-modal-overlay');window.ItineraryUtils.openBookingModal('${itinerary.id}')">Book this trip</button>`;
  }

  function openTripModal(id) {
    const itinerary = itineraryIndex[id];
    if (!itinerary) return;
    const content = document.getElementById('trip-modal-content');
    if (content) content.innerHTML = buildTripDetailHtml(itinerary);
    openModalEl('trip-modal-overlay');
  }

  /* ---------- Booking modal ("Book") ---------- */

  function buildBookingFormHtml(itinerary) {
    const today = new Date().toISOString().split('T')[0];
    return `
      <div class="booking-trip-name">${escapeHtml(getDisplayTitle(itinerary))}</div>
      <div class="booking-trip-meta">${escapeHtml(itinerary.country)} · ${escapeHtml(itinerary.nights)} Nights / ${escapeHtml(itinerary.days)} Days</div>
      <div class="booking-field">
        <label for="booking-date">Preferred start date</label>
        <input type="date" id="booking-date" min="${today}" onchange="window.ItineraryUtils.updateBookingPrice()">
      </div>
      <div class="booking-field">
        <label for="booking-people">Number of people</label>
        <input type="number" id="booking-people" min="1" step="1" value="1" oninput="window.ItineraryUtils.updateBookingPrice()">
      </div>
      <div class="booking-price-box" id="booking-price-box"></div>
      <button type="button" class="btn-whatsapp-book" onclick="window.ItineraryUtils.sendBookingWhatsApp()">Send Booking Request via WhatsApp</button>`;
  }

  function openBookingModal(id) {
    const itinerary = itineraryIndex[id];
    if (!itinerary) return;
    currentBookingId = id;
    const content = document.getElementById('booking-modal-content');
    if (content) content.innerHTML = buildBookingFormHtml(itinerary);
    openModalEl('booking-modal-overlay');
    updateBookingPrice();
  }

  /** Group discount: more than 2 people (i.e. 3+) automatically gets 11% off. */
  function computeBookingPrice(itinerary, people) {
    const pricePerPerson = getFromPrice(itinerary);
    const safePeople = Math.max(1, parseInt(people, 10) || 1);
    if (!pricePerPerson) {
      return { pricePerPerson: null, people: safePeople, subtotal: null, discounted: safePeople > 2, savings: null, total: null };
    }
    const subtotal = pricePerPerson * safePeople;
    const discounted = safePeople > 2;
    const total = discounted ? Math.round(subtotal * 0.89) : subtotal;
    const savings = discounted ? subtotal - total : 0;
    return { pricePerPerson, people: safePeople, subtotal, discounted, savings, total };
  }

  function updateBookingPrice() {
    const itinerary = itineraryIndex[currentBookingId];
    const box = document.getElementById('booking-price-box');
    if (!itinerary || !box) return;
    const peopleInput = document.getElementById('booking-people');
    const calc = computeBookingPrice(itinerary, peopleInput ? peopleInput.value : 1);

    if (!calc.pricePerPerson) {
      box.innerHTML = `
        <div class="booking-price-row"><span>Pricing</span><span>Custom Quote</span></div>
        <div class="booking-discount-note">Groups of 3 or more automatically receive an 11% discount once we confirm your price.</div>`;
      return;
    }

    let html = `<div class="booking-price-row"><span>${formatEUR(calc.pricePerPerson)} × ${calc.people} ${calc.people === 1 ? 'person' : 'people'}</span><span>${formatEUR(calc.subtotal)}</span></div>`;
    if (calc.discounted) {
      html += `<div class="booking-price-row discount"><span>Group discount (11%)</span><span>-${formatEUR(calc.savings)}</span></div>`;
    }
    html += `<div class="booking-price-row total"><span>Total</span><span>${formatEUR(calc.total)}</span></div>`;
    if (!calc.discounted) {
      html += `<div class="booking-discount-note">Book for more than 2 people and save 11% automatically.</div>`;
    }
    box.innerHTML = html;
  }

  function sendBookingWhatsApp() {
    const itinerary = itineraryIndex[currentBookingId];
    if (!itinerary) return;
    const dateInput = document.getElementById('booking-date');
    const peopleInput = document.getElementById('booking-people');
    const date = dateInput ? dateInput.value : '';
    if (!date) {
      alert('Please select a preferred start date.');
      if (dateInput) dateInput.focus();
      return;
    }
    const calc = computeBookingPrice(itinerary, peopleInput ? peopleInput.value : 1);
    let msg = `Hello! I'd like to book a trip:\n\n`;
    msg += `Package: ${getDisplayTitle(itinerary)}\n`;
    msg += `Country: ${itinerary.country}\n`;
    msg += `Preferred start date: ${date}\n`;
    msg += `Number of people: ${calc.people}\n`;
    if (calc.pricePerPerson) {
      msg += `Price per person: ${formatEUR(calc.pricePerPerson)}\n`;
      if (calc.discounted) msg += `Group discount (11%) applied: -${formatEUR(calc.savings)}\n`;
      msg += `Estimated total: ${formatEUR(calc.total)}\n`;
    }
    msg += `\nPlease confirm availability. Thank you!`;
    const url = `https://wa.me/256770307890?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('trip-modal-overlay');
      closeModal('booking-modal-overlay');
    }
  });

  window.ItineraryUtils = {
    STORAGE_KEY,
    getCountryKey,
    getCountryGroupId,
    getSavedItineraries,
    getAllItineraries: getAllItinerariesSync,
    getAllItinerariesAsync: getAllItineraries,
    saveItineraries,
    saveAllItineraries,
    saveItinerariesAsync,
    ensurePackageNumbers,
    nextPackageNumber,
    formatPackageLabel,
    getDisplayTitle,
    sortItineraries,
    initItineraries,
    renderBrochureItineraries,
    getFromPrice,
    openTripModal,
    closeModal,
    openBookingModal,
    updateBookingPrice,
    sendBookingWhatsApp,
    isBrochurePackage,
    getBrochurePackages,
    getBrochureCountries,
    refreshCountryDatalist,
    getSiteBase,
    resolveSitePath,
    escapeHtml,
  };
})();
