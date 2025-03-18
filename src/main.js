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

const map = L.map("map").setView([41.53289317099601, 2.104000992549118], 4);

const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

const allaus = L.tileLayer.wms('https://geoserveis.icgc.cat/geoserver/nivoallaus/wms?', {
    layers: 'zonesallaus',
    opacity: 0.4
})

const baseMaps = {
    "OpenStreeMap": osm
}
const overlays = {
    "Allaus (ICGC)" : allaus
}

let qt = QuadTreeNode.empty()
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
    //overlays["Tracks"] = geoJsonLayer
    layerControl.addOverlay(geoJsonLayer, "Tracks")
}

document.addEventListener('mapUpdate', (event) => {
    let newGeoJsonLayer = container.setFromQuadTree(event.detail.qt)
    updateGeoJsonLayer(newGeoJsonLayer)
});

i18nPromise.then(() => {
    addInfoButton(map, i18next);
    addUploadButton(map, qt, progressBar, fileLoadedCache, qtStorage, geoJsonLayer);
    addClearStorageButton(map, fileLoadedCache, qtStorage, qt, i18next)

    qtStorage.load()
        .then(qt => {
            const initialGeoJsonLayer = container.setFromQuadTree(qt)
            updateGeoJsonLayer(initialGeoJsonLayer)
        })
})

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        const initialLatLng = new L.LatLng(position.coords.latitude, position.coords.longitude)
        map.panTo(initialLatLng)
    })
}

//Export some libraries to global scope so that other libraries can find them.
window.i18next = i18next


const layerControl = L.control.layers(
    baseMaps,
    overlays,
    { collapsed: false }
).addTo(map);