export const LayersStorage = () => {

    const LOCALSTORAGE_NAME = "layers";

    const parseStored = () => {
        try {
            const parsed = JSON.parse(localStorage.getItem(LOCALSTORAGE_NAME));
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Failed to parse layers from localStorage:', e);
            localStorage.removeItem(LOCALSTORAGE_NAME);
            return [];
        }
    };

    return {
        putLayer(layer) {
            const layers = parseStored();
            const newLayers = [...layers, layer];
            localStorage.setItem(LOCALSTORAGE_NAME, JSON.stringify(newLayers));
        },
        removeLayer(layerName) {
            const layers = parseStored();
            const newLayers = layers.filter(l => l.name !== layerName);
            localStorage.setItem(LOCALSTORAGE_NAME, JSON.stringify(newLayers));
        },
        getAll() {
            return parseStored();
        },
        putAll(layers) {
            localStorage.setItem(LOCALSTORAGE_NAME, JSON.stringify(layers));
        },
        clear() {
            localStorage.removeItem(LOCALSTORAGE_NAME);
        }
    }
} 