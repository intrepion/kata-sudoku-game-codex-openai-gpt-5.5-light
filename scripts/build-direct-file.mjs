import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const outDir = resolve(root, "file-dist");
const assetsDir = resolve(outDir, "assets");

await rm(outDir, { recursive: true, force: true });
await mkdir(assetsDir, { recursive: true });

await build({
  entryPoints: [resolve(root, "src", "main.ts")],
  bundle: true,
  format: "iife",
  target: "es2022",
  outfile: resolve(assetsDir, "app.js"),
  loader: {
    ".css": "css",
  },
});

const html = (assetPrefix) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ninefold Daily</title>
    <link rel="stylesheet" href="${assetPrefix}assets/app.css" />
  </head>
  <body>
    <main id="app"></main>
    <script src="${assetPrefix}assets/app.js"></script>
  </body>
</html>
`;

await writeFile(resolve(outDir, "index.html"), html("./"));
await writeFile(resolve(root, "index.html"), html("./file-dist/"));
