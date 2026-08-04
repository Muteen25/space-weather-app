import type { SeverityLevel } from "../../shared/types";
import type { SourceHealthRecord } from "./noaaSwpcAdapter";

export type DonkiEventType = "cme" | "flare" | "gst" | "sep";

export type DonkiEventQuery = {
  type: DonkiEventType | "all";
  startDate: string;
  endDate: string;
  limit: number;
};

export type DonkiTimelineEvent = {
  id: string;
  type: DonkiEventType;
  timestamp: string;
  source: "NASA_DONKI";
  title: string;
  summary: string;
  severity: SeverityLevel;
  link?: string;
  sourceLocation?: string | null;
  activeRegionNum?: number | null;
  speedKmPerSec?: number | null;
  halfAngleDeg?: number | null;
  estimatedShockArrivalTime?: string | null;
  earthDirected?: boolean;
  flareClass?: string | null;
  kpIndex?: number | null;
  associatedEventIds: string[];
  instruments: string[];
};

const DONKI_TYPES: DonkiEventType[] = ["cme", "flare", "gst", "sep"];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export class NasaDonkiClient {
  private readonly health = new Map<string, SourceHealthRecord>();

  constructor(
    private readonly options: {
      baseUrl?: string;
      apiKey?: string;
      fetchJson?: <T>(path: string) => Promise<T>;
    } = {}
  ) {}

  async getEvents(queryInput: Partial<DonkiEventQuery> | Record<string, unknown> = {}): Promise<DonkiTimelineEvent[]> {
    const query = normalizeEventQuery(queryInput);
    const types = query.type === "all" ? DONKI_TYPES : [query.type];
    const batches = await Promise.all(types.map((type) => this.fetchEventsForType(type, query)));

    return batches
      .flat()
      .sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp))
      .slice(0, query.limit);
  }

  getSourceHealth(): SourceHealthRecord[] {
    return DONKI_TYPES.map((type) => {
      const sourceName = donkiSourceName(type);
      return (
        this.health.get(sourceName) ?? {
          sourceName,
          status: "unknown"
        }
      );
    });
  }

  private async fetchEventsForType(type: DonkiEventType, query: DonkiEventQuery): Promise<DonkiTimelineEvent[]> {
    const raw = await this.fetchDonki<unknown>(
      donkiSourceName(type),
      this.endpointForType(type, query)
    );

    if (type === "cme") return parseCmeProduct(raw);
    if (type === "flare") return parseFlareProduct(raw);
    if (type === "gst") return parseGstProduct(raw);
    return parseSepProduct(raw);
  }

  private apiKey(): string {
    return this.options.apiKey ?? process.env.NASA_API_KEY ?? "";
  }

  private endpointForType(type: DonkiEventType, query: DonkiEventQuery): string {
    const apiKey = this.apiKey();
    if (!this.options.baseUrl && !apiKey) {
      return resolveCcmcDonkiEndpoint(type, query.startDate, query.endDate);
    }

    return resolveDonkiEndpoint(type, query.startDate, query.endDate, apiKey || "DEMO_KEY");
  }

  private async fetchDonki<T>(sourceName: string, path: string): Promise<T> {
    const startedAt = performance.now();
    const lastFetchAt = new Date().toISOString();

    try {
      const payload = this.options.fetchJson
        ? await this.options.fetchJson<T>(path)
        : await fetchJson<T>(`${this.options.baseUrl ?? defaultDonkiBaseUrl()}${path}`);
      const latencyMs = Math.round(performance.now() - startedAt);
      const recordsFetched = Array.isArray(payload) ? payload.length : payload ? 1 : 0;

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
        errorMessage: error instanceof Error ? error.message : "Unknown NASA DONKI fetch failure"
      });
      throw error;
    }
  }
}

export function resolveDonkiEndpoint(
  type: DonkiEventType,
  startDate: string,
  endDate: string,
  apiKey: string
): string {
  const endpoint: Record<DonkiEventType, string> = {
    cme: "CME",
    flare: "FLR",
    gst: "GST",
    sep: "SEP"
  };
  const params = new URLSearchParams();
  params.set("startDate", startDate);
  params.set("endDate", endDate);
  params.set("api_key", apiKey);

  return `/${endpoint[type]}?${params.toString()}`;
}

