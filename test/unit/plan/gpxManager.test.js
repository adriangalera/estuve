import { describe, it, vi, expect, beforeEach } from "vitest";
import { GpxManager } from "../../../src/plan/gpxManager";
import { TrackParser } from "../../../src/parser/trackparser";
import L from "leaflet";

const parseGpxTrackInWorkerMock = vi.fn();

// Mock TrackParser
vi.mock("../../../src/parser/trackparser", () => ({
    TrackParser: vi.fn(() => ({
        parseGpxTrackInWorker: parseGpxTrackInWorkerMock,
    })),
}));

// Mock Leaflet
vi.mock("leaflet", () => {
    const polyline = vi.fn((latLngs, options) => ({
        latLngs,
        options,
        getBounds: vi.fn(() => ({ 
            extend: vi.fn(),
            isValid: vi.fn(() => true)
        })),
        addTo: vi.fn(),
    }));

    const latLngBounds = vi.fn(() => ({
        extend: vi.fn(),
        isValid: vi.fn(() => true)
    }));

    return {
        default: {
            polyline,
            latLngBounds
        },
        polyline,
        latLngBounds
    };
});

describe("GpxManager", () => {
    let gpxManager;
    let mockMap;
    let mockLayerControl;

    beforeEach(() => {
        gpxManager = GpxManager();
        mockMap = {
            removeLayer: vi.fn(),
            fitBounds: vi.fn()
        };
        mockLayerControl = {
            addOverlay: vi.fn(),
            removeLayer: vi.fn()
        };
        
        // Setup parser mock with default response
        parseGpxTrackInWorkerMock.mockResolvedValue({
            data: [
                { lat: 41.0, lon: 2.0 },
                { lat: 41.1, lon: 2.1 },
                { lat: 41.2, lon: 2.2 }
            ]
        });
    });

    describe("addGpxTrack", () => {
        it("should add a GPX track to the map", async () => {
            const mockFile = new File(["test"], "test.gpx", { type: "application/gpx+xml" });
            
            const trackInfo = await gpxManager.addGpxTrack(mockFile, mockMap, mockLayerControl);

            expect(trackInfo).toBeDefined();
            expect(trackInfo.metadata.name).toBe("test");
            expect(trackInfo.metadata.fileName).toBe("test.gpx");
            expect(trackInfo.metadata.pointCount).toBe(3);
            expect(mockLayerControl.addOverlay).toHaveBeenCalled();
        });

        it("should throw error when GPX has no valid points", async () => {
            parseGpxTrackInWorkerMock.mockResolvedValueOnce({ data: [] });
            const mockFile = new File(["test"], "empty.gpx", { type: "application/gpx+xml" });

            await expect(gpxManager.addGpxTrack(mockFile, mockMap, mockLayerControl))
                .rejects.toThrow("No valid track points found in GPX file");
        });

        it("should handle duplicate track names by appending counter", async () => {
            const mockFile1 = new File(["test"], "track.gpx", { type: "application/gpx+xml" });
            const mockFile2 = new File(["test"], "track.gpx", { type: "application/gpx+xml" });

            const track1 = await gpxManager.addGpxTrack(mockFile1, mockMap, mockLayerControl);
            const track2 = await gpxManager.addGpxTrack(mockFile2, mockMap, mockLayerControl);

            expect(track1.metadata.name).toBe("track");
            expect(track2.metadata.name).toContain("track");
            expect(track2.metadata.name).not.toBe("track");
        });

        it("should dispatch gpxTrackAdded event", async () => {
            const mockFile = new File(["test"], "test.gpx", { type: "application/gpx+xml" });
            const eventSpy = vi.fn();
            document.addEventListener('gpxTrackAdded', eventSpy);

            await gpxManager.addGpxTrack(mockFile, mockMap, mockLayerControl);

            expect(eventSpy).toHaveBeenCalled();
            document.removeEventListener('gpxTrackAdded', eventSpy);
        });
    });

    describe("removeGpxTrack", () => {
        it("should remove a track from the map", async () => {
            const mockFile = new File(["test"], "test.gpx", { type: "application/gpx+xml" });
            const trackInfo = await gpxManager.addGpxTrack(mockFile, mockMap, mockLayerControl);

            const result = gpxManager.removeGpxTrack(trackInfo.metadata.name, mockMap, mockLayerControl);

            expect(result).toBe(true);
            expect(mockMap.removeLayer).toHaveBeenCalledWith(trackInfo.layer);
            expect(mockLayerControl.removeLayer).toHaveBeenCalledWith(trackInfo.layer);
        });

        it("should return false when track not found", () => {
            const result = gpxManager.removeGpxTrack("nonexistent", mockMap, mockLayerControl);
            expect(result).toBe(false);
        });

        it("should dispatch gpxTrackRemoved event", async () => {
            const mockFile = new File(["test"], "test.gpx", { type: "application/gpx+xml" });
            const trackInfo = await gpxManager.addGpxTrack(mockFile, mockMap, mockLayerControl);
            const eventSpy = vi.fn();
            document.addEventListener('gpxTrackRemoved', eventSpy);

            gpxManager.removeGpxTrack(trackInfo.metadata.name, mockMap, mockLayerControl);

            expect(eventSpy).toHaveBeenCalled();
            document.removeEventListener('gpxTrackRemoved', eventSpy);
        });
    });

    describe("getAllTrackNames", () => {
        it("should return empty array when no tracks", () => {
            const names = gpxManager.getAllTrackNames();
            expect(names).toEqual([]);
        });

        it("should return all track names", async () => {
            const mockFile1 = new File(["test"], "track1.gpx", { type: "application/gpx+xml" });
            const mockFile2 = new File(["test"], "track2.gpx", { type: "application/gpx+xml" });

            await gpxManager.addGpxTrack(mockFile1, mockMap, mockLayerControl);
            await gpxManager.addGpxTrack(mockFile2, mockMap, mockLayerControl);

            const names = gpxManager.getAllTrackNames();
            expect(names).toHaveLength(2);
            expect(names).toContain("track1");
            expect(names).toContain("track2");
        });
    });

    describe("getTrackInfo", () => {
        it("should return null for nonexistent track", () => {
            const info = gpxManager.getTrackInfo("nonexistent");
            expect(info).toBeNull();
        });

        it("should return track info for existing track", async () => {
            const mockFile = new File(["test"], "test.gpx", { type: "application/gpx+xml" });
            const added = await gpxManager.addGpxTrack(mockFile, mockMap, mockLayerControl);

            const info = gpxManager.getTrackInfo("test");
            expect(info).toBeDefined();
            expect(info.metadata.name).toBe("test");
        });
    });

    describe("removeAllTracks", () => {
        it("should remove all tracks from the map", async () => {
            const mockFile1 = new File(["test"], "track1.gpx", { type: "application/gpx+xml" });
            const mockFile2 = new File(["test"], "track2.gpx", { type: "application/gpx+xml" });

            await gpxManager.addGpxTrack(mockFile1, mockMap, mockLayerControl);
            await gpxManager.addGpxTrack(mockFile2, mockMap, mockLayerControl);

            gpxManager.removeAllTracks(mockMap, mockLayerControl);

            const names = gpxManager.getAllTrackNames();
            expect(names).toHaveLength(0);
            expect(mockMap.removeLayer).toHaveBeenCalledTimes(2);
        });
    });

    describe("fitAllTracks", () => {
        it("should do nothing when no tracks", () => {
            gpxManager.fitAllTracks(mockMap);
            expect(mockMap.fitBounds).not.toHaveBeenCalled();
        });

        it("should fit map bounds when tracks exist", async () => {
            const mockFile = new File(["test"], "test.gpx", { type: "application/gpx+xml" });
            await gpxManager.addGpxTrack(mockFile, mockMap, mockLayerControl);

            gpxManager.fitAllTracks(mockMap);

            expect(mockMap.fitBounds).toHaveBeenCalled();
        });
    });
});
