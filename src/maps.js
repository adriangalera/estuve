let layerControl;

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
        format: 'image/png',
        transparent: true,
        opacity: 0.4,
        attribution: 'ICGC'
    });

    const pendientes = L.tileLayer.wms('https://wms-pendientes.idee.es/pendientes', {
        layers: 'MDP05',                     // official layer name
        format: 'image/png; mode=8bit',      // prefer paletted PNG to reduce payload
        transparent: true,
        version: '1.3.0',
        // use web-mercator to avoid reprojection where possible
        crs: L.CRS.EPSG3857,
        // performance-oriented options
        tiled: true,
        tileSize: 512,
        detectRetina: false,
        opacity: 0.45,
        attribution: '© IGN – MDP05',
        styles: 'default',
        maxZoom: 17,
        minZoom: 6
    });


    const atemsmaps = L.tileLayer.wms('https://geoserver.atesmaps.org/wms', {
        version: "1.3.0",
        format: "image/png",
        transparent: true,
        layers: "ATES:ates_all",
        tiled: true,
    });

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
        "OpenStreetMap": osm,
        "OpenTopomap": openTopoMap,
        "Topografic (ICGC)": topoIcgc,
        "Topografico (IGN)": topoIgn,
        "Ortofoto (ICGC)": hibrid,
    };

    const overlays = {
        "Allaus (ICGC)": allaus,
        "Atesmaps": atemsmaps,
        "Pendientes (IGN)": pendientes,
    };

    layerControl = L.control.layers(
        baseMaps,
        overlays,
        { collapsed: false }
    ).addTo(map);

    // ---------------- Legend control (local PNG, BIG & readable) ----------------
    const pendientesLegend = L.control({ position: 'bottomright' });

    pendientesLegend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend pendientes-legend');

        div.innerHTML = `
    <div style="
      background: rgba(255,255,255,0.95);
      padding: 12px 14px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    ">
      <div style="
        font-weight: 600;
        font-size: 15px;
        margin-bottom: 10px;
      ">
        Pendiente (°)
      </div>

      <img
        src="/pendientes.png"
        alt="Leyenda pendientes IGN"
        style="
          display: block;
          width: 260px;
          height: auto;
        "
      />

      <div style="
        font-size: 12px;
        margin-top: 8px;
        color: #444;
      ">
        MDP05 · grados sexagesimales · IGN
      </div>
    </div>
  `;

        return div;
    };

    map.on('overlayadd', (e) => {
        if (e.layer === pendientes) pendientesLegend.addTo(map);
    });

    map.on('overlayremove', (e) => {
        if (e.layer === pendientes) pendientesLegend.remove();
    });


    return layerControl;
}
