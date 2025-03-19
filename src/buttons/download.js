export const downloadQuadtree = (quadtree) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(quadtree.serialize());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "estuve.bin");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}

export const addDownloadButton = (map, quadtree, i18n) => {
    L.easyButton('fa-download', () => downloadQuadtree(quadtree), i18n.t("download.button")).addTo(map);
}