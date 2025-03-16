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

    it('Sets the geojson layer from a quadtree', () => {
        const vtMock = vi.fn()
        global.L = {
            geoJson: {
                vt: vtMock
            }
        }

        const qt = QuadTreeNode.empty()
        qt.insertLatLng(1, 2)

        const geoJsonContainer = GeoJsonContainer()
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
})


