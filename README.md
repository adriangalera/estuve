# estuve.eu

Visualize all your GPX tracks in a single place.

## Download all GPX tracks from Suunto

1. Go to https://www.sports-tracker.com/diary/workout-list
2. Open Developer tools
3. Copy the code of [scripts/suunto/extract.js](scripts/suunto/extract.js) there (it will be auto executed). Unfortunately, this step needs to be executed manually.
4. The script will generate a file named `data.json`.
5. Run `make suunto`
6. Run `make gpx`