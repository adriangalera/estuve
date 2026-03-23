// Local server that receives workout data from the Tampermonkey userscript
// and automatically runs the download pipeline.
//
// Usage: node scripts/suunto/server.js
const http = require('http');
const fs = require('fs');
const { execSync } = require('child_process');

const PORT = 7432;
const DATA_PATH = 'scripts/suunto/data.json';

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.sports-tracker.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'POST' || req.url !== '/data') {
        res.writeHead(404);
        res.end();
        return;
    }

    let body = '';
    let receiving = false;
    req.on('data', chunk => {
        if (!receiving) { receiving = true; console.log('Receiving data from browser...'); }
        body += chunk;
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (!data.token || !Array.isArray(data.ids)) {
                throw new Error('Invalid payload: expected { token, ids }');
            }

            fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
            console.log(`\nReceived ${data.ids.length} workouts. Starting download...`);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, workouts: data.ids.length }));

            // Run the download + gpx pipeline
            execSync('node scripts/suunto/download.js', { stdio: 'inherit' });
            execSync('make gpx', { stdio: 'inherit' });
            console.log('\nAll done! GPX files are up to date.');
            server.close();
        } catch (err) {
            console.error('Error:', err.message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: err.message }));
        }
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Waiting for data from browser...`);
    console.log(`Server listening on http://127.0.0.1:${PORT}`);
    console.log(`\nNow visit https://www.sports-tracker.com/diary/workout-list in your browser.`);
    console.log(`The Tampermonkey userscript will do the rest.\n`);
});
