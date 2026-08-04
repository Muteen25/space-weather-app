import request from "supertest";
import { createApp } from "./app";
import type { SpaceWeatherService } from "./services/spaceWeatherService";

describe("public API phase 2 dashboard", () => {
  const service = {
    getDashboardSummary: vi.fn(async () => ({
      condition: "Active",
      overallSeverity: "moderate",
      mainCause: "Kp 4.7 indicates active conditions",
      lastUpdated: "2026-05-14T07:00:00.000Z",
      kp: 4.67,
      gScale: "G0",
      rScale: "R1",
      sScale: "S0",
      solarWindSpeed: 548,
      bz: -5.4,
      latestFlare: null,
      activeAlerts: 2,
      source: "NOAA_SWPC",
      freshness: "fresh"
    })),
    getImpactSummary: vi.fn(async () => ({
      lastUpdated: "2026-05-14T07:00:00.000Z",
      source: "INTERNAL_RULES",
      impacts: [
        { sector: "Satellites", level: "moderate", reason: "Elevated activity.", relatedParameter: "G0" },
        { sector: "GNSS and navigation", level: "moderate", reason: "Active Kp.", relatedParameter: "Kp 4.67" },
        { sector: "HF radio communication", level: "moderate", reason: "Minor R-scale.", relatedParameter: "R1" },
        { sector: "Aviation", level: "low", reason: "No S-scale.", relatedParameter: "S0" },
        { sector: "Power grids", level: "low", reason: "No G-scale storm.", relatedParameter: "G0" },
        { sector: "Aurora visibility", level: "moderate", reason: "Active Kp.", relatedParameter: "Kp 4.67" },
        {
          sector: "Human spaceflight radiation awareness",
          level: "low",
          reason: "No S-scale.",
          relatedParameter: "S0"
        }
      ]
    })),
    getSolarWind: vi.fn(async (range) => ({
      range,
      source: "NOAA_SWPC",
      lastUpdated: "2026-05-14T07:00:00.000Z",
      freshness: "fresh",
      data: [
        {
          timestamp: "2026-05-14T07:00:00.000Z",
          speedKmPerSec: 548,
          densityPerCc: 5.9,
          temperatureK: 133000,
          bzNt: -5.4,
          btNt: 8.7
        }
      ]
    })),
    getMagneticField: vi.fn(async (range) => ({
      range,
      source: "NOAA_SWPC",
      lastUpdated: "2026-05-14T07:00:00.000Z",
      freshness: "fresh",
      data: [
        {
          timestamp: "2026-05-14T07:00:00.000Z",
          bxGsmNt: -0.3,
          byGsmNt: 6.87,
          bzGsmNt: -5.4,
          btNt: 8.7
        }
      ]
    })),
    getKp: vi.fn(async () => ({
      source: "NOAA_SWPC",
      lastUpdated: "2026-05-14T06:00:00.000Z",
      current: 4.67,
      gScale: "G0",
      freshness: "fresh",
      data: [{ timestamp: "2026-05-14T06:00:00.000Z", value: 4.67 }]
    })),
    getScales: vi.fn(async () => ({
      source: "NOAA_SWPC",
      lastUpdated: "2026-05-14T07:00:00.000Z",
      current: { gScale: "G0", rScale: "R1", sScale: "S0" },
      forecast: [],
      freshness: "fresh"
    })),
    getAlerts: vi.fn(async () => ({
      source: "NOAA_SWPC",
      lastUpdated: "2026-05-14T07:00:00.000Z",
      freshness: "fresh",
      alerts: []
    })),
    getSolarActivity: vi.fn(async () => ({
      source: "NOAA_SWPC",
      lastUpdated: "2026-05-14T07:00:00.000Z",
      freshness: "fresh",
      xray: {
        source: "NOAA_SWPC_GOES_XRAY",
        lastUpdated: "2026-05-14T07:00:00.000Z",
        freshness: "fresh",
        currentClass: "M2.4",
        currentFluxWm2: 0.000024,
        primarySatellite: 18,
        data: [
          { timestamp: "2026-05-14T06:58:00.000Z", fluxWm2: 0.000018, flareClass: "M1.8", energy: "0.1-0.8nm" },
          { timestamp: "2026-05-14T06:59:00.000Z", fluxWm2: 0.000024, flareClass: "M2.4", energy: "0.1-0.8nm" }
        ]
      },
      regions: { source: "NOAA_SWPC_SOLAR_REGIONS", lastUpdated: "2026-05-14T07:00:00.000Z", freshness: "fresh", data: [] },
      images: {
        source: "NASA_SDO",
        freshness: "fresh",
        images: [
          { id: "sdo-171", label: "AIA 171", wavelength: "171 angstrom", url: "https://example.test/171.jpg", lastModified: "2026-05-14T07:00:00.000Z" }
        ]
      }
    })),
    getSourceHealth: vi.fn(async () => ({
      sources: [
        {
          sourceName: "NOAA_SWPC_SOLAR_WIND",
          status: "healthy",
          lastSuccessAt: "2026-05-14T07:00:00.000Z",
          latencyMs: 80,
          recordsFetched: 1
        }
      ]
    })),
    getEvents: vi.fn(async () => ({
      source: "NASA_DONKI",
      lastUpdated: "2026-05-14T06:00:00.000Z",
      freshness: "fresh",
      query: { type: "cme", startDate: "2026-05-01", endDate: "2026-05-14", limit: 5 },
      events: [
        {
          id: "2026-05-12T11:12:00-CME-001",
          type: "cme",
          timestamp: "2026-05-12T11:12:00.000Z",
          source: "NASA_DONKI",
          title: "CME from N12E44",
          summary: "Earth-directed CME at 1200 km/s from N12E44.",
          severity: "high"
        }
      ]
    })),
    getGloTec: vi.fn(async () => ({
      source: "NOAA_SWPC_GLOTEC",
      lastUpdated: "2026-05-14T07:00:00.000Z",
      freshness: "fresh",
      productUrl: "https://services.swpc.noaa.gov/products/glotec",
      summary: {
        pointCount: 2,
        meanTec: 31.5,
        maxTec: 62.7,
        maxAnomaly: 7.7,
        observedCoveragePercent: 100
      },
      points: [
        {
          latitude: 18.8,
          longitude: 67.5,
          tec: 62.7,
          anomaly: 7.7,
          hmF2Km: 355,
          nmF2: null,
          qualityFlag: 0
        },
        {
          latitude: 0,
          longitude: 90,
          tec: 0.3,
          anomaly: null,
          hmF2Km: null,
          nmF2: null,
          qualityFlag: 0
        }
      ]
    }))
  };
  const app = createApp({ service: service as unknown as SpaceWeatherService });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects the API root to the local frontend during development", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("http://127.0.0.1:5173");
  });

  it("returns a dashboard summary with live NOAA source identity and timestamp", async () => {
    const response = await request(app).get("/api/dashboard/summary");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      condition: expect.any(String),
      overallSeverity: expect.any(String),
      kp: expect.any(Number),
      gScale: expect.stringMatching(/^G[0-5]$/),
      rScale: expect.stringMatching(/^R[0-5]$/),
      sScale: expect.stringMatching(/^S[0-5]$/),
      source: "NOAA_SWPC",
      freshness: "fresh"
    });
    expect(Date.parse(response.body.lastUpdated)).not.toBeNaN();
  });

  it("returns range-aware solar wind data and uses the requested NOAA product range", async () => {
    const response = await request(app).get("/api/solar-wind?range=2h");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ range: "2h", source: "NOAA_SWPC", freshness: "fresh" });
    expect(service.getSolarWind).toHaveBeenCalledWith("2h");
  });

  it("returns magnetic field telemetry for IMF Bz and Bt charting", async () => {
    const response = await request(app).get("/api/magnetic-field?range=6h");

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toEqual(expect.objectContaining({ bzGsmNt: -5.4, btNt: 8.7 }));
  });

  it("returns Kp chart data with current G-scale interpretation", async () => {
    const response = await request(app).get("/api/kp");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ current: 4.67, gScale: "G0", source: "NOAA_SWPC" });
  });

  it("returns NOAA space weather scale cards", async () => {
    const response = await request(app).get("/api/scales");

    expect(response.status).toBe(200);
    expect(response.body.current).toEqual({ gScale: "G0", rScale: "R1", sScale: "S0" });
  });

  it("returns solar activity data for x-ray, sunspot, and imagery panels", async () => {
    const response = await request(app).get("/api/solar-activity");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      source: "NOAA_SWPC",
      xray: {
        source: "NOAA_SWPC_GOES_XRAY",
        currentClass: "M2.4",
        primarySatellite: 18
      },
      images: {
        source: "NASA_SDO",
        images: [expect.objectContaining({ id: "sdo-171", label: "AIA 171" })]
      }
    });
    expect(service.getSolarActivity).toHaveBeenCalledOnce();
  });

  it("returns source health for data freshness indicators", async () => {
    const response = await request(app).get("/api/source-health");

    expect(response.status).toBe(200);
    expect(response.body.sources[0]).toMatchObject({
      sourceName: "NOAA_SWPC_SOLAR_WIND",
      status: "healthy"
    });
  });

  it("returns sector-wise impact summaries with traceable contributing factors", async () => {
    const response = await request(app).get("/api/impact-summary");

    expect(response.status).toBe(200);
    expect(response.body.impacts).toHaveLength(7);
    expect(response.body.impacts[0]).toEqual(
      expect.objectContaining({
        sector: expect.any(String),
        level: expect.stringMatching(/^(low|moderate|high|severe)$/),
        reason: expect.any(String),
        relatedParameter: expect.any(String)
      })
    );
  });

  it("returns NASA DONKI event timeline data with normalized filters", async () => {
    const response = await request(app).get("/api/events?type=cme&startDate=2026-05-01&endDate=2026-05-14&limit=5");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      source: "NASA_DONKI",
      events: [
        expect.objectContaining({
          id: "2026-05-12T11:12:00-CME-001",
          type: "cme",
          severity: "high"
        })
      ]
    });
    expect(service.getEvents).toHaveBeenCalledWith({
      type: "cme",
      startDate: "2026-05-01",
      endDate: "2026-05-14",
      limit: 5
    });
  });

  it("returns GloTEC ionosphere grid data for the TEC globe", async () => {
    const response = await request(app).get("/api/ionosphere/glotec");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      source: "NOAA_SWPC_GLOTEC",
      summary: {
        pointCount: 2,
        meanTec: 31.5,
        maxTec: 62.7
      }
    });
    expect(response.body.points[0]).toEqual(expect.objectContaining({
      latitude: 18.8,
      longitude: 67.5,
      tec: 62.7
    }));
    expect(service.getGloTec).toHaveBeenCalledOnce();
  });

  it("returns a 404 JSON error for unknown API routes", async () => {
    const response = await request(app).get("/api/not-real");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Not found", route: "/api/not-real" });
  });
});
