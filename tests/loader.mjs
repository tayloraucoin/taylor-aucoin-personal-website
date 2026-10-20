import Module from "node:module";
import "tsx";

/**
 * Loaded by `yarn test` through `--import`, so unit files load app modules the
 * way Next does. tsx compiles TypeScript and resolves `@/` from tsconfig. The
 * repo's package has no `"type"`, so tsx loads app modules as CommonJS, and the
 * two patches below stub what plain Node cannot load there: static image
 * imports, and the `server-only` marker (a bundler guard, not installed here).
 */
const IMAGES = [".png", ".webp", ".jpg", ".jpeg", ".gif", ".avif", ".svg"];

for (const ext of IMAGES) {
  Module._extensions[ext] = (module, filename) => {
    module.exports = { src: filename, width: 1, height: 1 };
  };
}

const SERVER_ONLY = "server-only";
const stub = new Module(SERVER_ONLY);
stub.filename = SERVER_ONLY;
stub.loaded = true;
Module._cache[SERVER_ONLY] = stub;

const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === SERVER_ONLY) return SERVER_ONLY;
  return resolveFilename.call(this, request, ...rest);
};
