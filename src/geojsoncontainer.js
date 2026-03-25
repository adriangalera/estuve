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
            const url = new URL(layer.url);
            if (!['https:', 'http:'].includes(url.protocol)) {
                return Promise.reject(new Error(`Unsupported URL protocol: ${url.protocol}`));
            }
            return fetch(layer.url)
                .then(response => {
                    if (!response.ok) throw new Error(`Failed to fetch layer: HTTP ${response.status}`);
                    return response.json();
                })
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
                }))
                .catch(error => {
                    console.error(`Failed to load layer "${layer.name}":`, error);
                    return Promise.reject(error);
                });
        }
    }
}