export function resolveCcmcDonkiEndpoint(type: DonkiEventType, startDate: string, endDate: string): string {
  const endpoint: Record<DonkiEventType, string> = {
    cme: "CME",
    flare: "FLR",
    gst: "GST",
    sep: "SEP"
  };
  const params = new URLSearchParams();
  params.set("startDate", startDate);
  params.set("endDate", endDate);

  return `/WS/get/${endpoint[type]}?${params.toString()}`;
}

export function normalizeEventQuery(raw: Partial<DonkiEventQuery> | Record<string, unknown> = {}): DonkiEventQuery {
  const now = new Date();
  const fallbackEndDate = formatDonkiDate(now);
  const fallbackStartDate = formatDonkiDate(addUtcDays(now, -30));
  const endDate = normalizeDate(scalar(raw.endDate)) ?? fallbackEndDate;
  const startDateCandidate = normalizeDate(scalar(raw.startDate)) ?? fallbackStartDate;
  const startDate =
    Date.parse(`${startDateCandidate}T00:00:00.000Z`) <= Date.parse(`${endDate}T00:00:00.000Z`)
      ? startDateCandidate
      : formatDonkiDate(addUtcDays(new Date(`${endDate}T00:00:00.000Z`), -30));

  return {
    type: normalizeEventType(scalar(raw.type)),
    startDate,
    endDate,
    limit: normalizeLimit(scalar(raw.limit))
  };
}

export function parseCmeProduct(raw: unknown): DonkiTimelineEvent[] {
  return toArray(raw)
    .map((item): DonkiTimelineEvent | null => {
      const record = asRecord(item);
      if (!record) return null;

      const timestamp = parseDonkiTimestamp(record.startTime);
      if (!timestamp) return null;

      const analysis = selectCmeAnalysis(record.cmeAnalyses);
      const enlil = selectEnlil(analysis?.enlilList);
      const speedKmPerSec = nullableNumber(analysis?.speed);
      const halfAngleDeg = nullableNumber(analysis?.halfAngle);
      const estimatedShockArrivalTime = parseDonkiTimestamp(enlil?.estimatedShockArrivalTime) || null;
      const earthDirected = isEarthDirected(enlil);
      const predictedKp = maxNullableNumber([enlil?.kp_90, enlil?.kp_135, enlil?.kp_180]);
      const sourceLocation = nullableText(record.sourceLocation);
      const activeRegionNum = nullableNumber(record.activeRegionNum);

      return {
        id: String(record.activityID ?? timestamp),
        type: "cme" as const,
        timestamp,
        source: "NASA_DONKI" as const,
        title: sourceLocation ? `CME from ${sourceLocation}` : "CME event",
        summary: cmeSummary({ sourceLocation, speedKmPerSec, halfAngleDeg, earthDirected }),
        severity: cmeSeverity(speedKmPerSec, halfAngleDeg, predictedKp, earthDirected),
        link: nullableText(record.link) ?? undefined,
        sourceLocation,
        activeRegionNum,
        speedKmPerSec,
        halfAngleDeg,
        estimatedShockArrivalTime,
        earthDirected,
        associatedEventIds: linkedEventIds(record.linkedEvents),
        instruments: instrumentNames(record.instruments)
      };
    })
    .filter((event): event is DonkiTimelineEvent => event !== null);
}

export function parseFlareProduct(raw: unknown): DonkiTimelineEvent[] {
  return toArray(raw)
    .map((item): DonkiTimelineEvent | null => {
      const record = asRecord(item);
      if (!record) return null;

      const flareClass = nullableText(record.classType);
      const timestamp =
        parseDonkiTimestamp(record.peakTime) ||
        parseDonkiTimestamp(record.beginTime) ||
        parseDonkiTimestamp(record.endTime);
      if (!timestamp) return null;

      const sourceLocation = nullableText(record.sourceLocation);

      return {
        id: String(record.flrID ?? timestamp),
        type: "flare" as const,
        timestamp,
        source: "NASA_DONKI" as const,
        title: flareClass ? `Solar flare ${flareClass}` : "Solar flare",
        summary: flareSummary(flareClass, sourceLocation),
        severity: flareSeverity(flareClass),
        link: nullableText(record.link) ?? undefined,
        sourceLocation,
        activeRegionNum: nullableNumber(record.activeRegionNum),
        flareClass,
        associatedEventIds: linkedEventIds(record.linkedEvents),
        instruments: instrumentNames(record.instruments)
      };
    })
    .filter((event): event is DonkiTimelineEvent => event !== null);
}

