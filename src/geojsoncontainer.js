import geojsonvt from 'geojson-vt';
window.geojsonvt = geojsonvt
import "leaflet-geojson-vt"

const pointToGeoJson = (point) => {
    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [point[1], point[0]]
        }
    }
}

const pointsToGeoJson = (points) => {
    return {
        "type": "FeatureCollection",
        "features": points.map((point) => pointToGeoJson(point))
    }
}


export const GeoJsonContainer = () => {

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
        set: (points) => {
            const geojson = pointsToGeoJson(points);
            return L.geoJson.vt(geojson, options);
        }
    }
}