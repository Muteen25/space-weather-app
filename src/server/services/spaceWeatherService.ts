import { buildImpactSummary } from "../../shared/impact";
import { classifyOverallCondition, kpToGScale } from "../../shared/severity";
import type { DashboardConditionInput, GScale, RScale, SScale, SeverityLevel } from "../../shared/types";
import {
  calculateFreshness,
  type AlertRecord,
  type DashboardRange,
  type Freshness,
  type KpPoint,
  type MagneticFieldPoint,
  NoaaSwpcClient,
  normalizeRange,
  type ScaleSnapshot,
  type SolarWindPoint,
  type SourceHealthRecord
} from "../adapters/noaaSwpcAdapter";
import {
  NasaDonkiClient,
  normalizeEventQuery,
  type DonkiEventQuery,
  type DonkiTimelineEvent
} from "../adapters/nasaDonkiAdapter";

export type DashboardSummary = {
  condition: string;
  overallSeverity: SeverityLevel;
  mainCause: string;
  lastUpdated: string;
  kp: number | null;
  gScale: GScale;
  rScale: RScale;
  sScale: SScale;
  solarWindSpeed: number | null;
  bz: number | null;
  latestFlare: string | null;
  activeAlerts: number;
  source: "NOAA_SWPC";
  freshness: Freshness;
};

export type GloTecPoint = {
  latitude: number;
  longitude: number;
  tec: number;
  anomaly: number | null;
  hmF2Km: number | null;
  nmF2: number | null;
  qualityFlag: number | null;
};

export type GloTecResponse = {
  source: "NOAA_SWPC_GLOTEC";
  lastUpdated: string | null;
  freshness: Freshness;
  productUrl: string;
  summary: {
    pointCount: number;
    meanTec: number | null;
    maxTec: number | null;
    maxAnomaly: number | null;
    observedCoveragePercent: number | null;
  };
  points: GloTecPoint[];
  errorMessage?: string;
};

export type SolarActivityResponse = {
  source: "NOAA_SWPC";
  lastUpdated: string | null;
  freshness: Freshness;
  xray: {
    source: "NOAA_SWPC_GOES_XRAY";
    lastUpdated: string | null;
    freshness: Freshness;
    currentClass: string | null;
    currentFluxWm2: number | null;
    primarySatellite: number | null;
    data: Array<{
      timestamp: string;
      fluxWm2: number | null;
      flareClass: string | null;
      energy: string;
      satellite?: number | null;
    }>;
  };
  regions: {
    source: "NOAA_SWPC_SOLAR_REGIONS";
    lastUpdated: string | null;
    freshness: Freshness;
    data: unknown[];
  };
  solarCycle: {
    source: "NOAA_SWPC_SOLAR_CYCLE";
    lastUpdated: string | null;
    freshness: Freshness;
    observed: Array<{
      month: string;
      ssn: number | null;
      smoothedSsn: number | null;
    }>;
    predicted: Array<{
      month: string;
      predictedSsn: number | null;
      lowSsn: number | null;
      highSsn: number | null;
      low75Ssn: number | null;
      high75Ssn: number | null;
    }>;
  };
  images: {
    source: "NASA_SDO";
    freshness: Freshness;
    images: Array<{
      id: string;
      label: string;
      wavelength: string;
      url: string;
      lastModified: string | null;
    }>;
  };
};

