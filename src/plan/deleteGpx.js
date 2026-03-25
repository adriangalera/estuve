import L from "leaflet";
import { openPanel, closePanel, onPanelOpen } from "../ui/panel.js";
import { escapeHtml } from "../utils/htmlEscape.js";

export const fontAwesomeSymbol = 'fa-trash-alt';

export const addPlanDeleteButton = (map, gpxManager, layerControl, i18next) => {

    const handleTrackDeletion = (trackName) => {
        const success = gpxManager.removeGpxTrack(trackName, map, layerControl);
        if (success) {
            const listItem = document.querySelector(`[data-track-name="${trackName}"]`);
            if (listItem) listItem.closest('li').remove();

            if (gpxManager.getAllTrackNames().length === 0) closePanel();
        }
    };

    const showDeletePopup = () => {
        const trackNames = gpxManager.getAllTrackNames();

        if (trackNames.length === 0) {
            alert(i18next.t("plan.delete.noTracks"));
            return;
        }

        const listItems = trackNames.map(trackName => `
            <li class="layer-list-item">
                <span class="layer-list-name">${escapeHtml(trackName)}</span>
                <button data-track-name="${escapeHtml(trackName)}" class="remove-track-btn" title="${i18next.t("plan.delete.removeTitle")}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </li>
        `).join('');

        const content = `
            <div class="popup-panel">
                <div class="popup-panel-header">
                    <div class="popup-panel-title">${i18next.t("plan.delete.title")}</div>
                </div>
                <section id="plan-delete-section">
                    <ul id="plan-tracks-list" class="layer-list">
                        ${listItems}
                    </ul>
                </section>
                <div class="popup-panel-footer">
                    <button id="delete-all-tracks-btn" class="btn-danger">
                        ${i18next.t("plan.delete.removeAll")}
                    </button>
                </div>
            </div>
        `;
        openPanel("plan-delete-popup", content);
    };

    onPanelOpen("plan-delete-popup", () => {
        document.querySelectorAll('.remove-track-btn').forEach(button => {
            button.addEventListener('click', () => {
                handleTrackDeletion(button.getAttribute('data-track-name'));
            });
        });

        const deleteAllBtn = document.getElementById('delete-all-tracks-btn');
        if (deleteAllBtn) {
            deleteAllBtn.addEventListener('click', () => {
                if (confirm(i18next.t("plan.delete.confirmAll"))) {
                    gpxManager.removeAllTracks(map, layerControl);
                    closePanel();
                }
            });
        }
    });

    return L.easyButton(fontAwesomeSymbol, () => {
        showDeletePopup();
    }, i18next.t("plan.delete.button")).addTo(map);
};
