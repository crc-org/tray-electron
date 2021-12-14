const Store = require('electron-store');

module.exports = class Config {
    constructor() {
        let schema = {
            enableTelemetry: {
                type: 'boolean',
                default: true
            }
        }
        this.store = new Store({schema})
    }

    get(key) {
        return this.store.get(key)
    }

    set(key, value) {
        this.store.set(key, value)
    }

    delete(key) {
        this.store.delete(key)
    }
}
