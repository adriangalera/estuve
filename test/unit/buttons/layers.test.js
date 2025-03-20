import { describe, it, vi, expect } from "vitest";
import { addLayerManagementButton, buttonClickListener } from "../../../src/buttons/layers";

describe("manageLayersButton", () => {

    const i18next = { t: vi.fn().mockImplementation(() => "") }

    it("should add button to the map and register callback", () => {
        const addToMapMock = vi.fn()
        let passedCallback = null;
        global.L = {
            easyButton: vi.fn((_, callback) => {
                passedCallback = callback
                return { addTo: addToMapMock }
            })
        }
        const map = {
            on: vi.fn()
        }
        addLayerManagementButton(map, vi.fn(), i18next)
        expect(addToMapMock).toHaveBeenCalledWith(map)
        expect(passedCallback).toBeDefined()
        expect(map.on).toHaveBeenCalledWith("popupopen", expect.anything())
    })

    it("should delete a created layer", () => {
        document.body.innerHTML = `
        <ul>
          <li>
            <button class="remove-layer-btn" data-layer-name="Layer1">Remove</button>
          </li>
        </ul>
      `;

        // Setup references to elements
        let button = document.querySelector('.remove-layer-btn');

        // Setup mock storage
        const storage = {
            layers: {
                removeLayer: vi.fn(),
            },
        };

        // Track dispatched custom event
        let dispatchedEvent = null;
        document.addEventListener('mapUpdate', (e) => {
            dispatchedEvent = e;
        });

        buttonClickListener(storage);

        button.click();

        expect(storage.layers.removeLayer).toHaveBeenCalledWith('Layer1');
        expect(document.querySelectorAll('li').length).toBe(0);
        expect(dispatchedEvent).toBeTruthy();
        expect(dispatchedEvent.detail).toEqual({ removedLayerName: 'Layer1' });
    })
})