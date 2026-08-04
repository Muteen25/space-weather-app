import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";

const API_BASE_URL = "https://space-weather-app-production-48ab.up.railway.app";
const apiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

const dashboardResponse = {
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
};

const impactResponse = {
  lastUpdated: "2026-05-14T07:00:00.000Z",
  source: "INTERNAL_RULES",
  impacts: [
    {
      sector: "Satellites",
      level: "moderate",
      reason: "Activity is elevated above quiet background levels.",
      relatedParameter: "G0, Earth-directed CME yes"
    },
    {
      sector: "GNSS and navigation",
      level: "moderate",
      reason: "Active geomagnetic or radio conditions may affect some precision use cases.",
      relatedParameter: "Kp 4.67, Bz -5.4 nT"
    }
  ]
};

const solarWindResponse = {
  range: "6h",
  source: "NOAA_SWPC",
  lastUpdated: "2026-05-14T07:00:00.000Z",
  freshness: "fresh",
  data: [
    {
      timestamp: "2026-05-14T06:00:00.000Z",
      speedKmPerSec: 520,
      densityPerCc: 7.1,
      temperatureK: 148000,
      bzNt: -6.2,
      btNt: 9.4
    },
    {
      timestamp: "2026-05-14T07:00:00.000Z",
      speedKmPerSec: 548,
      densityPerCc: 5.9,
      temperatureK: 133000,
      bzNt: -5.4,
      btNt: 8.7
    }
  ]
};

const magneticFieldResponse = {
  range: "6h",
  source: "NOAA_SWPC",
  lastUpdated: "2026-05-14T07:00:00.000Z",
  freshness: "fresh",
  data: [
    {
      timestamp: "2026-05-14T06:00:00.000Z",
      bxGsmNt: -0.4,
      byGsmNt: 6.77,
      bzGsmNt: -6.2,
      btNt: 9.4
    },
    {
      timestamp: "2026-05-14T07:00:00.000Z",
      bxGsmNt: -0.3,
      byGsmNt: 6.87,
      bzGsmNt: -5.4,
      btNt: 8.7
    }
  ]
};

const kpResponse = {
  source: "NOAA_SWPC",
  lastUpdated: "2026-05-14T06:00:00.000Z",
  current: 4.67,
  gScale: "G0",
  freshness: "fresh",
  data: [
    { timestamp: "2026-05-14T00:00:00.000Z", value: 3.33 },
    { timestamp: "2026-05-14T03:00:00.000Z", value: 4 },
    { timestamp: "2026-05-14T06:00:00.000Z", value: 4.67 }
  ]
};

const scalesResponse = {
  source: "NOAA_SWPC",
  lastUpdated: "2026-05-14T07:00:00.000Z",
  freshness: "fresh",
  current: { gScale: "G0", rScale: "R1", sScale: "S0" },
  forecast: []
};

const sourceHealthResponse = {
  sources: [
    {
      sourceName: "NOAA_SWPC_SOLAR_WIND",
      status: "healthy",
      lastSuccessAt: "2026-05-14T07:00:00.000Z",
      latencyMs: 80,
      recordsFetched: 2
    }
  ]
};

const alertsResponse = {
  source: "NOAA_SWPC",
  lastUpdated: "2026-05-14T07:00:00.000Z",
  freshness: "fresh",
  alerts: [
    {
      id: "noaa-sample-r1",
      title: "Minor radio blackout conditions observed",
      status: "active",
      scale: "R1",
      issuedAt: "2026-05-14T06:35:00.000Z",
      validUntil: "2026-05-14T12:00:00.000Z",
      affectedSystems: ["HF radio communication"],
      summary: "An M-class flare produced a minor sunlit-side HF radio awareness condition."
    }
  ]
};

const eventsResponse = {
  source: "NASA_DONKI",
  lastUpdated: "2026-05-14T06:00:00.000Z",
  freshness: "fresh",
  query: { type: "all", startDate: "2026-04-14", endDate: "2026-05-14", limit: 8 },
  events: [
    {
      id: "2026-05-12T11:12:00-CME-001",
      type: "cme",
      timestamp: "2026-05-12T11:12:00.000Z",
      source: "NASA_DONKI",
      title: "Earth-directed CME watch",
      summary: "Earth-directed CME at 1200 km/s from N12E44.",
      severity: "high",
      sourceLocation: "N12E44",
      activeRegionNum: 13664,
      speedKmPerSec: 1200,
      halfAngleDeg: 44,
      estimatedShockArrivalTime: "2026-05-14T06:00:00.000Z",
      earthDirected: true,
      associatedEventIds: ["2026-05-12T10:58:00-FLR-001"],
      instruments: ["SOHO: LASCO/C2"]
    },
    {
      id: "2026-05-13T02:03:00-FLR-001",
      type: "flare",
      timestamp: "2026-05-13T02:17:00.000Z",
      source: "NASA_DONKI",
      title: "Solar flare M2.4",
      summary: "M2.4 flare from S10W20 reported by DONKI.",
      severity: "moderate",
      sourceLocation: "S10W20",
      activeRegionNum: 13665,
      flareClass: "M2.4",
      associatedEventIds: [],
      instruments: ["GOES-18: EXIS"]
    }
  ]
};