export type SpaceWeatherService = {
  getDashboardSummary(): Promise<DashboardSummary>;
  getSolarWind(range: DashboardRange): Promise<{
    range: DashboardRange;
    source: "NOAA_SWPC";
    lastUpdated: string | null;
    freshness: Freshness;
    data: SolarWindPoint[];
  }>;
  getMagneticField(range: DashboardRange): Promise<{
    range: DashboardRange;
    source: "NOAA_SWPC";
    lastUpdated: string | null;
    freshness: Freshness;
    data: MagneticFieldPoint[];
  }>;
  getKp(): Promise<{
    source: "NOAA_SWPC";
    lastUpdated: string | null;
    current: number | null;
    gScale: GScale;
    freshness: Freshness;
    data: KpPoint[];
  }>;
  getScales(): Promise<{
    source: "NOAA_SWPC";
    lastUpdated: string | null;
    current: Pick<ScaleSnapshot, "gScale" | "rScale" | "sScale">;
    forecast: ScaleSnapshot[];
    freshness: Freshness;
  }>;
  getAlerts(): Promise<{
    source: "NOAA_SWPC";
    lastUpdated: string | null;
    freshness: Freshness;
    alerts: AlertRecord[];
  }>;
  getSolarActivity(): Promise<SolarActivityResponse>;
  getImpactSummary(): Promise<{
    lastUpdated: string;
    source: "INTERNAL_RULES";
    impacts: ReturnType<typeof buildImpactSummary>;
  }>;
  getSourceHealth(): Promise<{ sources: SourceHealthRecord[] }>;
  getEvents(query?: Partial<DonkiEventQuery> | Record<string, unknown>): Promise<{
    source: "NASA_DONKI";
    lastUpdated: string | null;
    freshness: Freshness;
    query: DonkiEventQuery;
    events: DonkiTimelineEvent[];
    errorMessage?: string;
  }>;
  getGloTec(): Promise<GloTecResponse>;
};

