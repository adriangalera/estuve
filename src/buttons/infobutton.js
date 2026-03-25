import { fontAwesomeSymbol as uploadSymbol } from "./upload";
import { fontAwesomeSymbol as downloadSymbol } from "./download";
import { fontAwesomeSymbol as clearSymbol } from "./clearStorage";
import { fontAwesomeSymbol as addLayer } from "./addLayer";
import { fontAwesomeSymbol as layer } from "./layers";
import { openPanel } from "../ui/panel.js";

const infoItem = (icon, name, help) => `
    <li class="info-popup-item">
        <span class="info-popup-icon"><i class="fa ${icon}"></i></span>
        <div class="info-popup-item-body">
            <div class="info-popup-item-name">${name}</div>
            <div class="info-popup-item-help">${help}</div>
        </div>
    </li>
`;

export const displayInfoMessage = (i18next) => {
    const content = `
        <div class="info-popup">
            <div class="info-popup-header">
                <div id="info-title" class="info-popup-title">${i18next.t("info.title")}</div>
                <div id="info-content" class="info-popup-subtitle">${i18next.t("info.content")}</div>
            </div>
            <ul class="info-popup-list">
                ${infoItem(uploadSymbol, i18next.t("upload.button"), i18next.t("upload.help"))}
                ${infoItem(downloadSymbol, i18next.t("download.button"), i18next.t("download.help"))}
                ${infoItem(clearSymbol, i18next.t("clear.button"), i18next.t("clear.help"))}
                ${infoItem(addLayer, i18next.t("addlayer.button"), i18next.t("addlayer.help"))}
                ${infoItem(layer, i18next.t("layer.button"), i18next.t("layer.help"))}
            </ul>
        </div>
    `;
    openPanel("info", content);
}

export const addInfoButton = (map, i18next) => {
    L.easyButton('fa-info-circle', () => {
        displayInfoMessage(i18next);
    }, i18next.t("info.button")).addTo(map);
}
