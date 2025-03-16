import L from 'leaflet';
import 'leaflet-easybutton';

export const addClearStorageButton = (map, fileLoadStorage, geoJsonStorage, quadtree) => {
    L.easyButton('fa-trash', function (btn, map) {
        fileLoadStorage.clear()
        geoJsonStorage.clear()
        quadtree.clear()
        document.dispatchEvent(new CustomEvent('mapUpdate', quadtree.points()));
    }).addTo(map);
}