import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseGpxTrack } from '../../src/trackparser';
import fs from 'fs';

describe('parseGpxTrack with real GPX file', () => {
    let gpxFile;

    beforeEach(() => {
        // Read the actual GPX file
        const gpxData = fs.readFileSync('test/resources/test-track.gpx', 'utf8');

        // Create a mock File object
        gpxFile = new File([gpxData], "test/resources/test-track.gpx", { type: "application/gpx+xml" });
    });

    it('should correctly parse GPX file and extract track points', async () => {
        const points = await parseGpxTrack(gpxFile);

        expect(points).toBeDefined();
        expect(points.length).toBe(2);
        expect(points[0].lat).toBe(48.8588443);
        expect(points[0].lon).toBe(2.2943506);
        expect(points[1].lat).toBe(48.859);
        expect(points[1].lon).toBe(2.295);
    });
});