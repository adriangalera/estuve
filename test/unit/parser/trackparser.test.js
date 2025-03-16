import { describe, it, expect, vi } from "vitest";
import { TrackParser } from "../../../src/parser/trackparser";

// Mock the Worker global
class MockWorker {
    constructor() {
        this.listeners = {};
    }
    addEventListener(event, callback) {
        this.listeners[event] = callback;
    }
    removeEventListener(event) {
        delete this.listeners[event];
    }
    postMessage(message) {
        // Simulate a response from the worker
        setTimeout(() => {
            if (this.listeners["message"]) {
                this.listeners["message"]({ data: { id: message.id, result: "parsed track data" } });
            }
        }, 10);
    }
}

describe("TrackParser", () => {
    it("should correctly parse a GPX track using the worker", async () => {
        global.Worker = MockWorker;
        const parser = TrackParser();
        
        const fakeFile = new Blob(["<gpx></gpx>"], { type: "application/gpx+xml" });
        
        const result = await parser.parseGpxTrackInWorker(fakeFile);
        
        expect(result).toHaveProperty("id");
        expect(result).toHaveProperty("result", "parsed track data");
    });
});