const solarActivityResponse = {
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
      { timestamp: "2026-05-14T06:59:00.000Z", fluxWm2: 0.000024, flareClass: "M2.4", energy: "0.1-0.8nm" },
      { timestamp: "2026-05-14T06:58:00.000Z", fluxWm2: 0.000004, flareClass: "C4.0", energy: "0.05-0.4nm" },
      { timestamp: "2026-05-14T06:59:00.000Z", fluxWm2: 0.000005, flareClass: "C5.0", energy: "0.05-0.4nm" }
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
};

const glotecResponse = {
  source: "NOAA_SWPC_GLOTEC",
  lastUpdated: "2026-05-14T07:00:00.000Z",
  freshness: "fresh",
  productUrl: "https://example.test/glotec.json",
  summary: {
    pointCount: 4,
    meanTec: 18.8,
    maxTec: 62.7,
    maxAnomaly: 7.7,
    observedCoveragePercent: 75
  },
  points: [
    { latitude: 18.8, longitude: 67.5, tec: 62.7, anomaly: 7.7, hmF2Km: 355, nmF2: null, qualityFlag: 0 },
    { latitude: 18.8, longitude: 62.5, tec: 62.3, anomaly: 7.2, hmF2Km: 357, nmF2: null, qualityFlag: 0 },
    { latitude: 18.8, longitude: 72.5, tec: 61.8, anomaly: 7.0, hmF2Km: 356, nmF2: null, qualityFlag: 0 },
    { latitude: 0, longitude: 90, tec: 18.8, anomaly: 1.2, hmF2Km: 320, nmF2: null, qualityFlag: 1 }
  ]
};

const unavailableEventsResponse = {
  source: "NASA_DONKI",
  lastUpdated: null,
  freshness: "unavailable",
  query: { type: "all", startDate: "2026-04-14", endDate: "2026-05-14", limit: 8 },
  events: [],
  errorMessage: "NASA DONKI request failed: 429"
};

const staleSolarWindResponse = {
  range: "6h",
  source: "NOAA_SWPC",
  lastUpdated: "2026-05-14T04:00:00.000Z",
  freshness: "stale",
  data: [
    {
      timestamp: "2026-05-14T03:00:00.000Z",
      speedKmPerSec: 360,
      densityPerCc: 3.4,
      temperatureK: 28000,
      bzNt: -0.8,
      btNt: 5.2
    },
    {
      timestamp: "2026-05-14T04:00:00.000Z",
      speedKmPerSec: 372,
      densityPerCc: 3.1,
      temperatureK: 30000,
      bzNt: -1.1,
      btNt: 5.6
    }
  ]
};

const staleKpResponse = {
  source: "NOAA_SWPC",
  lastUpdated: "2026-05-14T03:00:00.000Z",
  current: 2,
  gScale: "G0",
  freshness: "stale",
  data: [
    { timestamp: "2026-05-14T00:00:00.000Z", value: 1.33 },
    { timestamp: "2026-05-14T03:00:00.000Z", value: 2 }
  ]
};

