export const fontAwesomeSymbol = 'fa-layer-group'

export const buttonClickListener = (storage) => {
  document.querySelectorAll('.remove-layer-btn').forEach((button) => {
    button.addEventListener('click', (e) => {
      const layerName = button.getAttribute('data-layer-name');
      storage.layers.removeLayer(layerName)
      e.target.closest("li").remove()
      document.dispatchEvent(new CustomEvent('mapUpdate', { detail: { removedLayerName: layerName } }));
    });
  });
}

export const layerPopup = (map, storage, i18next) => {

  const translatedHtml = `
    <section id="existing-layers-section">
      <p>${i18next.t("layer.text")}</p>
      <ul id="existing-layers-list">
        ${storage.layers.getAll()
      .map(
        (layer) => `
              <li>
                <span>${layer.name}</span>
                <button data-layer-name="${layer.name}" class="remove-layer-btn" title="Remove layer">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </li>
            `
      )
      .join('')}
      </ul>
    </section>
  `;

  L.popup({ id: "layer-form" })
    .setLatLng(map.getCenter())
    .setContent(translatedHtml)
    .openOn(map);
}
export const addLayerManagementButton = (map, storage, i18next) => {

  map.on('popupopen', function (e) {
    const popupId = e.popup.options?.id
    if (popupId === "layer-form") {
      buttonClickListener(storage)
    }
  });


  return L.easyButton(fontAwesomeSymbol, function (btn, map) {
    layerPopup(map, storage, i18next)
  }, i18next.t("layer.button")).addTo(map);
}