import { TrackParser } from "../parser/trackparser";

const METERS_TOLERANCE = 10;
const UPDATE_MAP_EACH = 50;

export const addUploadButton = (map, quadtree, progressBar, fileLoadedCache, qtStorage) => {

    const triggerMapUpdate = () => {
        qtStorage.save(quadtree)
        document.dispatchEvent(new CustomEvent('mapUpdate', { detail: { qt: quadtree } }));
    }

    const handleMultipleGpxUpload = async (event) => {
        const parser = TrackParser()
        const files = event.target.files;
        if (!files.length) return;

        progressBar.loadWithCurrentTotal(0, files.length)

        let counter = 0
        for (let file of files) {
            if (!fileLoadedCache.isAlreadyLoaded(file)) {
                const response = await parser.parseGpxTrackInWorker(file)
                const points = response.data
                for (let point of points) {
                    const lat = point.lat
                    const lng = point.lon
                    if (!quadtree.locationIsOnTree(lat, lng, METERS_TOLERANCE)) {
                        quadtree.insertLatLng(lat, lng)
                    }
                }
                counter += 1
                if (counter % UPDATE_MAP_EACH == 0) {
                    progressBar.loadWithCurrentTotal(counter, files.length)
                    triggerMapUpdate()
                }
                fileLoadedCache.saveUploadedFile(file)
            }
        }

        progressBar.stop()
        triggerMapUpdate()
    }

    const fileInput = document.getElementById('gpxFileInput');
    fileInput.addEventListener('change', handleMultipleGpxUpload);

    // Add a Leaflet EasyButton to trigger file selection by clicking the hidden file input
    L.easyButton('fa-upload', () => fileInput.click(), 'Upload GPX Files').addTo(map);
}