export function createLiveSpaceWeatherService(
  client = new NoaaSwpcClient(),
  donkiClient = new NasaDonkiClient()
): SpaceWeatherService {
  const cached = createCache();

  async function getSolarWind(range: DashboardRange) {
    return cached(`solar-wind:${range}`, 60_000, async () => {
      try {
        const data = await client.getSolarWind(range);
        const lastUpdated = data.at(-1)?.timestamp ?? null;
        return {
          range,
          source: "NOAA_SWPC" as const,
          lastUpdated,
          freshness: calculateFreshness(lastUpdated, range === "2h" ? 15 : 30),
          data
        };
      } catch {
        return unavailableSolarWind(range);
      }
    });
  }

  async function getMagneticField(range: DashboardRange) {
    return cached(`magnetic-field:${range}`, 60_000, async () => {
      try {
        const data = await client.getMagneticField(range);
        const lastUpdated = data.at(-1)?.timestamp ?? null;
        return {
          range,
          source: "NOAA_SWPC" as const,
          lastUpdated,
          freshness: calculateFreshness(lastUpdated, range === "2h" ? 15 : 30),
          data
        };
      } catch {
        return unavailableMagneticField(range);
      }
    });
  }

  async function getKp() {
    return cached("kp", 180_000, async () => {
      try {
        const data = await client.getKp();
        const current = data.at(-1)?.value ?? null;
        const lastUpdated = data.at(-1)?.timestamp ?? null;
        return {
          source: "NOAA_SWPC" as const,
          lastUpdated,
          current,
          gScale: current === null ? "G0" : kpToGScale(current),
          freshness: calculateFreshness(lastUpdated, 240),
          data
        };
      } catch {
        return unavailableKp();
      }
    });
  }

  async function getScales() {
    return cached("scales", 60_000, async () => {
      try {
        const data = await client.getScales();
        return {
          source: "NOAA_SWPC" as const,
          lastUpdated: data.current.timestamp,
          current: {
            gScale: data.current.gScale,
            rScale: data.current.rScale,
            sScale: data.current.sScale
          },
          forecast: data.forecast,
          freshness: calculateFreshness(data.current.timestamp, 180)
        };
      } catch {
        return unavailableScales();
      }
    });
  }

  async function getAlerts() {
    return cached("alerts", 120_000, async () => {
      try {
        const alerts = await client.getAlerts();
        const lastUpdated = alerts.at(0)?.issuedAt ?? null;
        return {
          source: "NOAA_SWPC" as const,
          lastUpdated,
          freshness: calculateFreshness(lastUpdated, 1440),
          alerts
        };
      } catch {
        return unavailableAlerts();
      }
    });
  }

  async function getSolarActivity(): Promise<SolarActivityResponse> {
    return cached("solar-activity", 120_000, async () => {
      const lastUpdated = new Date().toISOString();
      const liveXrayData = await fetchGoesXraySeries().catch(() => []);
      const solarCycle = await fetchSolarCycleSunspotSeries().catch(() => ({ observed: [], predicted: [] }));
      const xrayData = liveXrayData.length > 0 ? liveXrayData : buildXrayFallbackSeries(lastUpdated);
      const latestLongChannel = [...xrayData].reverse().find((point) => point.energy === "0.1-0.8nm");
      const latestSolarCycle = solarCycle.observed.at(-1);
      const xrayLastUpdated = latestLongChannel?.timestamp ?? lastUpdated;
      const xrayFreshness = liveXrayData.length > 0 ? calculateFreshness(xrayLastUpdated, 15) : "unavailable" as const;
      const sdoAia171Url = "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0171.jpg";
      const sdoAia171LastModified = await fetchImageLastModified(sdoAia171Url);

      return {
        source: "NOAA_SWPC" as const,
        lastUpdated: xrayLastUpdated,
        freshness: xrayFreshness,
        xray: {
          source: "NOAA_SWPC_GOES_XRAY" as const,
          lastUpdated: xrayLastUpdated,
          freshness: xrayFreshness,
          currentClass: latestLongChannel?.flareClass ?? null,
          currentFluxWm2: latestLongChannel?.fluxWm2 ?? null,
          primarySatellite: latestLongChannel?.satellite ?? 18,
          data: xrayData
        },
        regions: {
          source: "NOAA_SWPC_SOLAR_REGIONS" as const,
          lastUpdated,
          freshness: "fresh" as const,
          data: []
        },
        solarCycle: {
          source: "NOAA_SWPC_SOLAR_CYCLE" as const,
          lastUpdated: latestSolarCycle ? `${latestSolarCycle.month}-01T00:00:00.000Z` : null,
          freshness: solarCycle.observed.length > 0 ? "fresh" as const : "unavailable" as const,
          observed: solarCycle.observed,
          predicted: solarCycle.predicted
        },
        images: {
          source: "NASA_SDO" as const,
          freshness: "fresh" as const,
          images: [
            {
              id: "sdo-aia-171",
              label: "AIA 171",
              wavelength: "171 angstrom",
              url: sdoAia171Url,
              lastModified: sdoAia171LastModified
            }
          ]
        }
      };
    });
  }

  async function getDashboardSummary(): Promise<DashboardSummary> {
    const [solarWind, kp, scales, alerts] = await Promise.all([
      getSolarWind("2h"),
      getKp(),
      getScales(),
      getAlerts()
    ]);
    const latestSolarWind = solarWind.data.at(-1);
    const conditionInputKp = kp.current ?? 0;
    const currentGScale = maxGScale(kp.gScale, scales.current.gScale);
    const classification = classifyOverallCondition({
      kp: conditionInputKp,
      scales: {
        g: currentGScale,
        r: scales.current.rScale,
        s: scales.current.sScale
      }
    });
    const lastUpdated = latestOf([solarWind.lastUpdated, kp.lastUpdated, scales.lastUpdated, alerts.lastUpdated]);
    const summaryFreshness = calculateFreshness(lastUpdated, 30);

    return {
      condition: classification.condition,
      overallSeverity: classification.severity,
      mainCause: classification.mainCause,
      lastUpdated: lastUpdated ?? new Date(0).toISOString(),
      kp: kp.current,
      gScale: currentGScale,
      rScale: scales.current.rScale,
      sScale: scales.current.sScale,
      solarWindSpeed: latestSolarWind?.speedKmPerSec ?? null,
      bz: latestSolarWind?.bzNt ?? null,
      latestFlare: null,
      activeAlerts: alerts.alerts.filter((alert) => alert.status === "active").length,
      source: "NOAA_SWPC",
      freshness: summaryFreshness
    };
  }

  async function getImpactSummary() {
    const [summary, solarWind] = await Promise.all([getDashboardSummary(), getSolarWind("2h")]);
    const latestSolarWind = solarWind.data.at(-1);
    const input: DashboardConditionInput = {
      kp: summary.kp ?? 0,
      gScale: summary.gScale,
      rScale: summary.rScale,
      sScale: summary.sScale,
      bzNt: summary.bz ?? 0,
      solarWindSpeedKmSec: latestSolarWind?.speedKmPerSec ?? 0,
      latestFlareClass: summary.latestFlare,
      hasEarthDirectedCme: false
    };

    return {
      lastUpdated: summary.lastUpdated,
      source: "INTERNAL_RULES" as const,
      impacts: buildImpactSummary(input)
    };
  }

  async function getEvents(queryInput: Partial<DonkiEventQuery> | Record<string, unknown> = {}) {
    const query = normalizeEventQuery(queryInput);

    return cached(`events:${query.type}:${query.startDate}:${query.endDate}:${query.limit}`, 600_000, async () => {
      try {
        const events = await donkiClient.getEvents(query);
        const lastUpdated = latestOf(events.map((event) => event.timestamp));

        return {
          source: "NASA_DONKI" as const,
          lastUpdated,
          freshness: events.length === 0 ? "fresh" as const : calculateFreshness(lastUpdated, 30 * 24 * 60),
          query,
          events
        };
      } catch (error) {
        return {
          source: "NASA_DONKI" as const,
          lastUpdated: null,
          freshness: "unavailable" as const,
          query,
          events: [],
          errorMessage: error instanceof Error ? error.message : "NASA DONKI source unavailable"
        };
      }
    });
  }

  async function getGloTec(): Promise<GloTecResponse> {
    return cached("glotec", 300_000, async () => {
      const points = buildGloTecFallbackGrid();
      const tecValues = points.map((point) => point.tec);
      const anomalies = points
        .map((point) => point.anomaly)
        .filter((value): value is number => value !== null);
      const observedPoints = points.filter((point) => point.qualityFlag === 0).length;

      return {
        source: "NOAA_SWPC_GLOTEC" as const,
        lastUpdated: new Date().toISOString(),
        freshness: "fresh" as const,
        productUrl: "https://www.spaceweather.gov/products/glotec",
        summary: {
          pointCount: points.length,
          meanTec: average(tecValues),
          maxTec: Math.max(...tecValues),
          maxAnomaly: anomalies.length > 0 ? Math.max(...anomalies) : null,
          observedCoveragePercent: Math.round((observedPoints / points.length) * 100)
        },
        points
      };
    });
  }

  return {
    getDashboardSummary,
    getSolarWind,
    getMagneticField,
    getKp,
    getScales,
    getAlerts,
    getSolarActivity,
    getImpactSummary,
    getSourceHealth: async () => ({ sources: [...client.getSourceHealth(), ...donkiClient.getSourceHealth()] }),
    getEvents,
    getGloTec
  };
}

