export type SeverityLevel = "low" | "moderate" | "high" | "severe";

export type OverallCondition =
  | "Quiet"
  | "Unsettled"
  | "Active"
  | "Minor Storm"
  | "Moderate Storm"
  | "Strong Storm"
  | "Severe Storm"
  | "Severe";

export type GScale = "G0" | "G1" | "G2" | "G3" | "G4" | "G5";
export type RScale = "R0" | "R1" | "R2" | "R3" | "R4" | "R5";
export type SScale = "S0" | "S1" | "S2" | "S3" | "S4" | "S5";

export type DashboardConditionInput = {
  kp: number;
  gScale: GScale;
  rScale: RScale;
  sScale: SScale;
  bzNt: number;
  solarWindSpeedKmSec: number;
  latestFlareClass: string | null;
  hasEarthDirectedCme: boolean;
};

export type ImpactSummaryItem = {
  sector: string;
  level: SeverityLevel;
  reason: string;
  relatedParameter: string;
};
