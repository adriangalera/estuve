import { describe, it, vi, expect, beforeEach } from "vitest";
import { addUploadButton } from "../../../src/buttons/upload";
import { parseGpxTrack } from "../../../src/trackparser";
import { fireEvent, waitFor } from "@testing-library/dom";

const addToMock = vi.fn()
global.L = {
    easyButton: vi.fn(() => {
        return { addTo: addToMock }
    })
}

vi.mock("../../../src/trackparser", () => ({
    parseGpxTrack: vi.fn(), // Create a mock function
}));

describe("addUploadButton", () => {
    let map, quadtree, fileInput, progressBar;

    beforeEach(() => {
        // Mock map and quadtree
        map = {};
        quadtree = { insertLatLng: vi.fn(), locationIsOnTree: vi.fn().mockImplementation(() => false) };
        progressBar = { loadWithCurrentTotal: vi.fn(), stop: vi.fn() }

        // Create a fake file input in the DOM
        document.body.innerHTML = `<input type="file" id="gpxFileInput" multiple />`;
        fileInput = document.getElementById("gpxFileInput");

        parseGpxTrack = vi.fn()

        // Call the function under test
        addUploadButton(map, quadtree, progressBar);
    });

    it("should add the button to the map", () => {
        expect(addToMock).toHaveBeenCalled()
    })

    it("should process a GPX file and insert points into the quadtree", async () => {
        const mockPoints = [{ lon: -0.09, lat: 51.505 }, { lon: -0.1, lat: 51.506 }];
        parseGpxTrack.mockResolvedValue(mockPoints);

        const file = new File(["GPX content"], "track.gpx", { type: "application/gpx+xml" });
        await fireEvent.change(fileInput, { target: { files: [file] } })

        expect(parseGpxTrack).toHaveBeenCalledWith(file);

        // Ensure points were inserted into the quadtree
        expect(quadtree.insertLatLng).toHaveBeenCalledTimes(mockPoints.length);
        expect(quadtree.insertLatLng).toHaveBeenCalledWith(mockPoints[0].lat, mockPoints[0].lon);
        expect(quadtree.insertLatLng).toHaveBeenCalledWith(mockPoints[1].lat, mockPoints[1].lon);
    })

    it("should dispatch a 'mapUpdate' event after processing all files", async () => {
        parseGpxTrack.mockResolvedValue([]);

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
        parseGpxTrack.mockResolvedValue(mockPoints);

        const file = new File(["GPX content"], "track.gpx", { type: "application/gpx+xml" });
        await fireEvent.change(fileInput, { target: { files: [file] } })

        await waitFor(() => {
            expect(progressBar.loadWithCurrentTotal).toHaveBeenCalledWith(0,1)
            expect(progressBar.stop).toHaveBeenCalled();
        })
    })

});
