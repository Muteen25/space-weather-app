import type { GScale, RScale, SScale } from "../../shared/types";

export type DashboardRange = "2h" | "6h" | "24h" | "3d" | "7d";
export type SolarWindKind = "plasma" | "mag";
export type Freshness = "fresh" | "stale" | "unavailable";
export type SourceStatus = "healthy" | "degraded" | "down" | "unknown";

export type PlasmaPoint = {
  timestamp: string;
  densityPerCc: number | null;
  speedKmPerSec: number | null;
  temperatureK: number | null;
};

export type MagneticFieldPoint = {
  timestamp: string;
  bxGsmNt: number | null;
  byGsmNt: number | null;
  bzGsmNt: number | null;
  longitudeGsmDeg?: number | null;
  latitudeGsmDeg?: number | null;
  btNt: number | null;
};

export type SolarWindPoint = PlasmaPoint & {
  bzNt: number | null;
  btNt: number | null;
};

export type KpPoint = {
  timestamp: string;
  value: number;
  aRunning?: number | null;
  stationCount?: number | null;
};

export type ScaleSnapshot = {
  timestamp: string;
  gScale: GScale;
  rScale: RScale;
  sScale: SScale;
  gText?: string | null;
  rText?: string | null;
  sText?: string | null;
};

export type ScalesProduct = {
  current: ScaleSnapshot;
  forecast: ScaleSnapshot[];
};

export type AlertRecord = {
  id: string;
  title: string;
  status: "active" | "expired";
  scale: string;
  issuedAt: string;
  validUntil: string | null;
  affectedSystems: string[];
  summary: string;
};

export type SourceHealthRecord = {
  sourceName: string;
  status: SourceStatus;
  lastFetchAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  latencyMs?: number;
  recordsFetched?: number;
  errorMessage?: string;
};

export class NoaaSwpcClient {
  private readonly health = new Map<string, SourceHealthRecord>();

  constructor(
    private readonly options: {
      baseUrl?: string;
      fetchJson?: <T>(path: string) => Promise<T>;
    } = {}
  ) {}

  async getSolarWind(range: DashboardRange): Promise<SolarWindPoint[]> {
    const [plasma, mag] = await Promise.all([
      this.fetchNoaa<unknown[]>("NOAA_SWPC_SOLAR_WIND_PLASMA", resolveSolarWindEndpoint(range, "plasma")),
      this.fetchNoaa<unknown[]>("NOAA_SWPC_SOLAR_WIND_MAG", resolveSolarWindEndpoint(range, "mag"))
    ]);
    return filterByRange(mergeSolarWind(parsePlasmaProduct(plasma), parseMagProduct(mag)), range);
  }

  async getMagneticField(range: DashboardRange): Promise<MagneticFieldPoint[]> {
    const raw = await this.fetchNoaa<unknown[]>("NOAA_SWPC_MAGNETIC_FIELD", resolveSolarWindEndpoint(range, "mag"));
    return filterByRange(parseMagProduct(raw), range);
  }

  async getKp(): Promise<KpPoint[]> {
    const raw = await this.fetchNoaa<unknown[]>("NOAA_SWPC_KP_INDEX", "/products/noaa-planetary-k-index.json");
    return parseKpProduct(raw);
  }

  async getScales(): Promise<ScalesProduct> {
    const raw = await this.fetchNoaa<Record<string, unknown>>("NOAA_SWPC_SCALES", "/products/noaa-scales.json");
    return parseScalesProduct(raw);
  }

  async getAlerts(now = new Date()): Promise<AlertRecord[]> {
    const raw = await this.fetchNoaa<unknown[]>("NOAA_SWPC_ALERTS", "/products/alerts.json");
    return parseAlertsProduct(raw, now);
  }

