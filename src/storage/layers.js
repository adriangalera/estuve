export const LayersStorage = () => {

    const LOCALSTORAGE_NAME = "layers";

    return {
        putLayer(layer) {
            const layers = JSON.parse(localStorage.getItem(LOCALSTORAGE_NAME)) || [];
            const newLayers = [...layers, layer];
            localStorage.setItem(LOCALSTORAGE_NAME, JSON.stringify(newLayers));
        },
        removeLayer(layerName) {
            const layers = JSON.parse(localStorage.getItem(LOCALSTORAGE_NAME)) || [];
            const newLayers = layers.filter(l => l.name !== layerName);
            localStorage.setItem(LOCALSTORAGE_NAME, JSON.stringify(newLayers));
        },
        getAll() {
            return JSON.parse(localStorage.getItem(LOCALSTORAGE_NAME)) || [];
        },
        putAll(layers) {
            localStorage.setItem(LOCALSTORAGE_NAME, JSON.stringify(layers));
        },
        clear() {
            localStorage.removeItem(LOCALSTORAGE_NAME);
        }
    }
} 