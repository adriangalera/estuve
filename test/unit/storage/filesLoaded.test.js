import { describe, it, expect, beforeEach, vi } from "vitest";
import { FileLoadStorage } from "../../../src/storage/filesLoaded";

describe("FileLoadStorage", () => {
    let fileStorage;

    beforeEach(() => {
        // Mock localStorage
        global.localStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
        };

        fileStorage = FileLoadStorage();
    });

    it("should return false if the file is not already loaded", () => {
        localStorage.getItem.mockReturnValue(null);

        const result = fileStorage.isAlreadyLoaded({ name: "file1.txt" });

        expect(result).toBe(false);
        expect(localStorage.getItem).toHaveBeenCalledWith("uploadedFiles");
    });

    it("should return true if the file is already loaded", () => {
        localStorage.getItem.mockReturnValue(JSON.stringify(["file1.txt"]));

        const result = fileStorage.isAlreadyLoaded({ name: "file1.txt" });

        expect(result).toBe(true);
        expect(localStorage.getItem).toHaveBeenCalledWith("uploadedFiles");
    });

    it("should save a new file to localStorage", () => {
        localStorage.getItem.mockReturnValue(null);
        localStorage.setItem.mockImplementation(() => { });

        fileStorage.saveUploadedFile({ name: "file2.txt" });

        expect(localStorage.setItem).toHaveBeenCalledWith("uploadedFiles", JSON.stringify(["file2.txt"]));
    });

    it("should append a new file to existing stored files", () => {
        localStorage.getItem.mockReturnValue(JSON.stringify(["file1.txt"]));
        localStorage.setItem.mockImplementation(() => { });

        fileStorage.saveUploadedFile({ name: "file2.txt" });

        expect(localStorage.setItem).toHaveBeenCalledWith("uploadedFiles", JSON.stringify(["file1.txt", "file2.txt"]));
    });

    it("should not duplicate files in storage", () => {
        localStorage.getItem.mockReturnValue(JSON.stringify(["file1.txt"]));
        localStorage.setItem.mockImplementation(() => { });

        fileStorage.saveUploadedFile({ name: "file1.txt" });

        expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it("should clear all stored files", () => {
        fileStorage.clear();

        expect(localStorage.removeItem).toHaveBeenCalledWith("uploadedFiles");
    });
    it("should return all loaded files", () => {
        localStorage.getItem.mockImplementation(() => "[1,2]")

        const allFiles = fileStorage.getAll()

        expect(allFiles).toStrictEqual([1, 2])
    })
    it("should set all files", () => {
        fileStorage.putAll([1,2])

        expect(localStorage.setItem).toHaveBeenCalled("[1,2]")
    })
});
