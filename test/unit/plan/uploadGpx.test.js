import { describe, it, vi, expect, beforeEach } from "vitest";
import { addPlanUploadButton } from "../../../src/plan/uploadGpx";
import { fireEvent, waitFor } from "@testing-library/dom";

// Mock Leaflet - Must be before imports
vi.mock("leaflet", () => {
    const addToMock = vi.fn();
    return {
        default: {
            easyButton: vi.fn(() => ({ addTo: addToMock }))
        },
        easyButton: vi.fn(() => ({ addTo: addToMock }))
    };
});

const addToMock = vi.fn();
global.L = {
    easyButton: vi.fn(() => ({ addTo: addToMock }))
};

describe("addPlanUploadButton", () => {
    let map, gpxManager, layerControl, fileInput;
    const i18next = { t: vi.fn().mockImplementation(() => "") };

    beforeEach(() => {
        map = {};
        gpxManager = {
            addGpxTrack: vi.fn().mockResolvedValue({
                metadata: { name: "test" }
            }),
            fitAllTracks: vi.fn()
        };
        layerControl = {};

        // Create file input in DOM
        document.body.innerHTML = `<input type="file" id="planGpxFileInput" multiple />`;
        fileInput = document.getElementById("planGpxFileInput");

        addPlanUploadButton(map, gpxManager, layerControl, i18next);
    });

    it("should handle successful GPX upload", async () => {
        const mockFile = new File(["gpx content"], "test.gpx", { type: "application/gpx+xml" });
        const fileList = [mockFile];
        Object.defineProperty(fileInput, 'files', {
            value: fileList,
            writable: false
        });

        fireEvent.change(fileInput);

        await waitFor(() => {
            expect(gpxManager.addGpxTrack).toHaveBeenCalledWith(mockFile, map, layerControl);
        });

        expect(gpxManager.fitAllTracks).toHaveBeenCalledWith(map);
    });

    it("should handle multiple GPX files", async () => {
        const mockFile1 = new File(["gpx1"], "track1.gpx", { type: "application/gpx+xml" });
        const mockFile2 = new File(["gpx2"], "track2.gpx", { type: "application/gpx+xml" });
        const fileList = [mockFile1, mockFile2];
        Object.defineProperty(fileInput, 'files', {
            value: fileList,
            writable: false
        });

        fireEvent.change(fileInput);

        await waitFor(() => {
            expect(gpxManager.addGpxTrack).toHaveBeenCalledTimes(2);
        });
    });

    it("should handle upload errors gracefully", async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const mockFile = new File(["invalid"], "bad.gpx", { type: "application/gpx+xml" });
        gpxManager.addGpxTrack.mockRejectedValueOnce(new Error("Invalid GPX"));
        
        const fileList = [mockFile];
        Object.defineProperty(fileInput, 'files', {
            value: fileList,
            writable: false
        });

        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        fireEvent.change(fileInput);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
        alertSpy.mockRestore();
    });

    it("should clear file input after upload", async () => {
        const mockFile = new File(["gpx"], "test.gpx", { type: "application/gpx+xml" });
        const fileList = [mockFile];
        Object.defineProperty(fileInput, 'files', {
            value: fileList,
            writable: false
        });

        fireEvent.change(fileInput);

        await waitFor(() => {
            expect(fileInput.value).toBe('');
        });
    });

    it("should do nothing when no files selected", async () => {
        Object.defineProperty(fileInput, 'files', {
            value: [],
            writable: false
        });

        fireEvent.change(fileInput);

        await waitFor(() => {
            expect(gpxManager.addGpxTrack).not.toHaveBeenCalled();
        });
    });
});