export function parseGstProduct(raw: unknown): DonkiTimelineEvent[] {
  return toArray(raw)
    .map((item): DonkiTimelineEvent | null => {
      const record = asRecord(item);
      if (!record) return null;

      const kpIndex = maxKpIndex(record.allKpIndex);
      const timestamp = parseDonkiTimestamp(record.startTime) || parseDonkiTimestamp(firstKpTime(record.allKpIndex));
      if (!timestamp) return null;

      return {
        id: String(record.gstID ?? timestamp),
        type: "gst" as const,
        timestamp,
        source: "NASA_DONKI" as const,
        title: kpIndex === null ? "Geomagnetic storm" : `Geomagnetic storm Kp ${kpIndex}`,
        summary:
          kpIndex === null
            ? "Geomagnetic storm event reported by DONKI."
            : `Geomagnetic storm reached Kp ${kpIndex}.`,
        severity: kpSeverity(kpIndex),
        link: nullableText(record.link) ?? undefined,
        kpIndex,
        associatedEventIds: linkedEventIds(record.linkedEvents),
        instruments: []
      };
    })
    .filter((event): event is DonkiTimelineEvent => event !== null);
}

export function parseSepProduct(raw: unknown): DonkiTimelineEvent[] {
  return toArray(raw)
    .map((item): DonkiTimelineEvent | null => {
      const record = asRecord(item);
      if (!record) return null;

      const timestamp = parseDonkiTimestamp(record.eventTime) || parseDonkiTimestamp(record.startTime);
      if (!timestamp) return null;

      return {
        id: String(record.sepID ?? timestamp),
        type: "sep" as const,
        timestamp,
        source: "NASA_DONKI" as const,
        title: "Solar energetic particle event",
        summary: "Solar energetic particle event reported by DONKI.",
        severity: "moderate",
        link: nullableText(record.link) ?? undefined,
        associatedEventIds: linkedEventIds(record.linkedEvents),
        instruments: instrumentNames(record.instruments)
      };
    })
    .filter((event): event is DonkiTimelineEvent => event !== null);
}

function normalizeEventType(raw: unknown): DonkiEventQuery["type"] {
  const value = String(raw ?? "all").trim().toLowerCase();
  if (value === "cme") return "cme";
  if (value === "flare" || value === "flr") return "flare";
  if (value === "gst" || value === "geomagnetic-storm") return "gst";
  if (value === "sep") return "sep";
  return "all";
}

function normalizeLimit(raw: unknown): number {
  const value = Number(raw ?? DEFAULT_LIMIT);
  if (!Number.isFinite(value) || value < 1) return DEFAULT_LIMIT;
  return Math.min(Math.floor(value), MAX_LIMIT);
}

function normalizeDate(raw: unknown): string | null {
  const value = String(raw ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10) === value ? value : null;
}

function selectCmeAnalysis(raw: unknown): Record<string, unknown> | null {
  const analyses = toRecordArray(raw);
  return analyses.find((analysis) => analysis.isMostAccurate === true) ?? analyses[0] ?? null;
}

function selectEnlil(raw: unknown): Record<string, unknown> | null {
  const forecasts = toRecordArray(raw);
  return forecasts.find((forecast) => isEarthDirected(forecast)) ?? forecasts[0] ?? null;
}

function isEarthDirected(raw: Record<string, unknown> | null | undefined): boolean {
  if (!raw) return false;
  return Boolean(raw.isEarthGB || raw.isEarthMinorImpact || raw.isEarthMajorImpact);
}

