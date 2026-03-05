import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { registerRoutes } from "./routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
      transport:
        process.env.NODE_ENV === "production"
          ? undefined
          : {
              target: "pino-pretty"
            }
    },
    genReqId: (req) => (req.headers["x-request-id"] as string | undefined) ?? randomUUID()
  });

  await app.register(cors, {
    origin: true,
    credentials: true
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Gazelle Public API Gateway",
        version: "0.1.0"
      },
      servers: [{ url: "https://api.gazellecoffee.com/v1" }]
    }
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs"
  });

  app.addHook("onRequest", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });

  await registerRoutes(app);

  return app;
}
