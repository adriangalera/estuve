import '@vitest/web-worker';
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import GpxParserWorker from "../../../src/parser/trackparser.worker?worker";
import { waitFor } from '@testing-library/dom';

describe('GPX Parser Worker', () => {

    const validGpxData = () => {
        const filePath = path.resolve(__dirname, '../../resources/test-track.gpx');
        return fs.readFileSync(filePath, 'utf-8');
    }

    const invalidGpxData = () => {
        const filePath = path.resolve(__dirname, '../../resources/empty-test-track.gpx');
        return fs.readFileSync(filePath, 'utf-8');
    }

    it('should parse GPX data correctly', async (done) => {
        const worker = new GpxParserWorker();
        let recivedData;

        worker.onmessage = function (event) {
            recivedData = event.data
        };

        worker.postMessage({ id: "12345", file: validGpxData() });

        waitFor(() => {
            expect(recivedData).toEqual([{ "lat": 48.8588443, "lon": 2.2943506 }, { "lat": 48.859, "lon": 2.295 }])
        })
    });

    it('should return empty points on invalid GPX file', async (done) => {
        const worker = new GpxParserWorker();
        let recivedData;

        worker.onmessage = function (event) {
            recivedData = event.data
        };

        worker.postMessage({ id: "12345", file: invalidGpxData() });

        waitFor(() => {
            expect(recivedData).toEqual([])
        })
    });
});
