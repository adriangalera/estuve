const map = L.map("map", {
    center: [41.53289317099601, 2.104000992549118],
    zoom: 14
});

const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    zIndex: 1,
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

osm.addTo(map);