  getSourceHealth(): SourceHealthRecord[] {
    const knownSources = [
      "NOAA_SWPC_SOLAR_WIND_PLASMA",
      "NOAA_SWPC_SOLAR_WIND_MAG",
      "NOAA_SWPC_MAGNETIC_FIELD",
      "NOAA_SWPC_KP_INDEX",
      "NOAA_SWPC_SCALES",
      "NOAA_SWPC_ALERTS"
    ];

    return knownSources.map(
      (sourceName) =>
        this.health.get(sourceName) ?? {
          sourceName,
          status: "unknown"
        }
    );
  }

  private async fetchNoaa<T>(sourceName: string, path: string): Promise<T> {
    const startedAt = performance.now();
    const lastFetchAt = new Date().toISOString();

    try {
      const payload = this.options.fetchJson
        ? await this.options.fetchJson<T>(path)
        : await fetchJson<T>(`${this.options.baseUrl ?? "https://services.swpc.noaa.gov"}${path}`);
      const latencyMs = Math.round(performance.now() - startedAt);
      const recordsFetched = Array.isArray(payload) ? Math.max(payload.length - 1, 0) : 1;

      this.health.set(sourceName, {
        sourceName,
        status: "healthy",
        lastFetchAt,
        lastSuccessAt: new Date().toISOString(),
        latencyMs,
        recordsFetched
      });

      return payload;
    } catch (error) {
      this.health.set(sourceName, {
        sourceName,
        status: "down",
        lastFetchAt,
        lastFailureAt: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : "Unknown NOAA fetch failure"
      });
      throw error;
    }
  }
}

export function resolveSolarWindEndpoint(range: DashboardRange, kind: SolarWindKind): string {
  void range;
  return kind === "plasma" ? "/json/rtsw/rtsw_wind_1m.json" : "/json/rtsw/rtsw_mag_1m.json";
}

export function normalizeRange(value: unknown): DashboardRange {
  return value === "2h" || value === "6h" || value === "24h" || value === "3d" || value === "7d"
    ? value
    : "6h";
}

export function parsePlasmaProduct(raw: unknown[]): PlasmaPoint[] {
  const rows = productRows(raw);

  return rows
    .map((row) => ({
      timestamp: parseNoaaTimestamp(row.time_tag),
      densityPerCc: nullableNumber(row.density ?? row.proton_density),
      speedKmPerSec: nullableNumber(row.speed ?? row.proton_speed),
      temperatureK: nullableNumber(row.temperature ?? row.proton_temperature)
    }))
    .filter((point) => Boolean(point.timestamp)) as PlasmaPoint[];
}

export function parseMagProduct(raw: unknown[]): MagneticFieldPoint[] {
  const rows = productRows(raw);

  return rows
    .map((row) => ({
      timestamp: parseNoaaTimestamp(row.time_tag),
      bxGsmNt: nullableNumber(row.bx_gsm),
      byGsmNt: nullableNumber(row.by_gsm),
      bzGsmNt: nullableNumber(row.bz_gsm),
      longitudeGsmDeg: nullableNumber(row.lon_gsm ?? row.phi_gsm),
      latitudeGsmDeg: nullableNumber(row.lat_gsm ?? row.theta_gsm),
      btNt: nullableNumber(row.bt)
    }))
    .filter((point) => Boolean(point.timestamp)) as MagneticFieldPoint[];
}

export function parseKpProduct(raw: unknown[]): KpPoint[] {
  return raw
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        timestamp: parseNoaaTimestamp(row.time_tag),
        value: Number(row.Kp),
        aRunning: nullableNumber(row.a_running),
        stationCount: nullableNumber(row.station_count)
      };
    })
    .filter((point) => Boolean(point.timestamp) && Number.isFinite(point.value))
    .sort((left, right) => Date.parse(left.timestamp) - Date.parse(right.timestamp));
}

