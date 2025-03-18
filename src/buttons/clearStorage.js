export const clearStorage = (fileLoadStorage, qtStorage, quadtree, i18next) => {
    const msg = i18next.t("clear.message")
    if (confirm(msg)) {
        fileLoadStorage.clear()
        qtStorage.clear()
        quadtree.clear()
        document.dispatchEvent(new CustomEvent('mapUpdate', { detail: { qt: quadtree } }));
    }
}
export const addClearStorageButton = (map, fileLoadStorage, qtStorage, quadtree, i18next) => {
    return L.easyButton('fa-trash', function (btn, map) {
        clearStorage(fileLoadStorage, qtStorage, quadtree, i18next)
    }).addTo(map);
}