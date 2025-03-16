import { describe, it, expect, beforeEach } from "vitest";
import { GeoJsonStorage } from "../../../src/storage/geoJsonStorage";
import { IDBFactory } from "fake-indexeddb";

describe("GeoJsonStorage", () => {
    let storage;

    beforeEach(() => {
        global.indexedDB = new IDBFactory();
        storage = GeoJsonStorage();
    });

    it("should open the database without errors", async () => {
        await expect(storage.openDatabase()).resolves.toBeDefined();
    });

    it("should save and load GeoJSON correctly", async () => {
        const sampleGeoJSON = { type: "FeatureCollection", features: [] };

        await storage.save(sampleGeoJSON);
        const loadedGeoJSON = await storage.load();

        expect(loadedGeoJSON).toEqual(sampleGeoJSON);
    });

    it("should return null if no GeoJSON is stored", async () => {
        const loadedGeoJSON = await storage.load();
        expect(loadedGeoJSON).toBeNull();
    });

    it("should clear the stored GeoJSON data", async () => {
        const sampleGeoJSON = { type: "FeatureCollection", features: [] };

        await storage.save(sampleGeoJSON);
        let loadedGeoJSON = await storage.load();
        expect(loadedGeoJSON).toEqual(sampleGeoJSON); // Ensure data was saved

        await storage.clear();
        loadedGeoJSON = await storage.load();
        expect(loadedGeoJSON).toBeNull(); // Ensure data was cleared
    });
});
