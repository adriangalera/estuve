import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import "leaflet.markercluster.layersupport";

import "leaflet-easybutton";
import "leaflet-easybutton/src/easy-button.css";


import { addInfoButton } from './buttons/infobutton';
import { QuadTreeNode } from "./quadtree.js";
import { i18next, i18nPromise } from './i18n.js';
import { addUploadButton } from "./buttons/upload.js";
import { GeoJsonContainer } from "./geojsoncontainer.js";
import { addProgressBar } from './progressbar/creator.js'
import { FileLoadStorage } from './storage/filesLoaded.js'
import { QuadtreeStorage } from "./storage/quadtreeStorage.js";
import { addClearStorageButton } from "./buttons/clearStorage.js";

//Export some libraries to global scope so that other libraries can find them.
window.i18next = i18next

const map = L.map("map").setView([41.53289317099601, 2.104000992549118], 4);

// ✅ Add a Tile Layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let qt = QuadTreeNode.empty()
let geoJsonLayer = null;

const progressBar = addProgressBar(map)
const fileLoadedCache = FileLoadStorage()
const qtStorage = QuadtreeStorage()
const container = GeoJsonContainer()

document.addEventListener('mapUpdate', (event) => {
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer); // Remove previous layer
    }
    let newGeoJsonLayer = container.setFromQuadTree(event.detail.qt)
    newGeoJsonLayer.addTo(map);
    geoJsonLayer = newGeoJsonLayer
});

i18nPromise.then(() => {
    addInfoButton(map, i18next);
    addUploadButton(map, qt, progressBar, fileLoadedCache, qtStorage);
    addClearStorageButton(map, fileLoadedCache, qtStorage, qt, i18next)

    qtStorage.load()
        .then(qt => {
            const layer = container.setFromQuadTree(qt)
            layer.addTo(map)
        })
})

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        const initialLatLng = new L.LatLng(position.coords.latitude, position.coords.longitude)
        map.panTo(initialLatLng)
    })
}

const countLayers = () => {
    let layerCount = 0;
    map.eachLayer(() => layerCount++);
}
window.count = countLayers