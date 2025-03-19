
export const displayInfoMessage = (map, i18next) => {
     const translatedHtml = `
     <b><span id="info-title">${i18next.t("info.title")}</span></b>
     <br>
     <span id="info-content">${i18next.t("info.content")}</span>
     `;

     L.popup()
          .setLatLng(map.getCenter())
          .setContent(translatedHtml)
          .openOn(map);
}

export const addInfoButton = (map, i18next) => {
     L.easyButton('fa-info-circle', function (btn, map) {
          displayInfoMessage(map, i18next)
     }, i18next.t("info.button")).addTo(map);
}