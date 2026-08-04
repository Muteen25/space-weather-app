import express from "express";
import cors from "cors";
import helmet from "helmet";

import {
  createLiveSpaceWeatherService,
  normalizeEventQuery,
  normalizeRange,
  type SpaceWeatherService
} from "./services/spaceWeatherService";

export function createApp({ service = createLiveSpaceWeatherService() }: { service?: SpaceWeatherService } = {}) {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/", (_request, response) => {
    response.redirect(process.env.FRONTEND_URL ?? "http://127.0.0.1:5173");
  });

  app.get("/api/dashboard/summary", async (_request, response) => {
    response.json(await service.getDashboardSummary());
  });

  app.get("/api/impact-summary", async (_request, response) => {
    response.json(await service.getImpactSummary());
  });

  app.get("/api/solar-wind", async (request, response) => {
    response.json(await service.getSolarWind(normalizeRange(request.query.range)));
  });

  app.get("/api/magnetic-field", async (request, response) => {
    response.json(await service.getMagneticField(normalizeRange(request.query.range)));
  });

  app.get("/api/kp", async (_request, response) => {
    response.json(await service.getKp());
  });

  app.get("/api/scales", async (_request, response) => {
    response.json(await service.getScales());
  });

  app.get("/api/alerts", async (_request, response) => {
    response.json(await service.getAlerts());
  });

  app.get("/api/solar-activity", async (_request, response) => {
    response.json(await service.getSolarActivity());
  });

  app.get("/api/source-health", async (_request, response) => {
    response.json(await service.getSourceHealth());
  });

  app.get("/api/events", async (request, response) => {
    response.json(await service.getEvents(normalizeEventQuery(request.query)));
  });

  app.get("/api/ionosphere/glotec", async (_request, response) => {
    response.json(await service.getGloTec());
  });

  app.use("/api", (request, response) => {
    response.status(404).json({ error: "Not found", route: request.originalUrl });
  });

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    response.status(503).json({
      error: "Space weather source unavailable",
      message: error instanceof Error ? error.message : "Unknown source failure"
    });
  });

  return app;
}
