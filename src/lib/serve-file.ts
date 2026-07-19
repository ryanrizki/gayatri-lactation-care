import fs from "node:fs";
import { Readable } from "node:stream";
import { parseRange } from "./uploads";

/**
 * Stream a file from disk as a Response, honoring an HTTP Range request.
 * With a valid Range → 206 Partial Content (Content-Range + sliced body);
 * otherwise → 200 with the full file. Both set Accept-Ranges so clients
 * (e.g. <video> seek) know range requests are supported.
 */
export function streamFile(abs: string, rangeHeader: string | null, contentType: string): Response {
  const stat = fs.statSync(abs);
  const range = parseRange(rangeHeader ?? undefined, stat.size);

  if (range) {
    const { start, end } = range;
    const stream = fs.createReadStream(abs, { start, end });
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
      },
    });
  }

  const stream = fs.createReadStream(abs);
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      "Accept-Ranges": "bytes",
    },
  });
}