function cmeSeverity(
  speedKmPerSec: number | null,
  halfAngleDeg: number | null,
  predictedKp: number | null,
  earthDirected: boolean
): SeverityLevel {
  if ((predictedKp ?? 0) >= 8 || (speedKmPerSec ?? 0) >= 2000) return "severe";
  if (earthDirected || (predictedKp ?? 0) >= 6 || (speedKmPerSec ?? 0) >= 1000 || (halfAngleDeg ?? 0) >= 60) {
    return "high";
  }
  if ((predictedKp ?? 0) >= 5 || (speedKmPerSec ?? 0) >= 500 || (halfAngleDeg ?? 0) >= 30) return "moderate";
  return "low";
}

function flareSeverity(flareClass: string | null): SeverityLevel {
  if (!flareClass) return "low";
  const family = flareClass.trim().toUpperCase().charAt(0);
  const magnitude = Number.parseFloat(flareClass.trim().slice(1));

  if (family === "X") return Number.isFinite(magnitude) && magnitude >= 10 ? "severe" : "high";
  if (family === "M") return Number.isFinite(magnitude) && magnitude >= 5 ? "high" : "moderate";
  return "low";
}

function kpSeverity(kpIndex: number | null): SeverityLevel {
  if (kpIndex === null) return "low";
  if (kpIndex >= 8) return "severe";
  if (kpIndex >= 6) return "high";
  if (kpIndex >= 5) return "moderate";
  return "low";
}

function cmeSummary(input: {
  sourceLocation: string | null;
  speedKmPerSec: number | null;
  halfAngleDeg: number | null;
  earthDirected: boolean;
}): string {
  const details = [
    input.sourceLocation ? `source ${input.sourceLocation}` : null,
    input.speedKmPerSec !== null ? `${Math.round(input.speedKmPerSec)} km/s` : null,
    input.halfAngleDeg !== null ? `${Math.round(input.halfAngleDeg)} degree half angle` : null,
    input.earthDirected ? "Earth-directed" : null
  ].filter((value): value is string => Boolean(value));

  return details.length > 0 ? `CME ${details.join(", ")}.` : "CME event reported by DONKI.";
}

function flareSummary(flareClass: string | null, sourceLocation: string | null): string {
  const details = [flareClass ? `${flareClass} flare` : "Solar flare", sourceLocation ? `from ${sourceLocation}` : null].filter(
    (value): value is string => Boolean(value)
  );
  return `${details.join(" ")} reported by DONKI.`;
}

function instrumentNames(raw: unknown): string[] {
  return toRecordArray(raw)
    .map((instrument) => nullableText(instrument.displayName))
    .filter((value): value is string => Boolean(value));
}

function linkedEventIds(raw: unknown): string[] {
  return toRecordArray(raw)
    .map((event) => nullableText(event.activityID))
    .filter((value): value is string => Boolean(value));
}

function maxKpIndex(raw: unknown): number | null {
  return maxNullableNumber(toRecordArray(raw).map((item) => item.kpIndex));
}

function firstKpTime(raw: unknown): unknown {
  return toRecordArray(raw)[0]?.observedTime;
}

function maxNullableNumber(raw: unknown[]): number | null {
  const values = raw.map((value) => nullableNumber(value)).filter((value): value is number => value !== null);
  return values.length === 0 ? null : Math.max(...values);
}

function parseDonkiTimestamp(raw: unknown): string {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const hasZone = /z$/i.test(normalized) || /[+-]\d{2}:?\d{2}$/.test(normalized);
  const parsed = new Date(hasZone ? normalized : `${normalized}Z`);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function toArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw === null || raw === undefined || raw === "") return [];
  return [raw];
}

function toRecordArray(raw: unknown): Array<Record<string, unknown>> {
  return toArray(raw).filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
}

function asRecord(raw: unknown): Record<string, unknown> | null {
  return typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : null;
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

function scalar(raw: unknown): unknown {
  return Array.isArray(raw) ? raw[0] : raw;
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDonkiDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function donkiSourceName(type: DonkiEventType): string {
  return `NASA_DONKI_${type.toUpperCase()}`;
}

function defaultDonkiBaseUrl(): string {
  return process.env.NASA_API_KEY ? "https://api.nasa.gov/DONKI" : "https://kauai.ccmc.gsfc.nasa.gov/DONKI";
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`NASA DONKI request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
