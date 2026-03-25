export const FileLoadStorage = () => {

    const LOCALSTORAGE_NAME = "uploadedFiles";

    const parseStored = () => {
        try {
            const parsed = JSON.parse(localStorage.getItem(LOCALSTORAGE_NAME));
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Failed to parse uploaded files from localStorage:', e);
            localStorage.removeItem(LOCALSTORAGE_NAME);
            return [];
        }
    };

    return {
        isAlreadyLoaded(file) {
            return parseStored().includes(file.name);
        },
        saveUploadedFile(file) {
            if (!this.isAlreadyLoaded(file)) {
                const existingFiles = parseStored();
                const newFiles = [...existingFiles, file.name];
                localStorage.setItem(LOCALSTORAGE_NAME, JSON.stringify(newFiles));
            }
        },
        clear() {
            localStorage.removeItem(LOCALSTORAGE_NAME);
        },
        getAll() {
            return parseStored();
        },
        putAll(files) {
            localStorage.setItem(LOCALSTORAGE_NAME, JSON.stringify(files));
        }
    }
} 