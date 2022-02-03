// types for preload-main.js shared contextBridge API

export interface Versions {
  appVersion?: string;
  crcVersion?: string;
  crcCommit?: string;
  ocpBundleVersion?: string;
  podmanVersion?: string;
}

export declare global {
  interface Window {
    api: {
      about: () => Promise<Versions>;
      openLinkInDefaultBrowser: (url: string) => void;
      // TODO: add rest of the API
    }
  }
}
