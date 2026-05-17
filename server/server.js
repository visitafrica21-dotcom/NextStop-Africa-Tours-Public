const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'itineraries.json');
const BUILTIN_FILE = path.join(__dirname, '..', 'data', 'built-in-itineraries.json');

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static site from project root (parent directory of server)
app.use(express.static(path.join(__dirname, '..')));

// Ensure data folder/file exists
async function ensureDataFile() {
  try {
    await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    await fs.access(DATA_FILE);
  } catch (err) {
    await fs.writeFile(DATA_FILE, '[]', 'utf8');
  }
}

async function loadItinerariesList() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  let list = JSON.parse(raw || '[]');
  if (list.length === 0) {
    try {
      const builtinRaw = await fs.readFile(BUILTIN_FILE, 'utf8');
      list = JSON.parse(builtinRaw || '[]');
      await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
    } catch {
      /* built-in file optional */
    }
  }
  return list;
}

// GET itineraries
app.get('/api/itineraries', async (req, res) => {
  try {
    const list = await loadItinerariesList();
    res.json(list);
  } catch (err) {
    console.error('Error reading itineraries:', err);
    res.status(500).json({ error: 'Failed to read itineraries' });
  }
});

// POST itinerary
app.post('/api/itineraries', async (req, res) => {
  try {
    const item = req.body;
    if (!item || !item.id) {
      return res.status(400).json({ error: 'Invalid itinerary object (missing id)' });
    }

    const list = await loadItinerariesList();

    // Avoid duplicates
    if (!list.find(x => x.id === item.id)) {
      list.push(item);
      await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
    }

    res.status(201).json(item);
  } catch (err) {
    console.error('Error saving itinerary:', err);
    res.status(500).json({ error: 'Failed to save itinerary' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
