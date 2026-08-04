const EARTH_RADIUS_KM = 6371;
const EARTH_MU_KM3_S2 = 398600.4418;

const fieldConfig = [
  { id: "satelliteName", label: "Satellite name", type: "text", value: "SWO DemoSat" },
  { id: "semiMajorAxis", label: "Semi-major axis", suffix: "km", min: 6600, max: 80000, step: 10, value: 7000 },
  { id: "eccentricity", label: "Eccentricity", min: 0, max: 0.85, step: 0.01, value: 0.01 },
  { id: "inclination", label: "Inclination", suffix: "deg", min: 0, max: 180, step: 1, value: 51.6 },
  { id: "raan", label: "RAAN", suffix: "deg", min: 0, max: 360, step: 1, value: 32 },
  { id: "argumentOfPerigee", label: "Argument of Perigee", suffix: "deg", min: 0, max: 360, step: 1, value: 45 },
  { id: "trueAnomaly", label: "True Anomaly", suffix: "deg", min: 0, max: 360, step: 1, value: 10 }
];

let orbitState = {
  satelliteName: "SWO DemoSat",
  semiMajorAxis: 7000,
  eccentricity: 0.01,
  inclination: 51.6,
  raan: 32,
  argumentOfPerigee: 45,
  trueAnomaly: 10
};
let camera = { yaw: -0.6, pitch: 0.28, zoom: 1 };
let isPlaying = true;
let animationPhase = 0;
let dragStart = null;
let orbitDesignerOpened = false;

function degreesToRadians(value) {
  return (Number(value) * Math.PI) / 180;
}

export function calculateOrbitSummary(elements) {
  const a = Number(elements.semiMajorAxis);
  const e = Number(elements.eccentricity);
  const perigee = a * (1 - e) - EARTH_RADIUS_KM;
  const apogee = a * (1 + e) - EARTH_RADIUS_KM;
  const periodMinutes = (2 * Math.PI * Math.sqrt(Math.pow(a, 3) / EARTH_MU_KM3_S2)) / 60;
  const velocityKmPerSec = Math.sqrt(EARTH_MU_KM3_S2 / a);
  const orbitClass = a - EARTH_RADIUS_KM >= 35786 ? "GEO / high Earth regime" : a - EARTH_RADIUS_KM >= 2000 ? "MEO / high LEO regime" : "LEO regime";

  return { perigee, apogee, periodMinutes, velocityKmPerSec, orbitClass };
}

function rotatePoint(point) {
  const cy = Math.cos(camera.yaw);
  const sy = Math.sin(camera.yaw);
  const cp = Math.cos(camera.pitch);
  const sp = Math.sin(camera.pitch);
  const x = point.x * cy - point.z * sy;
  const z = point.x * sy + point.z * cy;
  const y = point.y * cp - z * sp;
  const depth = point.y * sp + z * cp;
  return { x, y, depth };
}

function orbitalPoint(elements, anomalyDegrees) {
  const a = Number(elements.semiMajorAxis);
  const e = Number(elements.eccentricity);
  const i = degreesToRadians(elements.inclination);
  const raan = degreesToRadians(elements.raan);
  const arg = degreesToRadians(elements.argumentOfPerigee);
  const nu = degreesToRadians(anomalyDegrees);
  const radius = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
  const xPlane = radius * Math.cos(nu);
  const yPlane = radius * Math.sin(nu);
  const cosO = Math.cos(raan);
  const sinO = Math.sin(raan);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);
  const cosW = Math.cos(arg);
  const sinW = Math.sin(arg);

  return {
    x: (cosO * cosW - sinO * sinW * cosI) * xPlane + (-cosO * sinW - sinO * cosW * cosI) * yPlane,
    y: (sinO * cosW + cosO * sinW * cosI) * xPlane + (-sinO * sinW + cosO * cosW * cosI) * yPlane,
    z: sinW * sinI * xPlane + cosW * sinI * yPlane
  };
}

function project(point, canvas, scale) {
  const rotated = rotatePoint(point);
  const perspective = 1 / (1 + rotated.depth / 28000);
  return {
    x: canvas.width / 2 + rotated.x * scale * perspective,
    y: canvas.height / 2 - rotated.y * scale * perspective,
    depth: rotated.depth,
    perspective
  };
}

