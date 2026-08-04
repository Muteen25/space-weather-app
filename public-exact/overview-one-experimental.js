(() => {
  const state = { data: null, loading: null, timer: null };

  const text = (value, fallback = "Unavailable") => {
    if (value === null || value === undefined || value === "") return fallback;
    return String(value);
  };

  const number = (value, digits = 1) =>
    typeof value === "number" && Number.isFinite(value) ? value.toFixed(digits) : "Unavailable";

  const getJson = async (url) => {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`${url} failed: ${response.status}`);
    return response.json();
  };

  const loadData = () => {
    if (state.data) return Promise.resolve(state.data);
    if (state.loading) return state.loading;
    state.loading = Promise.allSettled([
      getJson("/api/solar-wind?range=6h"),
      getJson("/api/magnetic-field?range=6h"),
      getJson("/api/kp"),
      getJson("/api/ionosphere/glotec"),
      getJson("/api/alerts"),
      getJson("/api/events?limit=8"),
    ]).then((results) => {
      const pick = (index, fallback) => results[index].status === "fulfilled" ? results[index].value : fallback;
      state.data = {
        solarWind: pick(0, {}),
        magnetic: pick(1, {}),
        kp: pick(2, {}),
        tec: pick(3, {}),
        alerts: pick(4, []),
        events: pick(5, []),
      };
      return state.data;
    }).finally(() => {
      state.loading = null;
    });
    return state.loading;
  };

  const firstPoint = (series) =>
    Array.isArray(series?.data) ? series.data[0] :
    Array.isArray(series?.points) ? series.points[0] :
    Array.isArray(series?.series) ? series.series[0] :
    null;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const score = (value, max) => typeof value === "number" && Number.isFinite(value) ? clamp((value / max) * 100, 0, 100) : 0;
  const absScore = (value, max) => typeof value === "number" && Number.isFinite(value) ? clamp((Math.abs(value) / max) * 100, 0, 100) : 0;

  const comparisonItems = (data) => {
    const wind = data.solarWind?.latest || data.solarWind?.current || firstPoint(data.solarWind) || {};
    const field = data.magnetic?.latest || data.magnetic?.current || firstPoint(data.magnetic) || {};
    const kpValue = data.kp?.current?.kp ?? data.kp?.current;
    const tecMean = data.tec?.summary?.meanTec ?? data.tec?.statistics?.meanTec ?? data.tec?.meanTec;
    const windSpeed = wind.speed ?? wind.speedKmPerSec;
    const fieldBt = field.bt ?? field.btNt;
    const fieldBz = field.bz ?? field.bzGsmNt ?? field.bzNt;
    const activityCount = (Array.isArray(data.alerts) ? data.alerts.length : 0) + (Array.isArray(data.events) ? data.events.length : 0);

    return [
      { label: "Kp Index", value: text(kpValue), width: score(kpValue, 9), tone: "blue" },
      { label: "Solar wind speed", value: `${number(windSpeed, 0)} km/s`, width: score(windSpeed, 800), tone: "cyan" },
      { label: "IMF Bt", value: `${number(fieldBt, 1)} nT`, width: score(fieldBt, 30), tone: "violet" },
      { label: "Southward Bz", value: `${number(fieldBz, 1)} nT`, width: absScore(Math.min(fieldBz ?? 0, 0), 20), tone: "amber" },
      { label: "Mean TEC", value: `${number(tecMean, 1)} TECU`, width: score(tecMean, 80), tone: "green" },
      { label: "Alerts + events", value: `${activityCount}`, width: score(activityCount, 20), tone: "rose" },
    ];
  };

  const toneColor = (tone) => ({
    blue: "#38bdf8",
    cyan: "#22d3ee",
    violet: "#c084fc",
    amber: "#facc15",
    green: "#34d399",
    rose: "#fb7185",
  })[tone] ?? "#38bdf8";

  const comparisonLineChart = (items) => {
    const width = 980;
    const height = 300;
    const left = 60;
    const right = 26;
    const top = 26;
    const bottom = 74;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const points = items.map((item, index) => {
      const x = left + (items.length <= 1 ? 0 : (index / (items.length - 1)) * plotWidth);
      const y = top + (1 - clamp(item.width, 0, 100) / 100) * plotHeight;
      return { ...item, x, y };
    });
    const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
    const area = `${path} L ${points.at(-1)?.x.toFixed(1) ?? left} ${top + plotHeight} L ${left} ${top + plotHeight} Z`;

    return `
      <div class="overview-line-chart" role="img" aria-label="Normalized X Y line graph of space weather indicators">
        <svg viewBox="0 0 ${width} ${height}" focusable="false" aria-hidden="true">
          <defs>
            <linearGradient id="overviewLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#38bdf8"/>
              <stop offset="45%" stop-color="#c084fc"/>
              <stop offset="100%" stop-color="#34d399"/>
            </linearGradient>
            <linearGradient id="overviewAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.24"/>
              <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
            </linearGradient>
          </defs>
          ${[0, 25, 50, 75, 100].map((tick) => {
            const y = top + (1 - tick / 100) * plotHeight;
            return `
              <line class="overview-grid-line" x1="${left}" y1="${y}" x2="${width - right}" y2="${y}"></line>
              <text class="overview-y-label" x="${left - 14}" y="${y + 4}" text-anchor="end">${tick}</text>
            `;
          }).join("")}
          <line class="overview-axis" x1="${left}" y1="${top}" x2="${left}" y2="${top + plotHeight}"></line>
          <line class="overview-axis" x1="${left}" y1="${top + plotHeight}" x2="${width - right}" y2="${top + plotHeight}"></line>
          <path class="overview-area" d="${area}"></path>
          <path class="overview-line" d="${path}"></path>
          ${points.map((point) => `
            <g class="overview-point">
              <circle cx="${point.x}" cy="${point.y}" r="6" fill="${toneColor(point.tone)}"></circle>
              <circle cx="${point.x}" cy="${point.y}" r="11" fill="${toneColor(point.tone)}" opacity="0.12"></circle>
              <text class="overview-x-label" x="${point.x}" y="${top + plotHeight + 30}" text-anchor="middle">${point.label}</text>
              <text class="overview-point-value" x="${point.x}" y="${point.y - 14}" text-anchor="middle">${point.value}</text>
            </g>
          `).join("")}
          <text class="overview-axis-title" x="${left + plotWidth / 2}" y="${height - 10}" text-anchor="middle">Indicators</text>
          <text class="overview-axis-title overview-y-title" x="16" y="${top + plotHeight / 2}" text-anchor="middle" transform="rotate(-90 16 ${top + plotHeight / 2})">Normalized strength</text>
        </svg>
      </div>
    `;
  };

  const comparisonGraph = (data) => `
    <section class="overview-comparison-graph" data-overview-comparison>
      <div class="overview-comparison-head">
        <div>
          <p>Comparative live indicators</p>
          <h2>Space weather condition graph</h2>
        </div>
        <span>Normalized X/Y view for fast comparison. Higher point means stronger current activity within that category.</span>
      </div>
      ${comparisonLineChart(comparisonItems(data))}
      <div class="overview-comparison-values">
        ${comparisonItems(data).map((item) => `
          <span><i class="tone-${item.tone}"></i>${item.label}: <strong>${item.value}</strong></span>
        `).join("")}
      </div>
    </section>
  `;

  const contentArea = () => document.querySelector(".mission-content");
  const isOverviewSelected = () => {
    const selected = document.querySelector(".mission-menu .ant-menu-item-selected");
    return selected?.getAttribute("data-menu-id")?.endsWith("-overview") ?? false;
  };

  const removeOverviewOneArtifacts = () => {
    document.querySelector("[data-overview-one-nav]")?.remove();
    document.querySelector(".overview-one-outline")?.remove();
    document.getElementById("overview-one-experimental-root")?.remove();
    document.querySelectorAll("[data-overview-one-hidden='true']").forEach((element) => {
      element.hidden = false;
      element.removeAttribute("data-overview-one-hidden");
    });
  };

  const injectOverviewComparison = () => {
    removeOverviewOneArtifacts();

    if (window.location.pathname === "/observatory/overview-1") {
      window.history.replaceState({}, "", "/observatory");
    }

    if (window.location.pathname !== "/observatory" || !isOverviewSelected()) {
      document.querySelector("[data-overview-comparison]")?.remove();
      return;
    }

    const content = contentArea();
    if (!content || document.querySelector("[data-overview-comparison]")) return;
    loadData().then((data) => {
      if (window.location.pathname !== "/observatory" || !isOverviewSelected() || document.querySelector("[data-overview-comparison]")) return;
      const holder = document.createElement("div");
      holder.innerHTML = comparisonGraph(data);
      const graph = holder.firstElementChild;
      const summarySection = content.querySelector("#overview");
      const layerSection = content.querySelector(".layer-overview-section");
      if (summarySection?.after) summarySection.after(graph);
      else if (layerSection?.before) layerSection.before(graph);
      else content.append(graph);
    }).catch(() => {});
  };

  const pushState = history.pushState;
  history.pushState = function pushStateWithComparisonGraph() {
    const result = pushState.apply(this, arguments);
    window.setTimeout(injectOverviewComparison, 0);
    return result;
  };
  window.addEventListener("popstate", injectOverviewComparison);

  const observer = new MutationObserver(() => {
    window.clearTimeout(state.timer);
    state.timer = window.setTimeout(injectOverviewComparison, 80);
  });

  const start = () => {
    observer.observe(document.body, { childList: true, subtree: true });
    injectOverviewComparison();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
