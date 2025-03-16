import { describe, it, expect, beforeEach } from "vitest";
import { QuadtreeStorage } from "../../../src/storage/quadtreeStorage";
import { QuadTreeNode } from "../../../src/quadtree"
import { IDBFactory } from "fake-indexeddb";

describe("QuadtreeStorage", () => {
    let storage;

    beforeEach(() => {
        global.indexedDB = new IDBFactory();
        storage = QuadtreeStorage();
    });

    it("should open the database without errors", async () => {
        await expect(storage.openDatabase()).resolves.toBeDefined();
    });

    it("should save and load GeoJSON correctly", async () => {
        const qt = QuadTreeNode.empty()
        qt.insertLatLng(1, 1)

        await storage.save(qt);
        const loadedQt = await storage.load();

        expect(loadedQt).toEqual(qt);
    });

    it("should return null if no qt is stored", async () => {
        const loadedQt = await storage.load();
        expect(loadedQt).toBeNull();
    });

    it("should clear the stored qt data", async () => {
        const qt = QuadTreeNode.empty();
        qt.insertLatLng(1, 1)

        await storage.save(qt);
        let loadedQt = await storage.load();
        expect(loadedQt).toEqual(qt);

        await storage.clear();
        loadedQt = await storage.load();
        expect(loadedQt).toBeNull();
    });

});
