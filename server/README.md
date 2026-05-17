# Africa Tours Server

This small Express server provides a simple API for storing itineraries and serves the static site files.

Setup

1. Install dependencies:

```bash
cd server
npm install
```

2. Start the server:

```bash
npm start
```

3. Open the tool in your browser:

- http://localhost:3000/package-insertion-tool.html
- http://localhost:3000/brochure.html

Notes

- The server stores itineraries in `server/data/itineraries.json`.
- Submissions from the insertion tool will be posted to `/api/itineraries` and persisted.
- The brochure page fetches `/api/itineraries` on load to display saved itineraries.
