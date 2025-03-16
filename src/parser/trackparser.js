export const TrackParser = () => {
    const worker = new Worker(new URL("/src/parser/trackparser.worker.js", import.meta.url), { type: "module" });

    return {
        parseGpxTrackInWorker(file) {
            return new Promise((resolve, reject) => {
                const id = crypto.randomUUID();

                const handleMessage = (event) => {
                    if (event.data.id === id) {
                        worker.removeEventListener("message", handleMessage);
                        resolve(event.data);
                    }
                };

                worker.addEventListener("message", handleMessage);
                worker.postMessage({ file, id });
            });
        }
    }
}