import { TrackParser } from "../parser/trackparser";
import { QuadTreeNode } from "../quadtree"

const METERS_TOLERANCE = 10;
const UPDATE_MAP_EACH = 50;

export const fontAwesomeSymbol = 'fa-upload'

export const addUploadButton = (map, progressBar, i18next, storage) => {
    const { qt, fileLoadedCache, qtStorage } = storage
    const quadtree = qt

    const triggerMapUpdate = (newQuadTree) => {
        qtStorage.save(newQuadTree)
        document.dispatchEvent(new CustomEvent('mapUpdate', { detail: { qt: newQuadTree } }));
    }

    const getFileExtension = (filename) => filename.split('.').pop();

    const handleMultipleGpxUpload = async (event) => {
        const parser = TrackParser()
        const files = event.target.files;
        if (!files.length) return;

        progressBar.loadWithCurrentTotal(0, files.length)
        const uniqueExtensions = new Set(Array.from(files).map((f) => getFileExtension(f.name)))
        if (uniqueExtensions.size > 1) {
            alert(i18next.t("upload.alert"))
            return;
        }
        const extension = uniqueExtensions.values().next().value

        if (extension === "gpx") {
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
                        triggerMapUpdate(quadtree)
                    }
                    fileLoadedCache.saveUploadedFile(file)
                }
            }
        } else if (extension === "bin" && files.length == 1) {
            const reader = new FileReader();

            reader.onload = () => {
                const strData = atob(reader.result)
                const backup = JSON.parse(strData)
                const newQt = backup.qt
                const loadedFiles = backup.filesLoaded

                storage.fileLoadedCache.putAll(loadedFiles)
                const qt = QuadTreeNode.deserialize(newQt)
                triggerMapUpdate(qt)
                
            };
            reader.onerror = () => {
                const message = `${i18next.t("upload.error")} ${files[0].name}`
                alert(message)
            };

            reader.readAsText(files[0]);
        }

        progressBar.stop()
        triggerMapUpdate(quadtree)
    }

    const fileInput = document.getElementById('gpxFileInput');
    fileInput.addEventListener('change', handleMultipleGpxUpload);

    // Add a Leaflet EasyButton to trigger file selection by clicking the hidden file input
    L.easyButton(fontAwesomeSymbol, () => fileInput.click(), i18next.t("upload.button")).addTo(map);
}