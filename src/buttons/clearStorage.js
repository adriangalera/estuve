export const clearStorage = (storage, i18next) => {
    const fileLoadStorage = storage.fileLoadedCache
    const qtStorage = storage.qtStorage
    const quadtree = storage.qt

    const msg = i18next.t("clear.message")
    if (confirm(msg)) {
        fileLoadStorage.clear()
        qtStorage.clear()
        quadtree.clear()
        document.dispatchEvent(new CustomEvent('mapUpdate', { detail: { qt: quadtree } }));
    }
}
export const addClearStorageButton = (map, storage, i18next) => {
    return L.easyButton('fa-trash', function (btn, map) {
        clearStorage(storage, i18next)
    }, i18next.t("clear.button")).addTo(map);
}