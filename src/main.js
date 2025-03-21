import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import "leaflet.markercluster.layersupport";

import "leaflet-easybutton";
import "leaflet-easybutton/src/easy-button.css";


import { addInfoButton } from './buttons/infobutton';
import { i18next, i18nPromise } from './i18n.js';
import { addUploadButton } from "./buttons/upload.js";
import { GeoJsonContainer } from "./geojsoncontainer.js";
import { addProgressBar } from './progressbar/creator.js'
import { FileLoadStorage } from './storage/filesLoaded.js'
import { QuadtreeStorage } from "./storage/quadtreeStorage.js";
import { addClearStorageButton } from "./buttons/clearStorage.js";
import { addDownloadButton } from "./buttons/download.js";
import { registerMapsAndLayers } from "./maps.js"


const map = L.map("map").setView([41.53289317099601, 2.104000992549118], 4);
const layerControl = registerMapsAndLayers(map)

let geoJsonLayer = null;

const progressBar = addProgressBar(map)
const fileLoadedCache = FileLoadStorage()
const qtStorage = QuadtreeStorage()
const container = GeoJsonContainer()

const updateGeoJsonLayer = (newGeoJsonLayer) => {
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
        layerControl.removeLayer(geoJsonLayer)
    }
    newGeoJsonLayer.addTo(map);
    geoJsonLayer = newGeoJsonLayer
    window.geoJsonLayer = geoJsonLayer
    layerControl.addOverlay(geoJsonLayer, "Tracks")
}

document.addEventListener('mapUpdate', (event) => {
    let newGeoJsonLayer = container.setFromQuadTree(event.detail.qt)
    updateGeoJsonLayer(newGeoJsonLayer)
});

Promise.all([i18nPromise, qtStorage.load()])
    .then(([_, qt]) => {

        const storage = { qt, fileLoadedCache, qtStorage }

        addInfoButton(map, i18next);
        addUploadButton(map, progressBar, i18next, storage);
        addDownloadButton(map, storage, i18next);
        addClearStorageButton(map, storage, i18next);

        const initialGeoJsonLayer = container.setFromQuadTree(qt);
        updateGeoJsonLayer(initialGeoJsonLayer);
    })
    .catch(error => {
        console.error("Error loading dependencies:", error);
    });

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        const initialLatLng = new L.LatLng(position.coords.latitude, position.coords.longitude)
        map.panTo(initialLatLng)
    })
}

//Export some libraries to global scope so that other libraries can find them.
window.i18next = i18next