export function parseScalesProduct(raw: Record<string, unknown>): ScalesProduct {
  const current = parseScaleSnapshot(raw["0"]);
  const forecast = ["1", "2", "3"]
    .map((key) => raw[key])
    .filter((value): value is Record<string, unknown> => typeof value === "object" && value !== null)
    .map((value) => parseScaleSnapshot(value));

  return { current, forecast };
}

export function parseAlertsProduct(raw: unknown[], now = new Date()): AlertRecord[] {
  return raw
    .map((item) => {
      const record = item as Record<string, unknown>;
      const message = String(record.message ?? "");
      const issuedAt = parseNoaaTimestamp(record.issue_datetime);
      const validUntil = extractValidUntil(message);
      const title = firstMeaningfulLine(message);
      const scale = extractScale(message);
      const status = alertStatus(issuedAt, validUntil, now);
      return {
        id: `${String(record.product_id ?? "NOAA")}-${issuedAt}`,
        title,
        status,
        scale,
        issuedAt,
        validUntil,
        affectedSystems: affectedSystemsFromMessage(message),
        summary: summarizeAlert(message)
      };
    })
    .filter((alert) => Date.parse(alert.issuedAt))
    .sort((left, right) => Date.parse(right.issuedAt) - Date.parse(left.issuedAt));
}

function alertStatus(issuedAt: string, validUntil: string | null, now: Date): AlertRecord["status"] {
  if (validUntil) {
    return Date.parse(validUntil) < now.getTime() ? "expired" : "active";
  }

  const issuedMs = Date.parse(issuedAt);
  if (!Number.isFinite(issuedMs)) return "expired";
  return now.getTime() - issuedMs <= 48 * 60 * 60 * 1000 ? "active" : "expired";
}

export function mergeSolarWind(plasma: PlasmaPoint[], mag: MagneticFieldPoint[]): SolarWindPoint[] {
  const magByTimestamp = new Map(mag.map((point) => [point.timestamp, point]));

  return plasma.map((point) => {
    const magnetic = magByTimestamp.get(point.timestamp);
    return {
      ...point,
      bzNt: magnetic?.bzGsmNt ?? null,
      btNt: magnetic?.btNt ?? null
    };
  });
}

export function calculateFreshness(lastUpdated: string | null | undefined, staleAfterMinutes: number): Freshness {
  if (!lastUpdated) return "unavailable";
  const ageMs = Date.now() - Date.parse(lastUpdated);
  if (!Number.isFinite(ageMs)) return "unavailable";
  return ageMs <= staleAfterMinutes * 60_000 ? "fresh" : "stale";
}

function headerRows(raw: unknown[][]): Array<Record<string, unknown>> {
  const [header, ...rows] = raw;
  if (!Array.isArray(header)) return [];

  return rows
    .filter((row): row is unknown[] => Array.isArray(row))
    .map((row) =>
      Object.fromEntries(header.map((key, index) => [String(key), row[index] ?? null]))
    );
}

function productRows(raw: unknown[]): Array<Record<string, unknown>> {
  if (!Array.isArray(raw)) return [];
  if (Array.isArray(raw[0])) return headerRows(raw as unknown[][]);
  return raw.filter((row): row is Record<string, unknown> => typeof row === "object" && row !== null);
}

function filterByRange<TPoint extends { timestamp: string }>(points: TPoint[], range: DashboardRange): TPoint[] {
  const latest = points.at(-1)?.timestamp;
  if (!latest) return points;

  const hours: Record<DashboardRange, number> = {
    "2h": 2,
    "6h": 6,
    "24h": 24,
    "3d": 72,
    "7d": 168
  };
  const cutoff = Date.parse(latest) - hours[range] * 60 * 60 * 1000;
  return points.filter((point) => Date.parse(point.timestamp) >= cutoff);
}

