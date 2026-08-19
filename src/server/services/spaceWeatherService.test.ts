import { createLiveSpaceWeatherService } from "./spaceWeatherService";

describe("space weather service event resilience", () => {
  it("loads the 7-day GOES X-ray product before shorter fallback products", async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = input.toString();

      if (url.includes("xrays-7-day.json")) {
        return new Response(JSON.stringify([
          { time_tag: "2026-08-12T10:00:00Z", satellite: 18, flux: 1e-7, energy: "0.1-0.8nm" },
          { time_tag: "2026-08-19T10:00:00Z", satellite: 18, flux: 9.8e-7, energy: "0.1-0.8nm" }
        ]), { status: 200 });
      }

      if (url.includes("latest_1024_0171.jpg")) {
        return new Response(null, { status: 200, headers: { "last-modified": "Wed, 19 Aug 2026 10:00:00 GMT" } });
      }

      return new Response("[]", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const service = createLiveSpaceWeatherService({} as never, {
      getEvents: vi.fn(),
      getSourceHealth: vi.fn(() => [])
    } as never);

    const activity = await service.getSolarActivity();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json",
      { headers: { Accept: "application/json" } }
    );
    expect(activity.xray.lastUpdated).toBe("2026-08-19T10:00:00Z");
    expect(activity.xray.data[0]?.timestamp).toBe("2026-08-12T10:00:00Z");
  });

  it("uses the Kp-derived G scale when current Kp reaches storm level", async () => {
    const now = new Date().toISOString();
    const client = {
      getSolarWind: vi.fn(async () => [{ timestamp: now, speedKmPerSec: 438, densityPerCc: 5, temperatureK: 100000, bzNt: 0.5, btNt: 4 }]),
      getKp: vi.fn(async () => [{ timestamp: now, value: 5 }]),
      getScales: vi.fn(async () => ({
        current: { timestamp: now, gScale: "G0", rScale: "R0", sScale: "S0" },
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
      kp: 5,
      gScale: "G1",
      mainCause: "Kp 5.0 indicates minor storm conditions"
    });
  });

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
