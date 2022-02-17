import Store = require('electron-store');

interface ConfigType {
    enableTelemetry: boolean;
}
export class Config {
    private store: Store<ConfigType>;

    constructor() {
        let schema = {
            enableTelemetry: {
                default: true
            }
        }
        this.store = new Store<ConfigType>({schema})
    }

    get(key: string): boolean {
        return this.store.get(key)
    }

    set(key: string, value: boolean): void {
        this.store.set(key, value)
    }

    delete(key: 'enableTelemetry'): void {
        this.store.delete(key)
    }
}
