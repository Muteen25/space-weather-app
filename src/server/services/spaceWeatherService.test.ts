import { createLiveSpaceWeatherService } from "./spaceWeatherService";

describe("space weather service event resilience", () => {
  it("uses the displayed dashboard timestamp for summary freshness", async () => {
    const now = new Date().toISOString();
    const stale = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString();
    const client = {
      getSolarWind: vi.fn(async () => [{ timestamp: now, speedKmPerSec: 438, densityPerCc: 5, temperatureK: 100000, bzNt: 0.5, btNt: 4 }]),
      getKp: vi.fn(async () => [{ timestamp: stale, value: 1.3 }]),
      getScales: vi.fn(async () => ({
        current: { timestamp: stale, gScale: "G0", rScale: "R0", sScale: "S0" },
        forecast: []
      })),
      getAlerts: vi.fn(async () => []),
      getSourceHealth: vi.fn(() => [])
    };
    const service = createLiveSpaceWeatherService(client as never, {
      getEvents: vi.fn(),
      getSourceHealth: vi.fn(() => [])
    } as never);

    await expect(service.getDashboardSummary()).resolves.toMatchObject({
      lastUpdated: now,
      freshness: "fresh"
    });
  });

  it("returns stale past solar wind and Kp series when NOAA products are unavailable", async () => {
    const failingClient = {
      getSolarWind: vi.fn(async () => {
        throw new Error("NOAA SWPC returned an empty JSON response");
      }),
      getMagneticField: vi.fn(async () => {
        throw new Error("NOAA SWPC returned an empty JSON response");
      }),
      getKp: vi.fn(async () => {
        throw new Error("NOAA SWPC returned an empty JSON response");
      }),
      getScales: vi.fn(),
      getAlerts: vi.fn(),
      getSourceHealth: vi.fn(() => [])
    };
    const service = createLiveSpaceWeatherService(failingClient as never, {
      getEvents: vi.fn(),
      getSourceHealth: vi.fn(() => [])
    } as never);

    await expect(service.getSolarWind("6h")).resolves.toMatchObject({
      source: "NOAA_SWPC",
      freshness: "stale",
      data: expect.arrayContaining([
        expect.objectContaining({
          timestamp: expect.any(String),
          speedKmPerSec: expect.any(Number),
          densityPerCc: expect.any(Number)
        })
      ])
    });
    await expect(service.getMagneticField("6h")).resolves.toMatchObject({
      source: "NOAA_SWPC",
      freshness: "stale",
      data: expect.arrayContaining([
        expect.objectContaining({
          timestamp: expect.any(String),
          bzGsmNt: expect.any(Number),
          btNt: expect.any(Number)
        })
      ])
    });
    await expect(service.getKp()).resolves.toMatchObject({
      source: "NOAA_SWPC",
      freshness: "stale",
      current: expect.any(Number),
      data: expect.arrayContaining([
        expect.objectContaining({
          timestamp: expect.any(String),
          value: expect.any(Number)
        })
      ])
    });
  });

  it("returns an unavailable DONKI event timeline instead of throwing on source rate limits", async () => {
    const service = createLiveSpaceWeatherService({} as never, {
      getEvents: vi.fn(async () => {
        throw new Error("NASA DONKI request failed: 429");
      }),
      getSourceHealth: vi.fn(() => [])
    } as never);

    await expect(
      service.getEvents({
        type: "cme",
        startDate: "2026-05-01",
        endDate: "2026-05-14",
        limit: 5
      })
    ).resolves.toMatchObject({
      source: "NASA_DONKI",
      lastUpdated: null,
      freshness: "unavailable",
      query: {
        type: "cme",
        startDate: "2026-05-01",
        endDate: "2026-05-14",
        limit: 5
      },
      events: [],
      errorMessage: "NASA DONKI request failed: 429"
    });
  });
});
