import { useCallback } from 'react';
import { ExtensionMessage } from '../types';

// The VS Code API object is injected by the extension into the webview
declare function acquireVsCodeApi(): {
  postMessage: (msg: ExtensionMessage) => void;
  getState: () => unknown;
  setState: (state: unknown) => void;
};

let vscodeApi: ReturnType<typeof acquireVsCodeApi> | null = null;

function getVSCodeApi() {
  if (!vscodeApi) {
    try {
      vscodeApi = acquireVsCodeApi();
    } catch {
      // Running in browser dev mode — create a mock
      vscodeApi = {
        postMessage: (msg) => console.log('[Mock VSCode postMessage]', msg),
        getState: () => ({}),
        setState: () => {},
      };
    }
  }
  return vscodeApi;
}

export function useVSCode() {
  const postMessage = useCallback((message: ExtensionMessage) => {
    getVSCodeApi().postMessage(message);
  }, []);

  return { postMessage };
}
