export const registerMapsAndLayers = (map) => {
    const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png?', {
        maxZoom: 20,
        attribution: '&copy; <a href="https://opentopomap.org/about">OpenTopoMap</a>'
    });

    const allaus = L.tileLayer.wms('https://geoserveis.icgc.cat/geoserver/nivoallaus/wms?', {
        layers: 'zonesallaus',
        opacity: 0.4
    })

    const topoIcgc = L.tileLayer('https://geoserveis.icgc.cat/servei/catalunya/mapa-base/wmts/topografic/MON3857NW/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy;'
    });

    const hibrid = L.tileLayer('https://geoserveis.icgc.cat/servei/catalunya/mapa-base/wmts/orto-hibrida/MON3857NW/{z}/{x}/{y}.png', {
        maxZoom: 20
    });

    var topoIgn = L.tileLayer('https://tms-mapa-raster.ign.es/1.0.0/mapa-raster/{z}/{x}/{-y}.jpeg?layer=MTN&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/jpeg&TileMatrix={z}&TileCol={x}&TileRow={y}', {
        maxNativeZoom: 17,
        minZoom: 1,
        scheme: 'xyz',
        continuousWorld: false,
        attribution: 'CC-BY 4.0 <a href="https://www.ign.es" target="_blank">www.ign.es</a>'
    });

    const baseMaps = {
        "OpenStreeMap": osm,
        "OpenTopomap": openTopoMap,
        "Topografic (ICGC)": topoIcgc,
        "Topografico (IGN)": topoIgn,
        "Ortofoto (ICGC)": hibrid,
    }
    const overlays = {
        "Allaus (ICGC)": allaus,
    }

    return L.control.layers(
        baseMaps,
        overlays,
        { collapsed: false }
    ).addTo(map);
}