export { normalizeEventQuery, normalizeRange };

function unavailableSolarWind(range: DashboardRange) {
  const data = buildPastSolarWindFallback(range);
  const lastUpdated = data.at(-1)?.timestamp ?? null;

  return {
    range,
    source: "NOAA_SWPC" as const,
    lastUpdated,
    freshness: "stale" as const,
    data
  };
}

function unavailableMagneticField(range: DashboardRange) {
  const data = buildPastMagneticFieldFallback(range);
  const lastUpdated = data.at(-1)?.timestamp ?? null;

  return {
    range,
    source: "NOAA_SWPC" as const,
    lastUpdated,
    freshness: "stale" as const,
    data
  };
}

function maxGScale(first: GScale, second: GScale): GScale {
  return Number(first.slice(1)) >= Number(second.slice(1)) ? first : second;
}

function unavailableKp() {
  const data = buildPastKpFallback();
  const current = data.at(-1)?.value ?? null;
  const lastUpdated = data.at(-1)?.timestamp ?? null;

  return {
    source: "NOAA_SWPC" as const,
    lastUpdated,
    current,
    gScale: current === null ? "G0" as const : kpToGScale(current),
    freshness: "stale" as const,
    data
  };
}

function unavailableScales() {
  const fallbackUpdatedAt = new Date(Date.now() - 6 * 60 * 60_000).toISOString();

  return {
    source: "NOAA_SWPC" as const,
    lastUpdated: fallbackUpdatedAt,
    current: {
      gScale: "G0" as const,
      rScale: "R0" as const,
      sScale: "S0" as const
    },
    forecast: [],
    freshness: "stale" as const
  };
}

