import L from "leaflet";

export const fontAwesomeSymbol = 'fa-upload';

/**
 * Add upload button for the plan view
 * @param {L.Map} map - The Leaflet map instance
 * @param {object} gpxManager - The GPX manager instance
 * @param {L.Control.Layers} layerControl - The layer control
 * @param {object} i18next - The i18next instance for translations
 * @returns {L.Control} The created button control
 */
export const addPlanUploadButton = (map, gpxManager, layerControl, i18next) => {
    const handleGpxUpload = async (event) => {
        const files = event.target.files;
        if (!files.length) return;

        // Track how many files are being processed
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (let file of files) {
            try {
                await gpxManager.addGpxTrack(file, map, layerControl);
                successCount++;
            } catch (error) {
                errorCount++;
                errors.push(`${file.name}: ${error.message}`);
                console.error(`Error uploading ${file.name}:`, error);
            }
        }

        // Show results to user
        if (successCount > 0 && errorCount === 0) {
            // All files uploaded successfully
            const message = i18next.t("plan.upload.success", { count: successCount });
            showNotification(message, 'success');
            
            // Fit map to show all tracks
            gpxManager.fitAllTracks(map);
        } else if (errorCount > 0) {
            // Some or all files failed
            let message = i18next.t("plan.upload.partial", { 
                success: successCount, 
                failed: errorCount 
            });
            if (errors.length > 0) {
                message += '\n\n' + errors.join('\n');
            }
            alert(message);
            
            // Still fit map if some succeeded
            if (successCount > 0) {
                gpxManager.fitAllTracks(map);
            }
        }

        // Clear the file input
        event.target.value = '';
    };

    const fileInput = document.getElementById('planGpxFileInput');
    fileInput.addEventListener('change', handleGpxUpload);

    // Add a Leaflet EasyButton to trigger file selection
    return L.easyButton(fontAwesomeSymbol, () => {
        fileInput.click();
    }, i18next.t("plan.upload.button")).addTo(map);
};

/**
 * Show a notification to the user
 * @param {string} message - The message to display
 * @param {string} type - The notification type (success, error, info)
 */
const showNotification = (message, type = 'info') => {
    // For now, just use console.log
    // Could be enhanced with a proper notification UI component
    console.log(`[${type.toUpperCase()}] ${message}`);
};
