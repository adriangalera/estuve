import { describe, it, vi, expect } from "vitest";
import { clearStorage, addClearStorageButton } from "../../../src/buttons/clearStorage";
import { waitFor } from "@testing-library/dom";

describe("ClearButtonStorage", () => {

    const i18next = { t: vi.fn().mockImplementation(() => "") }

    it("should add the button and declare the callback on the button", () => {
        const addToMapMock = vi.fn()
        let passedCallback = null;
        global.L = {
            easyButton: vi.fn((symbol, callback) => {
                passedCallback = callback
                return { addTo: addToMapMock }
            })
        }
        const map = vi.fn()
        addClearStorageButton(map, vi.fn(), i18next)
        expect(addToMapMock).toHaveBeenCalledWith(map)
        expect(passedCallback).toBeDefined()
    })

    it("the callback should delete the storage", async () => {
        global.confirm = vi.fn().mockImplementation(() => true)
        const eventReceiver = vi.fn()
        document.addEventListener("mapUpdate", (event) => {
            eventReceiver(event.detail.qt, event.detail.removedLayerName)
        }
        )

        const fileLoadStorage = { clear: vi.fn() }
        const qtStorage = { clear: vi.fn() }
        const quadtree = { clear: vi.fn() }
        const layers = { clear: vi.fn() }
        const storage = { qt: quadtree, fileLoadedCache: fileLoadStorage, qtStorage, layers }

        clearStorage(storage, i18next)

        expect(fileLoadStorage.clear).toHaveBeenCalled()
        expect(qtStorage.clear).toHaveBeenCalled()
        expect(quadtree.clear).toHaveBeenCalled()
        expect(layers.clear).toHaveBeenCalled()

        await waitFor(() => {
            expect(eventReceiver).toHaveBeenCalledWith(quadtree, "ALL")
        })
    })

    it("the callback should not delete the storage", () => {
        global.confirm = vi.fn().mockImplementation(() => false)

        const fileLoadStorage = { clear: vi.fn() }
        const qtStorage = { clear: vi.fn() }
        const quadtree = { clear: vi.fn() }
        const storage = { qt: quadtree, fileLoadedCache: fileLoadStorage, qtStorage }


        clearStorage(storage, i18next)

        expect(fileLoadStorage.clear).not.toHaveBeenCalled()
        expect(qtStorage.clear).not.toHaveBeenCalled()
        expect(quadtree.clear).not.toHaveBeenCalled()
    })
})