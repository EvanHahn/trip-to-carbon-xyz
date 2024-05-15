import { build, emptyDir } from "https://deno.land/x/dnt@0.40.0/mod.ts";

await emptyDir("./dist/npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./dist/npm",
  shims: { deno: "dev" },
  typeCheck: "both",
  package: {
    "name": "trip-to-carbon-xyz",
    "description": "a light wrapper around triptocarbon.xyz",
    "version": "0.3.0",
    "author": "Evan Hahn <me@evanhahn.com> (https://evanhahn.com)",
    "license": "Unlicense",
    "keywords": [
      "triptocarbon.xyz",
    ],
    "homepage": "https://github.com/EvanHahn/trip-to-carbon-xyz",
    "repository": {
      "type": "git",
      "url": "git://github.com/EvanHahn/trip-to-carbon-xyz.git",
    },
    "bugs": {
      "url": "https://github.com/EvanHahn/trip-to-carbon-xyz/issues",
      "email": "me@evanhahn.com",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "./dist/npm/LICENSE.txt");
    Deno.copyFileSync("README.md", "./dist/npm/README.md");
    Deno.copyFileSync("CHANGELOG.md", "./dist/npm/CHANGELOG.md");
  },
});
