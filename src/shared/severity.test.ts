import {
  classifyOverallCondition,
  flareClassToRadioScale,
  kpToGScale,
  kpToSeverity
} from "./severity";

describe("space weather severity rules", () => {
  it("maps Kp values to NOAA G-scale storm levels", () => {
    expect(kpToGScale(4.9)).toBe("G0");
    expect(kpToGScale(5)).toBe("G1");
    expect(kpToGScale(6)).toBe("G2");
    expect(kpToGScale(7)).toBe("G3");
    expect(kpToGScale(8)).toBe("G4");
    expect(kpToGScale(9)).toBe("G5");
  });

  it("maps Kp values to user-facing severity labels", () => {
    expect(kpToSeverity(2.7)).toEqual({ condition: "Quiet", severity: "low" });
    expect(kpToSeverity(3.2)).toEqual({ condition: "Unsettled", severity: "low" });
    expect(kpToSeverity(4.4)).toEqual({ condition: "Active", severity: "moderate" });
    expect(kpToSeverity(5.2)).toEqual({ condition: "Minor Storm", severity: "moderate" });
    expect(kpToSeverity(6.1)).toEqual({ condition: "Moderate Storm", severity: "high" });
    expect(kpToSeverity(7.4)).toEqual({ condition: "Strong Storm", severity: "high" });
    expect(kpToSeverity(8.2)).toEqual({ condition: "Severe Storm", severity: "severe" });
  });

  it("lets active severe scale alerts override Kp-only classification", () => {
    expect(
      classifyOverallCondition({
        kp: 3,
        scales: { g: "G0", r: "R4", s: "S1" }
      })
    ).toEqual({
      condition: "Severe",
      severity: "severe",
      mainCause: "Active R4 radio blackout alert"
    });
  });

  it("maps flare classes to radio blackout scale estimates", () => {
    expect(flareClassToRadioScale("C8.1")).toBe("R0");
    expect(flareClassToRadioScale("M1.2")).toBe("R1");
    expect(flareClassToRadioScale("M7.4")).toBe("R2");
    expect(flareClassToRadioScale("X1.1")).toBe("R3");
    expect(flareClassToRadioScale("X10.0")).toBe("R4");
    expect(flareClassToRadioScale("X20.0")).toBe("R5");
  });
});
