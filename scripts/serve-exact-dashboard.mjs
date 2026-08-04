import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("public-exact");
const backend = new URL(process.env.API_PROXY_TARGET ?? "http://127.0.0.1:5000");
const port = Number(process.env.PORT ?? 5176);
const swpcOrigin = "https://services.swpc.noaa.gov";
let glotecCache = null;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8"
};

createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);

  if (requestUrl.pathname === "/api/ionosphere/glotec") {
    serveGloTec(response, requestUrl);
    return;
  }

  if (requestUrl.pathname === "/api/geomagnetic/dst") {
    serveDst(response, requestUrl);
    return;
  }

  if (requestUrl.pathname === "/api/solar-activity") {
    serveSolarActivity(response, requestUrl);
    return;
  }

  if (requestUrl.pathname.startsWith("/api/")) {
    proxyApi(request, response, requestUrl);
    return;
  }

  const pathname = requestUrl.pathname === "/" || !extname(requestUrl.pathname) ? "/index.html" : requestUrl.pathname;
  const filePath = normalize(join(root, pathname));

  if (!filePath.startsWith(root) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "content-type": mimeTypes[extname(filePath)] ?? "application/octet-stream" });
  createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Exact Space Weather dashboard listening on http://127.0.0.1:${port}`);
});

function proxyApi(clientRequest, clientResponse, requestUrl) {
  const targetUrl = new URL(requestUrl.pathname + requestUrl.search, backend);
  const started = Date.now();
  const proxyRequest = globalThis.fetch(targetUrl, {
    method: clientRequest.method,
    headers: sanitizeHeaders(clientRequest.headers),
    body: ["GET", "HEAD"].includes(clientRequest.method ?? "GET") ? undefined : clientRequest
  });

  proxyRequest
    .then(async (proxyResponse) => {
      clientResponse.writeHead(proxyResponse.status, Object.fromEntries(proxyResponse.headers.entries()));
      if (proxyResponse.body) {
        for await (const chunk of proxyResponse.body) clientResponse.write(chunk);
      }
      clientResponse.end();
      console.log(`${proxyResponse.status} ${requestUrl.pathname}${requestUrl.search} ${Date.now() - started}ms`);
    })
    .catch((error) => {
      clientResponse.writeHead(502, { "content-type": "application/json; charset=utf-8" });
      clientResponse.end(JSON.stringify({ error: "API proxy failed", message: error instanceof Error ? error.message : "Unknown error" }));
      console.log(`502 ${requestUrl.pathname}${requestUrl.search} ${Date.now() - started}ms`);
    });
}

function sanitizeHeaders(headers) {
  const next = { ...headers };
  delete next.host;
  delete next.connection;
  return next;
}

async function serveGloTec(response, requestUrl) {
  const started = Date.now();

  try {
    const shouldRefresh = requestUrl.searchParams.get("refresh") === "true";
    if (!shouldRefresh && glotecCache && glotecCache.expiresAt > Date.now()) {
      sendJson(response, glotecCache.payload);
      console.log(`200 ${requestUrl.pathname}${requestUrl.search} cache ${Date.now() - started}ms`);
      return;
    }

    const payload = await fetchGloTecPayload();
    glotecCache = { expiresAt: Date.now() + 10 * 60_000, payload };
    sendJson(response, payload);
    console.log(`200 ${requestUrl.pathname}${requestUrl.search} swpc ${Date.now() - started}ms`);
  } catch (error) {
    if (glotecCache?.payload) {
      sendJson(response, { ...glotecCache.payload, freshness: "stale" });
      console.log(`200 ${requestUrl.pathname}${requestUrl.search} stale-cache ${Date.now() - started}ms`);
      return;
    }

    sendJson(response, {
      source: "NOAA_SWPC_GLOTEC",
      lastUpdated: null,
      freshness: "unavailable",
      productUrl: null,
      summary: {
        pointCount: 0,
        meanTec: null,
        maxTec: null,
        maxAnomaly: null,
        observedCoveragePercent: null
      },
      points: [],
      errorMessage: error instanceof Error ? error.message : "NOAA GloTEC source unavailable"
    });
    console.log(`200 ${requestUrl.pathname}${requestUrl.search} unavailable ${Date.now() - started}ms`);
  }
}

async function fetchGloTecPayload() {
  const index = await fetchJson(`${swpcOrigin}/products/glotec/geojson_2d_urt.json`);
  const latest = Array.isArray(index) ? index.at(-1) : null;
  if (!latest?.url) throw new Error("NOAA GloTEC index did not include a product URL");

  const productUrl = `${swpcOrigin}${latest.url}`;
  const geojson = await fetchJson(productUrl);
  const features = Array.isArray(geojson.features) ? geojson.features : [];
  const points = features
    .map((feature) => {
      const coordinates = feature?.geometry?.coordinates;
      const properties = feature?.properties ?? {};
      const longitude = Number(coordinates?.[0]);
      const latitude = Number(coordinates?.[1]);
      const tec = Number(properties.tec);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(tec)) return null;

      return {
        latitude,
        longitude,
        tec,
        anomaly: numberOrNull(properties.anomaly),
        hmF2Km: numberOrNull(properties.hmF2),
        nmF2: numberOrNull(properties.NmF2),
        qualityFlag: Number.isFinite(Number(properties.quality_flag)) ? Number(properties.quality_flag) : null
      };
    })
    .filter(Boolean);

  const validTec = points.map((point) => point.tec).filter(Number.isFinite);
  const validAnomaly = points.map((point) => point.anomaly).filter(Number.isFinite);
  const observedPoints = points.filter((point) => point.qualityFlag === 0).length;

  return {
    source: "NOAA_SWPC_GLOTEC",
    lastUpdated: latest.time_tag ?? null,
    freshness: "fresh",
    productUrl,
    summary: {
      pointCount: points.length,
      meanTec: mean(validTec),
      maxTec: max(validTec),
      maxAnomaly: max(validAnomaly),
      observedCoveragePercent: points.length > 0 ? Math.round((observedPoints / points.length) * 100) : null
    },
    points
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`NOAA GloTEC request failed: ${response.status}`);
  return response.json();
}