function parseScaleSnapshot(raw: unknown): ScaleSnapshot {
  const row = raw as Record<string, unknown>;
  const g = (row.G ?? {}) as Record<string, unknown>;
  const r = (row.R ?? {}) as Record<string, unknown>;
  const s = (row.S ?? {}) as Record<string, unknown>;

  return {
    timestamp: parseNoaaTimestamp(`${String(row.DateStamp)} ${String(row.TimeStamp)}`),
    gScale: scaleLabel("G", g.Scale),
    rScale: scaleLabel("R", r.Scale),
    sScale: scaleLabel("S", s.Scale),
    gText: nullableText(g.Text),
    rText: nullableText(r.Text),
    sText: nullableText(s.Text)
  };
}

function scaleLabel<TPrefix extends "G" | "R" | "S">(
  prefix: TPrefix,
  raw: unknown
): `${TPrefix}${0 | 1 | 2 | 3 | 4 | 5}` {
  const value = Number(raw ?? 0);
  const bounded = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), 5);
  return `${prefix}${bounded}` as `${TPrefix}${0 | 1 | 2 | 3 | 4 | 5}`;
}

function parseNoaaTimestamp(raw: unknown): string {
  const value = String(raw ?? "").trim();
  if (!value || value === "undefined null") return "";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const withZone = /z$/i.test(normalized) ? normalized : `${normalized}Z`;
  const parsed = new Date(withZone);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function nullableNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function nullableText(raw: unknown): string | null {
  if (raw === null || raw === undefined || raw === "") return null;
  return String(raw);
}

function extractScale(message: string): string {
  return (
    message.match(/Category\s+([GRS][1-5])/i)?.[1]?.toUpperCase() ??
    message.match(/\b([GRS][1-5])\b/i)?.[1]?.toUpperCase() ??
    "general"
  );
}

function extractValidUntil(message: string): string | null {
  const match = message.match(/Valid To:\s*(\d{4})\s+([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})\s+UTC/i);
  if (!match) return null;

  const [, year, monthName, day, hhmm] = match;
  const hour = hhmm.slice(0, 2);
  const minute = hhmm.slice(2, 4);
  const parsed = new Date(`${year}-${monthNumber(monthName)}-${day.padStart(2, "0")}T${hour}:${minute}:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function monthNumber(monthName: string): string {
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const index = months.indexOf(monthName.toLowerCase().slice(0, 3));
  return String(index + 1).padStart(2, "0");
}

function firstMeaningfulLine(message: string): string {
  return message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^(watch|warning|alert)/i.test(line)) ?? "NOAA space weather alert";
}

function summarizeAlert(message: string): string {
  const lines = message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.find((line) => /^Potential Impacts:/i.test(line)) ?? lines.find((line) => /^(WATCH|WARNING|ALERT)/i.test(line)) ?? lines[0] ?? "NOAA space weather alert issued.";
}

function affectedSystemsFromMessage(message: string): string[] {
  const lower = message.toLowerCase();
  const systems = new Set<string>();

  if (lower.includes("spacecraft") || lower.includes("satellite")) systems.add("Satellites");
  if (lower.includes("gnss") || lower.includes("navigation")) systems.add("GNSS and navigation");
  if (lower.includes("radio") || lower.includes("hf")) systems.add("HF radio communication");
  if (lower.includes("aviation")) systems.add("Aviation");
  if (lower.includes("grid") || lower.includes("induced currents")) systems.add("Power grids");
  if (lower.includes("aurora")) systems.add("Aurora visibility");
  if (lower.includes("radiation")) systems.add("Human spaceflight radiation awareness");
  if (systems.size === 0 && lower.includes("geomagnetic")) {
    systems.add("Satellites");
    systems.add("Power grids");
    systems.add("Aurora visibility");
  }

  return [...systems];
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`NOAA SWPC request failed: ${response.status}`);
  }

  const body = await response.text();

  if (!body.trim()) {
    throw new Error(`NOAA SWPC returned an empty JSON response from ${url}`);
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(`NOAA SWPC returned invalid JSON from ${url}`);
  }
}
