import { ClientAdapter } from "@renkei/core";

export function createFetchAdapter(): ClientAdapter {
  return {
    request: async ({ body, url, signal }) => {
      const response = await window.fetch(url, {
        method: "POST",
        signal: signal ?? null,
        body,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      return response;
    },
    subscribe: ({ url }) => {
      const eventSource = new EventSource(url);

      return {
        close: () => {
          eventSource.close();
        },
        onEvent: (send) => {
          eventSource.onmessage = event => {
            send(event.data);
          };
        }
      };
    }
  };
}