describe("Space Weather dashboard", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/observatory");
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = input.toString();
        const payload = url.includes("impact-summary")
          ? impactResponse
          : url.includes("ionosphere/glotec")
            ? glotecResponse
          : url.includes("solar-wind")
            ? solarWindResponse
            : url.includes("magnetic-field")
              ? magneticFieldResponse
              : url.includes("kp")
                ? kpResponse
                : url.includes("scales")
                  ? scalesResponse
          : url.includes("source-health")
            ? sourceHealthResponse
            : url.includes("solar-activity")
              ? solarActivityResponse
              : url.includes("events")
                ? eventsResponse
                : url.includes("alerts")
                  ? alertsResponse
                  : dashboardResponse;

        return Promise.resolve(new Response(JSON.stringify(payload), { status: 200 }));
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.pushState({}, "", "/");
  });

  it("opens with the Space Weather Observatory landing page and starts live data loading", async () => {
    window.history.pushState({}, "", "/");

    render(<App />);

    expect(screen.getByRole("heading", { name: "Space Weather Observatory" })).toBeInTheDocument();
    expect(screen.getByText("GNSS Research Lab")).toBeInTheDocument();
    expect(screen.getByText("Real-time space environment monitoring")).toBeInTheDocument();
    expect(screen.getByLabelText("Space Weather Observatory landing hero").getAttribute("style")).toContain("/landing/hero-space-weather.png");
    expect(screen.getByRole("link", { name: "Live Dashboard" })).toHaveAttribute("href", "/observatory");
    expect(screen.queryByRole("link", { name: "View Phenomena" })).not.toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Space weather phenomena" })).toBeInTheDocument();
    expect(screen.queryByText("Loading live space weather snapshot")).not.toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(apiUrl("/api/dashboard/summary")));
  });

  it("renders the phase 2 dashboard sections from live-source API data", async () => {
    render(<App />);

    expect(screen.getByText("Loading live space weather snapshot")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Space Weather Observatory" })).toBeInTheDocument();
    });

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Kp 4.7")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Current space weather conditions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "GOES X-ray flux" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kp index trend" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Upstream plasma trend" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Observatory layers" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Solar Wind & IMF").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Geomagnetic Field").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ionosphere").length).toBeGreaterThan(0);
    expect(screen.getByRole("img", { name: "Overview solar wind speed and density chart" })).toBeInTheDocument();
    expect(screen.queryByText("Solar wind")).not.toBeInTheDocument();
    expect(screen.queryByText("Event timeline")).not.toBeInTheDocument();
    expect(screen.queryByText(/SAMPLE|prototype feed/i)).not.toBeInTheDocument();
  });

  it("renders the Ant Design app shell with navigation and theme toggle", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Space Weather Observatory" })).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Mission navigation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));

    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
  });

  it("renders the notebook side panel taxonomy from the sketch", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Space Weather Observatory" })).toBeInTheDocument();
    });

    expect(screen.getByRole("menuitem", { name: "Sun" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Solar Wind & IMF" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Geomagnetic Field" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Ionosphere" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "System" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Radio" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Outlook" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Reference" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Sun Overview" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Solar Wind Overview" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Ionosphere Overview" })).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "X-ray Flux" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Solar Flares" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Solar Wind Plasma" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "IMF Bz + Bt" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Ionosphere & TEC" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "References" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Contributors" })).toBeInTheDocument();
  });

  it("allows layer sidebar groups to collapse and expand", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Space Weather Observatory" })).toBeInTheDocument();
    });

    const navigation = within(screen.getByLabelText("Mission navigation"));

    fireEvent.click(navigation.getByRole("menuitem", { name: "Sun" }));
    expect(navigation.queryByRole("menuitem", { name: "X-ray Flux" })).not.toBeInTheDocument();

    fireEvent.click(navigation.getByRole("menuitem", { name: "Sun" }));
    expect(navigation.getByRole("menuitem", { name: "X-ray Flux" })).toBeInTheDocument();
  }, 12000);

  it("opens combined layer pages from the main sidebar tabs", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Space Weather Observatory" })).toBeInTheDocument();
    });

    const navigation = within(screen.getByLabelText("Mission navigation"));

    fireEvent.click(navigation.getByText("Sun"));
    expect(screen.getByRole("heading", { name: "SUN" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sun" })).toBeInTheDocument();
    expect(screen.getByText("Current X-ray class")).toBeInTheDocument();
    expect(screen.getAllByText("M2.4").length).toBeGreaterThan(0);
    expect(screen.getByText("GOES Latest X-Ray Event 1-8A")).toBeInTheDocument();
    expect(screen.getByText("GOES X-ray flux plot")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "GOES X-ray flux plot for 1-8 A and 0.5-4 A channels" })).toBeInTheDocument();
    expect(screen.getAllByText("Solar flare M2.4").length).toBeGreaterThan(0);
    expect(screen.getByText("Region records")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recent Sun views" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /HMI Intensity/i })).toHaveAttribute("href", "https://sdo.gsfc.nasa.gov/data/");

    fireEvent.click(navigation.getByText("Solar Wind & IMF"));
    expect(screen.getByRole("heading", { name: "SOLAR WIND & IMF" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Solar Wind & IMF" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Solar wind" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Magnetic field" })).toBeInTheDocument();

    fireEvent.click(navigation.getByText("Ionosphere"));
    expect(screen.getByRole("heading", { name: "IONOSPHERE" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ionosphere" })).toBeInTheDocument();
    expect(screen.getByText("TEC on globe")).toBeInTheDocument();
    expect(screen.getByText("Active geomagnetic or radio conditions may affect some precision use cases.")).toBeInTheDocument();

    fireEvent.click(navigation.getByText("Sun"));
    fireEvent.click(screen.getByRole("menuitem", { name: "X-ray Flux" }));
    expect(screen.getByRole("heading", { name: "X-ray Flux" })).toBeInTheDocument();
    expect(screen.getByText("This tab is limited to GOES X-ray flux, while flare events stay under Solar Flares.")).toBeInTheDocument();
  }, 20000);

  it("opens an interactive chart popup for solar wind details", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Space Weather Observatory" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("menuitem", { name: "Solar Wind Plasma" }));
    fireEvent.click(screen.getByRole("button", { name: "Inspect solar wind chart" }));

    expect(screen.getByText("Solar wind chart details")).toBeInTheDocument();
    expect(screen.getByText("Latest speed")).toBeInTheDocument();
    expect(screen.getAllByText("548 km/s").length).toBeGreaterThan(0);
  });

  it("requests a new NOAA range when a chart range button is clicked", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Space Weather Observatory" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "2h" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(apiUrl("/api/solar-wind?range=2h"));
      expect(fetch).toHaveBeenCalledWith(apiUrl("/api/magnetic-field?range=2h"));
    });
    expect(screen.getByRole("button", { name: "2h" })).toHaveAttribute("aria-pressed", "true");
  });

  it("filters DONKI events and shows CME details in the right card", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Space Weather Observatory" })).toBeInTheDocument();
    });

    fireEvent.click(within(screen.getByLabelText("Mission navigation")).getByText("Sun"));
    fireEvent.click(screen.getByRole("button", { name: /Filter CME events/i }));

    expect(screen.getByRole("heading", { name: "Earth-directed CME watch" })).toBeInTheDocument();
    expect(screen.getByText("CME details")).toBeInTheDocument();
    expect(screen.getByText("CME speed")).toBeInTheDocument();
    expect(screen.getAllByText("1200 km/s").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Half angle").length).toBeGreaterThan(0);
    expect(screen.getAllByText("44 degrees").length).toBeGreaterThan(0);
  }, 12000);

  it("opens references from the System sidebar group", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Space Weather Observatory" })).toBeInTheDocument();
    });

    fireEvent.click(within(screen.getByLabelText("Mission navigation")).getByText("System"));
    expect(screen.getByRole("heading", { name: "SYSTEM" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "System" })).toBeInTheDocument();
    expect(screen.getByText("Source health")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitem", { name: "References" }));
    expect(screen.getByRole("heading", { name: "REFERENCES" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "NOAA G/R/S Scales" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitem", { name: "Contributors" }));
    expect(screen.getByRole("heading", { name: "CONTRIBUTORS" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "Contributors" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Mock design")).toBeInTheDocument();
  }, 12000);

  it("keeps the dashboard visible when DONKI events are temporarily unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = input.toString();
        const payload = url.includes("impact-summary")
          ? impactResponse
          : url.includes("solar-wind")
            ? solarWindResponse
            : url.includes("magnetic-field")
              ? magneticFieldResponse
              : url.includes("kp")
                ? kpResponse
                : url.includes("scales")
                  ? scalesResponse
                  : url.includes("source-health")
                    ? sourceHealthResponse
                    : url.includes("solar-activity")
                      ? solarActivityResponse
                      : url.includes("ionosphere/glotec")
                        ? glotecResponse
                    : url.includes("events")
                      ? unavailableEventsResponse
                      : url.includes("alerts")
                        ? alertsResponse
                        : dashboardResponse;

        return Promise.resolve(new Response(JSON.stringify(payload), { status: 200 }));
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Space Weather Observatory" })).toBeInTheDocument();
    });

    fireEvent.click(within(screen.getByLabelText("Mission navigation")).getByText("System"));
    expect(screen.getByRole("heading", { name: "SYSTEM" })).toBeInTheDocument();
    expect(screen.getByText("Source health")).toBeInTheDocument();
    expect(screen.queryByText("Request failed: 503")).not.toBeInTheDocument();
  });

  it("uses stale past chart data when NOAA live products are unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = input.toString();
        const payload = url.includes("impact-summary")
          ? impactResponse
          : url.includes("solar-wind")
            ? staleSolarWindResponse
            : url.includes("magnetic-field")
              ? { ...magneticFieldResponse, freshness: "stale" }
              : url.includes("kp")
                ? staleKpResponse
                : url.includes("scales")
                  ? scalesResponse
                  : url.includes("source-health")
                    ? sourceHealthResponse
                    : url.includes("solar-activity")
                      ? solarActivityResponse
                      : url.includes("ionosphere/glotec")
                        ? glotecResponse
                        : url.includes("events")
                          ? eventsResponse
                          : url.includes("alerts")
                            ? alertsResponse
                            : { ...dashboardResponse, solarWindSpeed: 372, kp: 2, freshness: "stale" };

        return Promise.resolve(new Response(JSON.stringify(payload), { status: 200 }));
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Space Weather Observatory" })).toBeInTheDocument();
    });

    expect(screen.queryByText("0 of 0 points")).not.toBeInTheDocument();
    expect(screen.queryByText("Live series unavailable")).not.toBeInTheDocument();
    expect(screen.queryByText("Kp series unavailable")).not.toBeInTheDocument();
  });
});