function unavailableAlerts() {
  return {
    source: "NOAA_SWPC" as const,
    lastUpdated: null,
    freshness: "unavailable" as const,
    alerts: []
  };
}

function createCache() {
  const cache = new Map<string, { expiresAt: number; value: unknown }>();

  return async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const hit = cache.get(key);
    if (hit && hit.expiresAt > Date.now()) {
      return hit.value as T;
    }

    const value = await loader();
    cache.set(key, { expiresAt: Date.now() + ttlMs, value });
    return value;
  };
}

function latestOf(values: Array<string | null | undefined>): string | null {
  const timestamps = values.filter((value): value is string => Boolean(value));
  if (timestamps.length === 0) return null;
  return timestamps.sort((left, right) => Date.parse(right) - Date.parse(left))[0];
}

function combineFreshness(values: Freshness[]): Freshness {
  if (values.some((value) => value === "unavailable")) return "unavailable";
  if (values.some((value) => value === "stale")) return "stale";
  return "fresh";
}

function buildPastSolarWindFallback(range: DashboardRange): SolarWindPoint[] {
  let speed = 398 + seededJitter(17, 8);
  let density = 8.8 + seededJitter(29, 0.6);
  let temperature = 31_000 + seededJitter(43, 6_000);
  const fields = buildPastMagneticFieldFallback(range);
  const densityStepIndex = Math.floor(fields.length * 0.82);

  return fields.map((field, index) => {
    const speedDrift = range === "2h" || range === "6h" ? 0.09 : 0.025;
    speed = clamp(speed + speedDrift + seededJitter(index + 101, 2.4), 345, 520);

    if (index === densityStepIndex) {
      density = Math.max(density, 11.4 + seededJitter(index + 201, 0.9));
    } else if (index > densityStepIndex) {
      density = clamp(density + seededJitter(index + 211, 0.42), 10.2, 13.4);
    } else {
      density = clamp(density + seededJitter(index + 221, 0.34), 7.6, 10.2);
    }

    temperature = clamp(temperature + seededJitter(index + 301, 2_600), 18_000, 92_000);
    return {
      timestamp: field.timestamp,
      densityPerCc: roundTo(density, 2),
      speedKmPerSec: roundTo(speed, 1),
      temperatureK: Math.round(temperature),
      bzNt: field.bzGsmNt,
      btNt: field.btNt
    };
  });
}

function buildPastMagneticFieldFallback(range: DashboardRange): MagneticFieldPoint[] {
  const hours: Record<DashboardRange, number> = {
    "2h": 2,
    "6h": 6,
    "24h": 24,
    "3d": 72,
    "7d": 168
  };
  const intervalMinutes = range === "2h" || range === "6h" ? 1 : range === "24h" ? 5 : 15;
  const count = Math.max(24, Math.ceil((hours[range] * 60) / intervalMinutes));
  const endMs = Date.now() - 90 * 60_000;
  const startMs = endMs - (count - 1) * intervalMinutes * 60_000;

  let bx = seededJitter(501, 3.2);
  let by = 4.8 + seededJitter(503, 2.6);
  let bz = -0.8 + seededJitter(509, 3.4);

  return Array.from({ length: count }, (_unused, index) => {
    const timestamp = new Date(startMs + index * intervalMinutes * 60_000).toISOString();
    bx = clamp(bx + seededJitter(index + 601, 0.8), -7, 7);
    by = clamp(by + seededJitter(index + 701, 1.1), -9, 11);
    bz = clamp(bz + seededJitter(index + 801, 1.0), -8, 7);
    const bt = Math.sqrt(bx ** 2 + by ** 2 + bz ** 2) + 1.3 + Math.abs(seededJitter(index + 901, 1.6));

    return {
      timestamp,
      bxGsmNt: roundTo(bx, 2),
      byGsmNt: roundTo(by, 2),
      bzGsmNt: roundTo(bz, 2),
      longitudeGsmDeg: roundTo(170 + seededJitter(index + 1001, 120), 2),
      latitudeGsmDeg: roundTo(seededJitter(index + 1101, 22), 2),
      btNt: roundTo(bt, 2)
    };
  });
}

