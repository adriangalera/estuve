import { parseGpxTrack } from "../trackparser";

const METERS_TOLERANCE = 10;

export const addUploadButton = (map, quadtree, progressBar, fileLoadedCache) => {

    const triggerMapUpdate = () => {
        document.dispatchEvent(new CustomEvent('mapUpdate', quadtree));
    }

    const handleMultipleGpxUpload = async (event) => {
        const files = event.target.files;
        if (!files.length) return;

        progressBar.loadWithCurrentTotal(0, files.length)
        let counter = 0
        for (let file of files) {
            if (!fileLoadedCache.isAlreadyLoaded(file)) {
                await handleGpxFile(file)
                counter += 1
                if (counter % 10 == 0) {
                    progressBar.loadWithCurrentTotal(counter, files.length)
                    triggerMapUpdate()
                }
            }
        }
        progressBar.stop()
        triggerMapUpdate()
    }

    const handleGpxFile = async (file) => {
        const points = await parseGpxTrack(file)
        for (let point of points) {
            const lat = point.lat
            const lng = point.lon
            if (!quadtree.locationIsOnTree(lat, lng, METERS_TOLERANCE)) {
                quadtree.insertLatLng(lat, lng)
            }
        }
        fileLoadedCache.saveUploadedFile(file)
    }

    const fileInput = document.getElementById('gpxFileInput');
    fileInput.addEventListener('change', handleMultipleGpxUpload);

    // Add a Leaflet EasyButton to trigger file selection by clicking the hidden file input
    L.easyButton('fa-upload', () => fileInput.click(), 'Upload GPX Files').addTo(map);
}