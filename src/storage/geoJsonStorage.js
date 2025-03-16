export const GeoJsonStorage = () => {
    const databaseName = "geodb";
    const databaseKey = "geoData";
    const geoJsonId = "estuve-geojson";

    return {
        openDatabase() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(databaseName, 1);

                request.onupgradeneeded = function (event) {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(databaseKey)) {
                        db.createObjectStore(databaseKey, { keyPath: "id" });
                    }
                };

                request.onsuccess = function (event) {
                    resolve(event.target.result);
                };

                request.onerror = function (event) {
                    reject(event.target.error);
                };
            });
        },
        async save(geoJson) {
            const db = await this.openDatabase();
            const transaction = db.transaction(databaseKey, "readwrite");
            const store = transaction.objectStore(databaseKey);
            store.put({ id: geoJsonId, data: geoJson });

            return new Promise((resolve, reject) => {
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            });
        },
        async load() {
            const db = await this.openDatabase();
            const transaction = db.transaction(databaseKey, "readonly");
            const store = transaction.objectStore(databaseKey);
            const request = store.get(geoJsonId);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result?.data || null);
                request.onerror = () => reject(request.error);
            });
        },
        async clear() {
            const db = await this.openDatabase();
            const transaction = db.transaction(databaseKey, "readwrite");
            const store = transaction.objectStore(databaseKey);
            store.delete(geoJsonId);

            return new Promise((resolve, reject) => {
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            });
        }
    };
};
