import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import "leaflet.markercluster.layersupport";

import "leaflet-easybutton";
import "leaflet-easybutton/src/easy-button.css";

import geojsonvt from 'geojson-vt';
import "leaflet-geojson-vt"

import { addInfoButton } from './infobutton';
import { geoJsonData } from './tibet'
import { i18next, i18nPromise } from './i18n.js';

//Export some libraries to global scope so that other libraries can find them.
window.geojsonvt = geojsonvt;
window.i18next = i18next

// ✅ Initialize Leaflet Map
const map = L.map("map").setView([0, 0], 4);

// ✅ Add a Tile Layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

/*
// ✅ Initialize Marker Cluster Group
const markers = L.markerClusterGroup();
//L.marker([51.5, -0.09]).addTo(markers);
map.addLayer(markers);

// ✅ Add an EasyButton
L.easyButton("fa-globe", function (btn, map) {
    alert("Button clicked!");
}).addTo(map);

function waitForLeafletGeoJson(callback, interval = 100) {
    const checkExist = setInterval(() => {
        if (L.geoJson) {
            clearInterval(checkExist); // Stop checking
            callback(); // Execute the function
        }
    }, interval);
}

// ✅ Define the function that needs to run after L.geoJson is available
function initializeGeoJsonLayer() {
    console.log("L.geoJson is now available. Adding GeoJSON-VT layer...");

    const geojsonStyle = {
        color: "#3388FF",
        weight: 2,
        fillOpacity: 0.2,
    };

    const options = {
        maxZoom: 20,
        tolerance: 3,
        debug: 0,
        style: geojsonStyle,
        zIndex: 2,
    };

    // ✅ Add GeoJSON-VT layer to the map once L.geoJson is available
    L.geoJson.vt(geoJsonData, options).addTo(map);
}

// ✅ Start waiting for L.geoJson
waitForLeafletGeoJson(initializeGeoJsonLayer);
*/

// Add the info button
addInfoButton(map, i18next);