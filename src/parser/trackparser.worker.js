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

            // Extract track points
            const trackPoints = gpxData.gpx.trk.trkseg.trkpt.map((point) => ({
                lat: parseFloat(point["@_lat"]),
                lon: parseFloat(point["@_lon"]),
            }));

            // Send parsed data back to main thread
            self.postMessage({ id, name: file.name, data: trackPoints });
        } catch (error) {
            self.postMessage({ id, name: file.name, data: [] });
        }
    };

    reader.readAsText(blob);
};
