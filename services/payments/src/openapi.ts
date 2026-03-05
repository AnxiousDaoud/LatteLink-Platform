import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildApp } from "./app.js";

const app = await buildApp();
await app.ready();

const spec = app.swagger();
const outputDir = join(process.cwd(), "openapi");
await mkdir(outputDir, { recursive: true });
await writeFile(join(outputDir, "openapi.json"), JSON.stringify(spec, null, 2));

await app.close();
