import { describe, it, vi, expect } from "vitest";
import { addDownloadButton, downloadQuadtree } from "../../../src/buttons/download";

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

        // Call function
        downloadQuadtree(quadtree);

        // Ensure serialize() was called
        expect(quadtree.serialize).toHaveBeenCalled();

        // Ensure document.createElement("a") was called
        expect(createElementSpy).toHaveBeenCalledWith("a");

        // Ensure correct attributes were set
        expect(setAttributeSpy).toHaveBeenCalledWith("href", "data:text/json;charset=utf-8,%7B%22key%22%3A%22value%22%7D");
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