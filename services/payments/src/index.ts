import { buildApp } from "./app.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

const app = await buildApp();

await app.listen({ port, host });
app.log.info({ service: "payments", port }, "payments listening");
