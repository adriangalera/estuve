import { describe, it, expect, beforeEach } from "vitest";
import { QuadtreeStorage } from "../../../src/storage/quadtreeStorage";
import { QuadTreeNode } from "../../../src/quadtree";
import { IDBFactory } from "fake-indexeddb";

describe("QuadtreeStorage", () => {
    let storage;

    beforeEach(() => {
        // Mock IndexedDB before each test
        global.indexedDB = new IDBFactory();
        storage = QuadtreeStorage();
        return storage.clear(); // Ensure clean database state
    });

    it("should open the database without errors", async () => {
        await expect(storage.openDatabase()).resolves.toBeDefined();
    });

    it("should save and load quadtree correctly", async () => {
        const qt = QuadTreeNode.empty();
        qt.insertLatLng(10, 20); // Insert some data

        await storage.save(qt);
        const loadedQt = await storage.load();

        expect(loadedQt.points()).toStrictEqual(qt.points()); // Ensure data matches
    });

    it("should return an empty quadtree when no data is stored", async () => {
        const loadedQt = await storage.load();
        expect(loadedQt).toStrictEqual(QuadTreeNode.empty()); // Expect empty tree
    });

    it("should clear the stored quadtree data", async () => {
        const qt = QuadTreeNode.empty();
        qt.insertLatLng(5, 5);

        await storage.save(qt);
        let loadedQt = await storage.load();
        expect(loadedQt.points()).toStrictEqual(qt.points()); // Confirm it's saved

        await storage.clear();
        loadedQt = await storage.load();
        expect(loadedQt).toStrictEqual(QuadTreeNode.empty()); // Expect it to be cleared
    });

    it("should handle multiple save/load cycles", async () => {
        const qt1 = QuadTreeNode.empty();
        qt1.insertLatLng(15, 25);

        const qt2 = QuadTreeNode.empty();
        qt2.insertLatLng(30, 40);

        await storage.save(qt1);
        let loadedQt = await storage.load();
        expect(loadedQt.points()).toStrictEqual(qt1.points());

        await storage.save(qt2);
        loadedQt = await storage.load();
        expect(loadedQt.points()).toStrictEqual(qt2.points()); // Last saved data should persist
    });

    it("should reject on database errors", async () => {
        global.indexedDB = null; // Simulate IndexedDB unavailability

        await expect(storage.openDatabase()).rejects.toThrow();
        await expect(storage.save(QuadTreeNode.empty())).rejects.toThrow();
        await expect(storage.load()).rejects.toThrow();
    });
});
