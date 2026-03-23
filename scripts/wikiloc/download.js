// Download all tracks from Wikiloc as original GPX files
const fs = require('fs');
const fetch = require('node-fetch');

const OUTPUT_DIR = './gpx/wikiloc';
const DELAY_MS = 1000;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const alreadyDownloaded = (id) => fs.existsSync(`${OUTPUT_DIR}/${id}.gpx`);

const downloadGpx = async (id, cookie, current, total) => {
    const fileName = `${OUTPUT_DIR}/${id}.gpx`;
    const res = await fetch('https://www.wikiloc.com/wikiloc/downloadToFile.do', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookie,
        },
        body: `id=${id}&event=download&format=gpx&filter=original`,
        redirect: 'follow',
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} for track ${id}`);

    const text = await res.text();
    if (!text.includes('<gpx')) throw new Error(`Response for track ${id} is not a GPX file`);

    fs.writeFileSync(fileName, text);
    console.log(`Downloaded: ${fileName} (${current}/${total})`);
};

const downloadAllTracks = async () => {
    const data = JSON.parse(fs.readFileSync('scripts/wikiloc/data.json'));
    const { cookie, trackIds } = data;

    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    for (let i = 0; i < trackIds.length; i++) {
        const id = trackIds[i];
        if (alreadyDownloaded(id)) {
            console.log(`** Skipping already downloaded ${id}`);
            continue;
        }
        try {
            await downloadGpx(id, cookie, i + 1, trackIds.length);
        } catch (err) {
            console.error(`Error downloading track ${id}: ${err.message}`);
        }
        await delay(DELAY_MS);
    }

    console.log('\nAll done!');
};

downloadAllTracks();