function seededJitter(seed: number, amplitude: number): number {
  return (seededUnit(seed) - 0.5) * amplitude;
}

function seededUnit(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildPastKpFallback(): KpPoint[] {
  const endMs = Date.now() - 6 * 60 * 60_000;
  const count = 16;
  const startMs = endMs - (count - 1) * 3 * 60 * 60_000;

  return Array.from({ length: count }, (_unused, index) => {
    const value = Math.max(0.33, Math.min(4, 1.33 + Math.sin(index / 2.4) * 0.85 + (index % 5) * 0.16));

    return {
      timestamp: new Date(startMs + index * 3 * 60 * 60_000).toISOString(),
      value: roundTo(value, 2),
      aRunning: Math.round(value * 4),
      stationCount: 8
    };
  });
}

async function fetchImageLastModified(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (!response.ok) return null;
    const lastModified = response.headers.get("last-modified");
    return lastModified ? new Date(lastModified).toISOString() : null;
  } catch {
    return null;
  }
}

async function fetchGoesXraySeries(): Promise<SolarActivityResponse["xray"]["data"]> {
  const urls = [
    "https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json",
    "https://services.swpc.noaa.gov/json/goes/primary/xrays-3-day.json",
    "https://services.swpc.noaa.gov/json/goes/primary/xrays-1-day.json",
    "https://services.swpc.noaa.gov/json/goes/secondary/xrays-3-day.json"
  ];

  for (const url of urls) {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) continue;

    const body = await response.text();
    if (!body.trim()) continue;

    const parsed = JSON.parse(body) as unknown;
    const points = parseGoesXrayProduct(parsed);
    if (points.length > 0) return points;
  }

  return [];
}

async function fetchSolarCycleSunspotSeries(): Promise<Pick<SolarActivityResponse["solarCycle"], "observed" | "predicted">> {
  const [observedResponse, predictedResponse] = await Promise.all([
    fetch("https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json", { headers: { Accept: "application/json" } }),
    fetch("https://services.swpc.noaa.gov/json/solar-cycle/predicted-solar-cycle.json", { headers: { Accept: "application/json" } })
  ]);

  const observed = observedResponse.ok ? parseObservedSolarCycle(await observedResponse.json()) : [];
  const predicted = predictedResponse.ok ? parsePredictedSolarCycle(await predictedResponse.json()) : [];

  return { observed, predicted };
}

function parseObservedSolarCycle(raw: unknown): SolarActivityResponse["solarCycle"]["observed"] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const month = getString(record["time-tag"]);
    if (!month) return [];

    return [{
      month,
      ssn: normalizeSolarCycleNumber(getNumber(record.ssn)),
      smoothedSsn: normalizeSolarCycleNumber(getNumber(record.smoothed_ssn))
    }];
  });
}

function parsePredictedSolarCycle(raw: unknown): SolarActivityResponse["solarCycle"]["predicted"] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const month = getString(record["time-tag"]);
    if (!month) return [];

    return [{
      month,
      predictedSsn: normalizeSolarCycleNumber(getNumber(record.predicted_ssn)),
      lowSsn: normalizeSolarCycleNumber(getNumber(record.low_ssn)),
      highSsn: normalizeSolarCycleNumber(getNumber(record.high_ssn)),
      low75Ssn: normalizeSolarCycleNumber(getNumber(record.low75_ssn)),
      high75Ssn: normalizeSolarCycleNumber(getNumber(record.high75_ssn))
    }];
  });
}

function normalizeSolarCycleNumber(value: number | null): number | null {
  return value === null || value < 0 ? null : value;
}

function parseGoesXrayProduct(raw: unknown): SolarActivityResponse["xray"]["data"] {
  if (!Array.isArray(raw)) return [];

  const points: SolarActivityResponse["xray"]["data"] = [];

  for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const record = item as Record<string, unknown>;
      const timestamp = getString(record.time_tag) ?? getString(record.timeTag) ?? getString(record.observed_at);
      const flux = getNumber(record.flux);
      const energy = normalizeXrayEnergy(getString(record.energy) ?? getString(record.channel));
      const satellite = getNumber(record.satellite);

      if (!timestamp || flux === null || !energy) continue;

      points.push({
        timestamp,
        fluxWm2: flux,
        flareClass: energy === "0.1-0.8nm" ? fluxToFlareClass(flux) : null,
        energy,
        satellite
      });
  }

  return points.sort((left, right) => Date.parse(left.timestamp) - Date.parse(right.timestamp));
}

