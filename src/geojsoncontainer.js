import geojsonvt from 'geojson-vt';
window.geojsonvt = geojsonvt
import "leaflet-geojson-vt"

export const GeoJsonContainer = () => {

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


    const options = {
        name: "tracks",
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
        async setFromExtralayer(layer) {
            return fetch(layer.url)
                .then(response => response.json())
                .then(geojson => L.geoJson.vt(geojson, {
                    name: layer.name,
                    style: function (properties) {
                        const isFlagged = properties.flag;
                        return {
                            color: isFlagged ? layer.color : '#FF00FF',
                            weight: 10,
                            opacity: 1
                        };
                    }
                })
                )
        }
    }
}