function sendJson(response, payload) {
  response.writeHead(200, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function mean(values) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function max(values) {
  if (values.length === 0) return null;
  return Math.max(...values);
}

async function serveDst(response, requestUrl) {
  const started = Date.now();
  try {
    const raw = await fetchJson(`${swpcOrigin}/products/kyoto-dst.json`);
    const data = Array.isArray(raw)
      ? raw
          .map((row) => ({
            timestamp: parseTimestamp(row.time_tag),
            valueNt: numberOrNull(row.dst)
          }))
          .filter((point) => point.timestamp && Number.isFinite(point.valueNt))
      : [];
    const latest = data.at(-1) ?? null;
    sendJson(response, {
      source: "NOAA_SWPC_KYOTO_DST",
      lastUpdated: latest?.timestamp ?? null,
      current: latest?.valueNt ?? null,
      freshness: latest?.timestamp ? "fresh" : "unavailable",
      data
    });
    console.log(`200 ${requestUrl.pathname}${requestUrl.search} swpc ${Date.now() - started}ms`);
  } catch (error) {
    sendJson(response, {
      source: "NOAA_SWPC_KYOTO_DST",
      lastUpdated: null,
      current: null,
      freshness: "unavailable",
      data: [],
      errorMessage: error instanceof Error ? error.message : "Dst source unavailable"
    });
    console.log(`200 ${requestUrl.pathname}${requestUrl.search} unavailable ${Date.now() - started}ms`);
  }
}

async function serveSolarActivity(response, requestUrl) {
  const started = Date.now();
  const [xray, regions] = await Promise.allSettled([
    fetchJson(`${swpcOrigin}/json/goes/primary/xrays-6-hour.json`),
    fetchJson(`${swpcOrigin}/json/solar_regions.json`)
  ]);
  const xrayPayload = buildXrayPayload(xray.status === "fulfilled" ? xray.value : []);
  const regionPayload = regions.status === "fulfilled" && Array.isArray(regions.value) ? regions.value : [];

  sendJson(response, {
    source: "NOAA_SWPC",
    lastUpdated: xrayPayload.lastUpdated,
    freshness: xrayPayload.freshness,
    xray: xrayPayload,
    regions: {
      source: "NOAA_SWPC_SOLAR_REGIONS",
      lastUpdated: regionPayload[0]?.observed_date ? parseTimestamp(regionPayload[0].observed_date) : null,
      freshness: regionPayload.length > 0 ? "fresh" : "unavailable",
      data: regionPayload
    },
    images: {
      source: "NASA_SDO",
      freshness: "fresh",
      images: [
        {
          id: "sdo-171",
          label: "AIA 171",
          wavelength: "171 angstrom",
          url: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0171.jpg",
          lastModified: xrayPayload.lastUpdated
        },
        {
          id: "sdo-304",
          label: "AIA 304",
          wavelength: "304 angstrom",
          url: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0304.jpg",
          lastModified: xrayPayload.lastUpdated
        },
        {
          id: "sdo-193",
          label: "AIA 193",
          wavelength: "193 angstrom",
          url: "https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0193.jpg",
          lastModified: xrayPayload.lastUpdated
        }
      ]
    }
  });
  console.log(`200 ${requestUrl.pathname}${requestUrl.search} swpc ${Date.now() - started}ms`);
}

function buildXrayPayload(raw) {
  const data = Array.isArray(raw)
    ? raw
        .map((row) => ({
          timestamp: parseTimestamp(row.time_tag),
          satellite: numberOrNull(row.satellite),
          fluxWm2: numberOrNull(row.flux),
          energy: String(row.energy ?? ""),
          flareClass: flareClass(numberOrNull(row.flux))
        }))
        .filter((point) => point.timestamp && Number.isFinite(point.fluxWm2))
        .sort((left, right) => Date.parse(left.timestamp) - Date.parse(right.timestamp))
    : [];
  const primary = data.filter((point) => point.energy === "0.1-0.8nm");
  const latest = primary.at(-1) ?? null;

  return {
    source: "NOAA_SWPC_GOES_XRAY",
    lastUpdated: latest?.timestamp ?? null,
    freshness: latest ? "fresh" : "unavailable",
    currentClass: latest?.flareClass ?? null,
    currentFluxWm2: latest?.fluxWm2 ?? null,
    primarySatellite: latest?.satellite ?? null,
    data
  };
}

function flareClass(flux) {
  if (!Number.isFinite(flux) || flux <= 0) return null;
  const classes = [
    ["X", 1e-4],
    ["M", 1e-5],
    ["C", 1e-6],
    ["B", 1e-7],
    ["A", 1e-8]
  ];
  const [letter, base] = classes.find(([, base]) => flux >= base) ?? ["A", 1e-8];
  return `${letter}${Math.max(flux / base, 0.1).toFixed(1)}`;
}

function parseTimestamp(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const withZone = /z$/i.test(normalized) ? normalized : `${normalized}Z`;
  const parsed = new Date(withZone);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}
