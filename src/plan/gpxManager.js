import L from "leaflet";
import { TrackParser } from "../parser/trackparser";

/**
 * GpxManager handles adding and removing GPX tracks on a map.
 * Each GPX track is stored as a separate layer for independent management.
 */
export const GpxManager = () => {
    const tracks = new Map(); // Map of track name -> { layer, bounds, metadata }
    let trackCounter = 0;

    /**
     * Add a GPX track to the manager
     * @param {File} gpxFile - The GPX file to add
     * @param {L.Map} map - The Leaflet map instance
     * @param {L.Control.Layers} layerControl - The layer control to add the track to
     * @returns {Promise<object>} The added track information
     */
    const addGpxTrack = async (gpxFile, map, layerControl) => {
        const parser = TrackParser();
        const response = await parser.parseGpxTrackInWorker(gpxFile);
        const points = response.data;

        if (!points || points.length === 0) {
            throw new Error("No valid track points found in GPX file");
        }

        // Create a polyline from the points
        const latLngs = points.map(point => [point.lat, point.lon]);
        const polyline = L.polyline(latLngs, {
            color: "#3388FF",
            weight: 10,
            fillOpacity: 0.2
        });

        // Generate a unique track name
        trackCounter++;
        const trackName = gpxFile.name.replace('.gpx', '') || `Track ${trackCounter}`;
        const uniqueTrackName = tracks.has(trackName) ? `${trackName} (${trackCounter})` : trackName;

        // Get bounds for potential zooming
        const bounds = polyline.getBounds();

        // Store track information
        const trackInfo = {
            layer: polyline,
            bounds: bounds,
            metadata: {
                name: uniqueTrackName,
                fileName: gpxFile.name,
                pointCount: points.length,
                addedAt: new Date()
            }
        };

        tracks.set(uniqueTrackName, trackInfo);

        // Add to map and layer control
        polyline.addTo(map);
        layerControl.addOverlay(polyline, uniqueTrackName);

        // Dispatch custom event for track added
        document.dispatchEvent(new CustomEvent('gpxTrackAdded', {
            detail: { trackName: uniqueTrackName, trackInfo }
        }));

        return trackInfo;
    };

    /**
     * Remove a GPX track from the manager
     * @param {string} trackName - The name of the track to remove
     * @param {L.Map} map - The Leaflet map instance
     * @param {L.Control.Layers} layerControl - The layer control to remove the track from
     * @returns {boolean} True if track was removed, false if not found
     */
    const removeGpxTrack = (trackName, map, layerControl) => {
        const trackInfo = tracks.get(trackName);
        if (!trackInfo) {
            return false;
        }

        // Remove from map and layer control
        map.removeLayer(trackInfo.layer);
        layerControl.removeLayer(trackInfo.layer);

        // Remove from tracks map
        tracks.delete(trackName);

        // Dispatch custom event for track removed
        document.dispatchEvent(new CustomEvent('gpxTrackRemoved', {
            detail: { trackName }
        }));

        return true;
    };

    /**
     * Get all track names
     * @returns {Array<string>} Array of track names
     */
    const getAllTrackNames = () => {
        return Array.from(tracks.keys());
    };

    /**
     * Get track information by name
     * @param {string} trackName - The name of the track
     * @returns {object|null} Track information or null if not found
     */
    const getTrackInfo = (trackName) => {
        return tracks.get(trackName) || null;
    };

    /**
     * Remove all tracks
     * @param {L.Map} map - The Leaflet map instance
     * @param {L.Control.Layers} layerControl - The layer control
     */
    const removeAllTracks = (map, layerControl) => {
        const trackNames = getAllTrackNames();
        trackNames.forEach(name => removeGpxTrack(name, map, layerControl));
    };

    /**
     * Fit map to show all tracks
     * @param {L.Map} map - The Leaflet map instance
     */
    const fitAllTracks = (map) => {
        if (tracks.size === 0) return;

        const allBounds = L.latLngBounds([]);
        tracks.forEach(trackInfo => {
            allBounds.extend(trackInfo.bounds);
        });

        map.fitBounds(allBounds);
    };

    return {
        addGpxTrack,
        removeGpxTrack,
        getAllTrackNames,
        getTrackInfo,
        removeAllTracks,
        fitAllTracks
    };
};
