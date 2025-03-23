import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import "leaflet.markercluster.layersupport";

import "leaflet-easybutton";
import "leaflet-easybutton/src/easy-button.css";

import 'leaflet-geosearch/dist/geosearch.css';
import { SearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';


import { addInfoButton } from './buttons/infobutton';
import { i18next, i18nPromise } from './i18n.js';
import { addUploadButton } from "./buttons/upload.js";
import { GeoJsonContainer } from "./geojsoncontainer.js";
import { addProgressBar } from './progressbar/creator.js'
import { FileLoadStorage } from './storage/filesLoaded.js'
import { QuadtreeStorage } from "./storage/quadtreeStorage.js";
import { LayersStorage } from "./storage/layers.js"
import { addClearStorageButton } from "./buttons/clearStorage.js";
import { addDownloadButton } from "./buttons/download.js";
import { registerMapsAndLayers } from "./maps.js"
import { addExtraLayerButton } from "./buttons/addLayer.js";
import { addLayerManagementButton } from "./buttons/layers.js";



const map = L.map("map").setView([41.53289317099601, 2.104000992549118], 4);

const layersStorage = LayersStorage()
const container = GeoJsonContainer()

const layerControl = registerMapsAndLayers(map)

let geoJsonLayer = null;
let extraLayers = {}

const progressBar = addProgressBar(map)
const fileLoadedCache = FileLoadStorage()
const qtStorage = QuadtreeStorage()

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

const updateExtraLayer = (geoJsonLayer) => {
    layerControl.addOverlay(geoJsonLayer, geoJsonLayer.options.name)
    extraLayers[geoJsonLayer.options.name] = geoJsonLayer
}

const removeExtraLayer = (layerName) => {
    if (layerName === "ALL") {
        const layers = Object.values(extraLayers)
        for (let layer of layers) {
            layerControl.removeLayer(layer)
            map.removeLayer(layer)
        }
        extraLayers = {}
        return
    }
    const layerToRemove = extraLayers[layerName]
    layerControl.removeLayer(layerToRemove)
    map.removeLayer(layerToRemove)
    delete extraLayers[layerName];
}

document.addEventListener('mapUpdate', (event) => {
    if (event.detail.qt) {
        let newGeoJsonLayer = container.setFromQuadTree(event.detail.qt)
        updateGeoJsonLayer(newGeoJsonLayer)
    }
    if (event.detail.extraLayer) {
        container.setFromExtralayer(event.detail.extraLayer)
            .then((geoJsonLayer) => {
                updateExtraLayer(geoJsonLayer)
            })
    }
    if (event.detail.extraLayers) {
        for (let layer of event.detail.extraLayers) {
            container.setFromExtralayer(layer)
                .then((geoJsonLayer) => {
                    updateExtraLayer(geoJsonLayer)
                })
        }
    }
    if (event.detail.removedLayerName) {
        removeExtraLayer(event.detail.removedLayerName)
    }
});

Promise.all([i18nPromise, qtStorage.load()])
    .then(([_, qt]) => {

        const storage = { qt, fileLoadedCache, qtStorage, layers: layersStorage }

        addInfoButton(map, i18next);
        addUploadButton(map, progressBar, i18next, storage);
        addDownloadButton(map, storage, i18next);
        addClearStorageButton(map, storage, i18next);
        addExtraLayerButton(map, storage, i18next);
        addLayerManagementButton(map, storage, i18next);

        const initialGeoJsonLayer = container.setFromQuadTree(qt);
        updateGeoJsonLayer(initialGeoJsonLayer);

        for (let extraLayer of layersStorage.getAll()) {
            container.setFromExtralayer(extraLayer)
                .then((geoJsonLayer) => {
                    updateExtraLayer(geoJsonLayer)
                })
        }

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

const searchControl = new SearchControl({
    provider: new OpenStreetMapProvider(),
    style: 'bar',
    showMarker: false
});
map.addControl(searchControl);

//Export some libraries to global scope so that other libraries can find them.
window.i18next = i18next
window.map = map