function drawOrbit(canvas) {
  const context = canvas.getContext("2d");
  if (!context) return;

  const rect = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * pixelRatio);
  canvas.height = Math.round(rect.height * pixelRatio);
  context.scale(pixelRatio, pixelRatio);

  const width = rect.width;
  const height = rect.height;
  const scale = (Math.min(width, height) * 0.31 * camera.zoom) / orbitState.semiMajorAxis;
  const earthRadius = EARTH_RADIUS_KM * scale;
  const cx = width / 2;
  const cy = height / 2;

  context.clearRect(0, 0, width, height);
  const background = context.createRadialGradient(cx + 80, cy - 80, 20, cx, cy, width);
  background.addColorStop(0, "#132b5f");
  background.addColorStop(1, "#020617");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  for (let index = 0; index < 120; index += 1) {
    const x = (index * 97) % width;
    const y = (index * 53) % height;
    context.fillStyle = index % 3 === 0 ? "rgba(125, 211, 252, 0.55)" : "rgba(219, 234, 254, 0.28)";
    context.fillRect(x, y, 1.2, 1.2);
  }

  context.save();
  context.beginPath();
  context.arc(cx, cy, earthRadius, 0, Math.PI * 2);
  const earth = context.createRadialGradient(cx - earthRadius * 0.35, cy - earthRadius * 0.4, 8, cx, cy, earthRadius);
  earth.addColorStop(0, "#bfdbfe");
  earth.addColorStop(0.34, "#2563eb");
  earth.addColorStop(0.68, "#064e3b");
  earth.addColorStop(1, "#020617");
  context.fillStyle = earth;
  context.fill();
  context.strokeStyle = "rgba(147, 197, 253, 0.5)";
  context.lineWidth = 2;
  context.stroke();
  context.restore();

  context.strokeStyle = "rgba(56, 189, 248, 0.9)";
  context.lineWidth = 2.4;
  context.beginPath();
  for (let deg = 0; deg <= 360; deg += 3) {
    const point = project(orbitalPoint(orbitState, deg), { width, height }, scale);
    if (deg === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  }
  context.stroke();

  const satelliteAnomaly = (Number(orbitState.trueAnomaly) + animationPhase) % 360;
  const satellite = project(orbitalPoint(orbitState, satelliteAnomaly), { width, height }, scale);
  context.beginPath();
  context.arc(satellite.x, satellite.y, 8 * satellite.perspective + 4, 0, Math.PI * 2);
  context.fillStyle = "#facc15";
  context.shadowColor = "#facc15";
  context.shadowBlur = 18;
  context.fill();
  context.shadowBlur = 0;
  context.strokeStyle = "#ffffff";
  context.lineWidth = 2;
  context.stroke();
}

function updateSummary(panel) {
  const summary = calculateOrbitSummary(orbitState);
  panel.querySelector("[data-orbit-summary]").innerHTML = `
    <div><span>Perigee altitude</span><strong>${Math.max(summary.perigee, 0).toFixed(0)} km</strong></div>
    <div><span>Apogee altitude</span><strong>${Math.max(summary.apogee, 0).toFixed(0)} km</strong></div>
    <div><span>Orbital period</span><strong>${summary.periodMinutes.toFixed(1)} min</strong></div>
    <div><span>Mean velocity</span><strong>${summary.velocityKmPerSec.toFixed(2)} km/s</strong></div>
    <div><span>Orbit class</span><strong>${summary.orbitClass}</strong></div>
  `;
}

