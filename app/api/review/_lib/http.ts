/**
 * The contract's replies (`docs/review/REVIEW-BACKEND-CONTRACT.md` §2), and
 * the one body reader the ingest handlers share.
 *
 * Every error is one of four fixed bodies. A handler never composes its own,
 * so the client site can switch on `error` and nothing else — and so no
 * handler can ever put a comment's text or a key into a response by
 * accident.
 */

/** The contract's request ceiling (§1). Larger bodies are refused unread. */
const MAX_BODY_BYTES = 64 * 1024;

export function unauthorized(): Response {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

export function badRequest(): Response {
  return Response.json({ error: "bad_request" }, { status: 400 });
}

export function serverError(): Response {
  return Response.json({ error: "server" }, { status: 500 });
}

/**
 * The reply for a method a route does not implement.
 *
 * Next answers an unexported method with a bare 405; the contract wants a
 * JSON body with it. Each route re-exports this under the names it does not
 * serve.
 */
export function methodNotAllowed(): Response {
  return Response.json({ error: "method" }, { status: 405 });
}

/**
 * Reads a JSON body, or returns null for anything the contract calls a 400:
 * a declared non-JSON type, more than 64 KB, or text that does not parse.
 *
 * The size is checked on the declared length first, so an oversized body is
 * refused before it is read, and again on the bytes actually received, so a
 * caller that omits or understates `Content-Length` gains nothing by it.
 */
export async function readJsonBody(request: Request): Promise<unknown | null> {
  const type = request.headers.get("content-type");
  if (type && !type.toLowerCase().includes("application/json")) return null;

  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return null;

  let text: string;
  try {
    text = await request.text();
  } catch {
    return null;
  }

  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
