import { XMLParser } from "fast-xml-parser";

self.onmessage = async (event) => {
    const { file, id } = event.data;
    const blob = file instanceof Blob ? file : new Blob([file], { type: "text/xml" });
    const reader = new FileReader();

    reader.onload = () => {
        try {
            const rawGpxData = reader.result;

            // Use fast-xml-parser to parse GPX data
            const parser = new XMLParser({ ignoreAttributes: false });
            const gpxData = parser.parse(rawGpxData);

            // Extract track points with coordinate validation
            const trackPoints = gpxData.gpx.trk.trkseg.trkpt.reduce((acc, point) => {
                const lat = parseFloat(point["@_lat"]);
                const lon = parseFloat(point["@_lon"]);
                if (Number.isFinite(lat) && Number.isFinite(lon) &&
                    lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                    acc.push({ lat, lon });
                }
                return acc;
            }, []);

            // Send parsed data back to main thread
            self.postMessage({ id, name: file.name, data: trackPoints });
        } catch (error) {
            self.postMessage({ id, name: file.name, data: [], error: error.message });
        }
    };

    reader.onerror = () => {
        self.postMessage({ id, name: file.name, data: [], error: 'Failed to read file' });
    };

    reader.readAsText(blob);
};
