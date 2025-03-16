import { loader } from "./loader.js";

export const addProgressBar = (map) => {
    L.Control.ProgressBar = L.Control.extend(loader);
    const progressbarControl = new L.Control.ProgressBar({ position: 'bottomleft' });
    progressbarControl.addTo(map);
    progressbarControl.stop()
    return progressbarControl
}