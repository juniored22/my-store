// storageProvider.js
export class StorageProvider {
    constructor(storageKey) {
        this.storageKey = storageKey;

        return this;
    }

    // Save data to localStorage
    save(data) {
        const jsonData = JSON.stringify(data);
        localStorage.setItem(this.storageKey, jsonData);
        return this;
    }

    // Load data from localStorage
    load() {
        const jsonData = localStorage.getItem(this.storageKey);
        if (jsonData) {
            return JSON.parse(jsonData);
        }
        return null;
    }

    // Remove data from localStorage
    remove() {
        localStorage.removeItem(this.storageKey);
    }

    // Clear all data in localStorage
    clear() {
        localStorage.clear();
    }
}
