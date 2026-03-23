// ==UserScript==
// @name         Sports Tracker - Auto Export
// @namespace    https://estuve.eu
// @version      1.1
// @description  Automatically extracts all workouts and sends them to the local server
// @match        https://www.sports-tracker.com/*
// @grant        GM_xmlhttpRequest
// @grant        window.onurlchange
// @connect      127.0.0.1
// @run-at       document-idle
// ==/UserScript==

const TARGET_PATH = '/diary/workout-list';
const LOCAL_SERVER = 'http://127.0.0.1:7432/data';
const SHOW_MORE_CLICKS = 100;
const CLICK_DELAY_MS = 500;

const log = (msg) => console.log(`[Sports Tracker Export] ${msg}`);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const waitForElement = (selector) => new Promise((resolve) => {
    const check = () => {
        const el = document.querySelector(selector);
        if (el) resolve(el);
        else setTimeout(check, 300);
    };
    check();
});

const extractToken = () => {
    const key = 'sessionkey=';
    const valueStartIndex = document.cookie.indexOf(key) + key.length;
    return document.cookie.substring(valueStartIndex, document.cookie.indexOf(';', valueStartIndex));
};

const extractWorkouts = () => {
    const workouts = [];
    const items = document.querySelectorAll('ul.diary-list__workouts li a');
    for (let i = 0; i < items.length; i++) {
        const href = items[i].getAttribute('href');
        const km = items[i].children[4]?.innerText ?? '';
        const id = href.slice(href.lastIndexOf('/') + 1, href.lastIndexOf('/') + 25);
        workouts.push({ id, distance: km });
    }
    return workouts;
};

const clickShowMore = async () => {
    for (let i = 0; i < SHOW_MORE_CLICKS; i++) {
        const btn = document.getElementsByClassName('show-more')[0];
        if (!btn || btn.classList.contains('ng-hide')) break;
        btn.click();
        await delay(CLICK_DELAY_MS);
    }
};

const sendToServer = (data) => new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
        method: 'POST',
        url: LOCAL_SERVER,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(data),
        onload: (res) => {
            const body = JSON.parse(res.responseText);
            if (body.ok) resolve(body);
            else reject(new Error(body.error));
        },
        onerror: () => reject(new Error('Could not reach local server. Is it running? Run: node scripts/suunto/server.js')),
    });
});

const run = async () => {
    try {
        log('Waiting for workout list to load...');
        await waitForElement('ul.diary-list__workouts li');
        log('Clicking "Show More" to load all workouts...');
        await clickShowMore();

        const token = extractToken();
        const ids = extractWorkouts();
        log(`Extracted ${ids.length} workouts. Sending to local server...`);

        const result = await sendToServer({ token, ids });
        log(`Done! Server received ${result.workouts} workouts and started the download pipeline.`);
    } catch (err) {
        log(`Error: ${err.message}`);
    }
};

// Handle SPA navigation via Tampermonkey's built-in URL change event
;/** @type {any} */ (window).onurlchange = (e) => {
    if (new URL(e.url).pathname === TARGET_PATH) run();
};

// Run immediately if already on the target page
if (location.pathname === TARGET_PATH) run();
