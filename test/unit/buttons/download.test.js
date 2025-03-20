import { describe, it, vi, expect } from "vitest";
import { addDownloadButton, downloadStorage } from "../../../src/buttons/download";

describe("addDownloadButton", () => {

    const i18next = { t: vi.fn().mockImplementation( () => "")}

    it("should add button to the map and register callback", () => {
        const addToMapMock = vi.fn()
        let passedCallback = null;
        global.L = {
            easyButton: vi.fn((_, callback) => {
                passedCallback = callback
                return { addTo: addToMapMock }
            })
        }
        const map = vi.fn()
        addDownloadButton(map, vi.fn(), i18next)
        expect(addToMapMock).toHaveBeenCalledWith(map)
        expect(passedCallback).toBeDefined()
    })
    it("should download the contents of quadtree", () => {
        // Mock the quadtree object
        const quadtree = {
            serialize: vi.fn().mockImplementation(() => '{"key":"value"}')
        };
        const fileLoadedCache = {
            getAll: vi.fn().mockImplementation( () => ["1", "2"])
        }

        // Create a real <a> element
        const realAnchor = document.createElement("a");

        // Spy on its methods
        const clickSpy = vi.spyOn(realAnchor, "click").mockImplementation(() => {});        
        const setAttributeSpy = vi.spyOn(realAnchor, "setAttribute");
        const removeSpy = vi.spyOn(realAnchor, "remove");

        // Mock document.createElement to return the real <a> element
        const createElementSpy = vi.spyOn(document, "createElement").mockImplementation(() => realAnchor);

        // Spy on document.body methods
        const appendChildSpy = vi.spyOn(document.body, "appendChild");
        const removeChildSpy = vi.spyOn(document.body, "removeChild");

        const storage = {
            qt: quadtree,
            fileLoadedCache
        }

        // Call function
        downloadStorage(storage);

        // Ensure serialize() was called
        expect(quadtree.serialize).toHaveBeenCalled();

        // Ensure document.createElement("a") was called
        expect(createElementSpy).toHaveBeenCalledWith("a");

        const download = {
            qt: storage.qt.serialize(),
            filesLoaded: storage.fileLoadedCache.getAll()
        }
        const base64Data = btoa(JSON.stringify(download))

        // Ensure correct attributes were set
        expect(setAttributeSpy).toHaveBeenCalledWith("href", `data:text;charset=utf-8,${base64Data}`);
        expect(setAttributeSpy).toHaveBeenCalledWith("download", "estuve.bin");

        // Ensure the element was added and removed from DOM
        expect(appendChildSpy).toHaveBeenCalledWith(realAnchor);
        expect(removeChildSpy).toHaveBeenCalledWith(realAnchor);

        // Ensure the anchor was clicked
        expect(clickSpy).toHaveBeenCalled();

        // Restore mocks
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
    });
})