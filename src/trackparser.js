import xpath from 'xpath';

const namespaces = { gpx: 'http://www.topografix.com/GPX/1/1' };

const selectWithNamespace = (expression, node) => {
    return xpath.useNamespaces(namespaces)(expression, node);
};

const getPointsFromTrack = (root) => {
    const trkseg = selectWithNamespace('//gpx:trk/gpx:trkseg', root)[0];
    if (!trkseg) {
        console.error('Error: Could not find trkseg elements.');
        return;
    }
    return selectWithNamespace('gpx:trkpt', trkseg);
}

// Function to read file as text using a Promise
const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

export const parseGpxTrack = async (file) => {
    return readFileAsText(file)
        .then((rawGpxData) => {
            const parser = new DOMParser();
            const gpxData = parser.parseFromString(rawGpxData, "text/xml");
            var latlons =  getPointsFromTrack(gpxData).map( (elem) => { 
                return {lat : parseFloat(elem.getAttribute("lat")) , lon: parseFloat(elem.getAttribute("lon")) } }
            )
            return latlons
        })


}