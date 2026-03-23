# estuve.eu

Visualize all your GPX tracks in a single place.

## Download all GPX tracks from Wikiloc

Requires [Tampermonkey](https://www.tampermonkey.net/) installed in your browser.

1. Install the userscript from [scripts/wikiloc/userscript.js](scripts/wikiloc/userscript.js) in Tampermonkey.
2. Run `make wikiloc` (or `make wikiloc-reset` to re-download everything from scratch).
3. Visit your Wikiloc profile page in the browser — the userscript will take over automatically.
4. GPX files are downloaded by the browser and moved to `gpx/wikiloc/` as they arrive.
5. Once all tracks are done, `make gpx` runs automatically.

> The script selects the **Original** format when available, and falls back to GPX otherwise.

## Download all GPX tracks from Suunto

Requires [Tampermonkey](https://www.tampermonkey.net/) installed in your browser.

1. Install the userscript from [scripts/suunto/userscript.js](scripts/suunto/userscript.js) in Tampermonkey.
2. Run `make suunto`.
3. Visit https://www.sports-tracker.com/diary/workout-list in your browser — the userscript will take over automatically.
4. The script loads all workouts, sends them to the local server, which downloads the GPX files and runs `make gpx`.