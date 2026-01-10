import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "leaflet-easybutton";
import "leaflet-easybutton/src/easy-button.css";

import 'leaflet-geosearch/dist/geosearch.css';
import { SearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

import { i18next, i18nPromise } from './i18n.js';
import { registerMapsAndLayers } from "./maps.js";
import { GpxManager } from "./plan/gpxManager.js";
import { addPlanUploadButton } from "./plan/uploadGpx.js";
import { addPlanDeleteButton } from "./plan/deleteGpx.js";

// Initialize the map
const map = L.map("map").setView([41.53289317099601, 2.104000992549118], 4);

// Register base maps and overlay layers (this creates the layer control)
const layerControl = registerMapsAndLayers(map);

// Initialize GPX manager
const gpxManager = GpxManager();

// Wait for i18n to be ready, then add the buttons
i18nPromise
    .then(() => {
        // Add upload button
        addPlanUploadButton(map, gpxManager, layerControl, i18next);
        
        // Add delete button
        addPlanDeleteButton(map, gpxManager, layerControl, i18next);
    })
    .catch(error => {
        console.error("Error loading i18n:", error);
    });

// Add geolocation support
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        const initialLatLng = new L.LatLng(position.coords.latitude, position.coords.longitude);
        map.panTo(initialLatLng);
    });
}

// Add search control
const searchControl = new SearchControl({
    provider: new OpenStreetMapProvider(),
    style: 'bar',
    showMarker: false
});
map.addControl(searchControl);

// Export to global scope for debugging
window.i18next = i18next;
window.map = map;
window.gpxManager = gpxManager;
