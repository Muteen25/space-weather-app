import type { DashboardConditionInput, ImpactSummaryItem } from "./types";

export function buildImpactSummary(input: DashboardConditionInput): ImpactSummaryItem[] {
  return [
    satelliteImpact(input),
    gnssImpact(input),
    radioImpact(input),
    aviationImpact(input),
    powerGridImpact(input),
    auroraImpact(input),
    humanSpaceflightImpact(input)
  ];
}

function satelliteImpact(input: DashboardConditionInput): ImpactSummaryItem {
  if (scaleAtLeast(input.gScale, 4) || scaleAtLeast(input.sScale, 4)) {
    return item(
      "Satellites",
      "severe",
      "Severe geomagnetic or radiation storm scale is active.",
      `${input.gScale}, ${input.sScale}`
    );
  }

  if (scaleAtLeast(input.gScale, 3) || scaleBetween(input.sScale, 2, 3) || input.solarWindSpeedKmSec >= 650) {
    return item(
      "Satellites",
      "high",
      "Storm-level geomagnetic activity or elevated particle conditions may increase spacecraft awareness needs.",
      `${input.gScale}, solar wind ${input.solarWindSpeedKmSec} km/s`
    );
  }

  if (scaleAtLeast(input.gScale, 1) || input.solarWindSpeedKmSec >= 500 || input.hasEarthDirectedCme) {
    return item(
      "Satellites",
      "moderate",
      "Activity is elevated above quiet background levels.",
      `${input.gScale}, Earth-directed CME ${input.hasEarthDirectedCme ? "yes" : "no"}`
    );
  }

  return item("Satellites", "low", "No active storm-scale satellite impact indicators are present.", input.gScale);
}

function gnssImpact(input: DashboardConditionInput): ImpactSummaryItem {
  if (input.kp >= 8 || scaleAtLeast(input.gScale, 4)) {
    return item("GNSS and navigation", "severe", "Severe geomagnetic storm levels can disturb positioning reliability.", `Kp ${input.kp}`);
  }

  if (input.kp >= 6 || scaleBetween(input.gScale, 2, 3)) {
    return item("GNSS and navigation", "high", "Geomagnetic storm conditions can increase ionospheric disturbance risk.", `Kp ${input.kp}, ${input.gScale}`);
  }

  if (input.kp >= 4 || scaleBetween(input.rScale, 1, 2) || input.bzNt <= -8) {
    return item("GNSS and navigation", "moderate", "Active geomagnetic or radio conditions may affect some precision use cases.", `Kp ${input.kp}, Bz ${input.bzNt} nT`);
  }

  return item("GNSS and navigation", "low", "Quiet geomagnetic conditions indicate low GNSS disturbance risk.", `Kp ${input.kp}`);
}

function radioImpact(input: DashboardConditionInput): ImpactSummaryItem {
  const flareFamily = input.latestFlareClass?.trim().toUpperCase().charAt(0) ?? "";

  if (scaleAtLeast(input.rScale, 4)) {
    return item("HF radio communication", "severe", "Severe radio blackout scale is active.", input.rScale);
  }

  if (scaleBetween(input.rScale, 2, 3) || flareFamily === "X") {
    return item(
      "HF radio communication",
      "high",
      "Strong flare or blackout conditions may disturb sunlit HF paths.",
      input.latestFlareClass ? `${input.rScale}, flare ${input.latestFlareClass}` : input.rScale
    );
  }

  if (scaleAtLeast(input.rScale, 1) || flareFamily === "M") {
    return item(
      "HF radio communication",
      "moderate",
      "M-class flare or minor blackout conditions are present.",
      input.latestFlareClass ? `${input.rScale}, flare ${input.latestFlareClass}` : input.rScale
    );
  }

  return item("HF radio communication", "low", "No notable flare-driven radio blackout indicator is present.", input.rScale);
}

function aviationImpact(input: DashboardConditionInput): ImpactSummaryItem {
  if (scaleAtLeast(input.sScale, 4)) {
    return item("Aviation", "severe", "Severe radiation storm scale is active.", input.sScale);
  }

  if (scaleAtLeast(input.sScale, 3)) {
    return item("Aviation", "high", "Radiation storm scale is elevated for aviation awareness.", input.sScale);
  }

  if (scaleAtLeast(input.sScale, 1) || scaleAtLeast(input.rScale, 2)) {
    return item("Aviation", "moderate", "Radiation or HF communication conditions are elevated.", `${input.sScale}, ${input.rScale}`);
  }

  return item("Aviation", "low", "No active radiation storm indicator is present.", input.sScale);
}

function powerGridImpact(input: DashboardConditionInput): ImpactSummaryItem {
  if (scaleAtLeast(input.gScale, 4)) {
    return item("Power grids", "severe", "Severe geomagnetic storm scale is active.", input.gScale);
  }

  if (scaleAtLeast(input.gScale, 3)) {
    return item("Power grids", "high", "Strong geomagnetic storm conditions are present.", input.gScale);
  }

  if (scaleAtLeast(input.gScale, 1)) {
    return item("Power grids", "moderate", "Minor to moderate storm conditions are present.", input.gScale);
  }

  return item("Power grids", "low", "No geomagnetic storm scale is active.", input.gScale);
}

function auroraImpact(input: DashboardConditionInput): ImpactSummaryItem {
  if (input.kp >= 8) {
    return item("Aurora visibility", "severe", "Very high Kp can expand auroral activity farther from polar regions.", `Kp ${input.kp}`);
  }

  if (input.kp >= 6) {
    return item("Aurora visibility", "high", "Elevated Kp indicates increased auroral activity potential.", `Kp ${input.kp}`);
  }

  if (input.kp >= 4) {
    return item("Aurora visibility", "moderate", "Active geomagnetic conditions may support auroras at favorable latitudes.", `Kp ${input.kp}`);
  }

  return item("Aurora visibility", "low", "Kp is low, so auroral activity is likely confined to higher latitudes.", `Kp ${input.kp}`);
}

function humanSpaceflightImpact(input: DashboardConditionInput): ImpactSummaryItem {
  if (scaleAtLeast(input.sScale, 4)) {
    return item("Human spaceflight radiation awareness", "severe", "Severe radiation storm scale is active.", input.sScale);
  }

  if (scaleAtLeast(input.sScale, 3)) {
    return item("Human spaceflight radiation awareness", "high", "Radiation storm scale is elevated for spaceflight awareness.", input.sScale);
  }

  if (scaleAtLeast(input.sScale, 1)) {
    return item("Human spaceflight radiation awareness", "moderate", "Minor radiation storm scale is active.", input.sScale);
  }

  return item("Human spaceflight radiation awareness", "low", "No radiation storm scale is active.", input.sScale);
}

function item(
  sector: string,
  level: ImpactSummaryItem["level"],
  reason: string,
  relatedParameter: string
): ImpactSummaryItem {
  return { sector, level, reason, relatedParameter };
}

function scaleAtLeast(scale: string, minimum: number): boolean {
  return Number(scale.slice(1)) >= minimum;
}

function scaleBetween(scale: string, minimum: number, maximum: number): boolean {
  const value = Number(scale.slice(1));
  return value >= minimum && value <= maximum;
}
