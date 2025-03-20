export const fontAwesomeSymbol = 'fa-plus'

export const formSubmitListener = (popup, storage) => {
    const form = document.getElementById("geojson-layer-form");
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            storage.layers.putLayer(data)
            popup.closePopup();
            document.dispatchEvent(new CustomEvent('mapUpdate', { detail: { extraLayer: data } }));
        });
    }
}

export const extraLayerPopup = (map, i18next) => {

    const translatedHtml = `
        <form id="geojson-layer-form">
            <p>${i18next.t("addlayer.text1")}</p>

            <label for="new-layer-name">${i18next.t("addlayer.name.field")}</label>
            <input required type="text" id="new-layer-name" name="name" required placeholder="${i18next.t("addlayer.name.placeholder")}">

            <label for="new-layer-url">${i18next.t("addlayer.url.field")}</label>
            <input required type="url" id="new-layer-url" name="url" required placeholder="${i18next.t("addlayer.name.placeholder")}">
            <small class="help-text">
            ${i18next.t("addlayer.url.explanation")}
            </small>

            <label for="new-layer-color">${i18next.t("addlayer.color.field")}</label>
            <input required type="color" id="new-layer-color" name="color">

            <button type="submit">${i18next.t("addlayer.button")}</button>
        </form>
     `;


    L.popup({ id: "add-layer-form" })
        .setLatLng(map.getCenter())
        .setContent(translatedHtml)
        .openOn(map);
}
export const addExtraLayerButton = (map, storage, i18next) => {

    map.on('popupopen', function (e) {
        const popupId = e.popup.options?.id
        if (popupId === "add-layer-form") {
            formSubmitListener(e.target, storage)
        }
    });


    return L.easyButton(fontAwesomeSymbol, function (btn, map) {
        extraLayerPopup(map, i18next)
    }, i18next.t("addlayer.button")).addTo(map);
}