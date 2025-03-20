export const fontAwesomeSymbol = 'fa-trash'

export const clearStorage = (storage, i18next) => {
    const fileLoadStorage = storage.fileLoadedCache
    const qtStorage = storage.qtStorage
    const quadtree = storage.qt
    const layerStorage = storage.layers

    const msg = i18next.t("clear.message")
    if (confirm(msg)) {
        fileLoadStorage.clear()
        qtStorage.clear()
        quadtree.clear()
        layerStorage.clear()
        document.dispatchEvent(new CustomEvent('mapUpdate', { detail: { qt: quadtree, removedLayerName: "ALL" } }));
    }
}
export const addClearStorageButton = (map, storage, i18next) => {
    return L.easyButton(fontAwesomeSymbol, function (btn, map) {
        clearStorage(storage, i18next)
    }, i18next.t("clear.button")).addTo(map);
}