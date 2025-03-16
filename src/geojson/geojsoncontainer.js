import geojsonvt from 'geojson-vt';
window.geojsonvt = geojsonvt
import "leaflet-geojson-vt"
import { pointsToGeoJson } from './utils';

export const GeoJsonContainer = (geojsonStorage) => {
    const options = {
        maxZoom: 20,
        tolerance: 3,
        debug: 0,
        style: {
            color: "#3388FF",
            weight: 2,
            fillOpacity: 0.2,
        },
        zIndex: 2,
    };

    return {
        setFromQuadTree(qt) {
            const geojson = pointsToGeoJson(qt.points());
            return L.geoJson.vt(geojson, options);
        },
    }
}