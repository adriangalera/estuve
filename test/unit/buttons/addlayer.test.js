import { describe, it, vi, expect } from "vitest";
import { formSubmitListener, addExtraLayerButton, } from "../../../src/buttons/addLayer";

describe("addLayerButton", () => {

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
        const map = {}
        addExtraLayerButton(map, vi.fn(), i18next)
        expect(addToMapMock).toHaveBeenCalledWith(map)
        expect(passedCallback).toBeDefined()
    })

    it("the form listener retrieves the data", () => {
        let dispatchedEvent = null;
        document.addEventListener('mapUpdate', (e) => {
            dispatchedEvent = e;
        });

        const storage = {
            layers: {
                putLayer: vi.fn()
            }
        }

        document.body.innerHTML = `
        <form id="geojson-layer-form">
          <input name="name" value="Layer 1" />
          <input name="url" value="geojson" />
          <input name="color" value="red" />
          <button type="submit">Submit</button>
        </form>
      `;

        formSubmitListener(storage)

        const form = document.getElementById('geojson-layer-form');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        expect(storage.layers.putLayer).toHaveBeenCalledWith({
            name: 'Layer 1',
            url: 'geojson',
            color: 'red'
        });

        expect(dispatchedEvent).toBeTruthy();
        expect(dispatchedEvent.detail).toEqual({
            extraLayer: {
                name: 'Layer 1',
                url: 'geojson',
                color: 'red'
            },
        });
    })
})