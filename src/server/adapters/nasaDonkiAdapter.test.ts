import {
  NasaDonkiClient,
  normalizeEventQuery,
  parseCmeProduct,
  parseFlareProduct,
  parseGstProduct,
  parseSepProduct,
  resolveCcmcDonkiEndpoint,
  resolveDonkiEndpoint
} from "./nasaDonkiAdapter";

describe("NASA DONKI adapter parsers", () => {
  it("normalizes CME analysis details, Earth impact hints, and linked flare events", () => {
    const result = parseCmeProduct([
      {
        activityID: "2026-05-12T11:12:00-CME-001",
        startTime: "2026-05-12T11:12Z",
        instruments: [{ displayName: "SOHO: LASCO/C2" }, { displayName: "STEREO A: COR2" }],
        sourceLocation: "N12E44",
        activeRegionNum: 13664,
        link: "https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/CME/123",
        cmeAnalyses: [
          {
            isMostAccurate: false,
            speed: 620,
            halfAngle: 28,
            enlilList: []
          },
          {
            isMostAccurate: true,
            speed: 1200,
            halfAngle: 44,
            enlilList: [
              {
                estimatedShockArrivalTime: "2026-05-14T06:00Z",
                isEarthGB: true,
                isEarthMinorImpact: false,
                kp_90: 6,
                kp_135: 5,
                kp_180: 4
              }
            ]
          }
        ],
        linkedEvents: [{ activityID: "2026-05-12T10:58:00-FLR-001" }]
      }
    ]);

    expect(result).toEqual([
      expect.objectContaining({
        id: "2026-05-12T11:12:00-CME-001",
        type: "cme",
        timestamp: "2026-05-12T11:12:00.000Z",
        source: "NASA_DONKI",
        severity: "high",
        sourceLocation: "N12E44",
        activeRegionNum: 13664,
        speedKmPerSec: 1200,
        halfAngleDeg: 44,
        estimatedShockArrivalTime: "2026-05-14T06:00:00.000Z",
        earthDirected: true,
        associatedEventIds: ["2026-05-12T10:58:00-FLR-001"],
        instruments: ["SOHO: LASCO/C2", "STEREO A: COR2"]
      })
    ]);
    expect(result[0].summary).toContain("1200 km/s");
    expect(result[0].summary).toContain("Earth-directed");
  });

  it("normalizes flare, geomagnetic storm, and SEP events into one timeline contract", () => {
    const flare = parseFlareProduct([
      {
        flrID: "2026-05-13T02:03:00-FLR-001",
        beginTime: "2026-05-13T02:03Z",
        peakTime: "2026-05-13T02:17Z",
        endTime: "2026-05-13T02:29Z",
        classType: "X1.7",
        sourceLocation: "S10W20",
        activeRegionNum: 13665,
        instruments: [{ displayName: "GOES-18: EXIS 1.0-8.0" }]
      }
    ]);
    const gst = parseGstProduct({
      gstID: "2026-05-14T03:00:00-GST-001",
      startTime: "2026-05-14T03:00Z",
      allKpIndex: [{ observedTime: "2026-05-14T03:00Z", kpIndex: 6, source: "NOAA" }]
    });
    const sep = parseSepProduct([
      {
        sepID: "2026-05-11T09:30:00-SEP-001",
        eventTime: "2026-05-11T09:30Z",
        instruments: [{ displayName: "GOES-16: SEISS" }],
        linkedEvents: [{ activityID: "2026-05-11T07:42:00-FLR-001" }]
      }
    ]);

    expect(flare[0]).toMatchObject({
      id: "2026-05-13T02:03:00-FLR-001",
      type: "flare",
      timestamp: "2026-05-13T02:17:00.000Z",
      severity: "high",
      flareClass: "X1.7",
      sourceLocation: "S10W20"
    });
    expect(gst[0]).toMatchObject({
      id: "2026-05-14T03:00:00-GST-001",
      type: "gst",
      timestamp: "2026-05-14T03:00:00.000Z",
      severity: "high",
      kpIndex: 6
    });
    expect(sep[0]).toMatchObject({
      id: "2026-05-11T09:30:00-SEP-001",
      type: "sep",
      timestamp: "2026-05-11T09:30:00.000Z",
      source: "NASA_DONKI",
      severity: "moderate",
      associatedEventIds: ["2026-05-11T07:42:00-FLR-001"]
    });
  });

  it("builds official DONKI endpoints with date range and API key", () => {
    expect(resolveDonkiEndpoint("cme", "2026-05-01", "2026-05-14", "NASA_KEY")).toBe(
      "/CME?startDate=2026-05-01&endDate=2026-05-14&api_key=NASA_KEY"
    );
    expect(resolveDonkiEndpoint("flare", "2026-05-01", "2026-05-14", "DEMO_KEY")).toBe(
      "/FLR?startDate=2026-05-01&endDate=2026-05-14&api_key=DEMO_KEY"
    );
    expect(resolveCcmcDonkiEndpoint("flare", "2026-05-01", "2026-05-14")).toBe(
      "/WS/get/FLR?startDate=2026-05-01&endDate=2026-05-14"
    );
  });

  it("fetches, merges, sorts, and limits DONKI timeline events", async () => {
    const fetchedPaths: string[] = [];
    const client = new NasaDonkiClient({
      apiKey: "TEST_KEY",
      fetchJson: async <T>(path: string): Promise<T> => {
        fetchedPaths.push(path);
        if (path.startsWith("/CME")) {
          return [
            {
              activityID: "2026-05-12T11:12:00-CME-001",
              startTime: "2026-05-12T11:12Z",
              cmeAnalyses: [{ isMostAccurate: true, speed: 800, halfAngle: 22, enlilList: [] }]
            }
          ] as T;
        }
        if (path.startsWith("/FLR")) {
          return [
            {
              flrID: "2026-05-13T02:03:00-FLR-001",
              beginTime: "2026-05-13T02:03Z",
              peakTime: "2026-05-13T02:17Z",
              classType: "M2.4"
            }
          ] as T;
        }
        return [] as T;
      }
    });

    const events = await client.getEvents({
      type: "all",
      startDate: "2026-05-01",
      endDate: "2026-05-14",
      limit: 1
    });

    expect(fetchedPaths).toEqual([
      "/CME?startDate=2026-05-01&endDate=2026-05-14&api_key=TEST_KEY",
      "/FLR?startDate=2026-05-01&endDate=2026-05-14&api_key=TEST_KEY",
      "/GST?startDate=2026-05-01&endDate=2026-05-14&api_key=TEST_KEY",
      "/SEP?startDate=2026-05-01&endDate=2026-05-14&api_key=TEST_KEY"
    ]);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ id: "2026-05-13T02:03:00-FLR-001", type: "flare" });
  });

  it("normalizes event API query parameters with safe limits and default dates", () => {
    const result = normalizeEventQuery({
      type: "cme",
      startDate: "2026-04-14",
      endDate: "2026-05-14",
      limit: "1000"
    });

    expect(result).toEqual({
      type: "cme",
      startDate: "2026-04-14",
      endDate: "2026-05-14",
      limit: 50
    });
  });
});
