import L from "leaflet";

export const fontAwesomeSymbol = 'fa-trash-alt';

/**
 * Add delete button for the plan view to remove GPX tracks
 * @param {L.Map} map - The Leaflet map instance
 * @param {object} gpxManager - The GPX manager instance
 * @param {L.Control.Layers} layerControl - The layer control
 * @param {object} i18next - The i18next instance for translations
 * @returns {L.Control} The created button control
 */
export const addPlanDeleteButton = (map, gpxManager, layerControl, i18next) => {
    
    /**
     * Handle the track deletion from the popup form
     */
    const handleTrackDeletion = (trackName) => {
        const success = gpxManager.removeGpxTrack(trackName, map, layerControl);
        if (success) {
            // Remove the item from the list
            const listItem = document.querySelector(`[data-track-name="${trackName}"]`);
            if (listItem) {
                listItem.closest('li').remove();
            }
            
            // If no more tracks, close the popup
            const remainingTracks = gpxManager.getAllTrackNames();
            if (remainingTracks.length === 0) {
                map.closePopup();
            }
        }
    };

    /**
     * Create and show the delete popup
     */
    const showDeletePopup = () => {
        const trackNames = gpxManager.getAllTrackNames();
        
        if (trackNames.length === 0) {
            alert(i18next.t("plan.delete.noTracks"));
            return;
        }

        const translatedHtml = `
            <section id="plan-delete-section">
                <h3>${i18next.t("plan.delete.title")}</h3>
                <p>${i18next.t("plan.delete.text")}</p>
                <ul id="plan-tracks-list">
                    ${trackNames.map(trackName => {
                        const trackInfo = gpxManager.getTrackInfo(trackName);
                        return `
                            <li>
                                <span>${trackName}</span>
                                <button data-track-name="${trackName}" class="remove-track-btn" title="${i18next.t("plan.delete.removeTitle")}">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </li>
                        `;
                    }).join('')}
                </ul>
                <div style="margin-top: 10px;">
                    <button id="delete-all-tracks-btn" class="delete-all-btn">
                        ${i18next.t("plan.delete.removeAll")}
                    </button>
                </div>
            </section>
        `;

        L.popup({ id: "plan-delete-popup" })
            .setLatLng(map.getCenter())
            .setContent(translatedHtml)
            .openOn(map);
    };

    /**
     * Set up event listeners for the delete buttons
     */
    const setupDeleteListeners = () => {
        // Individual track delete buttons
        document.querySelectorAll('.remove-track-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const trackName = button.getAttribute('data-track-name');
                handleTrackDeletion(trackName);
            });
        });

        // Delete all button
        const deleteAllBtn = document.getElementById('delete-all-tracks-btn');
        if (deleteAllBtn) {
            deleteAllBtn.addEventListener('click', () => {
                if (confirm(i18next.t("plan.delete.confirmAll"))) {
                    gpxManager.removeAllTracks(map, layerControl);
                    map.closePopup();
                }
            });
        }
    };

    // Register popup open event to set up listeners
    map.on('popupopen', function (e) {
        const popupId = e.popup.options?.id;
        if (popupId === "plan-delete-popup") {
            setupDeleteListeners();
        }
    });

    // Add the delete button to the map
    return L.easyButton(fontAwesomeSymbol, function (btn, map) {
        showDeletePopup();
    }, i18next.t("plan.delete.button")).addTo(map);
};
