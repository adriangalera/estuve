export const FileLoadStorage = () => {

    const LOCALSTORAGE_NAME = "uploadedFiles";

    return {
        isAlreadyLoaded(file) {
            const loadedFiles = JSON.parse(localStorage.getItem(LOCALSTORAGE_NAME)) || [];
            return loadedFiles.includes(file.name)
        },
        saveUploadedFile(file) {
            if (!this.isAlreadyLoaded(file)) {
                const existingFiles = JSON.parse(localStorage.getItem(LOCALSTORAGE_NAME)) || [];
                const newFiles = [...existingFiles, file.name];
                localStorage.setItem(LOCALSTORAGE_NAME, JSON.stringify(newFiles));
            }
        },
        clear() {
            localStorage.removeItem(LOCALSTORAGE_NAME);
        }
    }
} 