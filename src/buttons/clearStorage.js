import L from 'leaflet';
import 'leaflet-easybutton';

export const addClearStorageButton = (map, fileLoadStorage, geoJsonStorage) => {
    L.easyButton('fa-trash', function (btn, map) {
        fileLoadStorage.clear()
        geoJsonStorage.clear()
        document.dispatchEvent(new CustomEvent('mapUpdate', []));
    }).addTo(map);
}