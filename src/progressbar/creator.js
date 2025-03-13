import { loader } from "./loader.js";

const addProgressBar = (map) => {
    L.Control.Watermark = L.Control.extend(loader);
    L.control.watermark = function (opts) {
        return new L.Control.Watermark(opts);
    }
    const progressBar =  L.control.watermark({ position: 'bottomleft' }).addTo(map);
    progressBar.stop()
    return progressBar
}

export { addProgressBar }