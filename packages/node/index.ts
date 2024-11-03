import { ServerAdapter } from "@superblue/core";
import { createServer, IncomingMessage } from "http";
import { Transform, Readable, PassThrough } from "stream";
import { createBrotliCompress, createDeflate, createGzip } from "zlib";

interface CompressionMetadata {
  compressionHeaders: Record<string, string>,
  compressedStream: Transform
}

export interface CompressionStrategy {
  compress: (request: IncomingMessage) => CompressionMetadata
}

export interface CreateNodeHttpServerAdapterOptions {
  clients?: string[],
  compression?: CompressionStrategy
}

export function jsonParseOr<Value>(fallback: Value, text: string): Value {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export interface GzipCompressionOptions {
  exceptions?: string[]
}

export function gzipCompression({ exceptions = [] }: GzipCompressionOptions = {}): CompressionStrategy {
  return {
    compress: request => {
      if (exceptions.includes(request.headers["accept"] ?? "")) {
        return {
          compressedStream: new PassThrough,
          compressionHeaders: {}
        };
      }

      if (!request.headers["accept-encoding"]?.includes("gzip")) {
        return {
          compressionHeaders: {},
          compressedStream: new PassThrough
        };
      }

      const gzip = createGzip();

      const compressionHeaders: Record<string, string> = {
        "Content-Encoding": "gzip"
      };

      return {
        compressedStream: gzip,
        compressionHeaders
      };
    }
  };
}

export function brotliCompression(): CompressionStrategy {
  return {
    compress: request => {
      if (!request.headers["accept-encoding"]?.includes("br")) {
        return {
          compressionHeaders: {},
          compressedStream: new PassThrough
        };
      }

      const compressedStream = createBrotliCompress();

      const compressionHeaders: Record<string, string> = {
        "Content-Encoding": "br"
      };

      return {
        compressedStream,
        compressionHeaders
      };
    }
  };
}

export function deflateCompression(): CompressionStrategy {
  return {
    compress: request => {
      if (!request.headers["accept-encoding"]?.includes("deflate")) {
        return {
          compressionHeaders: {},
          compressedStream: new PassThrough
        };
      }

      const compressedStream = createDeflate();

      const compressionHeaders: Record<string, string> = {
        "Content-Encoding": "deflate"
      };

      return {
        compressedStream,
        compressionHeaders
      };
    }
  };
}

export function noCompression(): CompressionStrategy {
  return {
    compress: () => {
      return {
        compressionHeaders: {},
        compressedStream: new PassThrough
      };
    }
  };
}

export function createNodeHttpServerAdapter({ clients = [], compression = noCompression() }: CreateNodeHttpServerAdapterOptions = { }): ServerAdapter {
  const server = createServer();

  function getBody(request: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = "";

      request.on("data", chunk => {
        body += chunk.toString();
      });

      request.on("error", error => {
        reject(error);
      });

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
        const origin = request.headers.origin;
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

          const readableBody = toNodeReadable(callbackResponse.body ?? new ReadableStream());
          const { compressedStream, compressionHeaders } = compression.compress(request);

          response.writeHead(callbackResponse.status, {
            ...Object.fromEntries(callbackResponse.headers.entries()),
            ...corsHeaders,
            ...compressionHeaders
          });

          readableBody.pipe(compressedStream).pipe(response);
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