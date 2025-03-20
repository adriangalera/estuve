export const fontAwesomeSymbol = 'fa-download'

export const downloadStorage = (storage) => {
    const download = {
        qt: storage.qt.serialize(),
        filesLoaded: storage.fileLoadedCache.getAll()
    }
    const base64Data = btoa(JSON.stringify(download))
    const dataStr = "data:text;charset=utf-8," + base64Data;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "estuve.bin");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);

}

export const addDownloadButton = (map, storage, i18n) => {
    L.easyButton(fontAwesomeSymbol, () => downloadStorage(storage), i18n.t("download.button")).addTo(map);
}