function addOrbitNavigation(panel) {
  if (document.querySelector("[data-orbit-designer-nav]")) return;

  const navigation = document.querySelector(".mission-sidebar nav") || document.querySelector("aside nav") || document.querySelector("nav");
  if (!navigation) return;

  const link = document.createElement("a");
  link.href = "#orbit-designer";
  link.dataset.orbitDesignerNav = "true";
  link.className = "orbit-designer-nav";
  link.textContent = "Orbit Designer";
  link.addEventListener("click", (event) => {
    event.preventDefault();
    orbitDesignerOpened = true;
    panel.hidden = false;
    panel.classList.add("orbit-designer-visible");
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  navigation.appendChild(link);
}

function createOrbitDesigner() {
  if (document.getElementById("orbit-designer")) return;
  const content = document.querySelector(".mission-content") || document.querySelector("main");
  if (!content || !document.body.textContent.includes("Space Weather ObservatoryMission console")) return;

  const panel = document.createElement("section");
  panel.id = "orbit-designer";
  panel.className = "panel instrument-panel orbit-designer-panel";
  panel.hidden = true;
  panel.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="eyebrow">Mission analysis sandbox</p>
        <h2>Orbit Designer</h2>
      </div>
      <div class="source-stack">
        <span class="source-tag">Keplerian elements</span>
        <span class="freshness-badge freshness-fresh">interactive</span>
      </div>
    </div>
    <div class="orbit-designer-grid">
      <form class="orbit-form" aria-label="Orbit design Keplerian elements">
        ${fieldConfig
          .map((field) => `
            <label>
              <span>${field.label}${field.suffix ? ` <small>${field.suffix}</small>` : ""}</span>
              <input
                name="${field.id}"
                type="${field.type || "number"}"
                value="${field.value}"
                ${field.min !== undefined ? `min="${field.min}"` : ""}
                ${field.max !== undefined ? `max="${field.max}"` : ""}
                ${field.step !== undefined ? `step="${field.step}"` : ""}
              />
            </label>
          `)
          .join("")}
        <button type="submit">Design Orbit</button>
      </form>
      <div class="orbit-viewer">
        <canvas aria-label="Interactive Earth globe with designed orbit path"></canvas>
        <div class="orbit-controls" aria-label="Orbit viewer controls">
          <button type="button" data-orbit-action="play">Pause</button>
          <button type="button" data-orbit-action="zoom-in">Zoom in</button>
          <button type="button" data-orbit-action="zoom-out">Zoom out</button>
          <button type="button" data-orbit-action="reset">Reset</button>
        </div>
      </div>
    </div>
    <div class="orbit-summary" data-orbit-summary></div>
    <p class="instrument-note">This educational view uses a two-body circular/elliptical Keplerian approximation for fast design iteration. Use professional tools such as STK, GMAT, Orekit, Poliastro or SPICE for validated mission analysis.</p>
  `;

  content.appendChild(panel);
  const form = panel.querySelector("form");
  const canvas = panel.querySelector("canvas");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    orbitState = {
      satelliteName: String(formData.get("satelliteName") || "Satellite"),
      semiMajorAxis: Number(formData.get("semiMajorAxis")),
      eccentricity: Number(formData.get("eccentricity")),
      inclination: Number(formData.get("inclination")),
      raan: Number(formData.get("raan")),
      argumentOfPerigee: Number(formData.get("argumentOfPerigee")),
      trueAnomaly: Number(formData.get("trueAnomaly"))
    };
    updateSummary(panel);
    drawOrbit(canvas);
  });

  panel.querySelector("[data-orbit-action='play']").addEventListener("click", (event) => {
    isPlaying = !isPlaying;
    event.currentTarget.textContent = isPlaying ? "Pause" : "Play";
  });
  panel.querySelector("[data-orbit-action='zoom-in']").addEventListener("click", () => {
    camera.zoom = Math.min(camera.zoom * 1.18, 2.8);
    drawOrbit(canvas);
  });
  panel.querySelector("[data-orbit-action='zoom-out']").addEventListener("click", () => {
    camera.zoom = Math.max(camera.zoom / 1.18, 0.55);
    drawOrbit(canvas);
  });
  panel.querySelector("[data-orbit-action='reset']").addEventListener("click", () => {
    camera = { yaw: -0.6, pitch: 0.28, zoom: 1 };
    drawOrbit(canvas);
  });

  canvas.addEventListener("pointerdown", (event) => {
    dragStart = { x: event.clientX, y: event.clientY, yaw: camera.yaw, pitch: camera.pitch };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragStart) return;
    camera.yaw = dragStart.yaw + (event.clientX - dragStart.x) * 0.008;
    camera.pitch = Math.max(-1.1, Math.min(1.1, dragStart.pitch + (event.clientY - dragStart.y) * 0.006));
    drawOrbit(canvas);
  });
  canvas.addEventListener("pointerup", () => {
    dragStart = null;
  });
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    camera.zoom = Math.max(0.55, Math.min(2.8, camera.zoom * (event.deltaY < 0 ? 1.08 : 0.92)));
    drawOrbit(canvas);
  }, { passive: false });

  updateSummary(panel);
  addOrbitNavigation(panel);
  if (orbitDesignerOpened) {
    panel.hidden = false;
    panel.classList.add("orbit-designer-visible");
    drawOrbit(canvas);
  }
  window.addEventListener("resize", () => drawOrbit(canvas));
  requestAnimationFrame(function animate() {
    if (isPlaying && !panel.hidden) {
      animationPhase = (animationPhase + 0.38) % 360;
      drawOrbit(canvas);
    }
    requestAnimationFrame(animate);
  });
}

function addOrbitStyles() {
  if (document.getElementById("orbit-designer-style")) return;
  const style = document.createElement("style");
  style.id = "orbit-designer-style";
  style.textContent = `
    .orbit-designer-panel { scroll-margin-top: 96px; }
    .orbit-designer-panel[hidden] { display: none !important; }
    .orbit-designer-visible { animation: orbitDesignerReveal 260ms ease-out; }
    .orbit-designer-grid { display: grid; grid-template-columns: minmax(280px, 0.85fr) minmax(360px, 1.35fr); gap: 18px; align-items: stretch; }
    .orbit-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .orbit-form label { display: grid; gap: 7px; color: var(--muted); font-size: 0.86rem; }
    .orbit-form label:first-child { grid-column: 1 / -1; }
    .orbit-form span { display: flex; justify-content: space-between; gap: 8px; }
    .orbit-form small { color: var(--subtle); }
    .orbit-form input { min-height: 42px; width: 100%; border: 1px solid var(--border); border-radius: var(--radius); background: rgba(15, 23, 42, 0.78); color: var(--text); padding: 0 12px; }
    .orbit-form button, .orbit-controls button { min-height: 42px; border: 1px solid rgba(56, 189, 248, 0.45); border-radius: var(--radius); background: rgba(56, 189, 248, 0.14); color: var(--text); font-weight: 700; }
    .orbit-form button { grid-column: 1 / -1; background: #38bdf8; color: #031827; }
    .orbit-viewer { min-height: 430px; border: 1px solid rgba(148, 163, 184, 0.28); border-radius: var(--radius); overflow: hidden; background: #020617; }
    .orbit-viewer canvas { display: block; width: 100%; height: 370px; cursor: grab; touch-action: none; }
    .orbit-viewer canvas:active { cursor: grabbing; }
    .orbit-controls { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; padding: 10px; background: rgba(2, 6, 23, 0.82); }
    .orbit-summary { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
    .orbit-summary div { border: 1px solid rgba(148, 163, 184, 0.22); border-radius: var(--radius); background: rgba(15, 23, 42, 0.58); padding: 12px; }
    .orbit-summary span, .orbit-summary strong { display: block; }
    .orbit-summary span { color: var(--muted); font-size: 0.78rem; }
    .orbit-summary strong { margin-top: 4px; color: var(--text); font-size: 1rem; }
    .orbit-designer-nav { display: block; margin: 8px 12px; border: 1px solid rgba(56, 189, 248, 0.36); border-radius: var(--radius); background: rgba(56, 189, 248, 0.1); color: var(--text); padding: 10px 12px; text-decoration: none; font-weight: 700; }
    .orbit-designer-nav:hover { background: rgba(56, 189, 248, 0.18); }
    @keyframes orbitDesignerReveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 980px) { .orbit-designer-grid, .orbit-form, .orbit-summary { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(style);
}

function startOrbitDesigner() {
  addOrbitStyles();
  const timer = window.setInterval(() => {
    createOrbitDesigner();
    if (document.getElementById("orbit-designer")) window.clearInterval(timer);
  }, 600);
}

startOrbitDesigner();
