import { ServerAdapter } from "@superblue/core";
import { createServer, IncomingMessage } from "http";
import { Readable } from "stream";

export function jsonParseOr<Value>(fallback: Value, text: string): Value {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export function createNodeHttpServerAdapter({ clients }: { clients: string[] }): ServerAdapter {
  const server = createServer();

  function getBody(request: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = "";

      request.on("data", chunk => {
        body += chunk.toString();
      });

      request.on("error", error => {
        reject(error);
      })

      request.on("end", () => {
        resolve(body);
      });
    });
  }

  function toNodeReadable(webStream: ReadableStream<Uint8Array>): Readable {
    const reader = webStream.getReader();
    return new Readable({
      async read() {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      }
    });
  }

  return {
    onRequest: (callback) => {
      server.on("request", async (request, response) => {
        const origin = request.headers.origin
        const foundClient = clients.find(client => client === origin);
        const allowedOrigin = foundClient ? foundClient : "null";

        const corsHeaders = {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST"
        };

        try {
          const body = await getBody(request);
          const json = jsonParseOr(null, body);
          const callbackResponse = await callback(new Request(`${request.headers.origin}${request.url ?? ""}`, {
            body: JSON.stringify(json),
            method: "POST",
            headers: Object.fromEntries(Object.entries(request.headers).map(([name, value]) => [name, String(value)]))
          }));

          response.writeHead(callbackResponse.status, {
            ...Object.fromEntries(callbackResponse.headers.entries()),
            ...corsHeaders
          });

          if (callbackResponse.body) {
            toNodeReadable(callbackResponse.body).pipe(response);
          } else {
            response.end(callbackResponse.body);
          }
        } catch (error) {
          response.writeHead(200, {
            "Content-Type": "application/json",
            ...corsHeaders
          });

          const message = error instanceof Error ? error.message : String(error);

          response.end(JSON.stringify({
            error: message
          }));
          
          return;
        }
      });
    },
    create: () => {
      return {
        start: ({ host, port }) => {
          server.listen(port, host, () => {
            console.log(`Server listening on http://${host}:${port}`);
          });
        },
        stop: () => {
          server.close();
        }
      };
    }
  };
}