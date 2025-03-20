import { describe, it, vi, expect, beforeEach } from "vitest";
import { addUploadButton } from "../../../src/buttons/upload";
import { TrackParser } from "../../../src/parser/trackparser";
import { QuadTreeNode } from "../../../src/quadtree";
import { fireEvent, waitFor } from "@testing-library/dom";

const addToMock = vi.fn()
const parseGpxTrackInWorkerMock = vi.fn()
const deserializeQuadTreeMock = vi.fn()
global.L = {
    easyButton: vi.fn(() => {
        return { addTo: addToMock }
    })
}

vi.mock("../../../src/parser/trackparser", () => ({
    TrackParser: vi.fn(() => ({
        parseGpxTrackInWorker: parseGpxTrackInWorkerMock,
    })),
}));

vi.mock("../../../src/quadtree", () => ({
    QuadTreeNode: vi.fn(() => ({
        deserialize: deserializeQuadTreeMock,
    })),
}));

describe("addUploadButton", () => {
    let map, quadtree, fileInput, progressBar, fileLoadStorage, qtStorage
    const i18next = { t: vi.fn().mockImplementation(() => "") }

    beforeEach(() => {
        // Mock map and quadtree
        map = {};
        quadtree = { insertLatLng: vi.fn(), locationIsOnTree: vi.fn().mockImplementation(() => false) };
        progressBar = { loadWithCurrentTotal: vi.fn(), stop: vi.fn() }
        fileLoadStorage = { isAlreadyLoaded: vi.fn().mockImplementation(() => false), saveUploadedFile: vi.fn(), putAll: vi.fn() }
        qtStorage = { save: vi.fn() }
        const storage = { qt: quadtree, fileLoadedCache: fileLoadStorage, qtStorage }


        // Create a fake file input in the DOM
        document.body.innerHTML = `<input type="file" id="gpxFileInput" multiple />`;
        fileInput = document.getElementById("gpxFileInput");

        // Call the function under test
        addUploadButton(map, progressBar, i18next, storage);
    });

    it("should add the button to the map", () => {
        expect(addToMock).toHaveBeenCalled()
    })

    it("should process a GPX file and insert points into the quadtree", async () => {
        const mockPoints = [{ lon: -0.09, lat: 51.505 }, { lon: -0.1, lat: 51.506 }];
        parseGpxTrackInWorkerMock.mockResolvedValue({ data: mockPoints });

        const file = new File(["GPX content"], "track.gpx", { type: "application/gpx+xml" });
        await fireEvent.change(fileInput, { target: { files: [file] } })

        expect(parseGpxTrackInWorkerMock).toHaveBeenCalledWith(file);

        // Ensure points were inserted into the quadtree
        expect(quadtree.insertLatLng).toHaveBeenCalledTimes(mockPoints.length);
        expect(quadtree.insertLatLng).toHaveBeenCalledWith(mockPoints[0].lat, mockPoints[0].lon);
        expect(quadtree.insertLatLng).toHaveBeenCalledWith(mockPoints[1].lat, mockPoints[1].lon);
    })

    it("should dispatch a 'mapUpdate' event after processing all files", async () => {
        parseGpxTrackInWorkerMock.mockResolvedValue({ data: [] });

        const mockListener = vi.fn(); // Mock event listener
        // Attach event listener
        document.addEventListener("mapUpdate", mockListener);

        const file = new File(["GPX content"], "track.gpx", { type: "application/gpx+xml" });
        await fireEvent.change(fileInput, { target: { files: [file] } })

        // Wait for the event to be processed
        await waitFor(() => {
            expect(mockListener).toHaveBeenCalled();
        });
    });
    it("should load the progress bar and stop it", async () => {
        const mockPoints = [{ lon: -0.09, lat: 51.505 }, { lon: -0.1, lat: 51.506 }];
        parseGpxTrackInWorkerMock.mockResolvedValue({ data: mockPoints });

        const file = new File(["GPX content"], "track.gpx", { type: "application/gpx+xml" });
        await fireEvent.change(fileInput, { target: { files: [file] } })

        await waitFor(() => {
            expect(progressBar.loadWithCurrentTotal).toHaveBeenCalledWith(0, 1)
            expect(progressBar.stop).toHaveBeenCalled();
        })
    })
    it("should check if file is already loaded and save the file is loaded", async () => {
        const mockPoints = [{ lon: -0.09, lat: 51.505 }, { lon: -0.1, lat: 51.506 }];
        parseGpxTrackInWorkerMock.mockResolvedValue({ data: mockPoints });

        const file = new File(["GPX content"], "track.gpx", { type: "application/gpx+xml" });
        await fireEvent.change(fileInput, { target: { files: [file] } })

        await waitFor(() => {
            expect(fileLoadStorage.isAlreadyLoaded).toHaveBeenCalledWith(file)
            expect(fileLoadStorage.saveUploadedFile).toHaveBeenCalledWith(file)
        })
    })

    it("should ignore file upload if already loaded", async () => {
        fileLoadStorage.isAlreadyLoaded.mockImplementation(() => true)
        const mockPoints = [{ lon: -0.09, lat: 51.505 }, { lon: -0.1, lat: 51.506 }];
        parseGpxTrackInWorkerMock.mockResolvedValue({ data: mockPoints });

        const file = new File(["GPX content"], "track.gpx", { type: "application/gpx+xml" });
        await fireEvent.change(fileInput, { target: { files: [file] } })

        expect(fileLoadStorage.saveUploadedFile).not.toHaveBeenCalledWith(file)
        expect(quadtree.insertLatLng).not.toHaveBeenCalled()
    })
    it("should upload backup file", async () => {
        const qtObj = { "key": "value" }
        const loadedFiles = ["1", "2"]
        const download = {
            qt: JSON.stringify(qtObj),
            filesLoaded: loadedFiles
        }
        const base64Data = btoa(JSON.stringify(download))

        const file = new File([base64Data], "estuve.bin", { type: "application/gpx+xml" });

        const mockListener = vi.fn();
        document.addEventListener("mapUpdate", mockListener);

        await fireEvent.change(fileInput, { target: { files: [file] } })

        waitFor(() => {
            expect(deserializeQuadTreeMock).toHaveBeenCalledWith(obj)
            expect(mockListener).toHaveBeenCalled()
            expect(fileLoadStorage.putAll).toHaveBeenCalledWith(loadedFiles)
        })

    })
    it("should show alert when mixing file extensions", async () => {
        const alertMock = vi.spyOn(window, "alert").mockImplementation(() => { });

        const mockListener = vi.fn();
        document.addEventListener("mapUpdate", mockListener);

        const file = new File([""], "estuve.bin", { type: "application/gpx+xml" });
        const file2 = new File([""], "track.gpx", { type: "application/gpx+xml" });
        await fireEvent.change(fileInput, { target: { files: [file, file2] } })


        expect(mockListener).not.toHaveBeenCalled()
        expect(alertMock).toHaveBeenCalled()
    })
});
