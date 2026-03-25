import { openPanel, closePanel, onPanelOpen } from "../ui/panel.js";

export const fontAwesomeSymbol = 'fa-plus'

export const formSubmitListener = (storage) => {
    const form = document.getElementById("geojson-layer-form");
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            storage.layers.putLayer(data);
            closePanel();
            document.dispatchEvent(new CustomEvent('mapUpdate', { detail: { extraLayer: data } }));
        });
    }
};

export const extraLayerPopup = (storage, i18next) => {
    const content = `
        <div class="popup-form-container">
            <div class="popup-form-header">
                <div class="popup-form-title">${i18next.t("addlayer.button")}</div>
                <div class="popup-form-subtitle">${i18next.t("addlayer.text1")}</div>
            </div>
            <form id="geojson-layer-form">
                <div class="form-group">
                    <label for="new-layer-name">${i18next.t("addlayer.name.field")}</label>
                    <input required type="text" id="new-layer-name" name="name" placeholder="${i18next.t("addlayer.name.placeholder")}">
                </div>

                <div class="form-group">
                    <label for="new-layer-url">${i18next.t("addlayer.url.field")}</label>
                    <input required type="url" id="new-layer-url" name="url" placeholder="${i18next.t("addlayer.url.placeholder")}">
                    <small class="help-text">${i18next.t("addlayer.url.explanation")}</small>
                </div>

                <div class="form-group">
                    <label for="new-layer-color">${i18next.t("addlayer.color.field")}</label>
                    <input required type="color" id="new-layer-color" name="color">
                </div>

                <button type="submit" class="btn-primary">${i18next.t("addlayer.button")}</button>
            </form>
        </div>
    `;
    openPanel("add-layer-form", content);
};

export const addExtraLayerButton = (map, storage, i18next) => {
    onPanelOpen("add-layer-form", () => formSubmitListener(storage));

    return L.easyButton(fontAwesomeSymbol, () => {
        extraLayerPopup(storage, i18next);
    }, i18next.t("addlayer.button")).addTo(map);
};
