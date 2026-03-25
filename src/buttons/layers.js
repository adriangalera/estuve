import { openPanel, onPanelOpen } from "../ui/panel.js";
import { escapeHtml } from "../utils/htmlEscape.js";

export const fontAwesomeSymbol = 'fa-layer-group'

export const buttonClickListener = (storage) => {
    document.querySelectorAll('.remove-layer-btn').forEach((button) => {
        button.addEventListener('click', (e) => {
            const layerName = button.getAttribute('data-layer-name');
            storage.layers.removeLayer(layerName);
            e.target.closest("li").remove();
            document.dispatchEvent(new CustomEvent('mapUpdate', { detail: { removedLayerName: layerName } }));
        });
    });
};

export const layerPopup = (storage, i18next) => {
    const layers = storage.layers.getAll();

    const listItems = layers.map((layer) => `
        <li class="layer-list-item">
            <span class="layer-list-name">${escapeHtml(layer.name)}</span>
            <button data-layer-name="${escapeHtml(layer.name)}" class="remove-layer-btn" title="Remove layer">
                <i class="fas fa-trash-alt"></i>
            </button>
        </li>
    `).join('');

    const content = `
        <div class="popup-panel">
            <div class="popup-panel-header">
                <div class="popup-panel-title">${i18next.t("layer.button")}</div>
            </div>
            <section id="existing-layers-section">
                <ul id="existing-layers-list" class="layer-list">
                    ${listItems || `<li class="layer-list-empty">${i18next.t("layer.empty")}</li>`}
                </ul>
            </section>
        </div>
    `;
    openPanel("layer-form", content);
};

export const addLayerManagementButton = (map, storage, i18next) => {
    onPanelOpen("layer-form", () => buttonClickListener(storage));

    return L.easyButton(fontAwesomeSymbol, () => {
        layerPopup(storage, i18next);
    }, i18next.t("layer.button")).addTo(map);
};
