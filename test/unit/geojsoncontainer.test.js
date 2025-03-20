import { describe } from 'vitest';
import { GeoJsonContainer } from "../../src/geojsoncontainer"
import { QuadTreeNode } from '../../src/quadtree';

// Mock dependencies
vi.mock("geojson-vt", () => ({
    default: vi.fn(() => ({
        getTile: vi.fn()
    }))
}));

vi.mock("leaflet-geojson-vt", () => ({ default: vi.fn() }));

describe("GeoJsonContainer", () => {

    const vtMock = vi.fn()
    global.L = {
        geoJson: {
            vt: vtMock
        }
    }

    // Mock fetch
    global.fetch = vi.fn();
    const geoJsonContainer = GeoJsonContainer()

    it('Sets the geojson layer from a quadtree', () => {


        const qt = QuadTreeNode.empty()
        qt.insertLatLng(1, 2)


        geoJsonContainer.setFromQuadTree(qt)

        expect(vtMock).toHaveBeenCalledWith(expect.objectContaining({
            type: "FeatureCollection",
            features: [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [2, 1]
                }
            }]
        }), expect.anything());
    })

    it("creates the geojson layer from a layer created by the form", async () => {
        const mockGeoJson = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: { flag: true },
                    geometry: {
                        type: 'Point',
                        coordinates: [0, 0]
                    }
                }
            ]
        };

        const mockLayer = {
            name: 'Test Layer',
            url: 'https://example.com/data.geojson',
            color: 'red'
        };

        fetch.mockResolvedValue({
            json: () => Promise.resolve(mockGeoJson)
        });

        await geoJsonContainer.setFromExtralayer(mockLayer);

        expect(fetch).toHaveBeenCalledWith(mockLayer.url);
        expect(L.geoJson.vt).toHaveBeenCalledWith(mockGeoJson, expect.objectContaining({
            name: 'Test Layer',
            style: expect.any(Function)
        }));
    })
})