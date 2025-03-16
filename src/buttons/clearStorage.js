import L from 'leaflet';
import 'leaflet-easybutton';

export const addClearStorageButton = (map, fileLoadStorage, qtStorage, quadtree) => {
    L.easyButton('fa-trash', function (btn, map) {
        fileLoadStorage.clear()
        qtStorage.clear().then( () => {
            quadtree.clear()
            document.dispatchEvent(new CustomEvent('mapUpdate', {detail: {qt: quadtree}}));
        } )
    }).addTo(map);
}