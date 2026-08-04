import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("exact dashboard orbit designer extension", () => {
  it("asks for all six Keplerian orbital elements", () => {
    const source = readFileSync(join(process.cwd(), "public-exact", "orbit-designer.js"), "utf8");

    [
      "Semi-major axis",
      "Eccentricity",
      "Inclination",
      "RAAN",
      "Argument of Perigee",
      "True Anomaly"
    ].forEach((label) => {
      expect(source).toContain(label);
    });
  });

  it("keeps the orbit designer disabled on the exact dashboard page", () => {
    const index = readFileSync(join(process.cwd(), "public-exact", "index.html"), "utf8");

    expect(index).not.toContain('src="/orbit-designer.js"');
  });
});
