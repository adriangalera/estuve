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
import { GeoJsonContainer } from "./geojson/geojsoncontainer.js";
import { addProgressBar } from './progressbar/creator.js'
import { FileLoadStorage } from './storage/filesLoaded.js'
import { GeoJsonStorage } from "./storage/geoJsonStorage.js";
import { addClearStorageButton } from "./buttons/clearStorage.js";
import { pointsFromGeoJson } from "./geojson/utils";

//Export some libraries to global scope so that other libraries can find them.
window.i18next = i18next

const map = L.map("map").setView([0, 0], 4);

// ✅ Add a Tile Layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let qt = QuadTreeNode.empty()
const progressBar = addProgressBar(map)
const fileLoadedCache = FileLoadStorage()
const geoJsonStorage = GeoJsonStorage()
const container = GeoJsonContainer(geoJsonStorage)

document.addEventListener('mapUpdate', (quadtree) => {
    console.log(`mapUpdate: ${quadtree.points()}`)
    qt = quadtree
    let geoJsonLayer = container.setFromPoints(qt.points())
    geoJsonLayer.addTo(map);
    //TODO: Make sure the layer is replaced
});

i18nPromise.then(() => {
    addInfoButton(map, i18next);
    addUploadButton(map, qt, progressBar, fileLoadedCache);
    addClearStorageButton(map, fileLoadedCache, geoJsonStorage, qt)

    geoJsonStorage.load()
        .then(geoJson => {
            console.log(`Loaded geoJson ${JSON.stringify(geoJson)}`)
            if (geoJson) { 
                qt = QuadTreeNode.empty()
                const points = pointsFromGeoJson(geoJson)
                points.forEach(point => qt.insertLatLng(point.lat, point.lon))
                console.log(qt.points().length)
                const layer = container.setFromGeoJson(geoJson);
                layer.addTo(map);
            }
        })
})

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        const initialLatLng = new L.LatLng(position.coords.latitude, position.coords.longitude)
        map.panTo(initialLatLng)
    })
}