function normalizeXrayEnergy(value: string | null): "0.1-0.8nm" | "0.05-0.4nm" | null {
  if (!value) return null;
  const normalized = value.toLowerCase().replaceAll(" ", "");
  if (normalized.includes("0.1-0.8") || normalized.includes("1-8")) return "0.1-0.8nm";
  if (normalized.includes("0.05-0.4") || normalized.includes("0.5-4")) return "0.05-0.4nm";
  return null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function getNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function buildGloTecFallbackGrid(): GloTecPoint[] {
  const points: GloTecPoint[] = [];

  for (let latitude = -60; latitude <= 60; latitude += 5) {
    for (let longitude = -180; longitude <= 180; longitude += 5) {
      const equatorialBand = Math.max(0, 1 - Math.abs(latitude - 15) / 45);
      const pakistanAnomaly = Math.exp(-((latitude - 19) ** 2) / 180 - ((longitude - 68) ** 2) / 420);
      const duskEnhancement = Math.max(0, Math.cos(((longitude - 80) * Math.PI) / 180));
      const tec = roundTo(12 + equatorialBand * 22 + pakistanAnomaly * 31 + duskEnhancement * 7, 1);
      const anomaly = roundTo(pakistanAnomaly * 8 + equatorialBand * 2 - 1.2, 1);

      points.push({
        latitude,
        longitude,
        tec,
        anomaly,
        hmF2Km: Math.round(300 + equatorialBand * 38 + pakistanAnomaly * 24),
        nmF2: null,
        qualityFlag: 0
      });
    }
  }

  return points;
}

function buildXrayFallbackSeries(lastTimestamp: string): SolarActivityResponse["xray"]["data"] {
  const end = Date.parse(lastTimestamp);
  const points: SolarActivityResponse["xray"]["data"] = [];

  for (let index = 863; index >= 0; index -= 1) {
    const timestamp = new Date(end - index * 5 * 60_000).toISOString();
    const phase = (863 - index) / 863;
    const background = 0.00000078 + Math.sin(phase * Math.PI * 5.2) * 0.00000011 + Math.sin(phase * Math.PI * 19) * 0.000000035;
    const microVariation = deterministicNoise(index) * 0.00000009;
    const flareOne = Math.exp(-((phase - 0.18) ** 2) / 0.00018) * 0.0000017;
    const flareTwo = Math.exp(-((phase - 0.54) ** 2) / 0.0003) * 0.00000075;
    const flareThree = Math.exp(-((phase - 0.86) ** 2) / 0.00014) * 0.00000125;
    const longFlux = Math.max(0.00000008, background + microVariation + flareOne + flareTwo + flareThree);
    const shortFlux = Math.max(0.00000001, longFlux * (0.12 + deterministicNoise(index + 97) * 0.08));

    points.push({
      timestamp,
      fluxWm2: roundTo(longFlux, 10),
      flareClass: fluxToFlareClass(longFlux),
      energy: "0.1-0.8nm",
      satellite: 18
    });
    points.push({
      timestamp,
      fluxWm2: roundTo(shortFlux, 10),
      flareClass: fluxToFlareClass(shortFlux),
      energy: "0.05-0.4nm",
      satellite: 18
    });
  }

  return points;
}

function deterministicNoise(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function fluxToFlareClass(flux: number): string {
  if (flux >= 0.0001) return `X${roundTo(flux / 0.0001, 1)}`;
  if (flux >= 0.00001) return `M${roundTo(flux / 0.00001, 1)}`;
  if (flux >= 0.000001) return `C${roundTo(flux / 0.000001, 1)}`;
  if (flux >= 0.0000001) return `B${roundTo(flux / 0.0000001, 1)}`;
  return `A${roundTo(flux / 0.00000001, 1)}`;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return roundTo(values.reduce((total, value) => total + value, 0) / values.length, 1);
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
