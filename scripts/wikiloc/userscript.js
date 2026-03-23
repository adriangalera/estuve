// ==UserScript==
// @name         Wikiloc - Auto Export
// @namespace    https://estuve.eu
// @version      3.0
// @description  Automatically downloads all tracks as original GPX files
// @match        https://www.wikiloc.com/wikiloc/user.do*
// @match        https://www.wikiloc.com/wikiloc/download.do*
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @connect      www.wikiloc.com
// @run-at       document-idle
// ==/UserScript==

const LOCAL_SERVER = 'http://127.0.0.1:7433';
const STORAGE_KEY = 'wl_export_queue';
const CACHE_KEY = 'wl_downloaded';
const PAGE_SIZE = 10;
const DOWNLOAD_DELAY_MS = 4000;

const cache = {
    get: () => new Set(JSON.parse(localStorage.getItem(CACHE_KEY) || '[]')),
    add: (id) => { const s = cache.get(); s.add(id); localStorage.setItem(CACHE_KEY, JSON.stringify([...s])); },
    clear: () => localStorage.removeItem(CACHE_KEY),
};

let banner = null;
const showStatus = (msg, { error = false } = {}) => {
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'wl-export-banner';
        Object.assign(banner.style, {
            position: 'fixed', bottom: '20px', right: '20px', zIndex: '99999',
            background: '#1a1a2e', color: '#e0e0e0', fontFamily: 'monospace',
            fontSize: '13px', padding: '10px 16px', borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)', maxWidth: '360px',
        });
        document.documentElement.appendChild(banner);
    }
    banner.style.borderLeft = `4px solid ${error ? '#e74c3c' : '#2ecc71'}`;
    banner.textContent = msg;
};

const log = (msg) => { console.log(`[Wikiloc Export] ${msg}`); showStatus(msg); };

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const gmRequest = (method, url, data) => new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
        method,
        url,
        headers: data ? { 'Content-Type': 'application/json' } : {},
        data: data ? JSON.stringify(data) : undefined,
        onload: (res) => resolve(res),
        onerror: () => reject(new Error(`Request failed: ${url}`)),
    });
});

const fetchPage = (url) => gmRequest('GET', url).then(r => r.responseText);

const extractTrackIds = (html) => {
    const matches = html.matchAll(/href="\/[\w-]+-trails\/[\w-]+-(\d+)"/g);
    return [...new Set([...matches].map(m => m[1]))];
};

// ── Profile page ─────────────────────────────────────────────────────────────

const runProfilePage = async () => {
    try {
        const userId = new URLSearchParams(location.search).get('id');
        if (!userId) throw new Error('Could not determine user ID from URL');

        log('Fetching first page to count tracks...');
        const firstPage = await fetchPage(`https://www.wikiloc.com/wikiloc/user.do?id=${userId}&from=0&to=${PAGE_SIZE}`);
        const allIds = extractTrackIds(firstPage);

        const lastPageMatches = [...firstPage.matchAll(/from=(\d+)&to=\d+/g)];
        const maxFrom = lastPageMatches.length
            ? Math.max(...lastPageMatches.map(m => parseInt(m[1])))
            : 0;

        if (maxFrom > 0) {
            const totalPages = Math.ceil((maxFrom + PAGE_SIZE) / PAGE_SIZE);
            for (let from = PAGE_SIZE; from <= maxFrom; from += PAGE_SIZE) {
                const html = await fetchPage(`https://www.wikiloc.com/wikiloc/user.do?id=${userId}&from=${from}&to=${from + PAGE_SIZE}`);
                for (const id of extractTrackIds(html)) if (!allIds.includes(id)) allIds.push(id);
                log(`Fetching pages... (${allIds.length} tracks found)`);
            }
        }

        const downloaded = cache.get();
        const pending = allIds.filter(id => !downloaded.has(id));
        log(`Found ${allIds.length} tracks, ${pending.length} pending. Starting downloads...`);

        if (pending.length === 0) {
            log('All tracks already downloaded!');
            await gmRequest('POST', `${LOCAL_SERVER}/done`);
            return;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids: pending, index: 0, total: pending.length }));
        location.href = `https://www.wikiloc.com/wikiloc/download.do?id=${pending[0]}`;
    } catch (err) {
        log(`Error: ${err.message}`);
        showStatus(`Error: ${err.message}`, { error: true });
    }
};

// ── Download page ─────────────────────────────────────────────────────────────

const waitForElement = (selector, timeoutMs = 15000) => new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const check = () => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);
        if (Date.now() >= deadline) return reject(new Error(`Timeout waiting for "${selector}" — Cloudflare challenge?`));
        setTimeout(check, 300);
    };
    check();
});

const runDownloadPage = async () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const state = JSON.parse(raw);
    const { ids, index, total } = state;

    try {
        log(`Downloading track ${index + 1}/${total}...`);

        const fileTab = await waitForElement('a[href="#download-file"]');
        fileTab.click();

        const submitBtn = await waitForElement('#btn-download-file');
        await delay(1500);

        const originalRadio = document.querySelector('input[name="filter"][value="original"]');
        if (originalRadio) originalRadio.click();
        // else: no original option — GPX is already selected by default

        submitBtn.click();

        await delay(DOWNLOAD_DELAY_MS);
        cache.add(ids[index]);

        const nextIndex = index + 1;
        if (nextIndex < ids.length) {
            state.index = nextIndex;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            location.href = `https://www.wikiloc.com/wikiloc/download.do?id=${ids[nextIndex]}`;
        } else {
            localStorage.removeItem(STORAGE_KEY);
            log(`All ${total} tracks downloaded!`);
            await gmRequest('POST', `${LOCAL_SERVER}/done`);
        }
    } catch (err) {
        log(`Error on track ${ids[index]}: ${err.message}`);
        showStatus(`Error: ${err.message}`, { error: true });
    }
};

// ── Router ────────────────────────────────────────────────────────────────────

if (location.pathname === '/wikiloc/user.do') {
    gmRequest('GET', `${LOCAL_SERVER}/ping`)
        .then((res) => {
            const { reset } = JSON.parse(res.responseText);
            if (reset) cache.clear();
            runProfilePage();
        })
        .catch(() => {}); // server not running, do nothing
}

if (location.pathname === '/wikiloc/download.do') runDownloadPage();
