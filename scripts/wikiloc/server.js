// Local server that signals the Tampermonkey userscript to start exporting
// and runs post-processing when all downloads are done.
//
// Usage: node scripts/wikiloc/server.js [--reset]
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const PORT = 7433;
const reset = process.argv.includes('--reset');
const downloadsDir = path.join(os.homedir(), 'Downloads');
const gpxDir = path.resolve(__dirname, '../../gpx/wikiloc');

const startWatcher = () => {
    fs.mkdirSync(gpxDir, { recursive: true });
    const watcher = fs.watch(downloadsDir, (event, filename) => {
        if (event !== 'rename' || !filename || !filename.endsWith('.gpx')) return;
        const src = path.join(downloadsDir, filename);
        setTimeout(() => {
            try {
                if (!fs.existsSync(src)) return;
                const base = filename.slice(0, -4); // strip .gpx
                let dest = path.join(gpxDir, filename);
                let n = 1;
                while (fs.existsSync(dest)) dest = path.join(gpxDir, `${base}${n++}.gpx`);
                fs.renameSync(src, dest);
                console.log(`  Moved: ${path.basename(dest)}`);
            } catch (e) { /* already moved or in use */ }
        }, 500);
    });
    return watcher;
};

let watcher = null;

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.wikiloc.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, reset }));
        console.log(`Browser connected. Export started.${reset ? ' (cache cleared)' : ''}`);
        if (!watcher) watcher = startWatcher();
        return;
    }

    if (req.method === 'POST' && req.url === '/done') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
        if (watcher) { watcher.close(); watcher = null; }
        console.log('\nAll tracks downloaded. Running post-processing...');
        execSync('make gpx', { stdio: 'inherit' });
        console.log('\nAll done! GPX files are up to date.');
        server.close();
        return;
    }

    res.writeHead(404);
    res.end();
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Waiting for browser...`);
    console.log(`Server listening on http://127.0.0.1:${PORT}`);
    console.log(`Saving GPX files to: ${gpxDir}`);
    console.log(`\nNow visit https://www.wikiloc.com/wikiloc/user.do?id=757241 in your browser.`);
    console.log(`The Tampermonkey userscript will do the rest.\n`);
});
