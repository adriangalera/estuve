import { fontAwesomeSymbol as uploadSymbol } from "./upload";
import { fontAwesomeSymbol as downloadSymbol } from "./download";
import { fontAwesomeSymbol as clearSymbol } from "./clearStorage";


export const displayInfoMessage = (map, i18next) => {
     const translatedHtml = `
     <b><span id="info-title">${i18next.t("info.title")}</span></b>
     <br>
     <span id="info-content">${i18next.t("info.content")}</span>

     <p>
          <span><i class="fa ${uploadSymbol}"></i><b>&nbsp;${i18next.t("upload.button")}</b></span><br/>
          <span>${i18next.t("upload.help")}</span>
     </p>
     <p><span><i class="fa ${downloadSymbol}"></i><b>&nbsp;${i18next.t("download.button")}</b></span><br/>
          <span>${i18next.t("download.help")}</span>
     </p>
     <p><span><i class="fa ${clearSymbol}"></i><b>&nbsp;${i18next.t("clear.button")}</b><br/>
          <span>${i18next.t("clear.help")}</span>
     </p>
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