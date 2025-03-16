import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addProgressBar } from '../../../src/progressbar/creator';
import { loader } from '../../../src/progressbar/loader';

const mockMap = {
    addControl: vi.fn()
};

beforeEach(() => {
    global.L = {
        Control: {
            extend: vi.fn().mockReturnValue(function () { 
                this.addTo = vi.fn(); 
                this.stop = vi.fn(); 
            })
        }
    };
});

describe('addProgressBar', () => {
    it('should add a progress bar control to the map', () => {
        const progressBar = addProgressBar(mockMap);

        expect(L.Control.extend).toHaveBeenCalledWith(loader);
        expect(progressBar).toBeDefined();
        expect(progressBar.addTo).toHaveBeenCalledWith(mockMap);
        expect(progressBar.stop).toHaveBeenCalled();
    });
});