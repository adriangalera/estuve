import { describe, it, vi, expect, beforeEach } from "vitest";
import { displayInfoMessage, addInfoButton } from "../../../src/buttons/infobutton";
import { waitFor } from "@testing-library/dom";
import L from "leaflet";


describe("InfoButton", () => {

    const i18next = { t: vi.fn().mockImplementation(() => "translated") }

    it("should invoke popup and put some HTML content", () => {
        let passedContent = "";
        const map = {
            getCenter: vi.fn().mockImplementation(() => "center")
        }

        vi.spyOn(L, "popup").mockImplementation(() => {
            const mock = {
                setLatLng: vi.fn().mockReturnThis(),
                setContent: vi.fn().mockImplementation((content) => {
                    passedContent = content
                    return mock
                }),
                openOn: vi.fn().mockReturnThis()
            }
            return mock

        });
        displayInfoMessage(map, i18next)
        expect(passedContent).not.toBe("")
    })

    it("should define callback and add button to the map", () => {
        const addToMapMock = vi.fn()
        let passedCallback = null;
        global.L = {
            easyButton: vi.fn((symbol, callback) => {
                passedCallback = callback
                return { addTo: addToMapMock }
            })
        }
        const map = vi.fn()
        addInfoButton(map, i18next)
        expect(addToMapMock).toHaveBeenCalledWith(map)
        expect(passedCallback).toBeDefined()
    })

})