import { buildImpactSummary } from "./impact";
import type { DashboardConditionInput } from "./types";

const quietInput: DashboardConditionInput = {
  kp: 2,
  gScale: "G0",
  rScale: "R0",
  sScale: "S0",
  bzNt: 1.2,
  solarWindSpeedKmSec: 360,
  latestFlareClass: "C2.4",
  hasEarthDirectedCme: false
};

describe("impact summary rules", () => {
  it("keeps all sectors low during quiet conditions", () => {
    const summary = buildImpactSummary(quietInput);

    expect(summary.map((item) => item.level)).toEqual([
      "low",
      "low",
      "low",
      "low",
      "low",
      "low",
      "low"
    ]);
  });

  it("raises GNSS, satellite, and aurora impacts during geomagnetic storm conditions", () => {
    const summary = buildImpactSummary({
      ...quietInput,
      kp: 7,
      gScale: "G3",
      bzNt: -12,
      solarWindSpeedKmSec: 690
    });

    expect(summary.find((item) => item.sector === "GNSS and navigation")?.level).toBe("high");
    expect(summary.find((item) => item.sector === "Satellites")?.level).toBe("high");
    expect(summary.find((item) => item.sector === "Aurora visibility")?.level).toBe("high");
  });

  it("raises HF radio impact from flare and radio blackout inputs", () => {
    const summary = buildImpactSummary({
      ...quietInput,
      rScale: "R3",
      latestFlareClass: "X1.7"
    });

    expect(summary.find((item) => item.sector === "HF radio communication")?.level).toBe("high");
  });

  it("raises aviation and human spaceflight awareness when radiation storm scale is elevated", () => {
    const summary = buildImpactSummary({
      ...quietInput,
      sScale: "S3"
    });

    expect(summary.find((item) => item.sector === "Aviation")?.level).toBe("high");
    expect(summary.find((item) => item.sector === "Human spaceflight radiation awareness")?.level).toBe(
      "high"
    );
  });
});
