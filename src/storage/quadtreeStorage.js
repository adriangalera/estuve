import { QuadTreeNode } from "../quadtree"

export const QuadtreeStorage = () => {
    const databaseName = "geodb";
    const databaseKey = "geoData";
    const id = "estuve-quadtree";

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
        async save(qt) {
            const db = await this.openDatabase();
            const transaction = db.transaction(databaseKey, "readwrite");
            const store = transaction.objectStore(databaseKey);
            store.put({ id: id, data: qt });

            return new Promise((resolve, reject) => {
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            });
        },
        async load() {
            const db = await this.openDatabase();
            const transaction = db.transaction(databaseKey, "readonly");
            const store = transaction.objectStore(databaseKey);
            const request = store.get(id);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    if (request.result && request.result?.data) {
                        resolve(QuadTreeNode.fromObject(request.result.data))
                        return;
                    }
                    resolve(QuadTreeNode.empty());
                }
                request.onerror = () => reject(request.error);
            });
        },
        async clear() {
            const db = await this.openDatabase();
            const transaction = db.transaction(databaseKey, "readwrite");
            const store = transaction.objectStore(databaseKey);
            store.delete(id);

            return new Promise((resolve, reject) => {
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            });
        }
    };
};
