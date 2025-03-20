import { describe, it, expect, beforeEach, vi } from "vitest";
import { LayersStorage } from "../../../src/storage/layers";

describe("LayerStorage", () => {
    let layerStorage;

    beforeEach(() => {
        // Mock localStorage
        global.localStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
        };

        layerStorage = LayersStorage();
    });

    it("should save a new layer to localStorage", () => {
        localStorage.getItem.mockReturnValue(null);
        localStorage.setItem.mockImplementation(() => { });

        layerStorage.putLayer({ name: "layer" });

        expect(localStorage.setItem).toHaveBeenCalledWith("layers", JSON.stringify([{ name: "layer" }]));
    });

    it("should append a new layer to existing stored layers", () => {
        localStorage.getItem.mockReturnValue(JSON.stringify([{ name: "layer" }]));
        localStorage.setItem.mockImplementation(() => { });

        layerStorage.putLayer({ name: "layer2" });

        expect(localStorage.setItem).toHaveBeenCalledWith("layers", JSON.stringify([{ name: "layer" }, { name: "layer2" }]));
    });

    it("should clear all stored layers", () => {
        layerStorage.clear();

        expect(localStorage.removeItem).toHaveBeenCalledWith("layers");
    });

    it("should return all loaded layers", () => {
        localStorage.getItem.mockImplementation(() => JSON.stringify([{ name: "layer" }, { name: "layer2" }]))

        const allLayers = layerStorage.getAll()

        expect(allLayers).toStrictEqual([{ name: "layer" }, { name: "layer2" }])
    })

    it("should set all layers", () => {
        layerStorage.putAll([{ name: "layer" }, { name: "layer2" }])

        expect(localStorage.setItem).toHaveBeenCalled(JSON.stringify([{ name: "layer" }, { name: "layer2" }]))
    })
    it("should remove layer by name", () => {
        localStorage.getItem.mockReturnValue(JSON.stringify([{ name: "layer" }, { name: "layer2" }]));
        
        layerStorage.removeLayer({name: "layer2"})

        expect(localStorage.setItem).toHaveBeenCalled(JSON.stringify([{ name: "layer" }]))
    })
});
