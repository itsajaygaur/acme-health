// Vercel build using the Build Output API (https://vercel.com/docs/build-output-api/v3).
//
// We build everything ourselves and write the result to .vercel/output so that
// Vercel does NOT run its own per-file TypeScript compilation for the API. That
// per-file compilation left the serverless function with extension-less ESM
// imports (e.g. `import ... from "../server/routes"`), which Node's ESM loader
// cannot resolve at runtime, causing ERR_MODULE_NOT_FOUND. Instead we bundle the
// whole Express app into a single self-contained CommonJS file with esbuild.

import { build } from "esbuild";
import { execSync } from "child_process";
import {
  rmSync,
  mkdirSync,
  cpSync,
  writeFileSync,
} from "fs";
import path from "path";

const root = process.cwd();
const outDir = path.join(root, ".vercel", "output");

console.log("[build] cleaning .vercel/output ...");
rmSync(outDir, { recursive: true, force: true });

// 1. Build the frontend (Vite -> dist/public).
console.log("[build] vite build ...");
execSync("npx --no-install vite build", { stdio: "inherit" });

// 2. Static assets: copy the Vite output into the Build Output static folder.
console.log("[build] copying static assets ...");
const staticDir = path.join(outDir, "static");
mkdirSync(staticDir, { recursive: true });
cpSync(path.join(root, "dist", "public"), staticDir, { recursive: true });

// 3. Serverless function: bundle the Express app into one self-contained file.
console.log("[build] bundling api function ...");
const funcDir = path.join(outDir, "functions", "api", "index.func");
mkdirSync(funcDir, { recursive: true });

await build({
  entryPoints: [path.join(root, "server", "vercel-entry.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outfile: path.join(funcDir, "index.js"),
  logLevel: "warning",
  // Optional native acceleration modules for `ws`; absent at runtime and loaded
  // best-effort behind try/catch by the consumer, so keep them external.
  external: ["bufferutil", "utf-8-validate"],
});

// The repo is `"type": "module"`, but our bundle is CommonJS. A local
// package.json makes the function directory treat index.js as CommonJS.
writeFileSync(
  path.join(funcDir, "package.json"),
  JSON.stringify({ type: "commonjs" }, null, 2),
);

// Function configuration. shouldAddHelpers is false so the raw request stream
// reaches Express's own body parser (express.json()) untouched.
writeFileSync(
  path.join(funcDir, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs20.x",
      handler: "index.js",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
    },
    null,
    2,
  ),
);

// 4. Routing: serve real files first, send /api/* to the function, and fall
// back to the SPA shell for every other path.
writeFileSync(
  path.join(outDir, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Send the API to the function BEFORE the filesystem phase, so the
        // rewritten /api/index path is matched against the function during
        // filesystem lookup. (If this came after { handle: "filesystem" } the
        // function would never be looked up and Vercel would return 404.)
        { src: "/api/(.*)", dest: "/api/index" },
        { handle: "filesystem" },
        // SPA fallback for everything that isn't a real file.
        { src: "/(.*)", dest: "/index.html" },
      ],
    },
    null,
    2,
  ),
);

console.log("[build] done -> .vercel/output");
