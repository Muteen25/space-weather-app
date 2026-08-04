import type { GScale, OverallCondition, RScale, SScale, SeverityLevel } from "./types";

export function kpToGScale(kp: number): GScale {
  if (kp >= 9) return "G5";
  if (kp >= 8) return "G4";
  if (kp >= 7) return "G3";
  if (kp >= 6) return "G2";
  if (kp >= 5) return "G1";
  return "G0";
}

export function kpToSeverity(kp: number): { condition: OverallCondition; severity: SeverityLevel } {
  if (kp >= 8) return { condition: "Severe Storm", severity: "severe" };
  if (kp >= 7) return { condition: "Strong Storm", severity: "high" };
  if (kp >= 6) return { condition: "Moderate Storm", severity: "high" };
  if (kp >= 5) return { condition: "Minor Storm", severity: "moderate" };
  if (kp >= 4) return { condition: "Active", severity: "moderate" };
  if (kp >= 3) return { condition: "Unsettled", severity: "low" };
  return { condition: "Quiet", severity: "low" };
}

export function flareClassToRadioScale(flareClass: string): RScale {
  const normalized = flareClass.trim().toUpperCase();
  const family = normalized.charAt(0);
  const value = Number.parseFloat(normalized.slice(1));

  if (family === "X") {
    if (value >= 20) return "R5";
    if (value >= 10) return "R4";
    return "R3";
  }

  if (family === "M") {
    return value >= 5 ? "R2" : "R1";
  }

  return "R0";
}

export function classifyOverallCondition(input: {
  kp: number;
  scales: { g: GScale; r: RScale; s: SScale };
}): { condition: OverallCondition; severity: SeverityLevel; mainCause: string } {
  const severeAlert = findSevereScale(input.scales);

  if (severeAlert) {
    return {
      condition: "Severe",
      severity: "severe",
      mainCause: severeAlert
    };
  }

  const kpSeverity = kpToSeverity(input.kp);

  return {
    ...kpSeverity,
    mainCause: `Kp ${input.kp.toFixed(1)} indicates ${kpSeverity.condition.toLowerCase()} conditions`
  };
}

function findSevereScale(scales: { g: GScale; r: RScale; s: SScale }): string | null {
  const candidates = [
    { label: scales.g, description: "geomagnetic storm" },
    { label: scales.r, description: "radio blackout" },
    { label: scales.s, description: "radiation storm" }
  ];

  const severe = candidates.find((candidate) => Number(candidate.label.slice(1)) >= 4);

  if (!severe) {
    return null;
  }

  return `Active ${severe.label} ${severe.description} alert`;
}
