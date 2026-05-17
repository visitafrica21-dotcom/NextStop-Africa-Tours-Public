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

  function saveItineraries(list) {
    saveAllItineraries(list);
  }

  function saveAllItineraries(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
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
    let list = getAllItinerariesSync();
    let legacy = [];

    try {
      legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]');
      if (!Array.isArray(legacy)) legacy = [];
    } catch {
      legacy = [];
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
    }

    if (legacy.length > 0) {
      legacy.forEach((item) => {
        if (!list.find((x) => x.id === item.id)) list.push(item);
      });
      localStorage.removeItem(LEGACY_KEY);
    }

    list = ensurePackageNumbers(list.filter(isBrochurePackage));
    saveAllItineraries(list);
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
    const tabs = countryGroup.querySelector('.itin-tabs');
    if (tabs) tabs.innerHTML = '';
    countryGroup.querySelectorAll('.itin-panel, .itin-note').forEach((el) => el.remove());
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
        <div class="itin-tabs"></div>`;
      if (insertBefore) {
        itinerarySection.insertBefore(countryGroup, insertBefore);
      } else {
        itinerarySection.appendChild(countryGroup);
      }
    }

    return countryGroup;
  }

  function renderBrochureItineraries() {
    const itineraries = sortItineraries(
      ensurePackageNumbers(getBrochurePackages(getAllItinerariesSync()))
    );
    const itinerarySection = document.querySelector('.itinerary-inner');
    if (!itinerarySection) return;

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

      let tabsContainer = countryGroup.querySelector('.itin-tabs');
      if (!tabsContainer) {
        tabsContainer = document.createElement('div');
        tabsContainer.className = 'itin-tabs';
        countryGroup.appendChild(tabsContainer);
      }

      const groupSlug = countryGroup.id.replace('itin-', '') + '-group';

      items.forEach((itinerary, index) => {
        const isActive = index === 0;
        const button = document.createElement('button');
        button.className = 'itin-btn' + (isActive ? ' active' : '');
        button.textContent = formatPackageLabel(itinerary);
        button.addEventListener('click', function (e) {
          e.preventDefault();
          if (typeof window.showItin === 'function') {
            window.showItin(itinerary.id, this, groupSlug);
          }
        });
        tabsContainer.appendChild(button);

        const panel = document.createElement('div');
        panel.id = itinerary.id;
        panel.className = 'itin-panel' + (isActive ? ' active' : '');
        panel.innerHTML = buildPanelHtml(itinerary);
        countryGroup.appendChild(panel);
      });
    });

    itinerarySection.querySelectorAll('.itin-country-group').forEach((group) => {
      if (group.id === 'itin-kenya-tanzania-morocco' || group.id === 'itin-other') return;
      group.style.display = group.querySelector('.itin-btn') ? '' : 'none';
    });
  }

  window.ItineraryUtils = {
    STORAGE_KEY,
    getCountryKey,
    getCountryGroupId,
    getSavedItineraries,
    getAllItineraries: getAllItinerariesSync,
    saveItineraries,
    saveAllItineraries,
    ensurePackageNumbers,
    nextPackageNumber,
    formatPackageLabel,
    getDisplayTitle,
    sortItineraries,
    initItineraries,
    renderBrochureItineraries,
    isBrochurePackage,
    getBrochurePackages,
    getBrochureCountries,
    refreshCountryDatalist,
    getSiteBase,
    resolveSitePath,
    escapeHtml,
  };
})();
